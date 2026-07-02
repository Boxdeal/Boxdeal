"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart, useCartSubtotal, useCartDiscount } from "@/store/hooks";
import { useAuth } from "@/hooks";
import { CartSummary, type ShippingState } from "@/components/cart/CartSummary";
import { AddressForm, type AddressFormValues } from "@/components/checkout/AddressForm";
import { PaymentButton } from "@/components/checkout/PaymentButton";
import { CouponInput } from "@/components/checkout/CouponInput";
import { CartItem } from "@/components/cart/CartItem";
import { addressService } from "@/services/address";
import { PARTIAL_COD_ONLINE_PERCENT, splitPartialCod } from "@/constants";
import { formatPrice } from "@/lib/utils/format";
import type { Address } from "@/types";

export default function CheckoutPage() {
  const { items } = useCart();
  const subtotal = useCartSubtotal();
  const discount = useCartDiscount();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [addingNew, setAddingNew] = useState(false);
  const [saving, setSaving] = useState(false);
  // Live delivery charge for the selected address (Shiprocket rate, capped).
  // Prepaid and COD rates can differ, so we fetch both and show whichever the
  // customer has selected.
  const [delivery, setDelivery] = useState<ShippingState>("pending");
  const [codDelivery, setCodDelivery] = useState<ShippingState>("pending");
  const [paymentMethod, setPaymentMethod] = useState<"online" | "cod">("online");
  // Whether the parcel is billed on its volumetric weight (bulky but light).
  // Same for prepaid or COD (a property of the cart), so we read it off either
  // quote. For COD such orders require PARTIAL payment — part online now, rest
  // collected on delivery.
  const [isVolumetric, setIsVolumetric] = useState(false);

  // Whenever the selected address (pincode) or cart changes, fetch the live
  // delivery charge (prepaid + COD) so the customer sees the real total before
  // paying and we know whether COD is even serviceable for the pincode.
  useEffect(() => {
    if (!selectedAddress?.pincode || items.length === 0) {
      setDelivery("pending");
      setCodDelivery("pending");
      setIsVolumetric(false);
      return;
    }
    let cancelled = false;
    const quote = (cod: boolean, set: (s: ShippingState) => void) => {
      set("loading");
      fetch("/api/shipping/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pincode: selectedAddress.pincode, items, cod }),
      })
        .then((r) => r.json())
        .then(({ data, error }) => {
          if (cancelled) return;
          // A returned `error` means a system/config problem (e.g. rate API down or
          // pickup pincode not configured) — distinct from a pincode that genuinely
          // has no courier (`serviceable: false`).
          if (error) { set("error"); return; }
          if (!data?.serviceable) { set("unserviceable"); return; }
          set(data.delivery_charge as number);
          if (typeof data.is_volumetric === "boolean") setIsVolumetric(data.is_volumetric);
        })
        .catch(() => { if (!cancelled) set("error"); });
    };
    quote(false, setDelivery);
    quote(true, setCodDelivery);
    return () => { cancelled = true; };
  }, [selectedAddress?.pincode, items]);

  // If the customer had COD selected but it isn't serviceable for the new
  // address, fall back to online so they're never stuck on a dead option.
  useEffect(() => {
    if (paymentMethod === "cod" && codDelivery === "unserviceable") {
      setPaymentMethod("online");
    }
  }, [paymentMethod, codDelivery]);

  // The charge + button state follow whichever method is selected.
  const activeDelivery = paymentMethod === "cod" ? codDelivery : delivery;

  // A COD order for a volumetric (bulky) parcel becomes a partial-COD order:
  // part paid online now, the rest on delivery. Only once the COD rate resolved.
  const isPartialCod =
    paymentMethod === "cod" && isVolumetric && typeof codDelivery === "number";
  const codSplit =
    isPartialCod && typeof codDelivery === "number"
      ? splitPartialCod(subtotal - discount + codDelivery)
      : null;

  useEffect(() => {
    if (authLoading) return; // wait for the Supabase session to resolve
    if (!user) { router.push("/login?redirect=/checkout"); return; }
    if (!items.length) { router.push("/products"); return; }
    loadAddresses();
  }, [user, authLoading, items.length]);

  useEffect(() => {
    // Load Razorpay script dynamically only on checkout page
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.head.appendChild(script);
    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  async function loadAddresses() {
    if (!user) return;
    const { data } = await addressService.getAddresses(user.id);
    const list = (data ?? []) as Address[];
    setAddresses(list);
    const def = list.find((a) => a.is_default) ?? list[0] ?? null;
    setSelectedAddress(def);
    // No saved address yet → open the form straight away so the user can fill
    // it in. If addresses already exist, show the selectable list instead.
    setAddingNew(list.length === 0);
  }

  async function saveAddress(values: AddressFormValues) {
    if (!user) return;
    setSaving(true);

    // Always save the address to the user's account. The first address (or one
    // explicitly marked default) becomes the default; the service unsets others.
    const makeDefault = values.is_default || addresses.length === 0;
    const { data } = await addressService.createAddress(user.id, {
      full_name:     values.full_name,
      phone:         values.phone,
      address_line1: values.address_line1,
      address_line2: values.address_line2 ?? null,
      city:          values.city,
      state:         values.state,
      pincode:       values.pincode,
      address_type:  values.address_type,
      is_default:    makeDefault,
    });

    if (data) {
      const saved = data as Address;
      // Show it in the list immediately and select it for this order.
      setAddresses((prev) =>
        saved.is_default
          ? [saved, ...prev.map((a) => ({ ...a, is_default: false }))]
          : [saved, ...prev]
      );
      setSelectedAddress(saved);
    }
    setAddingNew(false);
    setSaving(false);
  }

  if (!items.length) return null;

  return (
    <div className="mx-auto max-w-5xl px-3 py-6 sm:px-4 sm:py-8">
      <h1 className="mb-5 text-xl font-bold text-gray-900 sm:mb-6 sm:text-2xl">Checkout</h1>
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-5">
        {/* Left */}
        <div className="space-y-6 lg:col-span-3">
          {/* Address selection */}
          <div className="rounded-2xl border border-gray-100 bg-white p-4 sm:p-5">
            <div className="mb-4 flex items-center justify-between gap-2">
              <h2 className="font-bold text-gray-900">Delivery Address</h2>
              {/* Let users who already have addresses back out of the form */}
              {addingNew && addresses.length > 0 && (
                <button
                  onClick={() => setAddingNew(false)}
                  className="text-sm font-medium text-gray-500 hover:text-gray-700"
                >
                  Cancel
                </button>
              )}
            </div>
            {addresses.length > 0 && !addingNew && (
              <div className="space-y-3 mb-4">
                {addresses.map((addr) => (
                  <label key={addr.id} className="flex cursor-pointer gap-3 rounded-xl border border-gray-200 p-3 sm:p-4 hover:border-brand-300 transition-colors">
                    <input
                      type="radio"
                      name="address"
                      checked={selectedAddress?.id === addr.id}
                      onChange={() => setSelectedAddress(addr)}
                      className="mt-0.5 flex-shrink-0 text-brand-500"
                    />
                    <div className="min-w-0 text-sm">
                      <p className="font-semibold text-gray-900 break-words">
                        {addr.full_name} · {addr.phone}
                        {addr.is_default && (
                          <span className="ml-2 rounded bg-brand-100 px-1.5 py-0.5 text-xs text-brand-700">Default</span>
                        )}
                      </p>
                      <p className="text-gray-500 mt-0.5 break-words">
                        {addr.address_line1}{addr.address_line2 ? `, ${addr.address_line2}` : ""},{" "}
                        {addr.city}, {addr.state} — {addr.pincode}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            )}
            {!addingNew && (
              <button
                onClick={() => setAddingNew(true)}
                className="text-sm font-medium text-brand-600 hover:text-brand-700"
              >
                + Add new address
              </button>
            )}
            {addingNew && (
              <AddressForm onSubmit={saveAddress} loading={saving} />
            )}
          </div>
        </div>

        {/* Right */}
        <div className="space-y-4 lg:col-span-2">
          {/* Order summary */}
          <div className="rounded-2xl border border-gray-100 bg-white p-4 sm:p-5">
            <h2 className="mb-3 font-bold text-gray-900">Order Summary</h2>
            <div className="divide-y divide-gray-100">
              {items.map((item) => <CartItem key={item.product_id} item={item} />)}
            </div>
            <div className="mt-4 pt-4 border-t">
              <CartSummary subtotal={subtotal} discount={discount} shipping={activeDelivery} />
            </div>
          </div>

          <CouponInput />

          {/* Payment method selection */}
          {selectedAddress && (
            <div className="rounded-2xl border border-gray-100 bg-white p-4 sm:p-5">
              <h2 className="mb-3 font-bold text-gray-900">Payment Method</h2>
              <div className="space-y-3">
                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-200 p-3 sm:p-4 hover:border-brand-300 transition-colors">
                  <input
                    type="radio"
                    name="payment-method"
                    checked={paymentMethod === "online"}
                    onChange={() => setPaymentMethod("online")}
                    className="text-brand-500"
                  />
                  <div className="text-sm">
                    <p className="font-semibold text-gray-900">Online Payment</p>
                    <p className="text-gray-500 mt-0.5">UPI, cards, netbanking & wallets via Razorpay</p>
                  </div>
                </label>

                <label
                  className={`flex items-center gap-3 rounded-xl border border-gray-200 p-3 sm:p-4 transition-colors ${
                    codDelivery === "unserviceable"
                      ? "cursor-not-allowed opacity-50"
                      : "cursor-pointer hover:border-brand-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment-method"
                    checked={paymentMethod === "cod"}
                    disabled={codDelivery === "unserviceable"}
                    onChange={() => setPaymentMethod("cod")}
                    className="text-brand-500"
                  />
                  <div className="text-sm">
                    <p className="font-semibold text-gray-900">
                      {isVolumetric && codDelivery !== "unserviceable"
                        ? "Cash on Delivery (Partial)"
                        : "Cash on Delivery"}
                    </p>
                    <p className="text-gray-500 mt-0.5">
                      {codDelivery === "unserviceable"
                        ? "Not available for this pincode"
                        : isVolumetric
                        ? `Pay ${PARTIAL_COD_ONLINE_PERCENT}% online now, rest in cash on delivery`
                        : "Pay in cash when your order arrives"}
                    </p>
                  </div>
                </label>
              </div>

              {/* Partial-COD breakdown: a bulky/volumetric parcel needs part of
                  the payment online up front. */}
              {paymentMethod === "cod" && isPartialCod && codSplit && (
                <div className="mt-3 rounded-xl bg-amber-50 border border-amber-200 p-3 text-sm">
                  <p className="font-semibold text-amber-800">Partial payment required</p>
                  <p className="mt-1 text-amber-700">
                    This is a bulky item. Please pay part of the amount online now; the rest is
                    collected in cash on delivery.
                  </p>
                  <div className="mt-2 space-y-1 text-amber-900">
                    <div className="flex justify-between">
                      <span>Pay online now</span>
                      <span className="font-semibold">{formatPrice(codSplit.online)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pay on delivery (cash)</span>
                      <span className="font-semibold">{formatPrice(codSplit.cod)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {selectedAddress && (
            <PaymentButton
              address={selectedAddress}
              delivery={activeDelivery}
              paymentMethod={paymentMethod}
              isPartialCod={isPartialCod}
            />
          )}
        </div>
      </div>
    </div>
  );
}
