import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft, IndianRupee, Receipt, CreditCard, Banknote, Wallet, Hourglass, Undo2,
} from "lucide-react";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import { StatsCard } from "@/components/admin/StatsCard";
import { RevenueChart } from "@/components/admin/RevenueChart";
import { OrdersTable } from "@/components/admin/OrdersTable";
import { PeriodSelector } from "@/components/admin/PeriodSelector";
import { getPeriodStats, getISTPeriodRange, pctChange } from "@/lib/admin/periods";
import { REVENUE_STATUSES } from "@/lib/admin/order-buckets";
import { formatPrice } from "@/lib/utils/format";
import { ORDER_STATUS_LABELS, PAYMENT_BUCKET_LABELS, PAYMENT_BUCKET_METHODS } from "@/constants";
import type { DashboardPeriod, Order, OrderStatus, PaymentBucket } from "@/types";

const PAY_BUCKETS: PaymentBucket[] = ["prepaid", "cod"];

export const metadata: Metadata = { title: "Revenue — Admin" };
export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{
    period?: DashboardPeriod; from?: string; to?: string; pay?: PaymentBucket;
  }>;
}

export default async function RevenueDetailPage({ searchParams }: Props) {
  const { period = "month", from, to, pay: payParam } = await searchParams;
  const pay = payParam && PAY_BUCKETS.includes(payParam) ? payParam : undefined;

  const p = await getPeriodStats(period, { from, to });
  const range = getISTPeriodRange(period, { from, to });

  // Keep the active period on drill-down links.
  const q = new URLSearchParams({ period });
  if (from) q.set("from", from);
  if (to) q.set("to", to);
  const qs = `?${q.toString()}`;
  const payLink = (bucket: PaymentBucket | null) => {
    const sp = new URLSearchParams(q.toString());
    if (bucket) sp.set("pay", bucket);
    return `?${sp.toString()}`;
  };

  // The orders that MAKE UP this revenue — the same confirmed → delivered rule
  // the numbers above use, not just the ones already paid for.
  const admin = getSupabaseAdminClient();
  let ordersQuery = admin
    .from("orders")
    .select("*")
    .in("status", REVENUE_STATUSES)
    .neq("payment_status", "failed")
    .gte("placed_at", range.start.toISOString())
    .lte("placed_at", range.end.toISOString())
    .order("placed_at", { ascending: false })
    .limit(100);
  if (pay) ordersQuery = ordersQuery.in("payment_method", PAYMENT_BUCKET_METHODS[pay]);
  const { data: revenueOrders } = await ordersQuery;

  const revTrend = pctChange(p.revenue, p.prevRevenue);
  const { prepaid, cod } = p.byPayment;

  // Cards follow the selected payment bucket, so the headline always matches
  // the list underneath it.
  const scope = pay ? p.byPayment[pay] : null;
  const shown = scope
    ? {
        revenue: scope.revenue, orders: scope.revenueOrders,
        collected: scope.collectedRevenue, pending: scope.pendingRevenue,
      }
    : {
        revenue: p.revenue, orders: p.revenueOrders,
        collected: p.collectedRevenue, pending: p.pendingRevenue,
      };
  const avg = shown.orders > 0 ? Math.round(shown.revenue / shown.orders) : 0;

  const cards = [
    {
      title: pay ? `${PAYMENT_BUCKET_LABELS[pay]} Est. Revenue` : "Estimated Revenue",
      value: formatPrice(shown.revenue),
      subtitle: `${shown.orders} order${shown.orders === 1 ? "" : "s"} · confirmed → delivered`,
      icon: IndianRupee, variant: "success" as const,
      trend: !pay && revTrend !== null ? { value: revTrend, label: "vs prev period" } : undefined,
    },
    {
      title: "Already Collected", value: formatPrice(shown.collected),
      subtitle: "money in hand — see where it came from",
      icon: Wallet, variant: "default" as const,
      href: `/admin/dashboard/collected${qs}${pay ? `&pay=${pay}` : ""}`,
    },
    {
      title: "Yet to Collect", value: formatPrice(shown.pending),
      subtitle: "live orders, mostly COD", icon: Hourglass, variant: "warning" as const,
    },
    {
      title: "Avg Order Value", value: formatPrice(avg),
      icon: Receipt, variant: "default" as const,
    },
  ];

  // Big prepaid vs COD split — the whole point of clicking the revenue card.
  const splitCards = [
    {
      title: "Prepaid Revenue", value: formatPrice(prepaid.revenue),
      subtitle: `${prepaid.revenueOrders} order${prepaid.revenueOrders === 1 ? "" : "s"} · paid online`,
      icon: CreditCard, variant: "success" as const, href: payLink("prepaid"),
    },
    {
      title: "COD Revenue", value: formatPrice(cod.revenue),
      subtitle: `${cod.revenueOrders} order${cod.revenueOrders === 1 ? "" : "s"} · cash on delivery`,
      icon: Banknote, variant: "default" as const, href: payLink("cod"),
    },
  ];

  const statusRows = (Object.entries(p.byStatus) as [OrderStatus, { count: number; revenue: number }][])
    .filter(([, v]) => v.count > 0);

  return (
    <div className="space-y-6 p-6">
      <div>
        <Link href="/admin" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-brand-600">
          <ArrowLeft className="h-4 w-4" /> Dashboard
        </Link>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold text-gray-900">
            Revenue{pay ? ` · ${PAYMENT_BUCKET_LABELS[pay]}` : ""} · {p.label}
          </h1>
          <PeriodSelector defaultPeriod="month" />
        </div>
        <p className="mt-1 text-sm text-gray-500">
          Estimated revenue — confirmed, packed, shipped, out for delivery and delivered orders.
          Order Placed, failed, cancelled and RTO / returned orders are not counted.
        </p>
      </div>

      {/* Payment method filter */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-gray-500">Payment:</span>
        <Link
          href={payLink(null)}
          className={`rounded-full px-4 py-1.5 text-sm font-medium ${!pay ? "bg-gray-800 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}
        >
          All ({formatPrice(p.revenue)})
        </Link>
        {PAY_BUCKETS.map((b) => (
          <Link
            key={b}
            href={payLink(b)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium ${pay === b ? "bg-gray-800 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}
          >
            {PAYMENT_BUCKET_LABELS[b]} ({formatPrice(p.byPayment[b].revenue)})
          </Link>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => <StatsCard key={c.title} {...c} />)}
      </div>

      {p.returned.orders > 0 && (
        <div className="rounded-2xl border border-orange-100 bg-orange-50/40 p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <Undo2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-orange-500" />
            <div className="w-full">
              <p className="text-sm font-semibold text-gray-700">RTO deducted from revenue</p>
              <dl className="mt-2 max-w-sm space-y-1 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-500">Shipped order value</dt>
                  <dd className="text-gray-700">{formatPrice(p.revenue + p.returned.amount)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">
                    − RTO / returned ({p.returned.orders})
                    {p.customerReturn.orders > 0 && (
                      <span className="text-gray-400">
                        {" "}· {p.rto.orders} RTO, {p.customerReturn.orders} customer
                      </span>
                    )}
                  </dt>
                  <dd className="font-semibold text-red-600">− {formatPrice(p.returned.amount)}</dd>
                </div>
                <div className="flex justify-between border-t border-orange-200 pt-1">
                  <dt className="font-medium text-gray-700">Estimated revenue</dt>
                  <dd className="font-black text-gray-900">{formatPrice(p.revenue)}</dd>
                </div>
              </dl>
              <Link
                href={`/admin/dashboard/rto${qs}`}
                className="mt-2 inline-block text-xs font-medium text-brand-600 hover:text-brand-700"
              >
                See every RTO / returned order →
              </Link>
            </div>
          </div>
        </div>
      )}

      <section>
        <h2 className="mb-3 text-lg font-semibold text-gray-700">COD vs Prepaid · {p.label}</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {splitCards.map((c) => <StatsCard key={c.title} {...c} />)}
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="mb-3 text-sm font-semibold text-gray-700">Where the money stands</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-400">
                  <th className="pb-2 text-left font-medium">Method</th>
                  <th className="pb-2 text-right font-medium">Orders</th>
                  <th className="pb-2 text-right font-medium">Collected</th>
                  <th className="pb-2 text-right font-medium">Yet to collect</th>
                  <th className="pb-2 text-right font-medium">Est. revenue</th>
                </tr>
              </thead>
              <tbody>
                {PAY_BUCKETS.map((b) => {
                  const s = p.byPayment[b];
                  return (
                    <tr key={b} className="border-t border-gray-50">
                      <td className="py-2">
                        <Link href={payLink(b)} className="font-medium text-gray-700 hover:text-brand-600">
                          {PAYMENT_BUCKET_LABELS[b]}
                        </Link>
                      </td>
                      <td className="py-2 text-right text-gray-500">{s.revenueOrders}</td>
                      <td className="py-2 text-right">
                        <Link
                          href={`/admin/dashboard/collected${qs}&pay=${b}`}
                          className="text-gray-700 hover:text-brand-600"
                        >
                          {formatPrice(s.collectedRevenue)}
                        </Link>
                      </td>
                      <td className="py-2 text-right text-amber-700">
                        {s.pendingRevenue > 0 ? formatPrice(s.pendingRevenue) : "—"}
                      </td>
                      <td className="py-2 text-right font-semibold text-gray-900">{formatPrice(s.revenue)}</td>
                    </tr>
                  );
                })}
                <tr className="border-t border-gray-200">
                  <td className="pt-2 font-medium text-gray-700">Total</td>
                  <td className="pt-2 text-right text-gray-500">{p.revenueOrders}</td>
                  <td className="pt-2 text-right">
                    <Link
                      href={`/admin/dashboard/collected${qs}`}
                      className="text-gray-700 hover:text-brand-600"
                    >
                      {formatPrice(p.collectedRevenue)}
                    </Link>
                  </td>
                  <td className="pt-2 text-right text-amber-700">{formatPrice(p.pendingRevenue)}</td>
                  <td className="pt-2 text-right font-black">{formatPrice(p.revenue)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {(p.failed.orders > 0 || p.cancelled.orders > 0 || p.returned.orders > 0) && (
            <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 border-t border-gray-100 pt-3 text-xs text-gray-500">
              <Link href={`/admin/dashboard/failed${qs}`} className="hover:text-brand-600">
                Excluded: <strong className="text-red-600">{formatPrice(p.failed.amount)}</strong>{" "}
                failed ({p.failed.orders}) →
              </Link>
              <Link href={`/admin/dashboard/cancelled${qs}`} className="hover:text-brand-600">
                <strong className="text-amber-600">{formatPrice(p.cancelled.amount)}</strong>{" "}
                cancelled ({p.cancelled.orders}) →
              </Link>
              <Link href={`/admin/dashboard/rto${qs}`} className="hover:text-brand-600">
                <strong className="text-orange-600">{formatPrice(p.returned.amount)}</strong>{" "}
                RTO / returned ({p.returned.orders}) →
              </Link>
            </p>
          )}
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="mb-3 text-sm font-semibold text-gray-700">Order value by status</p>
          <div className="space-y-2 text-sm">
            {statusRows.length === 0 && <p className="text-gray-400">No orders in this period.</p>}
            {statusRows.map(([s, v]) => {
              const counted = REVENUE_STATUSES.includes(s);
              return (
                <div key={s} className="flex justify-between">
                  <span className={counted ? "text-gray-600" : "text-gray-400"}>
                    {ORDER_STATUS_LABELS[s]} <span className="text-gray-400">({v.count})</span>
                    {!counted && <span className="ml-1 text-[11px] text-gray-400">· not counted</span>}
                  </span>
                  <span className={counted ? "font-semibold text-gray-900" : "text-gray-400 line-through"}>
                    {formatPrice(v.revenue)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <section>
        <RevenueChart split data={p.chart} title="Daily estimated revenue — prepaid vs COD" />
      </section>

      <section>
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-lg font-semibold text-gray-700">
            Orders behind this revenue{" "}
            {(revenueOrders?.length ?? 0) === 100 && (
              <span className="text-xs font-normal text-gray-400">(latest 100)</span>
            )}
          </h2>
          <Link
            href={`/admin/dashboard/orders${qs}${pay ? `&pay=${pay}` : ""}`}
            className="text-sm font-medium text-brand-600 hover:text-brand-700"
          >
            All orders in this period →
          </Link>
        </div>
        <OrdersTable orders={(revenueOrders ?? []) as Order[]} />
      </section>
    </div>
  );
}
