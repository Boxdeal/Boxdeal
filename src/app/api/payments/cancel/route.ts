import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseAdminClient } from "@/lib/supabase/server";

// Called when the customer dismisses the Razorpay popup without paying.
// The order is still "pending" and no stock was taken, so we just mark it
// cancelled to keep pending orders clean for the admin dashboard.
export async function POST(req: NextRequest) {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { db_order_id } = await req.json();
  if (!db_order_id) return NextResponse.json({ error: "Missing order id" }, { status: 400 });

  const admin = getSupabaseAdminClient();

  // Only cancel the user's own order, and only if it never got paid.
  const { error } = await admin
    .from("orders")
    .update({ payment_status: "failed", status: "cancelled", cancelled_at: new Date().toISOString() })
    .eq("id", db_order_id)
    .eq("user_id", user.id)
    .eq("payment_status", "pending");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ data: { success: true } });
}
