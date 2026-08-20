import type { Metadata } from "next";
import {
  ShoppingBag, IndianRupee, Package, AlertTriangle,
  Users, Clock, Receipt, CreditCard, Banknote, Hourglass, XCircle, Ban, Wallet,
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
      // Estimated revenue: confirmed → delivered. Click through for the
      // prepaid vs COD split of exactly this number.
      title:   `Est. Revenue · ${p.label}`,
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

  // Orders that never became revenue — each gets its own tab.
  const lostCards = [
    {
      title:   `Failed Orders · ${p.label}`,
      value:   `${p.failed.orders}`,
      subtitle: `${formatPrice(p.failed.amount)} never converted`,
      icon:    XCircle,
      variant: p.failed.orders > 0 ? "danger" as const : "default" as const,
      href:    `/admin/dashboard/failed${qs}`,
    },
    {
      title:   `Cancelled Orders · ${p.label}`,
      value:   `${p.cancelled.orders}`,
      subtitle: `${formatPrice(p.cancelled.amount)} cancelled · by customer & BoxDeal`,
      icon:    Ban,
      variant: p.cancelled.orders > 0 ? "warning" as const : "default" as const,
      href:    `/admin/dashboard/cancelled${qs}`,
    },
  ];

  // Prepaid vs COD — both sides of the same estimate.
  const { prepaid, cod } = p.byPayment;
  const paymentCards = [
    {
      title:   `Prepaid Revenue · ${p.label}`,
      value:   formatPrice(prepaid.revenue),
      icon:    CreditCard,
      variant: "success" as const,
      href:    `/admin/dashboard/revenue${qs}&pay=prepaid`,
    },
    {
      title:   `COD Revenue · ${p.label}`,
      value:   formatPrice(cod.revenue),
      icon:    Banknote,
      variant: "default" as const,
      href:    `/admin/dashboard/revenue${qs}&pay=cod`,
    },
    {
      title:   `Prepaid Orders · ${p.label}`,
      value:   `${prepaid.revenueOrders}`,
      icon:    ShoppingBag,
      variant: "default" as const,
      href:    `/admin/dashboard/orders${qs}&pay=prepaid`,
    },
    {
      title:   `COD Orders · ${p.label}`,
      value:   `${cod.revenueOrders}`,
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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {lostCards.map((stat) => (
            <StatsCard key={stat.title} {...stat} />
          ))}
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Revenue counts</p>
            <p className="mt-1 text-sm font-medium text-gray-700">
              Confirmed · Packed · Shipped · Out for Delivery · Delivered
            </p>
            <p className="mt-1 text-xs text-gray-400">
              Order Placed, failed and cancelled orders are excluded.
            </p>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-lg font-semibold text-gray-700">Prepaid vs COD · {p.label}</h2>
          <p className="text-xs text-gray-400">
            Estimated revenue split by payment method — click a card for the full breakdown.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {paymentCards.map((stat) => (
            <StatsCard key={stat.title} {...stat} />
          ))}
        </div>
        <div className="mt-4 space-y-2 rounded-2xl border border-gray-100 bg-white p-4 text-sm shadow-sm">
          <p className="flex flex-wrap items-center gap-1.5 text-gray-600">
            <Wallet className="h-4 w-4 flex-shrink-0 text-green-500" />
            Already collected:{" "}
            <strong className="text-gray-900">{formatPrice(p.collectedRevenue)}</strong>
            <span className="text-gray-400">({p.collectedOrders} orders paid)</span>
          </p>
          {p.pendingOrders > 0 && (
            <p className="flex flex-wrap items-center gap-1.5 text-gray-600">
              <Hourglass className="h-4 w-4 flex-shrink-0 text-amber-500" />
              Yet to collect:{" "}
              <strong className="text-gray-900">{formatPrice(p.pendingRevenue)}</strong>
              <span className="text-gray-400">
                ({p.pendingOrders} live order{p.pendingOrders === 1 ? "" : "s"}, mostly COD in transit)
              </span>
            </p>
          )}
        </div>
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
