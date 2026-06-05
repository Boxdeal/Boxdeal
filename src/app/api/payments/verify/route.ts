import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import { verifyRazorpaySignature } from "@/lib/razorpay/index";
import { sendOrderConfirmation } from "@/lib/resend/index";

export async function POST(req: NextRequest) {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const {
    db_order_id,
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  } = await req.json();

  const valid = verifyRazorpaySignature(
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature
  );

  if (!valid)
    return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });

  const admin = getSupabaseAdminClient();

  const { data: order, error } = await admin
    .from("orders")
    .update({
      payment_status:      "paid",
      razorpay_payment_id: razorpay_payment_id,
      razorpay_signature:  razorpay_signature,
      status:              "confirmed",
      confirmed_at:        new Date().toISOString(),
    })
    .eq("id", db_order_id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await admin.from("order_status_history").insert({
    order_id: db_order_id,
    status:   "confirmed",
    note:     "Payment received via Razorpay",
  });

  // Send confirmation email
  const { data: authUser } = await admin.auth.admin.getUserById(user.id);
  const email = authUser?.user?.email;
  if (email) {
    const { data: fullOrder } = await admin
      .from("orders")
      .select("*, items:order_items(*)")
      .eq("id", db_order_id)
      .single();
    if (fullOrder) {
      await sendOrderConfirmation(fullOrder as never, email).catch(console.error);
    }
  }

  return NextResponse.json({ data: { success: true } });
}
