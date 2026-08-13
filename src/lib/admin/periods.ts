import { fromZonedTime, formatInTimeZone } from "date-fns-tz";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import type {
  DashboardPeriod, OrderStatus, PaymentBucket, PaymentSplit, PeriodStats, RevenueChartPoint,
} from "@/types";

// All admin analytics are computed in IST so a "day" matches the business day
// in India regardless of the (UTC) server timezone. Never slice toISOString()
// or use new Date(y,m,d) for boundaries — those resolve in the server's zone.
const IST = "Asia/Kolkata";

/** YYYY-MM-DD for a given instant, in IST. Replaces the old UTC dayKey. */
export function istDayKey(date: Date): string {
  return formatInTimeZone(date, IST, "yyyy-MM-dd");
}

/** UTC instant for IST-midnight (00:00:00.000) of the IST calendar day `ymd`. */
export function istDayStart(ymd: string): Date {
  return fromZonedTime(`${ymd}T00:00:00.000`, IST);
}

/** UTC instant for the very end (23:59:59.999) of the IST calendar day `ymd`. */
function istDayEnd(ymd: string): Date {
  return fromZonedTime(`${ymd}T23:59:59.999`, IST);
}

/** Human label for an IST calendar day key, e.g. "13 Aug 2026". */
export function prettyDay(ymd: string): string {
  return formatInTimeZone(istDayStart(ymd), IST, "dd MMM yyyy");
}

/** Add `days` to a YYYY-MM-DD string (calendar arithmetic, no timezone drift). */
export function addDaysKey(ymd: string, days: number): string {
  const [y, m, d] = ymd.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + days);
  return dt.toISOString().slice(0, 10);
}

export interface PeriodRange {
  start: Date;
  end: Date;
  label: string;
  /** The immediately preceding equal-length window, for % comparison. */
  prev: { start: Date; end: Date };
}

/**
 * Resolve a dashboard period selection into concrete UTC instants that map to
 * IST calendar boundaries. `now` is injectable for testing.
 */
export function getISTPeriodRange(
  period: DashboardPeriod,
  opts: { from?: string; to?: string; now?: Date } = {}
): PeriodRange {
  const now = opts.now ?? new Date();
  const todayKey = istDayKey(now);

  const build = (startKey: string, endKey: string, label: string): PeriodRange => {
    const start = istDayStart(startKey);
    const end = istDayEnd(endKey);
    // Previous window: same number of whole days, immediately before `start`.
    const spanDays =
      Math.round((istDayStart(endKey).getTime() - start.getTime()) / 86_400_000) + 1;
    const prevEndKey = addDaysKey(startKey, -1);
    const prevStartKey = addDaysKey(prevEndKey, -(spanDays - 1));
    return {
      start,
      end,
      label,
      prev: { start: istDayStart(prevStartKey), end: istDayEnd(prevEndKey) },
    };
  };

  switch (period) {
    case "today":
      return build(todayKey, todayKey, "Today");

    case "yesterday": {
      const y = addDaysKey(todayKey, -1);
      return build(y, y, "Yesterday");
    }

    case "week": {
      // ISO week: Monday-start. getUTCDay on the IST day key gives the weekday.
      const [y, m, d] = todayKey.split("-").map(Number);
      const dow = new Date(Date.UTC(y, m - 1, d)).getUTCDay(); // 0=Sun..6=Sat
      const back = (dow + 6) % 7; // days since Monday
      return build(addDaysKey(todayKey, -back), todayKey, "This Week");
    }

    case "month": {
      const monthStart = `${todayKey.slice(0, 7)}-01`;
      return build(monthStart, todayKey, "This Month");
    }

    case "last_month": {
      const [y, m] = todayKey.split("-").map(Number);
      const lmStart = `${String(m === 1 ? y - 1 : y).padStart(4, "0")}-${String(
        m === 1 ? 12 : m - 1
      ).padStart(2, "0")}-01`;
      const lmEnd = addDaysKey(`${todayKey.slice(0, 7)}-01`, -1); // day before this month starts
      return build(lmStart, lmEnd, "Last Month");
    }

    case "custom": {
      const from = opts.from && /^\d{4}-\d{2}-\d{2}$/.test(opts.from) ? opts.from : todayKey;
      const to = opts.to && /^\d{4}-\d{2}-\d{2}$/.test(opts.to) ? opts.to : todayKey;
      // Guard reversed range.
      const [s, e] = from <= to ? [from, to] : [to, from];
      // A single-day pick ("kisi bhi din") reads better as just that date.
      return build(s, e, s === e ? prettyDay(s) : `${prettyDay(s)} → ${prettyDay(e)}`);
    }

    case "all":
    default: {
      const start = new Date(0);
      return {
        start,
        end: istDayEnd(todayKey),
        label: "All Time",
        prev: { start, end: start },
      };
    }
  }
}

