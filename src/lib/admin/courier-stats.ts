import { getSupabaseAdminClient } from "@/lib/supabase/server";
import { getISTPeriodRange } from "@/lib/admin/periods";
import { parcelState, type ParcelState } from "@/lib/admin/order-buckets";
import type { CourierRow, CourierStats, DashboardPeriod, OrderStatus } from "@/types";

// Courier-wise delivery performance, computed off the `courier_name` Shiprocket
// stamps on an order when the AWB is generated (and re-stamps from the shipment
// webhook when a courier is reassigned).
//
// A "parcel" here is one order that was actually handed to a courier — i.e. it
// has a courier_name. Orders still waiting to be packed have none, and are
// reported separately as `awaiting` rather than blamed on any partner.
//
// Shiprocket reports the SERVICE, not the company: "Delhivery Surface 10 Kg",
// "Xpressbees Air 1kg", "Ecom Express 5 kg" are three services from three
// partners. We keep the exact service name (that's what shows on the AWB) and
// also roll every service up to its partner so "how much went with Delhivery"
// has one answer.

/** Company behind a Shiprocket service name. First match wins. */
const PARTNER_PATTERNS: Array<[RegExp, string]> = [
  [/delhivery/i,                     "Delhivery"],
  [/xpressbees|\bxb\b/i,             "Xpressbees"],
  [/ecom\s*express|ecomexpress/i,    "Ecom Express"],
  [/blue\s*dart|bluedart/i,          "Blue Dart"],
  [/\bdtdc\b/i,                      "DTDC"],
  [/shadowfax|\bsfx\b/i,             "Shadowfax"],
  [/ekart/i,                         "Ekart"],
  [/amazon/i,                        "Amazon Shipping"],
  [/india\s*post|speed\s*post/i,     "India Post"],
  [/professional/i,                  "Professional Couriers"],
  [/smartr/i,                        "Smartr"],
  [/rapidshyp/i,                     "Rapidshyp"],
  [/\bmovin\b/i,                     "Movin"],
  [/trackon/i,                       "Trackon"],
  [/\bgati\b/i,                      "Gati"],
  [/safexpress/i,                    "Safexpress"],
  [/wow\s*express/i,                 "Wow Express"],
  [/shree\s*maruti/i,                "Shree Maruti"],
  [/criticalog/i,                    "Criticalog"],
  [/\bshiprocket\b/i,                "Shiprocket"],
];

/**
 * Roll a Shiprocket service name up to the courier company that runs it.
 * Unknown partners fall back to the leading words of the name with the weight /
 * mode suffix stripped, so a new Shiprocket partner still groups sensibly
 * instead of splintering into one row per weight slab.
 */
export function courierPartner(service: string): string {
  const name = service.trim();
  if (!name) return "Unknown";
  for (const [re, partner] of PARTNER_PATTERNS) {
    if (re.test(name)) return partner;
  }
  // "Foo Logistics Surface 5kg" → "Foo Logistics". Drop everything from the
  // first mode/weight token onwards.
  const cut = name.split(/\s+(?:surface|air|express|cargo|heavy|\d)/i)[0].trim();
  return cut || name;
}

const emptyRow = (name: string): CourierRow => ({
  name,
  partner: name,
  services: [],
  parcels: 0,
  inTransit: 0,
  delivered: 0,
  rto: 0,
  customerReturn: 0,
  cancelled: 0,
  value: 0,
  deliveredValue: 0,
  rtoValue: 0,
  codParcels: 0,
  prepaidParcels: 0,
  codCollected: 0,
  deliveryRate: null,
  rtoRate: null,
  avgDeliveryDays: null,
  lastUsedAt: null,
});

interface CourierOrderRow {
  courier_name: string | null;
  status: OrderStatus;
  payment_method: string;
  payment_status: string;
  total_amount: number | string;
  placed_at: string;
  shipped_at: string | null;
  delivered_at: string | null;
}

const SELECT =
  "courier_name, status, payment_method, payment_status, total_amount, placed_at, shipped_at, delivered_at";

const PAGE = 1000;

/** Every order in the window, paged past PostgREST's 1000-row ceiling. */
async function fetchOrders(start: Date, end: Date): Promise<CourierOrderRow[]> {
  const admin = getSupabaseAdminClient();
  const out: CourierOrderRow[] = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await admin
      .from("orders")
      .select(SELECT)
      .gte("placed_at", start.toISOString())
      .lte("placed_at", end.toISOString())
      .order("placed_at", { ascending: false })
      .range(from, from + PAGE - 1);
    if (error) throw new Error(error.message);
    const page = (data ?? []) as unknown as CourierOrderRow[];
    out.push(...page);
    if (page.length < PAGE) break;
  }
  return out;
}

