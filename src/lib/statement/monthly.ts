import { fromZonedTime, formatInTimeZone } from "date-fns-tz";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import { orderBucket, returnKind, REVENUE_STATUSES } from "@/lib/admin/order-buckets";
import { computeOrderInvoice, INVOICE_ITEM_SELECT, type InvoiceItemRow } from "@/lib/invoice/order";
import { stateCode, GST_RATE } from "@/lib/invoice/gst";

/**
 * The monthly statement: one month of trading, in the two views a shop
 * actually needs.
 *
 * The two halves deliberately count DIFFERENT days, because they answer
 * different questions and merging them would make both wrong:
 *
 *   business — money earned, keyed on the day the money arrived: COD on
 *              `delivered_at` (the cash only exists once the parcel lands, so
 *              an order placed on the 30th and delivered on the 2nd is next
 *              month's money), online on `placed_at` (paid at checkout).
 *              Refunded, cancelled and returned orders drop out on their own:
 *              only paid orders in a live/delivered status count.
 *   gst      — tax owed, keyed on `invoice_date`. GST liability arises when
 *              the invoice is raised, whatever the order or delivery date.
 *
 * Every GST figure runs through the same `computeOrderInvoice` the customer's
 * PDF uses, so the statement can never report a different number than the
 * invoice it is summarising.
 */

const IST = "Asia/Kolkata";

export interface StatementRange {
  /** "2026-09" */
  month: string;
  /** "September 2026" */
  label: string;
  start: Date;
  end: Date;
}

/** Resolve a "YYYY-MM" string into IST month boundaries. */
export function getMonthRange(month: string): StatementRange {
  const m = /^(\d{4})-(\d{2})$/.exec(month);
  if (!m) throw new Error(`Invalid month "${month}" — expected YYYY-MM`);
  const year = Number(m[1]);
  const mon = Number(m[2]);
  if (mon < 1 || mon > 12) throw new Error(`Invalid month "${month}"`);

  const start = fromZonedTime(`${m[1]}-${m[2]}-01T00:00:00.000`, IST);
  // First instant of the next month, used as an exclusive upper bound so no
  // row can fall in a gap between "last millisecond" and "next midnight".
  const nextY = mon === 12 ? year + 1 : year;
  const nextM = mon === 12 ? 1 : mon + 1;
  const end = fromZonedTime(
    `${String(nextY).padStart(4, "0")}-${String(nextM).padStart(2, "0")}-01T00:00:00.000`,
    IST
  );

  return { month, label: formatInTimeZone(start, IST, "MMMM yyyy"), start, end };
}

/** The last `count` months as YYYY-MM, newest first, in IST. */
export function recentMonths(count = 24, now = new Date()): string[] {
  const key = formatInTimeZone(now, IST, "yyyy-MM");
  const [y, m] = key.split("-").map(Number);
  const out: string[] = [];
  for (let i = 0; i < count; i++) {
    const total = y * 12 + (m - 1) - i;
    out.push(`${String(Math.floor(total / 12)).padStart(4, "0")}-${String((total % 12) + 1).padStart(2, "0")}`);
  }
  return out;
}

// ── Output shape ────────────────────────────────────────────

export interface ActivityCounts {
  placed: number;
  delivered: number;
  /**
   * Every PAID order placed this month (delivered, plus online orders paid but
   * still on the way), split by the month the money arrived — online at
   * checkout, COD on delivery (often next month for late orders). Same rule as
   * Money Earned and the Money Collected page, so the rows reconcile with both.
   */
  paidByMonth: MonthSplit[];
  inTransit: number;
  cancelled: number;
  returned: number;
  failed: number;
}

