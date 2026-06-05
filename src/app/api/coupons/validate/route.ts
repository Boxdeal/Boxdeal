import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const { code, order_total } = await req.json();
  if (!code) return NextResponse.json({ error: "Coupon code required" }, { status: 400 });

  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase.rpc("validate_coupon", {
    p_code:        code.toUpperCase(),
    p_order_total: order_total,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}
