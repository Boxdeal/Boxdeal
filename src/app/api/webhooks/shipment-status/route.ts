import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import { sendOrderShipped, sendOrderDelivered } from "@/lib/resend/index";
import type { Order, OrderStatus } from "@/types";

// Shiprocket pushes shipment status changes here. Configure this URL under
// Shiprocket → Settings → Webhooks:  https://<your-domain>/api/webhooks/shipment-status
// NOTE: the path deliberately avoids the words "shiprocket"/"sr"/"kr" — Shiprocket
// rejects webhook URLs containing those keywords.
//
// Shared secret: set SHIPROCKET_WEBHOOK_TOKEN in env AND paste the same value as
// the Token (Auth Token Type: x-api-key) in the Shiprocket webhook config. If
// unset, the endpoint accepts all calls.

// Map Shiprocket's free-text status to our internal order status.
// Uses the text label (current_status / shipment_status) rather than the numeric
// current_status_id, since the IDs are inconsistent (e.g. both 18 and 20 report
// "IN TRANSIT"). Order matters: negative/failure states are checked first so
// their substrings aren't misread as success — e.g. "UNDELIVERED" contains
// "delivered", and "RTO DELIVERED" must count as a return, not a delivery.
function mapStatus(srStatus: string): OrderStatus | null {
  const s = srStatus.toLowerCase();
  if (s.includes("rto") || s.includes("return"))     return "returned";
  if (s.includes("cancel"))                          return "cancelled";
  if (s.includes("undelivered"))                     return null; // failed attempt — keep current state
  if (s.includes("out for delivery"))                return "out_for_delivery";
  if (s.includes("delivered"))                       return "delivered";
  if (s.includes("picked up") || s.includes("shipped") || s.includes("in transit")) return "shipped";
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
    console.error("[sr-webhook] invalid JSON body");
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  // Temporary observability: log every inbound call so we can confirm in the
  // Vercel Runtime Logs that Shiprocket is actually delivering webhooks and see
  // the exact payload shape it sends.
  console.log("[sr-webhook] payload:", JSON.stringify(payload));

  // Shiprocket's identifier fields are INCONSISTENT across payload versions:
  //   • Live production orders send  order_id = OUR order_number ("BD...")  +  sr_order_id = their numeric id.
  //   • The documented sample sends  order_id = their numeric id  +  channel_order_id = our order_number.
  // So `order_id` may be EITHER our number or Shiprocket's id. We therefore try
  // every identifier against every column it could plausibly be (below); there
  // are no false positives since "BD..." never collides with a numeric id.
  const str = (v: unknown) => (v != null && v !== "" ? String(v) : undefined);
  const orderId        = str(payload.order_id);
  const channelOrderId = str(payload.channel_order_id);
  const srOrderId      = str(payload.sr_order_id);
  const awb            = str(payload.awb);
  const currentStatus  = (payload.current_status ?? payload.shipment_status) as string | undefined;

  // Always acknowledge with 200 when there's nothing actionable (incomplete
  // payload, unknown status, unknown order). Shiprocket — including its "Test
  // Webhook" button — treats any non-2xx as "endpoint unreachable" and refuses
  // to save the config, so we must never 4xx a well-formed delivery.
  if (!currentStatus || (!orderId && !channelOrderId && !srOrderId && !awb)) {
    return NextResponse.json({ ok: true, ignored: "incomplete payload" });
  }

  const newStatus = mapStatus(String(currentStatus));
  if (!newStatus) {
    // Unknown/intermediate status — acknowledge so Shiprocket doesn't retry.
    return NextResponse.json({ ok: true, ignored: currentStatus });
  }

  const admin = getSupabaseAdminClient();

  // Locate the order by our order_number, cascading through Shiprocket's
  // internal order id and finally the AWB so a match is found regardless of
  // which identifiers this particular callback includes.
  let order: Order | null = null;
  for (const [column, value] of [
    ["order_number",        channelOrderId], // explicit "our number" field
    ["order_number",        orderId],        // live payloads put our number here
    ["shiprocket_order_id", srOrderId],      // their numeric id (live payloads)
    ["shiprocket_order_id", orderId],        // their numeric id (sample payloads)
    ["tracking_number",     awb],            // last resort — always present
  ] as const) {
    if (!value) continue;
    const { data } = await admin.from("orders").select("*").eq(column, value).maybeSingle();
    if (data) { order = data as Order; break; }
  }

  if (!order) {
    // Acknowledge — the AWB/order may simply belong to a different channel.
    console.warn("[sr-webhook] order not found for", { orderId, channelOrderId, srOrderId, awb });
    return NextResponse.json({ ok: true, ignored: "order not found" });
  }
  console.log("[sr-webhook] matched order", order.order_number, "→", newStatus, "(from", currentStatus + ")");

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
