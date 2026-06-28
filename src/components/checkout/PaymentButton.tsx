"use client";

import { useState } from "react";
import { Lock, CheckCircle2, XCircle, X } from "lucide-react";
import { useAppDispatch, useCart, useCartSubtotal, useCartDiscount } from "@/store/hooks";
import { clearCart } from "@/store/slices/cartSlice";
import { formatPrice } from "@/lib/utils/format";
import { RAZORPAY_CURRENCY, RAZORPAY_THEME_COLOR } from "@/constants";
import type { Address } from "@/types";
import type { ShippingState } from "@/components/cart/CartSummary";
import { toast } from "sonner";

interface PaymentButtonProps {
  address: Address;
  /** Live delivery charge state for the selected address. */
  delivery: ShippingState;
  /** Selected payment method — drives the Razorpay vs COD flow. */
  paymentMethod: "online" | "cod";
}

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => {
      open: () => void;
      on: (event: string, handler: (response: unknown) => void) => void;
    };
  }
}

type Result =
  | { kind: "success"; orderId: string; orderNumber: string; cod: boolean }
  | { kind: "failed"; message: string }
  | null;

export function PaymentButton({ address, delivery, paymentMethod }: PaymentButtonProps) {
  const [loading, setLoading] = useState(false);
  // The post-payment popup state. Rendered right here on the checkout page so
  // it never depends on a navigation succeeding from inside Razorpay's iframe.
  const [result, setResult] = useState<Result>(null);
  const dispatch = useAppDispatch();
  const { items, coupon } = useCart();
  const subtotal = useCartSubtotal();
  const discount = useCartDiscount();
  // A coupon only counts toward the order if it still yields a discount for
  // the current cart (e.g. subtotal may have dropped below its minimum).
  const couponCode = coupon?.valid && discount > 0 ? coupon.code : null;
  // The delivery charge must be resolved (a number) before payment is allowed.
  const shipping = typeof delivery === "number" ? delivery : null;
  const total = subtotal - discount + (shipping ?? 0);

  async function handleCod() {
    if (shipping === null) return;
    setLoading(true);
    try {
      const res = await fetch("/api/orders/cod", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          address,
          coupon_code: couponCode,
          subtotal,
          discount,
        }),
      });
      const { data, error } = await res.json();
      if (error) throw new Error(error);
      setResult({
        kind: "success",
        orderId: data.db_order_id,
        orderNumber: data.order_number,
        cod: true,
      });
      setLoading(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  async function handlePay() {
    if (shipping === null) return; // delivery charge not ready / pincode not serviceable
    if (paymentMethod === "cod") return handleCod();
    setLoading(true);
    try {
      const orderRes = await fetch("/api/payments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          address,
          coupon_code: couponCode,
          subtotal,
          discount,
          shipping_charge: shipping,
          total_amount: total,
        }),
      });

      const { data, error } = await orderRes.json();
      if (error) throw new Error(error);

      // Once we reach a final state (paid or failed) we don't want the modal's
      // ondismiss to also cancel the order.
      let settled = false;

      const cancelOrder = () => {
        fetch("/api/payments/cancel", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ db_order_id: data.db_order_id }),
        }).catch(() => {});
      };

      const options = {
        key:         process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount:      data.razorpay_amount,
        currency:    RAZORPAY_CURRENCY,
        name:        "BoxDeal",
        description: `Order ${data.order_number}`,
        order_id:    data.razorpay_order_id,
        theme:       { color: RAZORPAY_THEME_COLOR },
        prefill: {
          name:    address.full_name,
          contact: address.phone,
        },
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          settled = true;
          try {
            const verifyRes = await fetch("/api/payments/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                db_order_id:        data.db_order_id,
                razorpay_order_id:  response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });
            const verifyResult = await verifyRes.json();
            if (verifyResult.error) {
              setResult({
                kind: "failed",
                message: "We couldn't verify your payment. If money was deducted it will be refunded.",
              });
              setLoading(false);
              return;
            }
            // Success — show the confirmation popup. Cart is cleared only when
            // the user leaves (goToOrder), so clearing it here can't trigger the
            // checkout page's "cart empty → /products" redirect and unmount us.
            setResult({
              kind: "success",
              orderId: data.db_order_id,
              orderNumber: data.order_number,
              cod: false,
            });
            setLoading(false);
          } catch {
            setResult({
              kind: "failed",
              message: "Something went wrong while confirming your payment.",
            });
            setLoading(false);
          }
        },
        modal: {
          ondismiss: () => {
            // User closed Razorpay without completing payment.
            if (settled) return;
            cancelOrder();
            setLoading(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      // Fires when Razorpay reports the payment itself failed.
      rzp.on("payment.failed", () => {
        settled = true;
        cancelOrder();
        setResult({
          kind: "failed",
          message: "Your payment could not be completed. No money was deducted.",
        });
        setLoading(false);
      });
      rzp.open();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  function goToOrder() {
    if (result?.kind !== "success") return;
    const id = result.orderId;
    dispatch(clearCart());
    // Hard navigation so the checkout page's cart-empty redirect effect can't
    // race us to /products.
    window.location.href = `/orders/${id}`;
  }

  const isCod = paymentMethod === "cod";
  const payLabel =
    loading                ? "Processing…" :
    delivery === "loading" ? "Calculating delivery…" :
    shipping === null      ? (isCod ? "Place Order" : "Pay Securely") :
    isCod                  ? `Place Order · ${formatPrice(total)}` :
    `Pay ${formatPrice(total)} Securely`;

  return (
    <>
      {delivery === "unserviceable" && (
        <p className="mb-2 text-center text-sm font-medium text-red-600">
          Sorry, delivery isn&apos;t available to this pincode. Please try a different address.
        </p>
      )}
      {delivery === "error" && (
        <p className="mb-2 text-center text-sm font-medium text-red-600">
          Couldn&apos;t calculate the delivery charge right now. Please try again in a moment.
        </p>
      )}
      <button
        onClick={handlePay}
        disabled={loading || items.length === 0 || shipping === null}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 py-4 text-base font-bold text-white hover:bg-brand-600 disabled:opacity-60 disabled:cursor-not-allowed transition-all active:scale-95"
      >
        <Lock className="h-4 w-4" />
        {payLabel}
      </button>

      {result?.kind === "success" && (
        <SuccessModal
          orderNumber={result.orderNumber}
          cod={result.cod}
          onClose={goToOrder}
          onDismiss={() => setResult(null)}
        />
      )}
      {result?.kind === "failed" && (
        <FailedModal
          message={result.message}
          onClose={() => setResult(null)}
        />
      )}
    </>
  );
}

function SuccessModal({
  orderNumber,
  cod,
  onClose,
  onDismiss,
}: {
  orderNumber: string;
  cod: boolean;
  onClose: () => void;
  onDismiss: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-black/50" onClick={onDismiss} />
      <div className="relative z-10 w-full max-w-[340px] overflow-hidden rounded-3xl bg-white shadow-2xl animate-in zoom-in-95 fade-in duration-300">
        <button
          onClick={onDismiss}
          className="absolute right-4 top-4 z-20 text-gray-400 transition-all hover:text-gray-700 active:scale-90"
          aria-label="Close"
        >
          <X className="h-[18px] w-[18px]" strokeWidth={2.5} />
        </button>
        <div className="h-1.5 w-full bg-brand-500" />
        <div className="px-7 py-8 text-center">
          {/* The success tick stays green (universal "done" signal); everything
              else follows the brand (orange) theme. */}
          <div className="mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-12 w-12 text-green-500" strokeWidth={1.5} />
          </div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-brand-600">
            {cod ? "Order Placed" : "Payment Successful"}
          </p>
          <h2 className="mb-2 text-2xl font-extrabold leading-tight text-gray-900">
            Your Order is Confirmed!
          </h2>
          <p className="mb-1 text-sm text-gray-500">
            {cod ? "Please keep the order amount ready in cash." : "Thank you for shopping with us."}
          </p>
          <p className="mb-7 text-sm text-gray-700">
            Order <span className="font-mono font-semibold text-gray-900">{orderNumber}</span> has been placed.
          </p>
          <button
            onClick={onClose}
            className="w-full rounded-2xl bg-brand-500 py-3.5 text-sm font-bold text-white transition-all hover:bg-brand-600 active:scale-95"
          >
            View My Order
          </button>
        </div>
      </div>
    </div>
  );
}

function FailedModal({
  message,
  onClose,
}: {
  message: string;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-10 w-full max-w-[340px] overflow-hidden rounded-3xl bg-white shadow-2xl animate-in zoom-in-95 fade-in duration-300">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1 text-gray-400 hover:text-gray-600"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="h-1.5 w-full bg-red-500" />
        <div className="px-7 py-8 text-center">
          <div className="mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-full bg-red-100">
            <XCircle className="h-12 w-12 text-red-500" strokeWidth={1.5} />
          </div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-red-600">
            Payment Failed
          </p>
          <h2 className="mb-2 text-2xl font-extrabold leading-tight text-gray-900">
            Payment Unsuccessful
          </h2>
          <p className="mb-7 text-sm leading-relaxed text-gray-500">{message}</p>
          <button
            onClick={onClose}
            className="w-full rounded-2xl bg-gray-900 py-3.5 text-sm font-bold text-white transition-all hover:bg-gray-800 active:scale-95"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
}
