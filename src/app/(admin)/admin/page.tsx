import type { Metadata } from "next";
import {
  ShoppingBag, IndianRupee, Package, AlertTriangle,
  Users, Clock, Receipt, CreditCard, Banknote, Hourglass, TrendingDown,
} from "lucide-react";
import { StatsCard } from "@/components/admin/StatsCard";
import { RevenueChart } from "@/components/admin/RevenueChart";
import { OrdersTable } from "@/components/admin/OrdersTable";
import { PeriodSelector } from "@/components/admin/PeriodSelector";
import { formatPrice, formatCompactNumber } from "@/lib/utils/format";
import { getAdminDashboard } from "@/lib/admin/stats";
import { getPeriodStats, pctChange } from "@/lib/admin/periods";
import type { DashboardPeriod } from "@/types";

export const metadata: Metadata = { title: "Admin Dashboard" };
export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ period?: DashboardPeriod; from?: string; to?: string }>;
}

export default async function AdminDashboard({ searchParams }: Props) {
  const { period = "today", from, to } = await searchParams;

  const [{ stats, recentOrders }, p] = await Promise.all([
    getAdminDashboard(),
    getPeriodStats(period, { from, to }),
  ]);

  // Preserve the active period on every card link so drill-downs stay in context.
  const q = new URLSearchParams({ period });
  if (from) q.set("from", from);
  if (to) q.set("to", to);
  const qs = `?${q.toString()}`;

  const revTrend = pctChange(p.revenue, p.prevRevenue);
  const ordTrend = pctChange(p.orders, p.prevOrders);

  // Period-scoped cards (respond to the selector).
  const periodCards = [
    {
      title:   `Orders · ${p.label}`,
      value:   formatCompactNumber(p.orders),
      icon:    ShoppingBag,
      variant: "default" as const,
      href:    `/admin/dashboard/orders${qs}`,
      trend:   ordTrend !== null ? { value: ordTrend, label: "vs prev" } : undefined,
    },
    {
      title:   `Revenue · ${p.label}`,
      value:   formatPrice(p.revenue),
      icon:    IndianRupee,
      variant: "success" as const,
      href:    `/admin/dashboard/revenue${qs}`,
      trend:   revTrend !== null ? { value: revTrend, label: "vs prev" } : undefined,
    },
    {
      title:   `Avg Order Value · ${p.label}`,
      value:   formatPrice(p.avgOrderValue),
      icon:    Receipt,
      variant: "default" as const,
      href:    `/admin/dashboard/revenue${qs}`,
    },
  ];

  // Prepaid vs COD — counts and revenue kept strictly apart.
  const { prepaid, cod } = p.byPayment;
  const paymentCards = [
    {
      title:   `Prepaid Revenue · ${p.label}`,
      value:   formatPrice(prepaid.revenue),
      icon:    CreditCard,
      variant: "success" as const,
      href:    `/admin/dashboard/orders${qs}&pay=prepaid`,
    },
    {
      title:   `COD Revenue · ${p.label}`,
      value:   formatPrice(cod.revenue),
      icon:    Banknote,
      variant: "default" as const,
      href:    `/admin/dashboard/orders${qs}&pay=cod`,
    },
    {
      title:   `Prepaid Orders · ${p.label}`,
      value:   `${prepaid.orders}`,
      icon:    ShoppingBag,
      variant: "default" as const,
      href:    `/admin/dashboard/orders${qs}&pay=prepaid`,
    },
    {
      title:   `COD Orders · ${p.label}`,
      value:   `${cod.orders}`,
      icon:    ShoppingBag,
      variant: "default" as const,
      href:    `/admin/dashboard/orders${qs}&pay=cod`,
    },
  ];

  // Live operational cards (always "right now", not period-scoped).
  const opsCards = [
    {
      title:   "Pending Orders",
      value:   stats.pending_orders ?? 0,
      icon:    Package,
      variant: "warning" as const,
      href:    "/admin/dashboard/orders?period=all&filter=pending",
    },
    {
      title:   "Overdue Packing",
      value:   stats.overdue_packing ?? 0,
      icon:    Clock,
      variant: (stats.overdue_packing ?? 0) > 0 ? "danger" as const : "default" as const,
      href:    "/admin/dashboard/orders?period=all&filter=overdue",
    },
    {
      title:   "Low Stock Items",
      value:   stats.low_stock_products ?? 0,
      icon:    AlertTriangle,
      variant: (stats.low_stock_products ?? 0) > 0 ? "warning" as const : "default" as const,
      href:    "/admin/products?filter=low-stock",
    },
    {
      title:   "Total Customers",
      value:   formatCompactNumber(stats.total_customers ?? 0),
      icon:    Users,
      variant: "default" as const,
      href:    "/admin/customers",
    },
  ];

  return (
    <div className="space-y-8 p-6">
      <section>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl font-bold text-gray-900">Overview</h2>
          <PeriodSelector defaultPeriod="today" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {periodCards.map((stat) => (
            <StatsCard key={stat.title} {...stat} />
          ))}
        </div>
      </section>

      <section>
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-lg font-semibold text-gray-700">Prepaid vs COD · {p.label}</h2>
          <p className="text-xs text-gray-400">
            Revenue counts paid orders only — prepaid captured online, COD collected on delivery.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {paymentCards.map((stat) => (
            <StatsCard key={stat.title} {...stat} />
          ))}
        </div>
        {(cod.pendingOrders > 0 || prepaid.pendingOrders > 0 || cod.lostOrders > 0) && (
          <div className="mt-4 space-y-2 rounded-2xl border border-gray-100 bg-white p-4 text-sm shadow-sm">
            {cod.pendingOrders > 0 && (
              <p className="flex flex-wrap items-center gap-1.5 text-gray-600">
                <Hourglass className="h-4 w-4 flex-shrink-0 text-amber-500" />
                COD estimated incoming:{" "}
                <strong className="text-gray-900">{formatPrice(cod.pendingRevenue)}</strong>
                <span className="text-gray-400">({cod.pendingOrders} orders in transit)</span>
                <span className="text-gray-400">
                  · expected total {formatPrice(cod.revenue + cod.pendingRevenue)}
                </span>
              </p>
            )}
            {cod.lostOrders > 0 && (
              <p className="flex flex-wrap items-center gap-1.5 text-gray-600">
                <TrendingDown className="h-4 w-4 flex-shrink-0 text-red-500" />
                <strong className="text-red-600">− {formatPrice(cod.lostRevenue)}</strong>
                off the COD estimate
                <span className="text-gray-400">
                  ({cod.lostOrders} cancelled/returned, never collected)
                </span>
              </p>
            )}
            {prepaid.pendingOrders > 0 && (
              <p className="flex flex-wrap items-center gap-1.5 text-gray-600">
                <Hourglass className="h-4 w-4 flex-shrink-0 text-gray-400" />
                Prepaid unpaid:{" "}
                <strong className="text-gray-900">{formatPrice(prepaid.pendingRevenue)}</strong>
                <span className="text-gray-400">({prepaid.pendingOrders} orders)</span>
              </p>
            )}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-gray-700">Operations</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {opsCards.map((stat) => (
            <StatsCard key={stat.title} {...stat} />
          ))}
        </div>
      </section>

      <section>
        <RevenueChart split data={p.chart} title={`Revenue Trend · ${p.label}`} />
      </section>

      <section>
        <h2 className="mb-4 text-2xl font-bold text-gray-900">Recent Orders</h2>
        <OrdersTable orders={recentOrders} />
      </section>
    </div>
  );
}
