import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import { sendOrderShipped, sendOrderDelivered } from "@/lib/resend/index";
import type { OrderStatus } from "@/types";

// Shiprocket pushes shipment status changes here. Configure this URL under
// Shiprocket → Settings → Webhooks:  https://<your-domain>/api/webhooks/shipment-status
// NOTE: the path deliberately avoids the words "shiprocket"/"sr"/"kr" — Shiprocket
// rejects webhook URLs containing those keywords.
//
// Shared secret: set SHIPROCKET_WEBHOOK_TOKEN in env AND paste the same value as
// the Token (Auth Token Type: x-api-key) in the Shiprocket webhook config. If
// unset, the endpoint accepts all calls.

// Map Shiprocket's free-text status to our internal order status.
function mapStatus(srStatus: string): OrderStatus | null {
  const s = srStatus.toLowerCase();
  if (s.includes("out for delivery"))               return "out_for_delivery";
  if (s.includes("delivered") && !s.includes("rto")) return "delivered";
  if (s.includes("picked up") || s === "shipped" || s.includes("in transit")) return "shipped";
  if (s.includes("rto") || s.includes("return"))    return "returned";
  if (s.includes("cancel"))                          return "cancelled";
  return null;
}

const TIMESTAMP_FIELD: Partial<Record<OrderStatus, string>> = {
  shipped:   "shipped_at",
  delivered: "delivered_at",
  cancelled: "cancelled_at",
};

export async function POST(req: NextRequest) {
  const expectedToken = process.env.SHIPROCKET_WEBHOOK_TOKEN;
  if (expectedToken) {
    const token = req.headers.get("x-api-key");
    if (token !== expectedToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  let payload: Record<string, unknown>;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  // Shiprocket sends our order_number back as `order_id`; AWB as `awb`.
  const orderNumber  = (payload.order_id ?? payload.channel_order_id) as string | undefined;
  const awb          = payload.awb as string | undefined;
  const currentStatus = (payload.current_status ?? payload.shipment_status) as string | undefined;

  // Always acknowledge with 200 when there's nothing actionable (incomplete
  // payload, unknown status, unknown order). Shiprocket — including its "Test
  // Webhook" button — treats any non-2xx as "endpoint unreachable" and refuses
  // to save the config, so we must never 4xx a well-formed delivery.
  if (!currentStatus || (!orderNumber && !awb)) {
    return NextResponse.json({ ok: true, ignored: "incomplete payload" });
  }

  const newStatus = mapStatus(String(currentStatus));
  if (!newStatus) {
    // Unknown/intermediate status — acknowledge so Shiprocket doesn't retry.
    return NextResponse.json({ ok: true, ignored: currentStatus });
  }

  const admin = getSupabaseAdminClient();

  // Locate the order by order_number, falling back to AWB / tracking number.
  let query = admin.from("orders").select("*");
  query = orderNumber ? query.eq("order_number", orderNumber) : query.eq("tracking_number", awb!);
  const { data: order } = await query.single();

  if (!order) {
    // Acknowledge — the AWB/order may simply belong to a different channel.
    return NextResponse.json({ ok: true, ignored: "order not found" });
  }

  // Don't regress a delivered/cancelled order back to an earlier state.
  if (["delivered", "cancelled", "returned"].includes(order.status) && order.status !== newStatus) {
    return NextResponse.json({ ok: true, skipped: `already ${order.status}` });
  }
  if (order.status === newStatus) {
    return NextResponse.json({ ok: true, skipped: "no change" });
  }

  const updateData: Record<string, unknown> = { status: newStatus };
  const tsField = TIMESTAMP_FIELD[newStatus];
  if (tsField) updateData[tsField] = new Date().toISOString();
  if (awb && !order.tracking_number) updateData.tracking_number = awb;

  // A COD order is collected in cash at the doorstep, so it's only actually
  // "paid" once the courier delivers it. Online (Razorpay) orders are already
  // paid at checkout, so this never touches them.
  if (
    newStatus === "delivered" &&
    order.payment_method === "cod" &&
    order.payment_status !== "paid"
  ) {
    updateData.payment_status = "paid";
  }

  const { data: updated, error } = await admin
    .from("orders")
    .update(updateData)
    .eq("id", order.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await admin.from("order_status_history").insert({
    order_id: order.id,
    status:   newStatus,
    note:     `Auto-updated via Shiprocket (${currentStatus})`,
  });

  // Notify the customer on shipped / delivered.
  const { data: authUser } = await admin.auth.admin.getUserById(order.user_id);
  const email = authUser?.user?.email;
  if (email) {
    if (newStatus === "shipped")   await sendOrderShipped(updated as never, email).catch(console.error);
    if (newStatus === "delivered") await sendOrderDelivered(updated as never, email).catch(console.error);
  }

  return NextResponse.json({ ok: true, status: newStatus });
}
