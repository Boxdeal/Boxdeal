import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import { sendOrderShipped, sendOrderDelivered } from "@/lib/resend/index";
import { resolveParcel, type WeighableItem } from "@/lib/shipping/package";
import { saveShipmentCost } from "@/lib/orders/shipping-record";
import { createShiprocketOrder, generateAWB, getCourierCost, getDeliveryRate, getShiprocketOrder, getTrackingUrl, updateShiprocketAddress, cancelShipmentAwb, cancelShiprocketOrder, type ShipmentItem } from "@/lib/shiprocket/index";
import { cancelOnShiprocket, collectCodOnDelivery, settleEndedOrder } from "@/lib/orders/fulfillment";
import { ENDED_STATUSES, mapShiprocketStatus, STATUS_TIMESTAMP_FIELD } from "@/lib/shiprocket/status";
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

    // The parcel that ships: computed from every unit of every item, or the
    // box/weight the admin measured before packing (resolveParcel). One value
    // for the Shiprocket order, the courier choice and the cost record.
    const weighable: WeighableItem[] = (srOrder.items ?? []).map(
      (it: { quantity: number; product?: { weight_grams?: number | null; length_cm?: number | null; breadth_cm?: number | null; height_cm?: number | null } }) => ({
        quantity:     it.quantity,
        weight_grams: it.product?.weight_grams,
        length_cm:    it.product?.length_cm,
        breadth_cm:   it.product?.breadth_cm,
        height_cm:    it.product?.height_cm,
      })
    );
    const parcel = resolveParcel(weighable, srOrder);

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

      // Shiprocket dedupes ad-hoc orders by channel order_id. A restored order was
      // already pushed once under its plain number (now cancelled on Shiprocket's
      // side), so re-shipping under the same number returns the OLD cancelled
      // shipment and AWB generation fails. Suffix "-R<n>" from a per-order push
      // counter so each re-ship gets a brand-new Shiprocket shipment.
      const attempt = Number(srOrder.shiprocket_attempt ?? 0);
      const channelOrderId = attempt === 0
        ? srOrder.order_number
        : `${srOrder.order_number}-R${attempt}`;

      const created = await createShiprocketOrder({ ...(srOrder as Order), items }, channelOrderId, parcel);
      shipmentId = created.shipment_id;
      update.shiprocket_order_id    = String(created.order_id);
      update.shiprocket_shipment_id = String(created.shipment_id);
      update.shiprocket_attempt     = attempt + 1;

      // Persist the IDs right away, BEFORE attempting AWB. If AWB fails, the
      // order is still linked — the next retry skips creation (no duplicate).
      await admin
        .from("orders")
        .update({
          shiprocket_order_id:    update.shiprocket_order_id,
          shiprocket_shipment_id: update.shiprocket_shipment_id,
          shiprocket_attempt:     update.shiprocket_attempt,
        })
        .eq("id", id);
    }

    // Step 2 — assign courier / generate AWB for the shipment.
    if (shipmentId) {
      const isCod = srOrder.payment_method === "cod";
      const pincode = String(srOrder.shipping_pincode);
      const declared = Number(srOrder.total_amount) || undefined;

      // Couriers to try, in order:
      //  1. the one checkout quoted — the customer's delivery charge came from
      //     its rate, so shipping with it keeps the two equal;
      //  2. today's best pick (price + RTO risk), in case (1) can't take it now;
      //  3. Shiprocket's own auto-assign, so a parcel is never stuck.
      // COD is passed so only couriers that can do COD to the pincode qualify.
      const candidates: number[] = [];
      if (srOrder.quoted_courier_id) candidates.push(Number(srOrder.quoted_courier_id));
      try {
        const live = await getDeliveryRate(pincode, parcel.chargeableKg, isCod, declared);
        if (live.serviceable && !candidates.includes(live.courierId)) candidates.push(live.courierId);
      } catch (e) {
        console.error(`Courier lookup failed for order ${id}; trying quoted courier / auto-assign:`, e);
      }

      let awb: Awaited<ReturnType<typeof generateAWB>> | null = null;
      let assignedId: number | null = null;
      for (const courierId of candidates) {
        try {
          awb = await generateAWB(shipmentId, courierId);
          assignedId = courierId;
          break;
        } catch (e) {
          console.error(`Courier ${courierId} could not be assigned for order ${id}; trying the next option:`, e);
        }
      }
      if (!awb) awb = await generateAWB(shipmentId);   // auto-assign; throws if that fails too

      update.tracking_number = awb.awb_code;
      update.courier_name    = awb.courier_name;
      update.tracking_url    = getTrackingUrl(awb.awb_code);

      // Shiprocket's AWB response sometimes omits courier_name even though it
      // did assign a courier. generateAWB only throws on a missing awb_code, so
      // without this fallback the parcel is stored with a live AWB and no
      // courier — it then ships, delivers and even RTOs while belonging to no
      // partner in the Delivery tab. Ask the order endpoint for the name.
      const srId = (update.shiprocket_order_id ?? srOrder.shiprocket_order_id) as string | undefined;
      if (!update.courier_name && srId) {
        try {
          const live = await getShiprocketOrder(srId);
          if (live.courier_name) update.courier_name = live.courier_name;
        } catch (e) {
          console.error(`Courier-name lookup failed for order ${id} (AWB ${awb.awb_code}):`, e);
        }
      }
      if (!update.courier_name) {
        console.error(`Order ${id} got AWB ${awb.awb_code} with NO courier name — Delivery tab cannot attribute it.`);
      }

      // What this shipment costs us, for the shipping-cost report: Shiprocket's
      // live price for the courier that got the AWB, on the parcel we declared.
      // Best-effort — a lookup failure only leaves the cost blank.
      let shippingCost: number | null = null;
      const costCourier = awb.courier_id ?? assignedId;
      if (costCourier) {
        try {
          shippingCost = await getCourierCost(pincode, parcel.chargeableKg, isCod, declared, costCourier);
        } catch (e) {
          console.error(`Shipping cost lookup failed for order ${id}:`, e);
        }
      }
      await saveShipmentCost(admin, id, { shipped_weight_kg: parcel.chargeableKg, shipping_cost: shippingCost });
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

  const body = await req.json();

  // ── Customer self-cancellation ──────────────────────────────────────────
  // A buyer can cancel their OWN order within ORDER_CANCEL_WINDOW_HOURS of
  // placing it, as long as it hasn't been packed/shipped yet (per /returns
  // policy). Handled before the admin gate so it doesn't require is_admin.
  if (body.action === "cancel") {
    const admin = getSupabaseAdminClient();
    const { data: order } = await admin
      .from("orders")
      .select("id, user_id, status, placed_at, payment_method, payment_status, razorpay_payment_id, total_amount, tracking_number, shiprocket_order_id")
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

    // Kill the shipment on Shiprocket first so the courier doesn't still pick up
    // and deliver a parcel that shows as cancelled on our side. Best-effort — a
    // Shiprocket failure must not block the customer's cancellation.
    const { error: srCancelError } = await cancelOnShiprocket(order);

    // Auto-refund a paid online payment back to the original method. Best-effort:
    // a refund failure must NOT block the cancellation — we still cancel the order
    // and surface the error so the team can refund manually.
    const { refunded, refundError } = await settleEndedOrder(admin, order);

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

    await admin.from("order_status_history").insert({
      order_id:   id,
      status:     "cancelled",
      note:       refunded
        ? "Cancelled by customer — refund initiated"
        : "Cancelled by customer",
      updated_by: user.id,
    });

    return NextResponse.json({
      data: cancelled,
      refunded,
      refund_error: refundError,
      shiprocket_error: srCancelError,
    });
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

  // Admin applies an EXTRA discount on the order total from the panel. Allowed
  // only BEFORE the order is packed — the value is sent to Shiprocket at pack
  // time (folded into total_discount), so it must be finalised before then.
  if (action === "set_discount") {
    const amount = Number(body.admin_discount);
    if (!Number.isFinite(amount) || amount < 0) {
      return NextResponse.json({ error: "Enter a valid discount amount." }, { status: 400 });
    }
    const { data: o } = await admin
      .from("orders")
      .select("status, subtotal, discount_amount, shipping_charge")
      .eq("id", id)
      .single();
    if (!o) return NextResponse.json({ error: "Order not found" }, { status: 404 });
    if (!["placed", "confirmed"].includes(o.status)) {
      return NextResponse.json(
        { error: "Discount can only be changed before the order is packed." },
        { status: 400 }
      );
    }

    // Base amount that's still collectible from the customer — the extra
    // discount can't exceed this, the total must not go negative.
    const base = Number(o.subtotal) - Number(o.discount_amount) + Number(o.shipping_charge);
    if (amount > base) {
      return NextResponse.json(
        { error: `Discount can't exceed ${base}.` },
        { status: 400 }
      );
    }

    const newTotal = base - amount;
    const update: Record<string, unknown> = { admin_discount: amount, total_amount: newTotal };

    const { data: updated, error } = await admin
      .from("orders").update(update).eq("id", id).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    await admin.from("order_status_history").insert({
      order_id:   id,
      status:     o.status,
      note:       amount > 0 ? `Admin discount of ${amount} applied` : "Admin discount removed",
      updated_by: user.id,
    });
    return NextResponse.json({ data: updated });
  }

  // ── Parcel override ─────────────────────────────────────────────────────
  // The admin measured the real box / weight before packing. Used for the
  // Shiprocket order, the courier choice and the cost record. Locked once the
  // order is on Shiprocket — the parcel has been declared by then.
  if (action === "set_parcel") {
    const num = (v: unknown) => (v === null || v === undefined || v === "" ? null : Number(v));
    const l = num(body.length_cm), b = num(body.breadth_cm), h = num(body.height_cm), w = num(body.weight_kg);
    for (const v of [l, b, h, w]) {
      if (v !== null && (!Number.isFinite(v) || v <= 0 || v > 1000)) {
        return NextResponse.json({ error: "Enter sizes and weight as numbers above 0." }, { status: 400 });
      }
    }
    const boxCount = [l, b, h].filter((v) => v !== null).length;
    if (boxCount !== 0 && boxCount !== 3) {
      return NextResponse.json({ error: "Enter all three box sides, or leave all three empty." }, { status: 400 });
    }

    const { data: o } = await admin.from("orders").select("status, shiprocket_order_id").eq("id", id).single();
    if (!o) return NextResponse.json({ error: "Order not found" }, { status: 404 });
    if (o.shiprocket_order_id || !["placed", "confirmed", "packed"].includes(o.status)) {
      return NextResponse.json(
        { error: "The parcel was already sent to Shiprocket — change it in the Shiprocket panel." },
        { status: 400 }
      );
    }

    const { error } = await admin.from("orders").update({
      parcel_length_cm: l, parcel_breadth_cm: b, parcel_height_cm: h, parcel_weight_kg: w,
    }).eq("id", id);
    if (error) {
      return NextResponse.json(
        { error: `${error.message} — run database/shipping_quality.sql in Supabase first.` },
        { status: 500 }
      );
    }
    await admin.from("order_status_history").insert({
      order_id:   id,
      status:     o.status,
      note:       boxCount || w
        ? `Parcel set by admin: ${boxCount ? `${l}×${b}×${h} cm` : "box as computed"}${w ? `, ${w} kg` : ""}`
        : "Parcel override removed — computed box will be used",
      updated_by: user.id,
    });
    return NextResponse.json({ ok: true });
  }

  // ── Extra shipping charge ───────────────────────────────────────────────
  // What Shiprocket charged on top later (weight discrepancy etc.). Their API
  // doesn't expose it, so the admin copies it from the Shiprocket panel.
  if (action === "set_shipping_extra") {
    const amount = Number(body.amount);
    if (!Number.isFinite(amount) || amount < 0 || amount > 100000) {
      return NextResponse.json({ error: "Enter a valid amount." }, { status: 400 });
    }
    const { error } = await admin.from("orders").update({ shipping_cost_extra: amount }).eq("id", id);
    if (error) {
      return NextResponse.json(
        { error: `${error.message} — run database/shipping_quality.sql in Supabase first.` },
        { status: 500 }
      );
    }
    return NextResponse.json({ ok: true });
  }

  // ── Delivery address ────────────────────────────────────────────────────
  // Allowed until the parcel leaves the warehouse:
  //  • not on Shiprocket yet  → just the order;
  //  • on Shiprocket, same pincode → Shiprocket's address-update API too;
  //  • on Shiprocket, new pincode  → the courier/AWB were chosen for the old
  //    pincode, so the old shipment is cancelled and a new one created
  //    (only with `reship: true`, after the admin confirms).
  // The customer's delivery charge never changes here — it was already paid
  // or agreed at checkout.
  if (action === "update_address") {
    const raw = (body.address ?? {}) as Record<string, unknown>;
    const t = (v: unknown) => (typeof v === "string" ? v.trim() : "");
    const a = {
      shipping_full_name: t(raw.full_name),
      shipping_phone:     t(raw.phone).replace(/[\s-]/g, "").replace(/^(\+91|91)(?=\d{10}$)/, ""),
      shipping_address1:  t(raw.address1),
      shipping_address2:  t(raw.address2) || null,
      shipping_city:      t(raw.city),
      shipping_state:     t(raw.state),
      shipping_pincode:   t(raw.pincode),
    };
    if (!a.shipping_full_name || !a.shipping_address1 || !a.shipping_city || !a.shipping_state) {
      return NextResponse.json({ error: "Name, address, city and state are required." }, { status: 400 });
    }
    if (!/^[6-9]\d{9}$/.test(a.shipping_phone)) {
      return NextResponse.json({ error: "Enter a valid 10-digit mobile number." }, { status: 400 });
    }
    if (!/^\d{6}$/.test(a.shipping_pincode)) {
      return NextResponse.json({ error: "Enter a valid 6-digit pincode." }, { status: 400 });
    }

    const { data: o } = await admin
      .from("orders")
      .select(`*, items:order_items(quantity, product:products(weight_grams, length_cm, breadth_cm, height_cm))`)
      .eq("id", id)
      .single();
    if (!o) return NextResponse.json({ error: "Order not found" }, { status: 404 });
    if (!["placed", "confirmed", "packed"].includes(o.status)) {
      return NextResponse.json(
        { error: "The parcel has already left (or the order has ended) — the address can no longer be changed." },
        { status: 400 }
      );
    }

    const pincodeChanged = a.shipping_pincode !== o.shipping_pincode;
    const isCod = o.payment_method === "cod";

    // A new pincode must be deliverable for this payment mode before anything
    // is touched; its best courier becomes the order's quoted courier.
    let newQuote: Awaited<ReturnType<typeof getDeliveryRate>> | null = null;
    if (pincodeChanged) {
      const parcel = resolveParcel(
        (o.items ?? []).map((it: { quantity: number; product?: WeighableItem }) => ({ ...it.product, quantity: it.quantity })),
        o
      );
      try {
        newQuote = await getDeliveryRate(a.shipping_pincode, parcel.chargeableKg, isCod, Number(o.total_amount) || undefined);
      } catch (e) {
        return NextResponse.json(
          { error: `Couldn't check the new pincode with Shiprocket: ${e instanceof Error ? e.message : e}` },
          { status: 502 }
        );
      }
      if (!newQuote.serviceable) {
        return NextResponse.json(
          { error: `No courier delivers ${isCod ? "Cash on Delivery " : ""}to pincode ${a.shipping_pincode}.` },
          { status: 422 }
        );
      }
    }

    const update: Record<string, unknown> = { ...a };
    let reshipped = false;

    if (o.shiprocket_order_id && !pincodeChanged) {
      try {
        await updateShiprocketAddress(o.shiprocket_order_id, {
          name: a.shipping_full_name, phone: a.shipping_phone,
          address1: a.shipping_address1, address2: a.shipping_address2,
          city: a.shipping_city, state: a.shipping_state, pincode: a.shipping_pincode,
        });
      } catch (e) {
        return NextResponse.json(
          { error: `Shiprocket refused the change, nothing was updated: ${e instanceof Error ? e.message : e}` },
          { status: 502 }
        );
      }
    } else if (o.shiprocket_order_id && pincodeChanged) {
      if (body.reship !== true) {
        return NextResponse.json(
          {
            needs_reship: true,
            error: "The pincode changed after the order went to Shiprocket. The current shipment" +
              (o.tracking_number ? ` (AWB ${o.tracking_number})` : "") +
              " will be cancelled and a new one created for the new address.",
          },
          { status: 409 }
        );
      }
      try {
        if (o.tracking_number) await cancelShipmentAwb(o.tracking_number);
        await cancelShiprocketOrder(o.shiprocket_order_id);
      } catch (e) {
        return NextResponse.json(
          { error: `Couldn't cancel the old shipment, nothing was changed: ${e instanceof Error ? e.message : e}` },
          { status: 502 }
        );
      }
      // Detach the old shipment; its late webhooks are ignored because they
      // carry a Shiprocket order id this order no longer holds.
      Object.assign(update, {
        shiprocket_order_id: null, shiprocket_shipment_id: null,
        tracking_number: null, tracking_url: null, courier_name: null,
      });
      reshipped = true;
    }

    const { error } = await admin.from("orders").update(update).eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    if (newQuote?.serviceable) {
      // Best-effort (needs database/shipping_quality.sql).
      await admin.from("orders").update({
        quoted_courier_id: newQuote.courierId, quoted_courier_name: newQuote.courierName,
        quoted_rate: newQuote.rate,
      }).eq("id", id);
    }

    const before = `${o.shipping_address1}, ${o.shipping_city} ${o.shipping_pincode}`;
    const after  = `${a.shipping_address1}, ${a.shipping_city} ${a.shipping_pincode}`;
    await admin.from("order_status_history").insert({
      order_id:   id,
      status:     o.status,
      note:       `Delivery address changed by admin: ${before} → ${after}` +
        (reshipped ? ` — old shipment${o.tracking_number ? ` (AWB ${o.tracking_number})` : ""} cancelled` : ""),
      updated_by: user.id,
    });

    // A packed order needs a live shipment for the new address straight away.
    let shiprocketError: string | null = null;
    if (reshipped && o.status === "packed") {
      const { update: srUpdate, error: srError } = await fulfillShiprocket(admin, id);
      if (Object.keys(srUpdate).length > 0) await admin.from("orders").update(srUpdate).eq("id", id);
      shiprocketError = srError;
    }

    return NextResponse.json({ ok: true, reshipped, shiprocket_error: shiprocketError });
  }

  // Manually set / correct the AWB + courier at ANY status. Shiprocket can fail
  // to auto-assign, or the courier can be reassigned in the Shiprocket panel —
  // the admin must be able to type the real AWB in without having to be sitting
  // on the exact "packed → shipped" transition (which is all the status form
  // used to allow, and only when no AWB existed yet).
  if (action === "set_tracking") {
    const awb     = typeof body.tracking_number === "string" ? body.tracking_number.trim() : "";
    const courier = typeof body.courier_name    === "string" ? body.courier_name.trim()    : "";

    const { data: o } = await admin
      .from("orders").select("status, tracking_number, courier_name").eq("id", id).single();
    if (!o) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    // An empty AWB clears tracking entirely (used to undo a wrong entry).
    const update: Record<string, unknown> = {
      tracking_number: awb || null,
      tracking_url:    awb ? getTrackingUrl(awb) : null,
      courier_name:    courier || null,
    };

    const { data: updated, error } = await admin
      .from("orders").update(update).eq("id", id).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    await admin.from("order_status_history").insert({
      order_id:   id,
      status:     o.status,
      note:       awb
        ? `AWB set manually to ${awb}${courier ? ` (${courier})` : ""}${o.tracking_number && o.tracking_number !== awb ? ` — replaced ${o.tracking_number}` : ""}`
        : `AWB cleared${o.tracking_number ? ` (was ${o.tracking_number})` : ""}`,
      updated_by: user.id,
    });

    return NextResponse.json({ data: updated });
  }

  // Pull the live shipment state from Shiprocket and reconcile it onto the order.
  // Needed because Shiprocket fires each webhook event exactly once and never
  // replays it — so a courier reassignment / new AWB / cancellation that happened
  // while the webhook was misconfigured would otherwise never reach us.
  if (action === "sync_shiprocket") {
    const { data: o } = await admin
      .from("orders")
      .select("id, status, tracking_number, courier_name, payment_status, payment_method, razorpay_payment_id, total_amount, shiprocket_order_id")
      .eq("id", id)
      .single();
    if (!o) return NextResponse.json({ error: "Order not found" }, { status: 404 });
    if (!o.shiprocket_order_id) {
      return NextResponse.json(
        { error: "This order was never pushed to Shiprocket — nothing to sync." },
        { status: 400 }
      );
    }

    let live;
    try {
      live = await getShiprocketOrder(o.shiprocket_order_id);
    } catch (e) {
      return NextResponse.json(
        { error: e instanceof Error ? e.message : "Shiprocket lookup failed" },
        { status: 502 }
      );
    }

    const update: Record<string, unknown> = {};
    const changes: string[] = [];

    // AWB / courier reassignment — overwrite, don't just fill in blanks.
    if (live.awb && live.awb !== o.tracking_number) {
      update.tracking_number = live.awb;
      update.tracking_url    = getTrackingUrl(live.awb);
      changes.push(`AWB ${o.tracking_number ?? "—"} → ${live.awb}`);
    }
    if (live.courier_name && live.courier_name !== o.courier_name) {
      update.courier_name = live.courier_name;
      changes.push(`courier ${o.courier_name ?? "—"} → ${live.courier_name}`);
    }

    // Status — reuse the same mapping the webhook uses so both paths agree.
    const mapped = live.status ? mapShiprocketStatus(live.status) : null;
    // Never regress an order that already ended (delivered/cancelled/returned).
    const statusChanged =
      !!mapped && mapped !== o.status && !ENDED_STATUSES.includes(o.status as OrderStatus);
    if (statusChanged) {
      update.status = mapped;
      const tsField = STATUS_TIMESTAMP_FIELD[mapped];
      if (tsField) update[tsField] = new Date().toISOString();
      changes.push(`status ${o.status} → ${mapped}`);
    }

    let refunded = false;
    let refundError: string | null = null;
    if (statusChanged && (mapped === "cancelled" || mapped === "returned")) {
      ({ refunded, refundError } = await settleEndedOrder(admin, o));
      if (refunded) update.payment_status = "refunded";
    }
    if (statusChanged && mapped === "delivered") {
      Object.assign(update, collectCodOnDelivery(o));
    }

    if (changes.length === 0) {
      return NextResponse.json({ ok: true, changed: false, message: "Already up to date with Shiprocket." });
    }

    const { data: updated, error } = await admin
      .from("orders").update(update).eq("id", id).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    await admin.from("order_status_history").insert({
      order_id:   id,
      status:     (update.status as OrderStatus) ?? (o.status as OrderStatus),
      note:       `Synced from Shiprocket: ${changes.join(", ")}`,
      updated_by: user.id,
    });

    return NextResponse.json({
      ok: true,
      changed: true,
      changes,
      data: updated,
      refunded,
      refund_error: refundError,
    });
  }

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
    // A manually-entered AWB always wins — it's the admin correcting Shiprocket,
    // so it must overwrite whatever is stored (previously it was silently dropped
    // whenever a tracking number already existed) and get its tracking URL too.
    if (tracking_number) {
      updateData.tracking_number = tracking_number.trim();
      updateData.tracking_url    = getTrackingUrl(tracking_number.trim());
    }
    if (courier_name) updateData.courier_name = courier_name.trim();
  }
  if (status === "delivered") {
    updateData.delivered_at = new Date().toISOString();
    // Marking an order delivered by hand must collect its COD exactly like the
    // Shiprocket webhook does — otherwise the cash never lands in Money
    // Collected and the courier's COD total silently under-reports.
    const { data: payInfo } = await admin
      .from("orders")
      .select("payment_method, payment_status")
      .eq("id", id)
      .single();
    if (payInfo) Object.assign(updateData, collectCodOnDelivery(payInfo));
  }

  // When an admin cancels an order, auto-refund any online payment too (same
  // behaviour as a customer self-cancel). Best-effort — see refundOrderPayment.
  let refunded = false;
  let refundError: string | null = null;
  let srCancelError: string | null = null;
  if (status === "cancelled" || status === "returned") {
    if (status === "cancelled") updateData.cancelled_at = new Date().toISOString();

    const { data: payInfo } = await admin
      .from("orders")
      .select("id, status, payment_status, payment_method, razorpay_payment_id, total_amount, tracking_number, shiprocket_order_id")
      .eq("id", id)
      .single();

    if (payInfo) {
      // Cancelling here must also cancel the live shipment on Shiprocket —
      // otherwise the courier still picks up and delivers a "cancelled" order.
      // A return is a physical movement that Shiprocket already owns, so it is
      // recorded locally only.
      if (status === "cancelled") {
        ({ error: srCancelError } = await cancelOnShiprocket(payInfo));
      }
      ({ refunded, refundError } = await settleEndedOrder(admin, payInfo));
      if (refunded) updateData.payment_status = "refunded";
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
    shiprocket_error: shiprocketError ?? srCancelError,
    refunded,
    refund_error: refundError,
  });
}
