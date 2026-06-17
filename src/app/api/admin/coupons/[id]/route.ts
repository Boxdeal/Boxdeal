import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/supabase/admin-guard";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await requireAdmin();
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const b = await req.json();
  const fields: Record<string, unknown> = {};

  if (typeof b.code === "string") fields.code = b.code.trim().toUpperCase();
  if (b.discount_type) fields.discount_type = b.discount_type === "fixed" ? "fixed" : "percentage";
  if (b.discount_value != null) {
    const v = Number(b.discount_value);
    if (!v || v <= 0) return NextResponse.json({ error: "Discount value must be greater than 0" }, { status: 400 });
    fields.discount_value = v;
  }
  if ("min_order_amount" in b) fields.min_order_amount = Number(b.min_order_amount) || 0;
  if ("max_discount" in b) fields.max_discount = b.max_discount ? Number(b.max_discount) : null;
  if ("usage_limit" in b) fields.usage_limit = b.usage_limit ? Number(b.usage_limit) : null;
  if ("expires_at" in b) fields.expires_at = b.expires_at || null;
  if ("is_active" in b) fields.is_active = b.is_active;
  if ("eligibility" in b) fields.eligibility = b.eligibility === "first_order" ? "first_order" : "all";

  const admin = getSupabaseAdminClient();
  const { data, error } = await admin.from("coupons").update(fields).eq("id", id).select().single();
  if (error) {
    const msg = error.code === "23505" ? "A coupon with this code already exists" : error.message;
    return NextResponse.json({ error: msg }, { status: 400 });
  }
  return NextResponse.json({ data });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await requireAdmin();
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const admin = getSupabaseAdminClient();
  const { error } = await admin.from("coupons").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ data: { success: true } });
}
