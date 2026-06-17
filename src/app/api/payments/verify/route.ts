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

  const admin = getSupabaseAdminClient();

  const valid = verifyRazorpaySignature(
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature
  );

  // Bad signature → mark this order failed so it doesn't linger as "pending".
  if (!valid) {
    await admin
      .from("orders")
      .update({ payment_status: "failed", status: "cancelled", cancelled_at: new Date().toISOString() })
      .eq("id", db_order_id)
      .eq("user_id", user.id);
    return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
  }

  // Load the order (with its items) so we can take stock and apply the coupon.
  const { data: fullOrder, error: loadError } = await admin
    .from("orders")
    .select("*, items:order_items(product_id, quantity)")
    .eq("id", db_order_id)
    .eq("user_id", user.id)
    .single();

  if (loadError || !fullOrder)
    return NextResponse.json({ error: "Order not found" }, { status: 404 });

  // Payment already succeeded, so confirm the order first — never block a
  // paying customer on a stock hiccup.
  const { error } = await admin
    .from("orders")
    .update({
      payment_status:      "paid",
      razorpay_payment_id: razorpay_payment_id,
      razorpay_signature:  razorpay_signature,
      status:              "confirmed",
      confirmed_at:        new Date().toISOString(),
    })
    .eq("id", db_order_id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Decrement stock now that payment is confirmed. Run in parallel and don't
  // fail the request if one product is short — log it for admin reconciliation.
  const orderItems = (fullOrder.items as Array<{ product_id: string; quantity: number }>) ?? [];
  const stockResults = await Promise.allSettled(
    orderItems.map(item =>
      admin.rpc("decrement_stock", {
        p_product_id: item.product_id,
        p_quantity:   item.quantity,
      })
    )
  );
  stockResults.forEach((r, i) => {
    if (r.status === "rejected") {
      console.error(`Stock decrement failed for ${orderItems[i].product_id} on order ${db_order_id}:`, r.reason);
    }
  });

  // Consume the coupon now (not at create), so abandoned checkouts don't use it up.
  if (fullOrder.coupon_code) {
    const couponCode = String(fullOrder.coupon_code).toUpperCase();
    const { data: coupon } = await admin
      .from("coupons")
      .select("id, used_count, usage_limit")
      .eq("code", couponCode)
      .single();

    if (coupon && (coupon.usage_limit == null || coupon.used_count < coupon.usage_limit)) {
      await admin
        .from("coupons")
        .update({ used_count: coupon.used_count + 1 })
        .eq("code", couponCode);
    }
  }

  await admin.from("order_status_history").insert({
    order_id: db_order_id,
    status:   "confirmed",
    note:     "Payment received via Razorpay",
  });

  // Send confirmation email
  const { data: authUser } = await admin.auth.admin.getUserById(user.id);
  const email = authUser?.user?.email;
  if (email) {
    await sendOrderConfirmation(fullOrder as never, email).catch(console.error);
  }

  return NextResponse.json({ data: { success: true } });
}
