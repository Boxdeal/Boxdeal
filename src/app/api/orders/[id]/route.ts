import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import { sendOrderShipped, sendOrderDelivered } from "@/lib/resend/index";
import { refundRazorpayPayment } from "@/lib/razorpay/index";
import { createShiprocketOrder, generateAWB, getDeliveryRate, getTrackingUrl, type ShipmentItem } from "@/lib/shiprocket/index";
import type { Order, OrderStatus } from "@/types";
import type { SupabaseClient } from "@supabase/supabase-js";
import { ORDER_CANCEL_WINDOW_HOURS, USER_CANCELLABLE_STATUSES } from "@/constants";

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
      // Force the cheapest courier (the same one whose rate the customer was
      // quoted at checkout) instead of letting Shiprocket auto-assign — so what
      // we bill the customer matches what Shiprocket bills us. Best-effort: if
      // the rate lookup fails, fall back to auto-assign so fulfillment isn't
      // blocked.
      let courierId: number | undefined;
      try {
        const wItems = (srOrder.items ?? []) as Array<{
          quantity: number;
          product?: { weight_grams?: number | null };
        }>;
        const totalGrams = wItems.reduce(
          (s, it) => s + (it.product?.weight_grams ?? 0) * it.quantity,
          0
        );
        const weightKg = Math.max(totalGrams / 1000, 0.1);
        // Pass the order's COD flag so serviceability picks a courier that can
        // actually do COD to this pincode — otherwise generateAWB later fails to
        // assign a prepaid-only courier for a COD shipment ("no courier could be
        // assigned").
        const isCod = srOrder.payment_method === "cod";
        const rate = await getDeliveryRate(String(srOrder.shipping_pincode), weightKg, isCod);
        if (rate.serviceable) courierId = rate.courierId;
      } catch (e) {
        console.error(`Cheapest-courier lookup failed for order ${id}; using auto-assign:`, e);
      }

      // Best-effort: if forcing the quoted cheapest courier can't be assigned
      // (e.g. it doesn't service COD for this pincode), fall back to letting
      // Shiprocket auto-assign its recommended courier rather than failing.
      let awb;
      try {
        awb = await generateAWB(shipmentId, courierId);
      } catch (e) {
        if (!courierId) throw e;
        console.error(`Forced courier ${courierId} failed for order ${id}; retrying with auto-assign:`, e);
        awb = await generateAWB(shipmentId);
      }
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

// Statuses at which an order's stock has already been decremented (online at
// payment verify, COD at creation). Cancelling from any of these must give the
// stock back; cancelling a still-"placed" (unpaid online) order must not.
const STOCK_TAKEN_STATUSES: OrderStatus[] = [
  "confirmed", "packed", "shipped", "out_for_delivery", "delivered",
];

/**
 * Return an order's items to stock. Best-effort & idempotent-safe to call once
 * per cancellation: only call it when the order was in a stock-taken status.
 */
async function restoreOrderStock(admin: SupabaseClient, id: string): Promise<void> {
  const { data: items } = await admin
    .from("order_items")
    .select("product_id, quantity")
    .eq("order_id", id);
  if (!items?.length) return;

  const results = await Promise.allSettled(
    items.map((it) =>
      admin.rpc("restore_stock", { p_product_id: it.product_id, p_quantity: it.quantity })
    )
  );
  results.forEach((r, i) => {
    if (r.status === "rejected") {
      console.error(`Stock restore failed for ${items[i].product_id} on order ${id}:`, r.reason);
    }
  });
}

/**
 * Refund a cancelled order's payment back to the customer, if it was paid
 * online via Razorpay. Best-effort & safe to call for any order: COD or unpaid
 * orders are a no-op. A refund failure is returned (not thrown) so the caller
 * can still cancel the order and surface the error for a manual refund.
 */
