import { getSupabaseAdminClient } from "@/lib/supabase/server";
import { getISTPeriodRange, istDayKey } from "@/lib/admin/periods";
import { orderBucket } from "@/lib/admin/order-buckets";
import { ORDER_STATUS_LABELS } from "@/constants";
import type {
  DashboardPeriod, OrderStatus, ProductDayRow, ProductSalesRow, ProductStatusCount,
} from "@/types";

// Product-wise sales, computed in JS off order_items joined to their order so
// the same IST day boundaries and paid/pending/cancelled rules as the rest of
// the dashboard apply. Item value is quantity × selling_price — order-level
// coupon and admin discounts are not apportioned back to line items.

interface JoinedOrder {
  placed_at: string;
  payment_status: string;
  payment_method: string;
  status: string;
}

interface ItemRow {
  order_id: string;
  product_id: string;
  product_name: string;
  product_image: string | null;
  product_sku: string;
  quantity: number;
  selling_price: number | string;
  total_price: number | string | null;
  orders: JoinedOrder | JoinedOrder[] | null;
}

const SELECT =
  "order_id, product_id, product_name, product_image, product_sku, quantity, selling_price, total_price, " +
  "orders!inner(placed_at, payment_status, payment_method, status)";

/** PostgREST returns the embedded row as an object, but types it loosely. */
function orderOf(it: ItemRow): JoinedOrder | null {
  const o = it.orders;
  return Array.isArray(o) ? (o[0] ?? null) : o;
}

/** Line value, falling back to qty × price when total_price was never filled. */
function lineValue(it: ItemRow): number {
  const stored = Number(it.total_price) || 0;
  if (stored > 0) return stored;
  return (Number(it.selling_price) || 0) * it.quantity;
}

/**
 * Anything that is not live revenue: cancelled, returned, refunded, a failed
 * checkout, or an order still stuck at "placed". Same rule the dashboard uses,
 * so these units never inflate the pending estimate.
 */
function isDead(o: JoinedOrder): boolean {
  return o.payment_status === "refunded" || orderBucket(o) !== "revenue";
}

async function fetchItems(
  period: DashboardPeriod,
  opts: { from?: string; to?: string; productId?: string } = {}
): Promise<ItemRow[]> {
  const admin = getSupabaseAdminClient();
  const range = getISTPeriodRange(period, opts);

  let q = admin
    .from("order_items")
    .select(SELECT)
    .gte("orders.placed_at", range.start.toISOString())
    .lte("orders.placed_at", range.end.toISOString());

  if (opts.productId) q = q.eq("product_id", opts.productId);

  const { data } = await q;
  return (data ?? []) as unknown as ItemRow[];
}

/** Empty per-product totals — identity fields filled from any line of the product. */
function emptyTotals(it: Pick<ItemRow, "product_id" | "product_name" | "product_image" | "product_sku">): ProductSalesRow {
  return {
    product_id:     it.product_id,
    product_name:   it.product_name,
    product_image:  it.product_image,
    product_sku:    it.product_sku,
    orders:         0,
    units:          0,
    revenue:        0,
    pendingRevenue: 0,
    cancelledUnits: 0,
    prepaidUnits:   0,
    codUnits:       0,
  };
}

/** Fold one order line into a product totals row. */
function accumulate(row: ProductSalesRow, it: ItemRow, o: JoinedOrder): void {
  const value = lineValue(it);
  row.units += it.quantity;
  if (o.payment_method === "cod") row.codUnits += it.quantity;
  else row.prepaidUnits += it.quantity;

  if (o.payment_status === "paid") row.revenue += value;
  else if (isDead(o)) row.cancelledUnits += it.quantity;
  else row.pendingRevenue += value;
}

/**
 * Units + distinct orders per order status, in pipeline order (placed →
 * returned). Always computed over the UNFILTERED set so the status filter's
 * pills keep showing every bucket's size even while one of them is selected.
 */
