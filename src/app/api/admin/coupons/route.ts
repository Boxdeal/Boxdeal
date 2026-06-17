import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/supabase/admin-guard";

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const b = await req.json();
  const code = (b.code || "").trim().toUpperCase();
  if (!code) return NextResponse.json({ error: "Coupon code is required" }, { status: 400 });

  const discountType = b.discount_type === "fixed" ? "fixed" : "percentage";
  const discountValue = Number(b.discount_value);
  if (!discountValue || discountValue <= 0) {
    return NextResponse.json({ error: "Discount value must be greater than 0" }, { status: 400 });
  }
  if (discountType === "percentage" && discountValue > 100) {
    return NextResponse.json({ error: "Percentage discount cannot exceed 100" }, { status: 400 });
  }

  const payload = {
    code,
    discount_type:    discountType,
    discount_value:   discountValue,
    min_order_amount: Number(b.min_order_amount) || 0,
    max_discount:     b.max_discount ? Number(b.max_discount) : null,
    usage_limit:      b.usage_limit ? Number(b.usage_limit) : null,
    expires_at:       b.expires_at || null,
    is_active:        b.is_active ?? true,
    eligibility:      b.eligibility === "first_order" ? "first_order" : "all",
  };

  const admin = getSupabaseAdminClient();
  const { data, error } = await admin.from("coupons").insert(payload).select().single();
  if (error) {
    const msg = error.code === "23505" ? "A coupon with this code already exists" : error.message;
    return NextResponse.json({ error: msg }, { status: 400 });
  }
  return NextResponse.json({ data });
}
