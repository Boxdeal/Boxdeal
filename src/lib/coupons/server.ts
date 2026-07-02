import type { SupabaseClient } from "@supabase/supabase-js";

export interface CouponValidation {
  valid:             boolean;
  message?:          string;
  discount:          number;
  discount_type?:    string;
  discount_value?:   number;
  min_order_amount?: number;
  max_discount?:     number | null;
  coupon_id?:        string;
}

/**
 * Server-side coupon validation + discount computation. This is the single
 * source of truth used by BOTH the /api/coupons/validate endpoint (display)
 * AND order creation (create / cod), so the discount actually charged is
 * always derived server-side from the real coupon rules — never trusted from
 * the client. `orderTotal` must be the server-computed subtotal.
 */
export async function validateCoupon(
  admin: SupabaseClient,
  code: string,
  orderTotal: number,
  userId: string | null
): Promise<CouponValidation> {
  const total = Number(orderTotal) || 0;
  const upperCode = String(code).toUpperCase();

  const { data: coupon } = await admin
    .from("coupons")
    .select("*")
    .eq("code", upperCode)
    .single();

  const invalid = (message: string): CouponValidation => ({ valid: false, message, discount: 0 });

  if (!coupon || coupon.is_active === false) return invalid("Invalid or expired coupon");
  if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) return invalid("This coupon has expired");
  if (coupon.usage_limit != null && coupon.used_count >= coupon.usage_limit) return invalid("This coupon has reached its usage limit");
  if (total < Number(coupon.min_order_amount || 0)) {
    return invalid(`Minimum order of ₹${Number(coupon.min_order_amount).toLocaleString("en-IN")} required`);
  }

  // Audience targeting: first-time customers only.
  if (coupon.eligibility === "first_order") {
    if (!userId) return invalid("Please sign in to use this coupon");
    const { count } = await admin
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("payment_status", "paid");
    if ((count ?? 0) > 0) return invalid("This coupon is valid only on your first order");
  }

  // Compute the discount.
  let discount = 0;
  if (coupon.discount_type === "percentage") {
    discount = Math.round((total * Number(coupon.discount_value)) / 100);
    if (coupon.max_discount != null) discount = Math.min(discount, Number(coupon.max_discount));
  } else {
    discount = Number(coupon.discount_value);
  }
  discount = Math.min(discount, total); // never discount more than the order total

  return {
    valid:            true,
    discount,
    discount_type:    coupon.discount_type,
    discount_value:   Number(coupon.discount_value),
    min_order_amount: Number(coupon.min_order_amount || 0),
    max_discount:     coupon.max_discount != null ? Number(coupon.max_discount) : null,
    coupon_id:        coupon.id,
  };
}
