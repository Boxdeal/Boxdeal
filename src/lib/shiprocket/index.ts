import type { Order, OrderItem } from "@/types";
import { computePackage } from "@/lib/shipping/package";

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
 * The returned rate is what Shiprocket actually debits for the shipment:
 * `rate` (freight + COD charge) plus `coverage_charges` (the "Auto Secured"
 * shipment protection the account always applies). The COD charge is a % of
 * the order value, so `declaredValue` must be the amount Shiprocket will see on
 * the order (sub_total + shipping − discount) — without it the API quotes only
 * the minimum COD fee and under-quotes high-value COD orders.
 *
 * @param deliveryPincode  destination (customer) pincode
 * @param weightKg         total package weight in kg
 * @param cod              true for cash-on-delivery, false for prepaid
 * @param declaredValue    order value in ₹ (drives COD charge + coverage)
 *
 * Answers are cached in memory for RATE_CACHE_TTL_MS per (pincode, weight,
 * COD, value): checkout re-quotes the same cart on every address / payment
 * toggle, and order creation repeats the quote moments later.
 */
export async function getDeliveryRate(
  deliveryPincode: string,
  weightKg: number,
  cod = false,
  declaredValue?: number
): Promise<DeliveryRate> {
  const pickup = process.env.SHIPROCKET_PICKUP_PINCODE;
  if (!pickup) throw new Error("SHIPROCKET_PICKUP_PINCODE is not configured");

  const value = declaredValue && declaredValue > 0 ? Math.round(declaredValue) : 0;
  const key = `${pickup}|${deliveryPincode}|${weightKg}|${cod ? 1 : 0}|${value}`;
  const hit = rateCache.get(key);
  if (hit && hit.expiresAt > Date.now()) return hit.rate;

  const { rate, cacheable } = await fetchDeliveryRate(pickup, deliveryPincode, weightKg, cod, value);
  if (cacheable) {
    if (rateCache.size >= RATE_CACHE_MAX) rateCache.clear();
    rateCache.set(key, { rate, expiresAt: Date.now() + RATE_CACHE_TTL_MS });
  }
  return rate;
}

const RATE_CACHE_TTL_MS = 10 * 60 * 1000;
const RATE_CACHE_MAX = 1000;
const rateCache = new Map<string, { rate: DeliveryRate; expiresAt: number }>();