async function refundOrderPayment(
  id: string,
  order: {
    payment_status: string | null;
    payment_method: string | null;
    razorpay_payment_id: string | null;
    total_amount: number;
  }
): Promise<{ refunded: boolean; error: string | null }> {
  const wasPaidOnline =
    order.payment_status === "paid" &&
    order.payment_method === "razorpay" &&
    !!order.razorpay_payment_id;
  if (!wasPaidOnline) return { refunded: false, error: null };

  try {
    await refundRazorpayPayment(
      order.razorpay_payment_id as string,
      Math.round(order.total_amount * 100)
    );
    return { refunded: true, error: null };
  } catch (e) {
    console.error(`Razorpay refund failed for order ${id}:`, e);
    return {
      refunded: false,
      error: e instanceof Error ? e.message : "Refund failed",
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

  const body = await req.json();

  // ── Customer self-cancellation ──────────────────────────────────────────
  // A buyer can cancel their OWN order within ORDER_CANCEL_WINDOW_HOURS of
  // placing it, as long as it hasn't been packed/shipped yet (per /returns
  // policy). Handled before the admin gate so it doesn't require is_admin.
  if (body.action === "cancel") {
    const admin = getSupabaseAdminClient();
    const { data: order } = await admin
      .from("orders")
      .select("id, user_id, status, placed_at, payment_method, payment_status, razorpay_payment_id, total_amount")
      .eq("id", id)
      .single();

    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
    if (order.user_id !== user.id)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    if (!USER_CANCELLABLE_STATUSES.includes(order.status as OrderStatus)) {
      return NextResponse.json(
        { error: "This order can no longer be cancelled as it is already being processed for shipping." },
        { status: 400 }
      );
    }

    const hoursSincePlaced =
      (Date.now() - new Date(order.placed_at).getTime()) / (1000 * 60 * 60);
    if (hoursSincePlaced > ORDER_CANCEL_WINDOW_HOURS) {
      return NextResponse.json(
        { error: `Orders can only be cancelled within ${ORDER_CANCEL_WINDOW_HOURS} hours of placing them.` },
        { status: 400 }
      );
    }

    // Auto-refund a paid online payment back to the original method. Best-effort:
    // a refund failure must NOT block the cancellation — we still cancel the order
    // and surface the error so the team can refund manually.
    const { refunded, error: refundError } = await refundOrderPayment(id, order);

    const { data: cancelled, error: cancelError } = await admin
      .from("orders")
      .update({
        status: "cancelled",
        cancelled_at: new Date().toISOString(),
        ...(refunded ? { payment_status: "refunded" } : {}),
      })
      .eq("id", id)
      .select()
      .single();
    if (cancelError)
      return NextResponse.json({ error: cancelError.message }, { status: 500 });

    // Give the stock back if it had already been taken (i.e. not a still-unpaid
    // "placed" online order).
    if (STOCK_TAKEN_STATUSES.includes(order.status as OrderStatus)) {
      await restoreOrderStock(admin, id);
    }

    await admin.from("order_status_history").insert({
      order_id:   id,
      status:     "cancelled",
      note:       refunded
        ? "Cancelled by customer — refund initiated"
        : "Cancelled by customer",
      updated_by: user.id,
    });

    return NextResponse.json({ data: cancelled, refunded, refund_error: refundError });
  }

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();
  if (!profile?.is_admin)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

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

  // When an admin cancels an order, auto-refund any online payment too (same
  // behaviour as a customer self-cancel). Best-effort — see refundOrderPayment.
  let refunded = false;
  let refundError: string | null = null;
  if (status === "cancelled") {
    updateData.cancelled_at = new Date().toISOString();
    const { data: payInfo } = await admin
      .from("orders")
      .select("status, payment_status, payment_method, razorpay_payment_id, total_amount")
      .eq("id", id)
      .single();
    if (payInfo) {
      ({ refunded, error: refundError } = await refundOrderPayment(id, payInfo));
      if (refunded) updateData.payment_status = "refunded";
      // Give stock back if it had already been taken for this order.
      if (STOCK_TAKEN_STATUSES.includes(payInfo.status as OrderStatus)) {
        await restoreOrderStock(admin, id);
      }
    }
  }

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
    note:       refunded ? `${note ? `${note} — ` : ""}Refund initiated` : note ?? null,
    updated_by: user.id,
  });

  // Send emails
  const { data: authUser } = await admin.auth.admin.getUserById(order.user_id);
  const email = authUser?.user?.email;
  if (email) {
    if (status === "shipped")   await sendOrderShipped(order as never, email).catch(console.error);
    if (status === "delivered") await sendOrderDelivered(order as never, email).catch(console.error);
  }

  return NextResponse.json({
    data: order,
    shiprocket_error: shiprocketError,
    refunded,
    refund_error: refundError,
  });
}
