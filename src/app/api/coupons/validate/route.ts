import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient, getSupabaseAdminClient } from "@/lib/supabase/server";

// Self-contained coupon validation (no DB function dependency).
export async function POST(req: NextRequest) {
  const { code, order_total } = await req.json();
  if (!code) return NextResponse.json({ error: "Coupon code required" }, { status: 400 });

  const total = Number(order_total) || 0;
  const upperCode = String(code).toUpperCase();

  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  const admin = getSupabaseAdminClient();

  const { data: coupon } = await admin
    .from("coupons")
    .select("*")
    .eq("code", upperCode)
    .single();

  const invalid = (message: string) => NextResponse.json({ data: { valid: false, message } });

  if (!coupon || coupon.is_active === false) return invalid("Invalid or expired coupon");
  if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) return invalid("This coupon has expired");
  if (coupon.usage_limit != null && coupon.used_count >= coupon.usage_limit) return invalid("This coupon has reached its usage limit");
  if (total < Number(coupon.min_order_amount || 0)) {
    return invalid(`Minimum order of ₹${Number(coupon.min_order_amount).toLocaleString("en-IN")} required`);
  }

  // Audience targeting: first-time customers only.
  if (coupon.eligibility === "first_order") {
    if (!user) return invalid("Please sign in to use this coupon");
    const { count } = await admin
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
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

  return NextResponse.json({
    data: {
      valid:          true,
      discount,
      discount_type:  coupon.discount_type,
      discount_value: Number(coupon.discount_value),
      coupon_id:      coupon.id,
    },
  });
}