// One uncached serviceability lookup. `cacheable` is false when Shiprocket
// errored, so a transient failure isn't remembered as "not serviceable".
async function fetchDeliveryRate(
  pickup: string,
  deliveryPincode: string,
  weightKg: number,
  cod: boolean,
  declaredValue: number
): Promise<{ rate: DeliveryRate; cacheable: boolean }> {
  const unserviceable: DeliveryRate = { serviceable: false, rate: null, courierId: null, courierName: null };

  const params = new URLSearchParams({
    pickup_postcode:   pickup,
    delivery_postcode: deliveryPincode,
    weight:            String(weightKg),
    cod:               cod ? "1" : "0",
  });
  if (declaredValue > 0) params.set("declared_value", String(declaredValue));

  const res = await shiprocketFetch(`/courier/serviceability/?${params.toString()}`);
  const data = await res.json();

  const couriers: Array<{
    courier_company_id: number;
    courier_name?:      string;
    rate?:              number;
    coverage_charges?:  number;
  }> = data?.data?.available_courier_companies ?? [];

  if (!res.ok) return { rate: unserviceable, cacheable: false };
  if (couriers.length === 0) return { rate: unserviceable, cacheable: true };

  // Pick the cheapest available courier so the customer pays the lowest possible
  // delivery charge for their pincode.
  // Full cost Shiprocket debits: freight + COD charge + shipment coverage.
  const totalCost = (c: (typeof couriers)[number]) =>
    Number(c.rate ?? Infinity) + (Number(c.coverage_charges) || 0);

  const chosen = couriers.reduce((cheapest, c) =>
    totalCost(c) < totalCost(cheapest) ? c : cheapest
  );

  const rate = totalCost(chosen);
  if (!Number.isFinite(rate)) return { rate: unserviceable, cacheable: true };

  return {
    rate: {
      serviceable: true,
      rate,
      courierId:   chosen.courier_company_id,
      courierName: chosen.courier_name ?? null,
    },
    cacheable: true,
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
 * Weight and box dimensions come from `computePackage` (all items × qty), the
 * same calculation used for the checkout delivery quote.
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

  // Same sizing as the checkout quote: every unit of every item, chargeable
  // weight + combined box — so the label, Shiprocket's bill and the customer's
  // delivery charge all agree.
  const { chargeableKg, length, breadth, height } = computePackage(items);

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
      weight:                 chargeableKg,
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

// ── COD remittance ──────────────────────────────────────────

/** One payout of COD cash from Shiprocket to the bank account. */
export interface CodRemittance {
  id: number;
  /** ISO timestamp the payout was raised. */
  createdAt: string;
  /** COD collected from customers that this payout settles. */
  codPayable: number;
  /** Shiprocket's COD fee, kept back from the payout. */
  deduction: number;
  /** Kept back to top up the Shiprocket shipping wallet. */
  walletRecharge: number;
  /** What actually reached the bank. */
  remitted: number;
  utr: string | null;
  status: string;
  /** False until the bank transfer has gone through ("Remittance success"). */
  settled: boolean;
}

/**
 * Every COD payout raised between two IST calendar days, inclusive.
 *
 * Shiprocket only exposes payout totals here — which orders a payout covers is
 * not in the public API (it is a CSV download in their panel). The endpoint
 * wants dates as "2026-Sep-01" and pages at 15 by default.
 */
export async function getCodRemittances(fromDay: Date, toDay: Date): Promise<CodRemittance[]> {
  const fmt = (d: Date) =>
    new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "short", day: "2-digit" })
      .formatToParts(d)
      .reduce((acc, p) => ({ ...acc, [p.type]: p.value }), {} as Record<string, string>);
  const day = (d: Date) => {
    const p = fmt(d);
    return `${p.year}-${p.month.slice(0, 3)}-${p.day}`;
  };

  // Shiprocket refuses ranges much longer than a month, so walk the period in
  // 28-day windows (each one inclusive of both ends, hence the +1 day step).
  // "All time" arrives as 1970; cap the walk at a year back so it stays a
  // dozen calls, not hundreds.
  const DAY = 86_400_000;
  const earliest = Math.max(fromDay.getTime(), toDay.getTime() - 365 * DAY);
  const windows: Array<[Date, Date]> = [];
  for (let start = earliest; start <= toDay.getTime(); start += 28 * DAY) {
    windows.push([new Date(start), new Date(Math.min(start + 27 * DAY, toDay.getTime()))]);
  }

  const out: CodRemittance[] = [];
  for (const [winFrom, winTo] of windows) for (let page = 1; page <= 20; page++) {
    const res = await shiprocketFetch(
      `/account/details/remittance?from=${day(winFrom)}&to=${day(winTo)}&per_page=100&page=${page}`
    );
    const data = await res.json();
    if (!res.ok) throw new Error(data.message ?? "Shiprocket remittance lookup failed");

    for (const r of data.data ?? []) {
      out.push({
        id:             Number(r.crf_id),
        createdAt:      new Date(Number(r.created_at) * 1000).toISOString(),
        codPayable:     Number(r.cod_payble) || 0,
        deduction:      Number(r.deduction_value) || 0,
        walletRecharge: Number(r.recharge_value) || 0,
        remitted:       Number(r.remitted_value) || 0,
        utr:            r.utr || null,
        status:         String(r.status ?? ""),
        settled:        r.status === "Remittance success",
      });
    }
    const pages = Number(data.meta?.pagination?.total_pages) || 1;
    if (page >= pages) break;
  }
  // Adjacent windows can share a boundary day — keep each payout once.
  const unique = [...new Map(out.map((r) => [r.id, r])).values()];
  return unique.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