export interface RealisedMoney {
  /** Paid orders whose money arrived this month (COD delivered + online paid). */
  orders: number;
  /**
   * How many of those were for orders placed in an EARLIER month (always COD —
   * online orders are paid the day they are placed).
   * Surfaced because it is the whole reason this count differs from the
   * delivered figure in Order Activity, which is scoped to orders placed in
   * this month — without it the two look like a contradiction.
   */
  fromEarlierMonths: number;
  /** `orders` split by the month each one was placed, newest first. */
  byOrderMonth: MonthSplit[];
  /** Sum of line values before any discount. */
  gross: number;
  discount: number;
  delivery: number;
  /** What the customer actually paid — gross − discount + delivery. */
  net: number;
  cod: { orders: number; amount: number };
  prepaid: { orders: number; amount: number };
  /**
   * Online orders paid this month but not delivered yet. Counted above (the
   * money is in hand) but with no invoice yet: the number is issued on
   * delivery, dated back to the order day — so this month's invoice count
   * grows by this many as they land.
   */
  awaitingInvoice: { orders: number; amount: number };
}

/** A count (and its money) attributed to one calendar month. */
export interface MonthSplit {
  /** "2026-08" */
  month: string;
  /** "August 2026" */
  label: string;
  orders: number;
  /** `orders` split by payment method. */
  cod: number;
  prepaid: number;
  amount: number;
}

export interface ReturnsBlock {
  rto: { orders: number; amount: number };
  customer: { orders: number; amount: number };
}

export interface TopProduct {
  sku: string;
  name: string;
  qty: number;
  amount: number;
}

export interface InvoiceRegisterRow {
  invoiceNumber: string;
  invoiceDate: string;
  orderNumber: string;
  state: string;
  stateCode: string;
  paymentMethod: string;
  taxable: number;
  cgst: number;
  sgst: number;
  igst: number;
  total: number;
}

export interface GstTotals {
  taxable: number;
  cgst: number;
  sgst: number;
  igst: number;
  tax: number;
  net: number;
}

export interface HsnSummaryRow extends GstTotals {
  hsn: string;
  qty: number;
}

export interface StateSummaryRow extends GstTotals {
  state: string;
  stateCode: string;
  invoices: number;
}

export interface MonthlyStatement {
  month: string;
  label: string;
  generatedAt: string;
  rate: number;
  activity: ActivityCounts;
  realised: RealisedMoney;
  returns: ReturnsBlock;
  topProducts: TopProduct[];
  gst: {
    invoices: InvoiceRegisterRow[];
    totals: GstTotals;
    hsn: HsnSummaryRow[];
    states: StateSummaryRow[];
  };
}

// ── Helpers ─────────────────────────────────────────────────

const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;
const num = (v: unknown) => Number(v) || 0;

type OrderRow = {
  order_number: string;
  status: string;
  payment_status: string;
  payment_method: string;
  placed_at: string;
  delivered_at: string | null;
  subtotal: number | string;
  discount_amount: number | string | null;
  admin_discount: number | string | null;
  shipping_charge: number | string | null;
  total_amount: number | string;
  shipping_state: string | null;
  invoice_number?: string | null;
  invoice_date?: string | null;
  items?: InvoiceItemRow[] | null;
};

/** Tallies orders into calendar months (IST) by the given timestamp, newest first. */
function splitByMonth(rows: OrderRow[], at: (o: OrderRow) => string | null): MonthSplit[] {
  const byMonth = new Map<string, MonthSplit>();
  for (const o of rows) {
    const ts = at(o);
    if (!ts) continue;
    const month = formatInTimeZone(new Date(ts), IST, "yyyy-MM");
    const row = byMonth.get(month) ??
      { month, label: formatInTimeZone(new Date(ts), IST, "MMMM yyyy"), orders: 0, cod: 0, prepaid: 0, amount: 0 };
    row.orders++;
    if (o.payment_method === "cod") row.cod++;
    else row.prepaid++;
    row.amount = round2(row.amount + num(o.total_amount));
    byMonth.set(month, row);
  }
  return [...byMonth.values()].sort((a, b) => b.month.localeCompare(a.month));
}

const emptyTotals = (): GstTotals => ({ taxable: 0, cgst: 0, sgst: 0, igst: 0, tax: 0, net: 0 });

function addTotals(into: GstTotals, from: GstTotals) {
  into.taxable = round2(into.taxable + from.taxable);
  into.cgst = round2(into.cgst + from.cgst);
  into.sgst = round2(into.sgst + from.sgst);
  into.igst = round2(into.igst + from.igst);
  into.tax = round2(into.tax + from.tax);
  into.net = round2(into.net + from.net);
}

