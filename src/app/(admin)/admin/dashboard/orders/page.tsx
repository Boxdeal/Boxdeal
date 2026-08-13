import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, TrendingDown } from "lucide-react";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import { OrdersTable } from "@/components/admin/OrdersTable";
import { PeriodSelector } from "@/components/admin/PeriodSelector";
import { getPeriodStats, getISTPeriodRange } from "@/lib/admin/periods";
import { formatPrice } from "@/lib/utils/format";
import { ORDER_STATUS_LABELS, PAYMENT_BUCKET_LABELS, PAYMENT_BUCKET_METHODS } from "@/constants";
import type { DashboardPeriod, Order, OrderStatus, PaymentBucket } from "@/types";

export const metadata: Metadata = { title: "Orders — Admin" };
export const dynamic = "force-dynamic";

const STATUS_ORDER: OrderStatus[] = [
  "placed", "confirmed", "packed", "shipped", "out_for_delivery", "delivered", "cancelled", "returned",
];

const PAY_BUCKETS: PaymentBucket[] = ["prepaid", "cod"];

interface Props {
  searchParams: Promise<{
    period?: DashboardPeriod; from?: string; to?: string;
    status?: OrderStatus; filter?: "pending" | "overdue"; pay?: PaymentBucket;
  }>;
}

