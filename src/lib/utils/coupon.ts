import type { CouponValidationResult } from "@/types";

type AppliedCoupon = (CouponValidationResult & { code?: string }) | null | undefined;

/**
 * Recomputes a coupon's discount against the CURRENT cart subtotal.
 *
 * The discount is intentionally NOT a frozen number — it is derived every
 * time the subtotal changes (item added/removed, quantity +/-), so the saving
 * always matches what's actually in the cart. Mirrors the server-side rules in
 * /api/coupons/validate. Returns 0 when there's no valid coupon, the cart is
 * empty, or the subtotal no longer meets the coupon's minimum order.
 */
export function computeCouponDiscount(coupon: AppliedCoupon, subtotal: number): number {
  if (!coupon?.valid || subtotal <= 0) return 0;

  const minOrder = Number(coupon.min_order_amount ?? 0);
  if (subtotal < minOrder) return 0;

  let discount = 0;
  if (coupon.discount_type === "percentage") {
    discount = Math.round((subtotal * Number(coupon.discount_value ?? 0)) / 100);
    if (coupon.max_discount != null) discount = Math.min(discount, Number(coupon.max_discount));
  } else {
    discount = Number(coupon.discount_value ?? 0);
  }

  // Never discount more than the order total.
  return Math.min(discount, subtotal);
}
