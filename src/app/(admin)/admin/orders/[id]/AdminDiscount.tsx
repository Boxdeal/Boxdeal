"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/utils/format";
import { toast } from "sonner";

/**
 * Lets an admin apply an extra discount on the order total, on top of any coupon.
 * Only shown before the order is packed — the amount is pushed to Shiprocket at
 * pack time so the COD collectible / invoice reflect it.
 */
export function AdminDiscount({
  orderId,
  currentDiscount,
  maxDiscount,
}: {
  orderId: string;
  currentDiscount: number;
  maxDiscount: number;
}) {
  const [value, setValue] = useState(currentDiscount ? String(currentDiscount) : "");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function apply() {
    const amount = Number(value || 0);
    if (!Number.isFinite(amount) || amount < 0) {
      toast.error("Enter a valid amount.");
      return;
    }
    if (amount > maxDiscount) {
      toast.error(`Discount can't exceed ${formatPrice(maxDiscount)}.`);
      return;
    }
    setLoading(true);
    const res = await fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "set_discount", admin_discount: amount }),
    });
    const { error } = await res.json();
    setLoading(false);
    if (error) { toast.error(error); return; }
    toast.success(amount > 0 ? `Discount of ${formatPrice(amount)} applied` : "Discount removed");
    router.refresh();
  }

  return (
    <div className="mt-3 border-t pt-3">
      <label className="mb-1 block text-xs font-medium text-gray-600">
        Extra discount (₹) <span className="font-normal text-gray-400">— max {formatPrice(maxDiscount)}</span>
      </label>
      <div className="flex gap-2">
        <input
          type="number"
          min={0}
          max={maxDiscount}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="0"
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none"
        />
        <button
          onClick={apply}
          disabled={loading}
          className="whitespace-nowrap rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-60"
        >
          {loading ? "Applying…" : "Apply"}
        </button>
      </div>
      <p className="mt-1 text-xs text-gray-400">Applied before packing — reflected in the Shiprocket invoice &amp; COD amount.</p>
    </div>
  );
}
