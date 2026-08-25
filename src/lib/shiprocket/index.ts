import type { Order, OrderItem } from "@/types";

const BASE_URL = "https://apiv2.shiprocket.in/v1/external";

// Pickup location nickname as configured in the Shiprocket dashboard.
const PICKUP_LOCATION = "Boxdeal";

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.token;
  }

  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email:    process.env.SHIPROCKET_EMAIL,
      password: process.env.SHIPROCKET_PASSWORD,
    }),
  });

  const data = await res.json();
  if (!res.ok || !data.token) throw new Error("Shiprocket auth failed");

  cachedToken = {
    token:     data.token,
    expiresAt: Date.now() + 9 * 24 * 60 * 60 * 1000, // 9 days
  };

  return cachedToken.token;
}

async function shiprocketFetch(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = await getToken();
  return fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type":  "application/json",
      "Authorization": `Bearer ${token}`,
      ...(options.headers ?? {}),
    },
  });
}

/** Public Shiprocket tracking page for a given AWB. */
export function getTrackingUrl(awb: string): string {
  return `https://shiprocket.co/tracking/${awb}`;
}

export type DeliveryRate =
  | { serviceable: true; rate: number; courierId: number; courierName: string | null }
  | { serviceable: false; rate: null; courierId: null; courierName: null };

/**
 * Fetch the live delivery rate from Shiprocket for a destination pincode.
 * Uses the courier serviceability API and returns the rate of the courier
 * Shiprocket would actually auto-assign (its recommended courier), falling back
 * to the cheapest available courier. `serviceable: false` means no courier
 * services the destination — the order should be blocked.
 *
 * @param deliveryPincode  destination (customer) pincode
 * @param weightKg         total package weight in kg
 * @param cod              true for cash-on-delivery, false for prepaid
 */
export async function getDeliveryRate(
  deliveryPincode: string,
  weightKg: number,
  cod = false
): Promise<DeliveryRate> {
  const pickup = process.env.SHIPROCKET_PICKUP_PINCODE;
  if (!pickup) throw new Error("SHIPROCKET_PICKUP_PINCODE is not configured");

  const params = new URLSearchParams({
    pickup_postcode:   pickup,
    delivery_postcode: deliveryPincode,
    weight:            String(weightKg),
    cod:               cod ? "1" : "0",
  });

  const res = await shiprocketFetch(`/courier/serviceability/?${params.toString()}`);
  const data = await res.json();

  const couriers: Array<{
    courier_company_id: number;
    courier_name?:      string;
    rate?:              number;
  }> = data?.data?.available_courier_companies ?? [];

  if (!res.ok || couriers.length === 0) {
    return { serviceable: false, rate: null, courierId: null, courierName: null };
  }

  // Pick the cheapest available courier so the customer pays the lowest possible
  // delivery charge for their pincode.
  const chosen = couriers.reduce((cheapest, c) =>
    Number(c.rate ?? Infinity) < Number(cheapest.rate ?? Infinity) ? c : cheapest
  );

  const rate = Number(chosen.rate);
  if (!Number.isFinite(rate)) {
    return { serviceable: false, rate: null, courierId: null, courierName: null };
  }

  return {
    serviceable: true,
    rate,
    courierId:   chosen.courier_company_id,
    courierName: chosen.courier_name ?? null,
  };
}

// Order item enriched with the product's physical attributes (joined from
// the products table at fulfillment time — order_items doesn't store these).
export type ShipmentItem = OrderItem & {
  weight_grams?: number | null;
  length_cm?:    number | null;
  breadth_cm?:   number | null;
  height_cm?:    number | null;
};

/**
 * Push an order to Shiprocket as an ad-hoc order.
 * Weight is summed from each item's product weight; package dimensions use the
 * largest dimension found across items (Shiprocket takes one box per shipment).
 * Returns { order_id, shipment_id }.
 */