// ── The computation ─────────────────────────────────────────

export async function getMonthlyStatement(month: string): Promise<MonthlyStatement> {
  const range = getMonthRange(month);
  const admin = getSupabaseAdminClient();
  const from = range.start.toISOString();
  const to = range.end.toISOString();

  const SLIM = "order_number, status, payment_status, payment_method, placed_at, delivered_at, " +
    "subtotal, discount_amount, admin_discount, shipping_charge, total_amount, shipping_state";

  const [placedRes, deliveredRes, prepaidRes, invoicedRes, returnedRes] = await Promise.all([
    // Activity — every order raised this month, whatever became of it.
    admin.from("orders").select(SLIM)
      .gte("placed_at", from).lt("placed_at", to).limit(10000),
    // Money earned (COD) — cash that landed with a parcel delivered this month.
    admin.from("orders").select(`${SLIM}, items:order_items(product_name, product_sku, quantity, selling_price)`)
      .eq("payment_method", "cod").eq("status", "delivered").eq("payment_status", "paid")
      .gte("delivered_at", from).lt("delivered_at", to).limit(10000),
    // Money earned (online) — paid at checkout this month. Delivery is irrelevant
    // here: the money is already in hand.
    admin.from("orders").select(`${SLIM}, invoice_number, items:order_items(product_name, product_sku, quantity, selling_price)`)
      .neq("payment_method", "cod").in("status", REVENUE_STATUSES).eq("payment_status", "paid")
      .gte("placed_at", from).lt("placed_at", to).limit(10000),
    // Tax owed — invoices raised this month.
    admin.from("orders").select(`${SLIM}, invoice_number, invoice_date, items:order_items(${INVOICE_ITEM_SELECT})`)
      .not("invoice_number", "is", null)
      .gte("invoice_date", from).lt("invoice_date", to)
      .order("invoice_number", { ascending: true }).limit(10000),
    // Goods that came back. Keyed off the status-history entry rather than the
    // order's updated_at: that column moves on any later edit, so it would drag
    // an old return into whatever month someone last touched the order.
    admin.from("order_status_history")
      .select(`created_at, order:orders(${SLIM})`)
      .eq("status", "returned")
      .gte("created_at", from).lt("created_at", to).limit(10000),
  ]);

  // ── Activity, by order date ──
  const activity: ActivityCounts = {
    placed: 0, delivered: 0, paidByMonth: [], inTransit: 0, cancelled: 0, returned: 0, failed: 0,
  };
  const paidOfPlaced: OrderRow[] = [];
  for (const o of (placedRes.data ?? []) as unknown as OrderRow[]) {
    activity.placed++;
    const bucket = orderBucket(o);
    if (bucket === "failed") activity.failed++;
    else if (bucket === "cancelled") activity.cancelled++;
    else if (bucket === "returned") activity.returned++;
    else if (o.status === "delivered") activity.delivered++;
    else activity.inTransit++;
    if (bucket === "revenue" && o.payment_status === "paid") paidOfPlaced.push(o);
  }

  activity.paidByMonth = splitByMonth(
    paidOfPlaced, (o) => (o.payment_method === "cod" ? o.delivered_at : o.placed_at),
  );

  // ── Money earned, by the day the money arrived ──
  const earnedRows = [...(deliveredRes.data ?? []), ...(prepaidRes.data ?? [])] as unknown as OrderRow[];
  const realised: RealisedMoney = {
    orders: 0, fromEarlierMonths: 0, byOrderMonth: [], gross: 0, discount: 0, delivery: 0, net: 0,
    cod: { orders: 0, amount: 0 },
    prepaid: { orders: 0, amount: 0 },
    awaitingInvoice: { orders: 0, amount: 0 },
  };
  const productTally = new Map<string, TopProduct>();

  for (const o of earnedRows) {
    const total = num(o.total_amount);
    realised.orders++;
    if (new Date(o.placed_at) < range.start) realised.fromEarlierMonths++;
    realised.gross = round2(realised.gross + num(o.subtotal));
    realised.discount = round2(realised.discount + num(o.discount_amount) + num(o.admin_discount));
    realised.delivery = round2(realised.delivery + num(o.shipping_charge));
    realised.net = round2(realised.net + total);

    const side = o.payment_method === "cod" ? realised.cod : realised.prepaid;
    side.orders++;
    side.amount = round2(side.amount + total);
    if (o.payment_method !== "cod" && !o.invoice_number) {
      realised.awaitingInvoice.orders++;
      realised.awaitingInvoice.amount = round2(realised.awaitingInvoice.amount + total);
    }

    for (const it of o.items ?? []) {
      const sku = it.product_sku ?? "—";
      const row = productTally.get(sku) ?? { sku, name: it.product_name, qty: 0, amount: 0 };
      row.qty += it.quantity;
      row.amount = round2(row.amount + num(it.selling_price) * it.quantity);
      productTally.set(sku, row);
    }
  }

  realised.byOrderMonth = splitByMonth(
    earnedRows, (o) => o.placed_at,
  );

  const topProducts = [...productTally.values()]
    .sort((a, b) => b.amount - a.amount || b.qty - a.qty)
    .slice(0, 10);

  // ── Returns ──
  const returns: ReturnsBlock = {
    rto: { orders: 0, amount: 0 },
    customer: { orders: 0, amount: 0 },
  };
  const returnRows = (returnedRes.data ?? []) as unknown as Array<{ order: OrderRow | OrderRow[] | null }>;
  for (const row of returnRows) {
    const o = Array.isArray(row.order) ? row.order[0] : row.order;
    if (!o) continue;
    const side = returnKind(o) === "rto" ? returns.rto : returns.customer;
    side.orders++;
    side.amount = round2(side.amount + num(o.total_amount));
  }

  // ── GST, by invoice date ──
  const invoices: InvoiceRegisterRow[] = [];
  const totals = emptyTotals();
  const hsnMap = new Map<string, HsnSummaryRow>();
  const stateMap = new Map<string, StateSummaryRow>();

  for (const o of (invoicedRes.data ?? []) as unknown as OrderRow[]) {
    const calc = computeOrderInvoice(o);
    const state = (o.shipping_state ?? "").trim() || "Unknown";
    const code = stateCode(state) ?? "—";

    invoices.push({
      invoiceNumber: o.invoice_number ?? "",
      invoiceDate: formatInTimeZone(new Date(o.invoice_date!), IST, "dd/MM/yyyy"),
      orderNumber: o.order_number,
      state,
      stateCode: code,
      paymentMethod: o.payment_method === "cod" ? "COD" : "Prepaid",
      taxable: calc.totals.taxable,
      cgst: calc.totals.cgst,
      sgst: calc.totals.sgst,
      igst: calc.totals.igst,
      total: calc.totals.net,
    });

    addTotals(totals, calc.totals);

    // State-wise — the B2C table a GSTR-1 needs, one row per destination.
    const stateRow = stateMap.get(state) ?? { state, stateCode: code, invoices: 0, ...emptyTotals() };
    stateRow.invoices++;
    addTotals(stateRow, calc.totals);
    stateMap.set(state, stateRow);

    // HSN-wise — product lines only. The delivery charge has no HSN of its own
    // (it rides along with the goods as a composite supply), so it is kept out
    // of this table and shown separately; otherwise the HSN totals would not
    // reconcile against any single code.
    for (const line of calc.lines) {
      const hsn = line.hsn || "(not set)";
      const row = hsnMap.get(hsn) ?? { hsn, qty: 0, ...emptyTotals() };
      row.qty += line.qty;
      addTotals(row, {
        taxable: line.taxable, cgst: line.cgst, sgst: line.sgst,
        igst: line.igst, tax: line.tax, net: line.total,
      });
      hsnMap.set(hsn, row);
    }
  }

  return {
    month: range.month,
    label: range.label,
    generatedAt: formatInTimeZone(new Date(), IST, "dd/MM/yyyy, hh:mm a"),
    rate: GST_RATE,
    activity,
    realised,
    returns,
    topProducts,
    gst: {
      invoices,
      totals,
      hsn: [...hsnMap.values()].sort((a, b) => b.taxable - a.taxable),
      states: [...stateMap.values()].sort((a, b) => b.taxable - a.taxable),
    },
  };
}