/** Days between handover and delivery — null unless both stamps exist. */
function deliveryDays(o: CourierOrderRow): number | null {
  if (!o.delivered_at) return null;
  const from = o.shipped_at ?? o.placed_at;
  const days = (new Date(o.delivered_at).getTime() - new Date(from).getTime()) / 86_400_000;
  return days >= 0 ? days : null;
}

/**
 * The CourierRow counter each parcel state increments. Derived from the shared
 * `parcelState`, so the Delivery tab's filter pills count exactly the parcels
 * their filtered list returns.
 */
export const PARCEL_STATE_FIELD: Record<
  ParcelState,
  "inTransit" | "delivered" | "rto" | "customerReturn" | "cancelled"
> = {
  transit:   "inTransit",
  delivered: "delivered",
  rto:       "rto",
  returned:  "customerReturn",
  cancelled: "cancelled",
};

/** Fold one order into a row. `transit` sums are shared by service + partner. */
function accumulate(row: CourierRow, o: CourierOrderRow, days: number[]) {
  const amount = Number(o.total_amount) || 0;
  row.parcels++;
  row.value += amount;
  if (o.payment_method === "cod") row.codParcels++;
  else row.prepaidParcels++;
  if (!row.lastUsedAt || o.placed_at > row.lastUsedAt) row.lastUsedAt = o.placed_at;

  const state = parcelState(o);
  row[PARCEL_STATE_FIELD[state]]++;

  if (state === "delivered") {
    row.deliveredValue += amount;
    // Cash the courier collected at the door and has to remit to us.
    if (o.payment_method === "cod" && o.payment_status === "paid") row.codCollected += amount;
  } else if (state === "rto") {
    row.rtoValue += amount;
  }

  const d = deliveryDays(o);
  if (d !== null) days.push(d);
}

/**
 * Finalise the derived rates once every order has been folded in.
 *
 * A delivery attempt has exactly two outcomes: the parcel reached the customer,
 * or it came back to us as an RTO. A customer return counts as a SUCCESSFUL
 * delivery — the courier did its job and the buyer changed their mind — so it
 * must never drag the partner's delivery rate down. Parcels still in transit and
 * orders cancelled before the attempt are excluded from both rates entirely.
 */
function finalise(row: CourierRow, days: number[]) {
  const succeeded = row.delivered + row.customerReturn;
  const attempted = succeeded + row.rto;
  row.deliveryRate = attempted > 0 ? (succeeded / attempted) * 100 : null;
  row.rtoRate      = attempted > 0 ? (row.rto / attempted) * 100 : null;
  row.avgDeliveryDays =
    days.length > 0 ? days.reduce((a, b) => a + b, 0) / days.length : null;
  row.services.sort((a, b) => b.parcels - a.parcels);
}

/**
 * Courier-wise stats for a period, keyed on the date the order was placed —
 * the same window rule every other dashboard tab uses.
 */
export async function getCourierStats(
  period: DashboardPeriod,
  opts: { from?: string; to?: string } = {}
): Promise<CourierStats> {
  const range = getISTPeriodRange(period, opts);
  const orders = await fetchOrders(range.start, range.end);

  const partners = new Map<string, { row: CourierRow; days: number[] }>();
  const services = new Map<string, { row: CourierRow; days: number[] }>();
  const awaiting = { parcels: 0, value: 0 };
  const totals = emptyRow("All couriers");
  const totalDays: number[] = [];

  for (const o of orders) {
    const service = o.courier_name?.trim();
    if (!service) {
      // Never handed over — sitting with us, or a checkout that never became an
      // order. Not any partner's number.
      awaiting.parcels++;
      awaiting.value += Number(o.total_amount) || 0;
      continue;
    }

    const partnerName = courierPartner(service);

    let p = partners.get(partnerName);
    if (!p) {
      p = { row: { ...emptyRow(partnerName), services: [] }, days: [] };
      partners.set(partnerName, p);
    }
    accumulate(p.row, o, p.days);

    let s = services.get(service);
    if (!s) {
      s = { row: { ...emptyRow(service), partner: partnerName, services: [] }, days: [] };
      services.set(service, s);
    }
    accumulate(s.row, o, s.days);

    accumulate(totals, o, totalDays);
  }

  for (const { row, days } of services.values()) finalise(row, days);
  // Hang each partner's services off its row so the table can expand in place.
  for (const { row } of services.values()) {
    const p = partners.get(row.partner);
    if (p) p.row.services.push(row);
  }
  for (const { row, days } of partners.values()) finalise(row, days);
  finalise(totals, totalDays);

  const sorted = Array.from(partners.values())
    .map((p) => p.row)
    .sort((a, b) => b.parcels - a.parcels || b.value - a.value);

  return {
    label: range.label,
    partners: sorted,
    services: Array.from(services.values())
      .map((s) => s.row)
      .sort((a, b) => b.parcels - a.parcels),
    totals,
    awaiting,
  };
}
