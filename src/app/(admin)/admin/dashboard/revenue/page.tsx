import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, IndianRupee, Receipt, ShoppingBag, TrendingUp } from "lucide-react";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import { StatsCard } from "@/components/admin/StatsCard";
import { RevenueChart } from "@/components/admin/RevenueChart";
import { OrdersTable } from "@/components/admin/OrdersTable";
import { PeriodSelector } from "@/components/admin/PeriodSelector";
import { getPeriodStats, getISTPeriodRange, pctChange } from "@/lib/admin/periods";
import { formatPrice, formatCompactNumber } from "@/lib/utils/format";
import { ORDER_STATUS_LABELS } from "@/constants";
import type { DashboardPeriod, Order, OrderStatus } from "@/types";

export const metadata: Metadata = { title: "Revenue — Admin" };
export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ period?: DashboardPeriod; from?: string; to?: string }>;
}

export default async function RevenueDetailPage({ searchParams }: Props) {
  const { period = "month", from, to } = await searchParams;

  const p = await getPeriodStats(period, { from, to });
  const range = getISTPeriodRange(period, { from, to });

  // The paid orders that make up this revenue.
  const admin = getSupabaseAdminClient();
  const { data: paidOrders } = await admin
    .from("orders")
    .select("*")
    .eq("payment_status", "paid")
    .gte("placed_at", range.start.toISOString())
    .lte("placed_at", range.end.toISOString())
    .order("placed_at", { ascending: false })
    .limit(100);

  const revTrend = pctChange(p.revenue, p.prevRevenue);

  const cards = [
    { title: "Revenue (paid)", value: formatPrice(p.revenue), icon: IndianRupee, variant: "success" as const,
      trend: revTrend !== null ? { value: revTrend, label: "vs prev period" } : undefined },
    { title: "Paid Orders",    value: formatCompactNumber(p.paidOrders), icon: ShoppingBag, variant: "default" as const },
    { title: "Avg Order Value", value: formatPrice(p.avgOrderValue), icon: Receipt, variant: "default" as const },
    { title: "Prev Period",    value: formatPrice(p.prevRevenue), icon: TrendingUp, variant: "default" as const },
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
          <h1 className="text-2xl font-bold text-gray-900">Revenue · {p.label}</h1>
          <PeriodSelector defaultPeriod="month" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => <StatsCard key={c.title} {...c} />)}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="mb-3 text-sm font-semibold text-gray-700">Payment method split (paid)</p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Online (prepaid)</span><span className="font-semibold">{formatPrice(p.onlineRevenue)}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">COD (delivered)</span><span className="font-semibold">{formatPrice(p.codRevenue)}</span></div>
            <div className="flex justify-between border-t border-gray-100 pt-2"><span className="text-gray-700 font-medium">Total</span><span className="font-black">{formatPrice(p.revenue)}</span></div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="mb-3 text-sm font-semibold text-gray-700">Revenue by status (paid)</p>
          <div className="space-y-2 text-sm">
            {statusRows.length === 0 && <p className="text-gray-400">No orders in this period.</p>}
            {statusRows.map(([s, v]) => (
              <div key={s} className="flex justify-between">
                <span className="text-gray-500">{ORDER_STATUS_LABELS[s]} <span className="text-gray-400">({v.count})</span></span>
                <span className="font-semibold">{formatPrice(v.revenue)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <section>
        <RevenueChart data={p.chart} title="Daily revenue (paid)" />
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-gray-700">
          Contributing paid orders {(paidOrders?.length ?? 0) === 100 && <span className="text-xs font-normal text-gray-400">(latest 100)</span>}
        </h2>
        <OrdersTable orders={(paidOrders ?? []) as Order[]} />
      </section>
    </div>
  );
}