const isPaid = (s: string) => s === "paid";

type OrderRow = {
  placed_at: string;
  total_amount: number | string;
  payment_status: string;
  payment_method: string;
  status: OrderStatus;
};

/**
 * Aggregate order stats for a period, in IST. Revenue counts PAID orders only
 * (online paid + COD delivered); order counts include every order in range
 * (cancelled surfaced separately via `byStatus`, never silently dropped).
 */
export async function getPeriodStats(
  period: DashboardPeriod,
  opts: { from?: string; to?: string; now?: Date } = {}
): Promise<PeriodStats> {
  const admin = getSupabaseAdminClient();
  const range = getISTPeriodRange(period, opts);

  const [curRes, prevRes] = await Promise.all([
    admin
      .from("orders")
      .select("placed_at, total_amount, payment_status, payment_method, status")
      .gte("placed_at", range.start.toISOString())
      .lte("placed_at", range.end.toISOString()),
    admin
      .from("orders")
      .select("total_amount, payment_status")
      .gte("placed_at", range.prev.start.toISOString())
      .lte("placed_at", range.prev.end.toISOString()),
  ]);

  const rows = (curRes.data ?? []) as OrderRow[];

  const emptyStatus = (): Record<OrderStatus, { count: number; revenue: number }> => ({
    placed: { count: 0, revenue: 0 },
    confirmed: { count: 0, revenue: 0 },
    packed: { count: 0, revenue: 0 },
    shipped: { count: 0, revenue: 0 },
    out_for_delivery: { count: 0, revenue: 0 },
    delivered: { count: 0, revenue: 0 },
    cancelled: { count: 0, revenue: 0 },
    returned: { count: 0, revenue: 0 },
  });

  const emptySplit = (): PaymentSplit => ({
    orders: 0, paidOrders: 0, revenue: 0, pendingOrders: 0, pendingRevenue: 0,
  });

  const byStatus = emptyStatus();
  const byPayment: Record<PaymentBucket, PaymentSplit> = {
    prepaid: emptySplit(),
    cod:     emptySplit(),
  };
  const chartMap = new Map<string, { revenue: number; orders: number; prepaidRevenue: number; codRevenue: number }>();

  let orders = 0;
  let revenue = 0;
  let paidOrders = 0;

  for (const o of rows) {
    const amount = Number(o.total_amount) || 0;
    const paid = isPaid(o.payment_status);
    orders++;

    const bucket = byStatus[o.status] ?? (byStatus[o.status] = { count: 0, revenue: 0 });
    bucket.count++;

    const key = istDayKey(new Date(o.placed_at));
    const day = chartMap.get(key) ?? { revenue: 0, orders: 0, prepaidRevenue: 0, codRevenue: 0 };
    day.orders++;

    // COD is the "postpaid" bucket; anything else is money taken up front.
    const pay = byPayment[o.payment_method === "cod" ? "cod" : "prepaid"];
    pay.orders++;

    if (paid) {
      revenue += amount;
      paidOrders++;
      bucket.revenue += amount;
      day.revenue += amount;
      pay.paidOrders++;
      pay.revenue += amount;
      if (o.payment_method === "cod") day.codRevenue += amount;
      else day.prepaidRevenue += amount;
    } else if (o.status !== "cancelled" && o.status !== "returned" && o.payment_status !== "refunded") {
      // Still in flight: COD yet to be collected, or a prepaid order the
      // customer never paid for. Dead orders are excluded so the number
      // reflects money that can still land.
      pay.pendingOrders++;
      pay.pendingRevenue += amount;
    }
    chartMap.set(key, day);
  }

  // Prev-window revenue for the comparison trend.
  let prevRevenue = 0;
  let prevOrders = 0;
  for (const o of (prevRes.data ?? []) as Array<{ total_amount: number | string; payment_status: string }>) {
    prevOrders++;
    if (isPaid(o.payment_status)) prevRevenue += Number(o.total_amount) || 0;
  }

  const chart: RevenueChartPoint[] = Array.from(chartMap.entries())
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([date, v]) => ({ date, ...v }));

  return {
    label: range.label,
    start: range.start.toISOString(),
    end: range.end.toISOString(),
    orders,
    paidOrders,
    revenue,
    avgOrderValue: paidOrders > 0 ? Math.round(revenue / paidOrders) : 0,
    byStatus,
    byPayment,
    chart,
    prevRevenue,
    prevOrders,
  };
}

/** Percent change vs previous window, rounded; null when there's no baseline. */
export function pctChange(current: number, previous: number): number | null {
  if (previous <= 0) return null;
  return Math.round(((current - previous) / previous) * 100);
}
