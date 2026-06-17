"use client";

import { useState, useEffect } from "react";
import { Tag, X, Loader2, Check } from "lucide-react";
import { toast } from "sonner";
import { useAppDispatch, useCart, useCartSubtotal, useCartDiscount } from "@/store/hooks";
import { applyCoupon, removeCoupon } from "@/store/slices/cartSlice";
import { formatPrice } from "@/lib/utils/format";

export function CouponInput() {
  const dispatch = useAppDispatch();
  const { coupon } = useCart();
  const subtotal = useCartSubtotal();
  const discount = useCartDiscount();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const applied = coupon?.valid;

  // If the cart changes so the coupon no longer qualifies (e.g. subtotal drops
  // below its minimum order), drop it automatically and tell the user.
  useEffect(() => {
    if (coupon?.valid && subtotal > 0 && discount === 0) {
      dispatch(removeCoupon());
      const minOrder = Number(coupon.min_order_amount ?? 0);
      toast.info(
        minOrder > 0
          ? `Coupon removed — minimum order of ${formatPrice(minOrder)} not met`
          : "Coupon removed — no longer applicable"
      );
    }
  }, [coupon, subtotal, discount, dispatch]);

  async function apply() {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return;
    setLoading(true);
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: trimmed, order_total: subtotal }),
      });
      const { data, error } = await res.json();
      if (error) throw new Error(error);

      if (!data?.valid) {
        toast.error(data?.message || "Invalid coupon code");
        return;
      }
      dispatch(applyCoupon({ ...data, code: trimmed }));
      toast.success(`Coupon ${trimmed} applied — you saved ${formatPrice(data.discount ?? 0)}`);
      setCode("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't apply coupon");
    } finally {
      setLoading(false);
    }
  }

  function remove() {
    dispatch(removeCoupon());
    toast.success("Coupon removed");
  }

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 sm:p-5">
      <h2 className="mb-3 flex items-center gap-2 font-bold text-gray-900">
        <Tag className="h-4 w-4 text-brand-500" /> Have a coupon?
      </h2>

      {applied ? (
        <div className="flex items-center justify-between rounded-xl border border-green-200 bg-green-50 px-4 py-3">
          <div className="flex items-center gap-2 text-sm">
            <Check className="h-4 w-4 text-green-600" />
            <span className="font-bold uppercase text-green-700">{coupon?.code}</span>
            <span className="text-green-600">−{formatPrice(discount)}</span>
          </div>
          <button onClick={remove} className="text-gray-400 hover:text-red-500" title="Remove coupon">
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div className="flex gap-2">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === "Enter" && apply()}
            placeholder="Enter coupon code"
            className="flex-1 rounded-xl border border-gray-200 px-3 py-2.5 text-sm uppercase focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
          <button
            onClick={apply}
            disabled={loading || !code.trim()}
            className="flex items-center gap-1.5 rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />} Apply
          </button>
        </div>
      )}
    </div>
  );
}
