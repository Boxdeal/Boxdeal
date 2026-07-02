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

  // Load the order (with its full items) so we can take stock, apply the coupon,
  // AND render a complete confirmation email (needs name/price, not just id/qty).
  const { data: fullOrder, error: loadError } = await admin
    .from("orders")
    .select("*, items:order_items(*)")
    .eq("id", db_order_id)
    .eq("user_id", user.id)
    .single();

  if (loadError || !fullOrder)
    return NextResponse.json({ error: "Order not found" }, { status: 404 });

  // Payment already succeeded, so confirm the order first — never block a
  // paying customer on a stock hiccup.
  //
  // Idempotency: only the transition from "pending" → "paid" is allowed to run
  // the stock/coupon/email side-effects. If verify is called twice (network
  // retry, double submit), the guard `.eq("payment_status", "pending")` means
  // the second call updates zero rows, so we return success WITHOUT decrementing
  // stock or consuming the coupon a second time.
  const { data: flipped, error } = await admin
    .from("orders")
    .update({
      payment_status:      "paid",
      razorpay_payment_id: razorpay_payment_id,
      razorpay_signature:  razorpay_signature,
      status:              "confirmed",
      confirmed_at:        new Date().toISOString(),
    })
    .eq("id", db_order_id)
    .eq("payment_status", "pending")
    .select("id");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Already processed by an earlier verify call — nothing more to do.
  if (!flipped || flipped.length === 0) {
    return NextResponse.json({ data: { success: true, already_processed: true } });
  }

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

  // Consume the coupon now (not at create), so abandoned checkouts don't use it
  // up. Atomic increment that only counts up while under the usage limit, so
  // concurrent orders can't push past it (see increment_coupon_usage).
  if (fullOrder.coupon_code) {
    const couponCode = String(fullOrder.coupon_code).toUpperCase();
    const { error: couponErr } = await admin.rpc("increment_coupon_usage", { p_code: couponCode });
    if (couponErr) console.error(`Coupon usage increment failed for ${couponCode} on order ${db_order_id}:`, couponErr);
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
