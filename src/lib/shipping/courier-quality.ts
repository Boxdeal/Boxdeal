import { getSupabaseAdminClient } from "@/lib/supabase/server";
import { fetchAllRows } from "@/lib/admin/fetch-all";
import { courierPartner } from "@/lib/admin/courier-stats";

// Picking a courier on price alone sends parcels to whoever is cheapest, even
// when that partner brings far more parcels back as RTO. An RTO costs the
// forward freight AND the return freight, and the sale is lost — so a courier
// that is ₹10 cheaper but RTOs twice as often is the expensive one.
//
// Each option is therefore ranked by its EXPECTED cost:
//     cost × (1 + RTO_COST_FACTOR × rtoRate)
// where rtoRate is that courier company's RTO share of attempted deliveries
// (delivered + customer returns + RTO) over the last LOOKBACK_DAYS, from our
// own orders — the same rule the Delivery & Couriers tab uses. A company with
// too few parcels to judge gets the average rate, so a newcomer is neither
// punished nor favoured.

/** An RTO pays the freight twice (there and back). */
const RTO_COST_FACTOR = 2;
const LOOKBACK_DAYS = 180;
/** Below this many attempted deliveries a company's own rate is noise. */
const MIN_ATTEMPTS = 15;
const CACHE_MS = 60 * 60 * 1000;

export interface RtoTable {
  /** RTO share (0–1) per courier company, e.g. "Xpressbees" → 0.28. */
  byPartner: Map<string, number>;
  /** Overall RTO share across every company — used when a company is unknown. */
  average: number;
}

let cached: { table: RtoTable; expiresAt: number } | null = null;

/** RTO share per courier company. Cached for an hour; never throws. */
export async function getRtoTable(): Promise<RtoTable> {
  if (cached && cached.expiresAt > Date.now()) return cached.table;

  const empty: RtoTable = { byPartner: new Map(), average: 0 };
  try {
    const admin = getSupabaseAdminClient();
    const since = new Date(Date.now() - LOOKBACK_DAYS * 86_400_000).toISOString();
    const rows = await fetchAllRows<{ courier_name: string; status: string; delivered_at: string | null }>(
      (from, to) =>
        admin
          .from("orders")
          .select("courier_name, status, delivered_at")
          .not("courier_name", "is", null)
          .in("status", ["delivered", "returned"])
          .gte("placed_at", since)
          .order("id")
          .range(from, to)
    );

    const tally = new Map<string, { attempted: number; rto: number }>();
    let attempted = 0;
    let rto = 0;
    for (const r of rows) {
      const partner = courierPartner(r.courier_name);
      const t = tally.get(partner) ?? { attempted: 0, rto: 0 };
      // A return with no delivered_at never reached the customer — an RTO.
      const isRto = r.status === "returned" && !r.delivered_at;
      t.attempted++;
      if (isRto) t.rto++;
      tally.set(partner, t);
      attempted++;
      if (isRto) rto++;
    }

    const table: RtoTable = { byPartner: new Map(), average: attempted ? rto / attempted : 0 };
    for (const [partner, t] of tally) {
      if (t.attempted >= MIN_ATTEMPTS) table.byPartner.set(partner, t.rto / t.attempted);
    }
    cached = { table, expiresAt: Date.now() + CACHE_MS };
    return table;
  } catch (e) {
    // Without stats, fall back to plain cheapest — never block a quote.
    console.error("RTO stats unavailable; choosing couriers on price only:", e);
    return empty;
  }
}

/** RTO share used for a Shiprocket service name ("Xpressbees Surface 1kg"). */
export function rtoRateFor(table: RtoTable, courierName: string | null | undefined): number {
  if (!courierName) return table.average;
  return table.byPartner.get(courierPartner(courierName)) ?? table.average;
}

/** What a courier is really expected to cost once its RTO risk is priced in. */
export function expectedCost(cost: number, rtoRate: number): number {
  return cost * (1 + RTO_COST_FACTOR * rtoRate);
}