export default async function OrdersDetailPage({ searchParams }: Props) {
  const { period = "today", from, to, status, filter, pay: payParam } = await searchParams;
  const pay = payParam && PAY_BUCKETS.includes(payParam) ? payParam : undefined;

  const p = await getPeriodStats(period, { from, to });
  const range = getISTPeriodRange(period, { from, to });

  const admin = getSupabaseAdminClient();
  let query = admin
    .from("orders")
    .select("*")
    .gte("placed_at", range.start.toISOString())
    .lte("placed_at", range.end.toISOString())
    .order("placed_at", { ascending: false })
    .limit(100);

  if (filter === "pending")      query = query.in("status", ["placed", "confirmed"]);
  else if (filter === "overdue") query = query.eq("status", "placed").lt("pack_deadline", new Date().toISOString());
  else if (status)               query = query.eq("status", status);

  if (pay) query = query.in("payment_method", PAYMENT_BUCKET_METHODS[pay]);

  const { data: orders } = await query;

  // Preserve period params (and the payment bucket) across the status pills.
  const base = new URLSearchParams({ period });
  if (from) base.set("from", from);
  if (to) base.set("to", to);
  const linkWith = (extra: Record<string, string | null>) => {
    const sp = new URLSearchParams(base.toString());
    if (pay) sp.set("pay", pay);
    for (const [k, v] of Object.entries(extra)) {
      if (v === null) sp.delete(k);
      else sp.set(k, v);
    }
    return `?${sp.toString()}`;
  };
  // Payment pills keep the status filter but swap the bucket.
  const payLink = (bucket: PaymentBucket | null) => {
    const sp = new URLSearchParams(base.toString());
    if (status) sp.set("status", status);
    if (filter) sp.set("filter", filter);
    if (bucket) sp.set("pay", bucket);
    return `?${sp.toString()}`;
  };
  const allActive = !status && !filter;

  // Totals follow the payment bucket when one is selected, so the headline
  // numbers always match the list below them.
  const split = pay ? p.byPayment[pay] : null;
  const totals = split
    ? { orders: split.orders, paidOrders: split.paidOrders, revenue: split.revenue }
    : { orders: p.orders, paidOrders: p.paidOrders, revenue: p.revenue };

  const title = filter === "pending" ? "Pending Orders"
    : filter === "overdue" ? "Overdue Packing"
    : pay ? `${PAYMENT_BUCKET_LABELS[pay]} Orders`
    : "Orders";

  return (
    <div className="space-y-5 p-6">
      <div>
        <Link href="/admin" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-brand-600">
          <ArrowLeft className="h-4 w-4" /> Dashboard
        </Link>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold text-gray-900">{title} · {p.label}</h1>
          <PeriodSelector defaultPeriod="today" />
        </div>
      </div>

      {/* Totals — scoped to the selected payment bucket when there is one */}
      <div className={`grid gap-4 ${split ? "sm:grid-cols-2 lg:grid-cols-4" : "sm:grid-cols-3"}`}>
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Total Orders</p>
          <p className="mt-1 text-2xl font-black text-gray-900">{totals.orders}</p>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">{split ? "Collected" : "Revenue (paid)"}</p>
          <p className="mt-1 text-2xl font-black text-gray-900">{formatPrice(totals.revenue)}</p>
          <p className="mt-1 text-xs text-gray-400">{totals.paidOrders} paid orders</p>
        </div>

        {split ? (
          <>
            {/* Money still expected to land from this bucket. */}
            <div className="rounded-2xl border border-amber-100 bg-amber-50/50 p-5 shadow-sm">
              <p className="text-sm text-amber-700">Estimated incoming</p>
              <p className="mt-1 text-2xl font-black text-amber-900">{formatPrice(split.pendingRevenue)}</p>
              <p className="mt-1 text-xs text-amber-600">
                {split.pendingOrders} order{split.pendingOrders === 1 ? "" : "s"} in transit
              </p>
            </div>
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">Expected total</p>
              <p className="mt-1 text-2xl font-black text-gray-900">
                {formatPrice(split.revenue + split.pendingRevenue)}
              </p>
              <p className="mt-1 text-xs text-gray-400">collected + estimate</p>
            </div>
          </>
        ) : (
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Paid Orders</p>
            <p className="mt-1 text-2xl font-black text-gray-900">{totals.paidOrders}</p>
          </div>
        )}
      </div>

      {/* What fell out of the estimate — cancelled/returned/refunded before collection. */}
      {split && split.lostOrders > 0 && (
        <div className="flex items-center gap-2 rounded-2xl border border-red-100 bg-red-50/50 px-4 py-3 text-sm">
          <TrendingDown className="h-4 w-4 flex-shrink-0 text-red-500" />
          <span className="text-gray-600">
            <strong className="text-red-600">− {formatPrice(split.lostRevenue)}</strong> removed from the
            estimate — {split.lostOrders} cancelled/returned order{split.lostOrders === 1 ? "" : "s"} that
            never got collected.
          </span>
        </div>
      )}

      {/* Payment method — prepaid vs COD */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-gray-500">Payment:</span>
        <Link
          href={payLink(null)}
          className={`rounded-full px-4 py-1.5 text-sm font-medium ${!pay ? "bg-gray-800 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}
        >
          All ({p.orders})
        </Link>
        {PAY_BUCKETS.map((b) => (
          <Link
            key={b}
            href={payLink(b)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium ${pay === b ? "bg-gray-800 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}
          >
            {PAYMENT_BUCKET_LABELS[b]} ({p.byPayment[b].orders}) ·{" "}
            <span className={pay === b ? "text-gray-200" : "text-gray-400"}>
              {formatPrice(p.byPayment[b].revenue)}
            </span>
          </Link>
        ))}
      </div>

      {/* Status breakdown — clickable, date-wise + status-wise */}
      <div className="flex flex-wrap gap-2">
        <Link
          href={linkWith({})}
          className={`rounded-full px-4 py-1.5 text-sm font-medium ${allActive ? "bg-brand-500 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}
        >
          All ({p.orders})
        </Link>
        {STATUS_ORDER.filter((s) => p.byStatus[s].count > 0).map((s) => (
          <Link
            key={s}
            href={linkWith({ status: s })}
            className={`rounded-full px-4 py-1.5 text-sm font-medium ${status === s && !filter ? "bg-brand-500 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}
          >
            {ORDER_STATUS_LABELS[s]} ({p.byStatus[s].count})
          </Link>
        ))}
      </div>

      <OrdersTable orders={(orders ?? []) as Order[]} />
      {(orders?.length ?? 0) === 100 && (
        <p className="text-center text-xs text-gray-400">Showing latest 100 — narrow the period to see more.</p>
      )}
    </div>
  );
}