export async function createShiprocketOrder(
  order: Order & { items?: ShipmentItem[] },
  // Channel order_id to register on Shiprocket. Defaults to our order_number, but
  // a re-ship (after a prior cancellation) must pass a unique value — Shiprocket
  // dedupes ad-hoc orders by this id and would otherwise return the old shipment.
  channelOrderId?: string
) {
  const items = (order.items ?? []) as ShipmentItem[];

  const orderItems = items.map((item) => ({
    name:          item.product_name,
    sku:           item.product_sku,
    units:         item.quantity,
    selling_price: item.selling_price,
  }));

  // Total actual weight in kg (Shiprocket expects kg). Floor at 0.1kg.
  const totalGrams = items.reduce(
    (sum, item) => sum + (item.weight_grams ?? 0) * item.quantity,
    0
  );
  const weightKg = Math.max(totalGrams / 1000, 0.1);

  // Package dimensions in cm — largest single-item value, sensible defaults.
  const maxDim = (pick: (i: ShipmentItem) => number | null | undefined, fallback: number) =>
    Math.max(...items.map((i) => Number(pick(i)) || 0), 0) || fallback;

  const length  = maxDim((i) => i.length_cm, 10);
  const breadth = maxDim((i) => i.breadth_cm, 10);
  const height  = maxDim((i) => i.height_cm, 5);

  const res = await shiprocketFetch("/orders/create/adhoc", {
    method: "POST",
    body: JSON.stringify({
      order_id:               channelOrderId ?? order.order_number,
      order_date:             order.placed_at,
      pickup_location:        PICKUP_LOCATION,
      billing_customer_name:  order.shipping_full_name,
      billing_last_name:      "",
      billing_address:        order.shipping_address1,
      billing_address_2:      order.shipping_address2 ?? "",
      billing_city:           order.shipping_city,
      billing_pincode:        order.shipping_pincode,
      billing_state:          order.shipping_state,
      billing_country:        "India",
      billing_phone:          order.shipping_phone,
      shipping_is_billing:    1,
      order_items:            orderItems,
      payment_method:         order.payment_method === "cod" ? "COD" : "Prepaid",
      sub_total:              order.subtotal,
      // Delivery charge + discount so Shiprocket's collectible/invoice matches
      // the order total: sub_total + shipping_charges − total_discount.
      // admin_discount is any extra discount the admin applied from the panel.
      shipping_charges:       order.shipping_charge,
      total_discount:         order.discount_amount + (order.admin_discount ?? 0),
      length,
      breadth,
      height,
      weight:                 weightKg,
    }),
  });

  const data = await res.json();
  if (!res.ok || !data.shipment_id) {
    throw new Error(data.message ?? "Shiprocket order creation failed");
  }
  return data as {
    order_id:    number;
    shipment_id: number;
    status?:     string;
  };
}

/**
 * Assign a courier + generate the AWB (tracking number) for a shipment.
 * With auto-assignment enabled, courierId can be omitted and Shiprocket picks
 * the recommended courier. Returns { awb_code, courier_name }.
 */
export async function generateAWB(shipmentId: number, courierId?: number) {
  const body: Record<string, unknown> = { shipment_id: shipmentId };
  if (courierId) body.courier_id = courierId;

  const res = await shiprocketFetch("/courier/assign/awb", {
    method: "POST",
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? "AWB generation failed");

  // Shiprocket nests the assigned courier details under response.data.
  const d = data?.response?.data ?? {};
  const awb_code     = d.awb_code     ?? data.awb_code     ?? null;
  const courier_name = d.courier_name ?? data.courier_name ?? null;

  if (!awb_code) throw new Error(data.message ?? "No courier could be assigned (check serviceability / wallet balance)");

  return { awb_code: String(awb_code), courier_name: courier_name as string | null };
}

export async function schedulePickup(shipmentIds: number[]) {
  const res = await shiprocketFetch("/courier/generate/pickup", {
    method: "POST",
    body: JSON.stringify({ shipment_id: shipmentIds }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? "Pickup scheduling failed");
  return data;
}

export async function trackOrder(awb: string) {
  const res = await shiprocketFetch(`/courier/track/awb/${awb}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? "Tracking failed");
  return data;
}

/**
 * Cancel a shipment by its AWB. Required BEFORE cancelling the order itself once
 * a courier has been assigned — otherwise the courier still attempts pickup and
 * delivery even though the order shows cancelled on our side.
 */
export async function cancelShipmentAwb(awb: string) {
  const res = await shiprocketFetch("/orders/cancel/shipment/awbs", {
    method: "POST",
    body: JSON.stringify({ awbs: [awb] }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? "AWB cancellation failed");
  return data;
}

/** Cancel an order on Shiprocket by their numeric order id. */
export async function cancelShiprocketOrder(shiprocketOrderId: string | number) {
  const res = await shiprocketFetch("/orders/cancel", {
    method: "POST",
    body: JSON.stringify({ ids: [Number(shiprocketOrderId)] }),
  });
  const data = await res.json();
  // Already-cancelled orders come back as an error — treat that as success so a
  // repeat cancel is idempotent rather than surfacing a scary message.
  const msg = String(data?.message ?? "");
  if (!res.ok && !/already|cancel/i.test(msg)) {
    throw new Error(msg || "Shiprocket order cancellation failed");
  }
  return data;
}

/**
 * Live snapshot of an order as Shiprocket currently sees it — used to reconcile
 * when a webhook was missed (Shiprocket fires each event once and never replays)
 * or when the courier/AWB was changed from the Shiprocket panel.
 *
 * Shiprocket returns `shipments` as either an object or an array depending on
 * the order, so both shapes are normalised here.
 */
export async function getShiprocketOrder(shiprocketOrderId: string | number): Promise<{
  awb: string | null;
  courier_name: string | null;
  status: string | null;
  shipment_id: string | null;
}> {
  const res = await shiprocketFetch(`/orders/show/${shiprocketOrderId}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? "Shiprocket order lookup failed");

  const d = data?.data ?? data ?? {};
  const raw = d.shipments;
  const shipment = (Array.isArray(raw) ? raw[0] : raw) ?? {};

  const str = (v: unknown) => (v != null && v !== "" ? String(v) : null);
  return {
    awb:          str(shipment.awb ?? shipment.awb_code),
    courier_name: str(shipment.courier ?? shipment.courier_name),
    status:       str(shipment.status ?? d.status),
    shipment_id:  str(shipment.id ?? d.shipment_id),
  };
}
