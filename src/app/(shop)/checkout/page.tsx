"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart, useCartSubtotal, useUser } from "@/store/hooks";
import { CartSummary } from "@/components/cart/CartSummary";
import { AddressForm, type AddressFormValues } from "@/components/checkout/AddressForm";
import { PaymentButton } from "@/components/checkout/PaymentButton";
import { CartItem } from "@/components/cart/CartItem";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Address } from "@/types";

export default function CheckoutPage() {
  const { items, coupon } = useCart();
  const subtotal = useCartSubtotal();
  const discount = coupon?.valid ? (coupon.discount ?? 0) : 0;
  const user = useUser();
  const router = useRouter();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [addingNew, setAddingNew] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) { router.push("/login"); return; }
    if (!items.length) { router.push("/cart"); return; }
    loadAddresses();
  }, [user, items.length]);

  async function loadAddresses() {
    const supabase = getSupabaseBrowserClient();
    const { data } = await supabase
      .from("addresses")
      .select("*")
      .order("is_default", { ascending: false });
    setAddresses(data ?? []);
    const def = (data ?? []).find((a) => a.is_default) ?? data?.[0] ?? null;
    setSelectedAddress(def);
  }

  async function saveAddress(values: AddressFormValues) {
    setSaving(true);
    const supabase = getSupabaseBrowserClient();

    if (values.save_address) {
      if (values.is_default || addresses.length === 0) {
        await supabase.from("addresses").update({ is_default: false }).eq("user_id", user!.id);
      }
      const { data } = await supabase
        .from("addresses")
        .insert({
          user_id:       user!.id,
          full_name:     values.full_name,
          phone:         values.phone,
          address_line1: values.address_line1,
          address_line2: values.address_line2 ?? null,
          city:          values.city,
          state:         values.state,
          pincode:       values.pincode,
          address_type:  values.address_type,
          is_default:    addresses.length === 0,
        })
        .select()
        .single();
      if (data) setSelectedAddress(data);
    } else {
      setSelectedAddress({
        id: "temp",
        user_id: user!.id,
        full_name: values.full_name,
        phone: values.phone,
        address_line1: values.address_line1,
        address_line2: values.address_line2 ?? null,
        city: values.city,
        state: values.state,
        pincode: values.pincode,
        address_type: values.address_type,
        is_default: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }
    setAddingNew(false);
    setSaving(false);
  }

  if (!items.length) return null;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Checkout</h1>
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Left */}
        <div className="space-y-6 lg:col-span-3">
          {/* Address selection */}
          <div className="rounded-2xl border border-gray-100 bg-white p-5">
            <h2 className="mb-4 font-bold text-gray-900">Delivery Address</h2>
            {addresses.length > 0 && !addingNew && (
              <div className="space-y-3 mb-4">
                {addresses.map((addr) => (
                  <label key={addr.id} className="flex cursor-pointer gap-3 rounded-xl border border-gray-200 p-4 hover:border-brand-300 transition-colors">
                    <input
                      type="radio"
                      name="address"
                      checked={selectedAddress?.id === addr.id}
                      onChange={() => setSelectedAddress(addr)}
                      className="mt-0.5 text-brand-500"
                    />
                    <div className="text-sm">
                      <p className="font-semibold text-gray-900">
                        {addr.full_name} · {addr.phone}
                        {addr.is_default && (
                          <span className="ml-2 rounded bg-brand-100 px-1.5 py-0.5 text-xs text-brand-700">Default</span>
                        )}
                      </p>
                      <p className="text-gray-500 mt-0.5">
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
          <div className="rounded-2xl border border-gray-100 bg-white p-5">
            <h2 className="mb-3 font-bold text-gray-900">Order Summary</h2>
            <div className="divide-y divide-gray-100">
              {items.map((item) => <CartItem key={item.product_id} item={item} />)}
            </div>
            <div className="mt-4 pt-4 border-t">
              <CartSummary subtotal={subtotal} discount={discount} />
            </div>
          </div>

          {selectedAddress && (
            <PaymentButton address={selectedAddress} />
          )}
        </div>
      </div>
    </div>
  );
}
