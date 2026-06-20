import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import { sendOrderShipped, sendOrderDelivered } from "@/lib/resend/index";
import { createShiprocketOrder, generateAWB, getTrackingUrl, type ShipmentItem } from "@/lib/shiprocket/index";
import type { Order, OrderStatus } from "@/types";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Push an order to Shiprocket and assign a courier/AWB.
 *
 * Resilient & idempotent so it can be safely retried:
 *  - If the order was never pushed, we create it and persist the Shiprocket
 *    order/shipment IDs IMMEDIATELY — so a later AWB failure never loses them
 *    (which would otherwise cause a duplicate order on the next attempt).
 *  - If the order already exists on Shiprocket, we skip creation and only
 *    (re)generate the AWB for the existing shipment.
 *  - If tracking already exists, it's a no-op.
 *
 * Returns the fields to merge into the order update, plus any error to surface.
 */
async function fulfillShiprocket(
  admin: SupabaseClient,
  id: string
): Promise<{ update: Record<string, unknown>; error: string | null }> {
  const update: Record<string, unknown> = {};
  try {
    const { data: srOrder } = await admin
      .from("orders")
      .select(`
        *,
        items:order_items(
          *,
          product:products(weight_grams, length_cm, breadth_cm, height_cm)
        )
      `)
      .eq("id", id)
      .single();

    if (!srOrder) return { update, error: "Order not found" };
    // Already fully fulfilled — nothing to do.
    if (srOrder.tracking_number) return { update, error: null };

    let shipmentId: number | null = srOrder.shiprocket_shipment_id
      ? Number(srOrder.shiprocket_shipment_id)
      : null;

    // Step 1 — create the order on Shiprocket (only if not already pushed).
    if (!srOrder.shiprocket_order_id) {
      const items: ShipmentItem[] = (srOrder.items ?? []).map(
        (it: ShipmentItem & { product?: { weight_grams: number; length_cm: number; breadth_cm: number; height_cm: number } }) => ({
          ...it,
          weight_grams: it.product?.weight_grams ?? 0,
          length_cm:    it.product?.length_cm    ?? 0,
          breadth_cm:   it.product?.breadth_cm   ?? 0,
          height_cm:    it.product?.height_cm    ?? 0,
        })
      );

      const created = await createShiprocketOrder({ ...(srOrder as Order), items });
      shipmentId = created.shipment_id;
      update.shiprocket_order_id    = String(created.order_id);
      update.shiprocket_shipment_id = String(created.shipment_id);

      // Persist the IDs right away, BEFORE attempting AWB. If AWB fails, the
      // order is still linked — the next retry skips creation (no duplicate).
      await admin
        .from("orders")
        .update({
          shiprocket_order_id:    update.shiprocket_order_id,
          shiprocket_shipment_id: update.shiprocket_shipment_id,
        })
        .eq("id", id);
    }

    // Step 2 — assign courier / generate AWB for the shipment.
    if (shipmentId) {
      const awb = await generateAWB(shipmentId);
      update.tracking_number = awb.awb_code;
      update.courier_name    = awb.courier_name;
      update.tracking_url    = getTrackingUrl(awb.awb_code);
    }

    return { update, error: null };
  } catch (e) {
    console.error(`Shiprocket fulfillment failed for order ${id}:`, e);
    return {
      update,
      error: e instanceof Error ? e.message : "Shiprocket fulfillment failed",
    };
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();
  if (!profile?.is_admin)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const { status, note, tracking_number, courier_name, action } = body as {
    status?: OrderStatus;
    note?: string;
    tracking_number?: string;
    courier_name?: string;
    action?: string;
  };

  const admin = getSupabaseAdminClient();

  // Retry-only path: re-run Shiprocket fulfillment (create order if needed +
  // generate AWB) WITHOUT changing the order status. Used by the admin "Retry
  // tracking" button after fixing wallet balance / serviceability.
  if (action === "retry_shiprocket") {
    const { update, error: srError } = await fulfillShiprocket(admin, id);
    if (Object.keys(update).length > 0) {
      const { error } = await admin.from("orders").update(update).eq("id", id);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({
      ok: !srError && !!update.tracking_number,
      shiprocket_error: srError,
    });
  }

  if (!status) {
    return NextResponse.json({ error: "Missing status" }, { status: 400 });
  }

  const updateData: Record<string, unknown> = { status };
  if (status === "confirmed")        updateData.confirmed_at = new Date().toISOString();
  if (status === "packed")           updateData.packed_at    = new Date().toISOString();
  if (status === "shipped") {
    updateData.shipped_at = new Date().toISOString();
    // Allow a manual override only when Shiprocket didn't already fill these in.
    if (tracking_number) updateData.tracking_number = tracking_number;
    if (courier_name)    updateData.courier_name    = courier_name;
  }
  if (status === "delivered")        updateData.delivered_at = new Date().toISOString();
  if (status === "cancelled")        updateData.cancelled_at = new Date().toISOString();

  // When packing, push the order to Shiprocket and auto-assign a courier/AWB.
  // Best-effort: a Shiprocket failure must not block the admin from packing —
  // we surface the error in the response so the UI can warn, but still proceed.
  let shiprocketError: string | null = null;
  if (status === "packed") {
    const { update, error } = await fulfillShiprocket(admin, id);
    Object.assign(updateData, update);
    shiprocketError = error;
  }

  const { data: order, error } = await admin
    .from("orders")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await admin.from("order_status_history").insert({
    order_id:   id,
    status,
    note:       note ?? null,
    updated_by: user.id,
  });

  // Send emails
  const { data: authUser } = await admin.auth.admin.getUserById(order.user_id);
  const email = authUser?.user?.email;
  if (email) {
    if (status === "shipped")   await sendOrderShipped(order as never, email).catch(console.error);
    if (status === "delivered") await sendOrderDelivered(order as never, email).catch(console.error);
  }

  return NextResponse.json({ data: order, shiprocket_error: shiprocketError });
}
