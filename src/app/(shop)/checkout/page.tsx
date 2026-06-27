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
  const [delivery, setDelivery] = useState<ShippingState>("pending");

  // Whenever the selected address (pincode) or cart changes, fetch the live
  // delivery charge so the customer sees the real total before paying.
  useEffect(() => {
    if (!selectedAddress?.pincode || items.length === 0) {
      setDelivery("pending");
      return;
    }
    let cancelled = false;
    setDelivery("loading");
    fetch("/api/shipping/quote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pincode: selectedAddress.pincode, items }),
    })
      .then((r) => r.json())
      .then(({ data, error }) => {
        if (cancelled) return;
        // A returned `error` means a system/config problem (e.g. rate API down or
        // pickup pincode not configured) — distinct from a pincode that genuinely
        // has no courier (`serviceable: false`).
        if (error) { setDelivery("error"); return; }
        if (!data?.serviceable) { setDelivery("unserviceable"); return; }
        setDelivery(data.delivery_charge as number);
      })
      .catch(() => { if (!cancelled) setDelivery("error"); });
    return () => { cancelled = true; };
  }, [selectedAddress?.pincode, items]);

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
              <CartSummary subtotal={subtotal} discount={discount} shipping={delivery} />
            </div>
          </div>

          <CouponInput />

          {selectedAddress && (
            <PaymentButton address={selectedAddress} delivery={delivery} />
          )}
        </div>
      </div>
    </div>
  );
}
