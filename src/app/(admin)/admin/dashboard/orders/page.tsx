import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, TrendingDown } from "lucide-react";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import { OrdersTable } from "@/components/admin/OrdersTable";
import { PeriodSelector } from "@/components/admin/PeriodSelector";
import { getPeriodStats, getISTPeriodRange } from "@/lib/admin/periods";
import { LIVE_ORDER_STATUSES } from "@/lib/admin/order-buckets";
import { formatPrice } from "@/lib/utils/format";
import { ORDER_STATUS_LABELS, PAYMENT_BUCKET_LABELS, PAYMENT_BUCKET_METHODS } from "@/constants";
import type { DashboardPeriod, Order, OrderStatus, PaymentBucket } from "@/types";

export const metadata: Metadata = { title: "Orders — Admin" };
export const dynamic = "force-dynamic";

// Placed / cancelled / returned are deliberately absent — those live in the
// Failed, Cancelled and RTO tabs, not in the orders list.
const STATUS_ORDER: OrderStatus[] = [
  "confirmed", "packed", "shipped", "out_for_delivery", "delivered",
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

  // Pending / overdue = waiting to be packed, i.e. confirmed orders only.
  if (filter === "pending")      query = query.eq("status", "confirmed");
  else if (filter === "overdue") query = query.eq("status", "confirmed").lt("pack_deadline", new Date().toISOString());
  else if (status)               query = query.eq("status", status);
  // Unfiltered = real orders only; failed and cancelled have their own tabs.
  else query = query.in("status", LIVE_ORDER_STATUSES).neq("payment_status", "failed");

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
  // "Orders" here means real orders — the same set the list below shows.
  const totals = split
    ? {
        orders: split.revenueOrders, revenue: split.revenue, revenueOrders: split.revenueOrders,
        collected: split.collectedRevenue, pending: split.pendingRevenue,
        pendingOrders: split.pendingOrders,
      }
    : {
        orders: p.revenueOrders, revenue: p.revenue, revenueOrders: p.revenueOrders,
        collected: p.collectedRevenue, pending: p.pendingRevenue,
        pendingOrders: p.pendingOrders,
      };
  // Status pills must count only the selected payment bucket, otherwise they
  // contradict the totals above them.
  const statusCounts = split ? split.byStatus : p.byStatus;

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
          <div className="flex flex-wrap items-baseline gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{title} · {p.label}</h1>
            <Link
              href={`/admin/dashboard/products?${base.toString()}`}
              className="text-sm font-medium text-brand-600 hover:text-brand-700"
            >
              View product-wise →
            </Link>
          </div>
          <PeriodSelector defaultPeriod="today" />
        </div>
      </div>

      {/* Totals — scoped to the selected payment bucket when there is one */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Orders</p>
          <p className="mt-1 text-2xl font-black text-gray-900">{totals.orders}</p>
          <p className="mt-1 text-xs text-gray-400">confirmed → delivered — failed, cancelled &amp; RTO excluded</p>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Est. Revenue</p>
          <p className="mt-1 text-2xl font-black text-gray-900">{formatPrice(totals.revenue)}</p>
          <p className="mt-1 text-xs text-gray-400">
            {totals.revenueOrders} confirmed → delivered order{totals.revenueOrders === 1 ? "" : "s"}
          </p>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Collected</p>
          <p className="mt-1 text-2xl font-black text-gray-900">{formatPrice(totals.collected)}</p>
          <p className="mt-1 text-xs text-gray-400">money already in hand</p>
        </div>
        <div className="rounded-2xl border border-amber-100 bg-amber-50/50 p-5 shadow-sm">
          <p className="text-sm text-amber-700">Yet to collect</p>
          <p className="mt-1 text-2xl font-black text-amber-900">{formatPrice(totals.pending)}</p>
          <p className="mt-1 text-xs text-amber-600">
            {totals.pendingOrders} live order{totals.pendingOrders === 1 ? "" : "s"}
          </p>
        </div>
      </div>

      {/* What never became revenue — each has its own tab. */}
      {(p.failed.orders > 0 || p.cancelled.orders > 0 || p.returned.orders > 0) && (
        <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-gray-100 bg-white px-4 py-3 text-sm">
          <TrendingDown className="h-4 w-4 flex-shrink-0 text-red-500" />
          <span className="text-gray-600">Not in revenue:</span>
          <Link href={`/admin/dashboard/failed?${base.toString()}`} className="font-medium text-gray-700 hover:text-brand-600">
            {p.failed.orders} failed ({formatPrice(p.failed.amount)}) →
          </Link>
          <Link href={`/admin/dashboard/cancelled?${base.toString()}`} className="font-medium text-gray-700 hover:text-brand-600">
            {p.cancelled.orders} cancelled ({formatPrice(p.cancelled.amount)}) →
          </Link>
          <Link href={`/admin/dashboard/rto?${base.toString()}`} className="font-medium text-gray-700 hover:text-brand-600">
            {p.returned.orders} RTO / returned ({formatPrice(p.returned.amount)}) →
          </Link>
        </div>
      )}

      {/* Payment method — prepaid vs COD */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-gray-500">Payment:</span>
        <Link
          href={payLink(null)}
          className={`rounded-full px-4 py-1.5 text-sm font-medium ${!pay ? "bg-gray-800 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}
        >
          All ({p.revenueOrders})
        </Link>
        {PAY_BUCKETS.map((b) => (
          <Link
            key={b}
            href={payLink(b)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium ${pay === b ? "bg-gray-800 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}
          >
            {PAYMENT_BUCKET_LABELS[b]} ({p.byPayment[b].revenueOrders}) ·{" "}
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
          All ({totals.orders})
        </Link>
        {STATUS_ORDER.filter((s) => statusCounts[s].count > 0).map((s) => (
          <Link
            key={s}
            href={linkWith({ status: s })}
            className={`rounded-full px-4 py-1.5 text-sm font-medium ${status === s && !filter ? "bg-brand-500 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}
          >
            {ORDER_STATUS_LABELS[s]} ({statusCounts[s].count})
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
