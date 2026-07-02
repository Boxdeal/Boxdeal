import { getSupabaseAdminClient } from "@/lib/supabase/server";
import { istDayKey, istDayStart, addDaysKey } from "@/lib/admin/periods";
import type { DashboardStats, RevenueChartPoint, Order } from "@/types";

const CHART_DAYS = 30;
// All day bucketing is done in IST so "today"/"this month" match the business
// day in India regardless of the (UTC) server timezone.
const dayKey = istDayKey;

export interface TopProduct {
  product_id: string;
  product_name: string;
  sold_count: number;
  revenue: number;
  rating: number;
}

// All dashboard numbers + the 30-day revenue chart, computed in JS so we don't
// depend on any DB functions that may not exist in the live database.
export async function getAdminDashboard(): Promise<{
  stats: DashboardStats;
  chart: RevenueChartPoint[];
  recentOrders: Order[];
}> {
  const admin = getSupabaseAdminClient();
  const now = new Date();

  // Boundaries as IST calendar days → concrete UTC instants.
  const todayKey = dayKey(now);
  const monthStartKey = `${todayKey.slice(0, 7)}-01`;
  const chartStartKey = addDaysKey(todayKey, -(CHART_DAYS - 1));
  const startOfMonth = istDayStart(monthStartKey);
  const chartStart = istDayStart(chartStartKey);
  const fetchSince = chartStart < startOfMonth ? chartStart : startOfMonth;

  const [ordersRes, pendingRes, overdueRes, productsRes, customersRes, recentRes] = await Promise.all([
    admin.from("orders").select("placed_at, total_amount, payment_status").gte("placed_at", fetchSince.toISOString()),
    admin.from("orders").select("id", { count: "exact", head: true }).in("status", ["placed", "confirmed"]),
    admin.from("orders").select("id", { count: "exact", head: true }).eq("status", "placed").lt("pack_deadline", now.toISOString()),
    admin.from("products").select("stock_quantity, low_stock_threshold, is_active"),
    admin.from("user_profiles").select("id", { count: "exact", head: true }).eq("is_admin", false),
    admin.from("orders").select("*").order("placed_at", { ascending: false }).limit(10),
  ]);

  const orders = ordersRes.data ?? [];
  const paid = (s: string) => s === "paid";

  // Pre-seed every chart day (as IST day keys) so gaps render as zero.
  const buckets = new Map<string, { revenue: number; orders: number }>();
  for (let i = 0; i < CHART_DAYS; i++) {
    buckets.set(addDaysKey(chartStartKey, i), { revenue: 0, orders: 0 });
  }

  let today_orders = 0, today_revenue = 0, month_orders = 0, month_revenue = 0;
  for (const o of orders) {
    const d = new Date(o.placed_at);
    const k = dayKey(d);
    const amount = Number(o.total_amount) || 0;

    if (k === todayKey) {
      today_orders++;
      if (paid(o.payment_status)) today_revenue += amount;
    }
    if (d >= startOfMonth) {
      month_orders++;
      if (paid(o.payment_status)) month_revenue += amount;
    }
    const b = buckets.get(k);
    if (b) {
      b.orders++;
      if (paid(o.payment_status)) b.revenue += amount;
    }
  }

  const lowStock = (productsRes.data ?? []).filter(
    (p) => p.is_active && p.stock_quantity <= (p.low_stock_threshold ?? 0)
  ).length;

  const stats: DashboardStats = {
    today_orders,
    today_revenue,
    pending_orders:     pendingRes.count ?? 0,
    overdue_packing:    overdueRes.count ?? 0,
    low_stock_products: lowStock,
    total_customers:    customersRes.count ?? 0,
    month_revenue,
    month_orders,
  };

  const chart: RevenueChartPoint[] = Array.from(buckets.entries()).map(([date, v]) => ({
    date,
    revenue: v.revenue,
    orders:  v.orders,
  }));

  return { stats, chart, recentOrders: (recentRes.data ?? []) as Order[] };
}

// Best-selling products by units sold (from paid orders), computed in JS.
export async function getTopProducts(limit = 10): Promise<TopProduct[]> {
  const admin = getSupabaseAdminClient();

  const { data: items } = await admin
    .from("order_items")
    .select("product_id, product_name, quantity, selling_price, orders!inner(payment_status)")
    .eq("orders.payment_status", "paid");

  const map = new Map<string, TopProduct>();
  for (const it of (items ?? []) as Array<{ product_id: string; product_name: string; quantity: number; selling_price: number }>) {
    const cur = map.get(it.product_id) ?? {
      product_id:   it.product_id,
      product_name: it.product_name,
      sold_count:   0,
      revenue:      0,
      rating:       0,
    };
    cur.sold_count += it.quantity;
    cur.revenue += (Number(it.selling_price) || 0) * it.quantity;
    map.set(it.product_id, cur);
  }

  const top = Array.from(map.values()).sort((a, b) => b.sold_count - a.sold_count).slice(0, limit);

  // Attach current ratings.
  if (top.length) {
    const { data: ratings } = await admin
      .from("products")
      .select("id, rating")
      .in("id", top.map((t) => t.product_id));
    const ratingById = new Map((ratings ?? []).map((r) => [r.id, Number(r.rating) || 0]));
    for (const t of top) t.rating = ratingById.get(t.product_id) ?? 0;
  }

  return top;
}
