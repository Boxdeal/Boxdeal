"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";
import { useAppDispatch, useCart, useCartSubtotal } from "@/store/hooks";
import { clearCart } from "@/store/slices/cartSlice";
import { calculateShipping } from "@/lib/utils/helpers";
import { formatPrice } from "@/lib/utils/format";
import { RAZORPAY_CURRENCY, RAZORPAY_THEME_COLOR } from "@/constants";
import type { Address } from "@/types";
import { toast } from "sonner";

interface PaymentButtonProps {
  address: Address;
}

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void };
  }
}

export function PaymentButton({ address }: PaymentButtonProps) {
  const [loading, setLoading] = useState(false);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { items, coupon } = useCart();
  const subtotal = useCartSubtotal();
  const discount = coupon?.valid ? (coupon.discount ?? 0) : 0;
  const shipping = calculateShipping(subtotal - discount);
  const total = subtotal - discount + shipping;

  async function handlePay() {
    setLoading(true);
    try {
      const orderRes = await fetch("/api/payments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          address,
          coupon_code: coupon?.valid ? coupon.code : null,
          subtotal,
          discount,
          shipping_charge: shipping,
          total_amount: total,
        }),
      });

      const { data, error } = await orderRes.json();
      if (error) throw new Error(error);

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
          const result = await verifyRes.json();
          if (result.error) {
            toast.error("Payment verification failed");
            return;
          }
          dispatch(clearCart());
          router.push(`/orders/${data.db_order_id}?success=true`);
        },
        modal: {
          ondismiss: () => {
            // User closed the popup without paying — release the pending order.
            fetch("/api/payments/cancel", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ db_order_id: data.db_order_id }),
            }).catch(() => {});
            setLoading(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handlePay}
      disabled={loading || items.length === 0}
      className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 py-4 text-base font-bold text-white hover:bg-brand-600 disabled:opacity-60 transition-all active:scale-95"
    >
      <Lock className="h-4 w-4" />
      {loading ? "Processing…" : `Pay ${formatPrice(total)} Securely`}
    </button>
  );
}