function countByStatus(items: ItemRow[]): ProductStatusCount[] {
  const units = new Map<string, number>();
  const orders = new Map<string, Set<string>>();

  for (const it of items) {
    const o = orderOf(it);
    if (!o) continue;
    units.set(o.status, (units.get(o.status) ?? 0) + it.quantity);
    const set = orders.get(o.status) ?? new Set<string>();
    set.add(it.order_id);
    orders.set(o.status, set);
  }

  return (Object.keys(ORDER_STATUS_LABELS) as OrderStatus[])
    .filter((st) => units.has(st))
    .map((st) => ({
      status: st,
      units:  units.get(st) ?? 0,
      orders: orders.get(st)?.size ?? 0,
    }));
}

/** One row per product sold in the period, sorted by units desc. */
export async function getProductSales(
  period: DashboardPeriod,
  opts: { from?: string; to?: string } = {}
): Promise<ProductSalesRow[]> {
  const items = await fetchItems(period, opts);

  const byProduct = new Map<string, ProductSalesRow>();
  // Distinct order ids per product — one order can hold several lines.
  const orderIds = new Map<string, Set<string>>();

  for (const it of items) {
    const o = orderOf(it);
    if (!o) continue;

    const row = byProduct.get(it.product_id) ?? emptyTotals(it);
    accumulate(row, it, o);
    byProduct.set(it.product_id, row);

    const set = orderIds.get(it.product_id) ?? new Set<string>();
    set.add(it.order_id);
    orderIds.set(it.product_id, set);
  }

  for (const [id, row] of byProduct) row.orders = orderIds.get(id)?.size ?? 0;

  return Array.from(byProduct.values()).sort(
    (a, b) => b.units - a.units || b.revenue - a.revenue
  );
}

/**
 * Day-by-day sales for a single product, oldest first.
 *
 * `opts.status` narrows every number (days, chart, totals) to orders currently
 * in that order status — so the day-wise view can answer "how much of this
 * product is confirmed / shipped / delivered / cancelled". The status breakdown
 * itself is always computed over the full period, so selecting a filter never
 * hides the other buckets from the picker.
 */
export async function getProductDaily(
  productId: string,
  period: DashboardPeriod,
  opts: { from?: string; to?: string; status?: OrderStatus } = {}
): Promise<{
  days: ProductDayRow[];
  totals: ProductSalesRow | null;
  statusCounts: ProductStatusCount[];
}> {
  const all = await fetchItems(period, { from: opts.from, to: opts.to, productId });
  if (all.length === 0) return { days: [], totals: null, statusCounts: [] };

  const statusCounts = countByStatus(all);

  const items = opts.status
    ? all.filter((it) => orderOf(it)?.status === opts.status)
    : all;

  // Identity always comes from the unfiltered set, so the product header still
  // renders when a filter matches nothing.
  const totals = emptyTotals(all[0]);
  if (items.length === 0) return { days: [], totals, statusCounts };

  const dayMap = new Map<string, ProductDayRow>();
  const dayOrders = new Map<string, Set<string>>();
  const allOrders = new Set<string>();

  for (const it of items) {
    const o = orderOf(it);
    if (!o) continue;

    accumulate(totals, it, o);
    allOrders.add(it.order_id);

    const key = istDayKey(new Date(o.placed_at));
    const day = dayMap.get(key) ?? {
      date: key, orders: 0, units: 0, revenue: 0,
      pendingRevenue: 0, prepaidRevenue: 0, codRevenue: 0,
    };

    const value = lineValue(it);
    day.units += it.quantity;

    if (o.payment_status === "paid") {
      day.revenue += value;
      if (o.payment_method === "cod") day.codRevenue += value;
      else day.prepaidRevenue += value;
    } else if (!isDead(o)) {
      day.pendingRevenue += value;
    }

    dayMap.set(key, day);

    const set = dayOrders.get(key) ?? new Set<string>();
    set.add(it.order_id);
    dayOrders.set(key, set);
  }

  for (const [key, day] of dayMap) day.orders = dayOrders.get(key)?.size ?? 0;
  totals.orders = allOrders.size;

  const days = Array.from(dayMap.values()).sort((a, b) => (a.date < b.date ? -1 : 1));
  return { days, totals, statusCounts };
}
