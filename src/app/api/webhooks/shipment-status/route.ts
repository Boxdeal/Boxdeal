import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import { sendOrderShipped, sendOrderDelivered } from "@/lib/resend/index";
import { getTrackingUrl } from "@/lib/shiprocket/index";
import { ENDED_STATUSES, mapShiprocketStatus, STATUS_TIMESTAMP_FIELD } from "@/lib/shiprocket/status";
import { collectCodOnDelivery, settleEndedOrder } from "@/lib/orders/fulfillment";
import type { Order } from "@/types";

// Shiprocket pushes shipment status changes here. Configure this URL under
// Shiprocket → Settings → Webhooks:  https://<your-domain>/api/webhooks/shipment-status
// NOTE: the path deliberately avoids the words "shiprocket"/"sr"/"kr" — Shiprocket
// rejects webhook URLs containing those keywords.
//
// Shared secret: set SHIPROCKET_WEBHOOK_TOKEN in env AND paste the same value as
// the Token (Auth Token Type: x-api-key) in the Shiprocket webhook config. If
// unset, the endpoint accepts all calls.

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
  const str = (v: unknown) => (v != null && v !== "" ? String(v).trim() || undefined : undefined);
  const orderId        = str(payload.order_id);
  const channelOrderId = str(payload.channel_order_id);
  const srOrderId      = str(payload.sr_order_id);
  const awb            = str(payload.awb);
  const courierName    = str(payload.courier_name) ?? str(payload.courier);
  const currentStatus  = (payload.current_status ?? payload.shipment_status) as string | undefined;

  // Always acknowledge with 200 when there's nothing actionable (incomplete
  // payload, unknown status, unknown order). Shiprocket — including its "Test
  // Webhook" button — treats any non-2xx as "endpoint unreachable" and refuses
  // to save the config, so we must never 4xx a well-formed delivery.
  if (!orderId && !channelOrderId && !srOrderId && !awb) {
    return NextResponse.json({ ok: true, ignored: "incomplete payload" });
  }

  const admin = getSupabaseAdminClient();

  // Locate the order by our order_number, cascading through Shiprocket's
  // internal order id and finally the AWB so a match is found regardless of
  // which identifiers this particular callback includes.
  //
  // The AWB is checked LAST on purpose: when a courier is reassigned the payload
  // carries a brand-new AWB that matches nothing, but sr_order_id/order_number
  // still identify the order — which is exactly how a reassignment gets applied.
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

  // ── 1. Shipment details (AWB / courier) ────────────────────────────────────
  // Applied BEFORE any status handling and independently of it. A courier
  // reassignment in the Shiprocket panel issues a NEW AWB while the shipment
  // status often stays the same — so this must not sit behind the "no status
  // change" short-circuit, and it must OVERWRITE the stored AWB rather than only
  // filling in a blank one.
  const shipmentUpdate: Record<string, unknown> = {};
  const shipmentChanges: string[] = [];
  if (awb && awb !== order.tracking_number) {
    shipmentUpdate.tracking_number = awb;
    shipmentUpdate.tracking_url    = getTrackingUrl(awb);
    shipmentChanges.push(`AWB ${order.tracking_number ?? "—"} → ${awb}`);
  }
  if (courierName && courierName !== order.courier_name) {
    shipmentUpdate.courier_name = courierName;
    shipmentChanges.push(`courier ${order.courier_name ?? "—"} → ${courierName}`);
  }

  if (shipmentChanges.length > 0) {
    await admin.from("orders").update(shipmentUpdate).eq("id", order.id);
    await admin.from("order_status_history").insert({
      order_id: order.id,
      status:   order.status,
      note:     `Shiprocket updated shipment: ${shipmentChanges.join(", ")}`,
    });
    Object.assign(order, shipmentUpdate);
    console.log("[sr-webhook]", order.order_number, shipmentChanges.join(", "));
  }

  // ── 2. Status ──────────────────────────────────────────────────────────────
  if (!currentStatus) {
    return NextResponse.json({ ok: true, shipment_synced: shipmentChanges, ignored: "no status" });
  }

  const newStatus = mapShiprocketStatus(String(currentStatus));
  if (!newStatus) {
    // Unknown/intermediate status — acknowledge so Shiprocket doesn't retry.
    return NextResponse.json({ ok: true, shipment_synced: shipmentChanges, ignored: currentStatus });
  }
  console.log("[sr-webhook] matched order", order.order_number, "→", newStatus, "(from", currentStatus + ")");

  // Don't regress a delivered/cancelled/returned order back to an earlier state.
  if (ENDED_STATUSES.includes(order.status) && order.status !== newStatus) {
    return NextResponse.json({ ok: true, shipment_synced: shipmentChanges, skipped: `already ${order.status}` });
  }
  if (order.status === newStatus) {
    return NextResponse.json({ ok: true, shipment_synced: shipmentChanges, skipped: "no change" });
  }

  const updateData: Record<string, unknown> = { status: newStatus };
  const tsField = STATUS_TIMESTAMP_FIELD[newStatus];
  if (tsField) updateData[tsField] = new Date().toISOString();

  // A COD order is collected in cash at the doorstep, so it's only actually
  // "paid" once the courier delivers it. Shared with the admin panel's manual
  // and "Sync from Shiprocket" paths so all three agree.
  if (newStatus === "delivered") {
    Object.assign(updateData, collectCodOnDelivery(order));
  }

  // An order cancelled or returned (RTO) on Shiprocket's side must be settled
  // exactly like one cancelled from our admin panel: stock back and any online
  // payment refunded. Without this, a cancellation done in the Shiprocket panel
  // silently left the stock decremented and the customer's money with us.
  let refunded = false;
  let refundError: string | null = null;
  if (newStatus === "cancelled" || newStatus === "returned") {
    ({ refunded, refundError } = await settleEndedOrder(admin, order));
    if (refunded) updateData.payment_status = "refunded";
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
    note:     `Auto-updated via Shiprocket (${currentStatus})${refunded ? " — refund initiated" : ""}`,
  });

  // Notify the customer on shipped / delivered.
  const { data: authUser } = await admin.auth.admin.getUserById(order.user_id);
  const email = authUser?.user?.email;
  if (email) {
    if (newStatus === "shipped")   await sendOrderShipped(updated as never, email).catch(console.error);
    if (newStatus === "delivered") await sendOrderDelivered(updated as never, email).catch(console.error);
  }

  return NextResponse.json({
    ok: true,
    status: newStatus,
    shipment_synced: shipmentChanges,
    refunded,
    refund_error: refundError,
  });
}
