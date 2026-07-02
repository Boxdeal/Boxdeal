import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient, getSupabaseAdminClient } from "@/lib/supabase/server";
import { validateCoupon } from "@/lib/coupons/server";

// Coupon validation for display on the checkout page. Uses the exact same
// server-side rules (validateCoupon) that order creation uses to compute the
// discount actually charged, so what the customer is quoted here always matches
// what they're billed.
export async function POST(req: NextRequest) {
  const { code, order_total } = await req.json();
  if (!code) return NextResponse.json({ error: "Coupon code required" }, { status: 400 });

  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  const admin = getSupabaseAdminClient();

  const result = await validateCoupon(admin, String(code), Number(order_total) || 0, user?.id ?? null);

  if (!result.valid) {
    return NextResponse.json({ data: { valid: false, message: result.message } });
  }

  return NextResponse.json({
    data: {
      valid:            true,
      discount:         result.discount,
      discount_type:    result.discount_type,
      discount_value:   result.discount_value,
      min_order_amount: result.min_order_amount,
      max_discount:     result.max_discount,
      coupon_id:        result.coupon_id,
    },
  });
}
