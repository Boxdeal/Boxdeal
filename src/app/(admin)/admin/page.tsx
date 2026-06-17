import type { Metadata } from "next";
import {
  ShoppingBag, IndianRupee, Package, AlertTriangle,
  Users, Clock,
} from "lucide-react";
import { StatsCard } from "@/components/admin/StatsCard";
import { RevenueChart } from "@/components/admin/RevenueChart";
import { OrdersTable } from "@/components/admin/OrdersTable";
import { formatPrice, formatCompactNumber } from "@/lib/utils/format";
import { getAdminDashboard } from "@/lib/admin/stats";

export const metadata: Metadata = { title: "Admin Dashboard" };
export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const { stats, chart, recentOrders } = await getAdminDashboard();

  const statCards = [
    {
      title:   "Today's Orders",
      value:   stats.today_orders ?? 0,
      icon:    ShoppingBag,
      variant: "default" as const,
    },
    {
      title:   "Today's Revenue",
      value:   formatPrice(stats.today_revenue ?? 0),
      icon:    IndianRupee,
      variant: "success" as const,
    },
    {
      title:   "Pending Orders",
      value:   stats.pending_orders ?? 0,
      icon:    Package,
      variant: (stats.overdue_packing ?? 0) > 0 ? "danger" as const : "warning" as const,
    },
    {
      title:   "Overdue Packing",
      value:   stats.overdue_packing ?? 0,
      icon:    Clock,
      variant: (stats.overdue_packing ?? 0) > 0 ? "danger" as const : "default" as const,
    },
    {
      title:   "Low Stock Items",
      value:   stats.low_stock_products ?? 0,
      icon:    AlertTriangle,
      variant: (stats.low_stock_products ?? 0) > 0 ? "warning" as const : "default" as const,
    },
    {
      title:   "Total Customers",
      value:   formatCompactNumber(stats.total_customers ?? 0),
      icon:    Users,
      variant: "default" as const,
    },
    {
      title:   "Month Revenue",
      value:   formatPrice(stats.month_revenue ?? 0),
      icon:    IndianRupee,
      variant: "success" as const,
    },
    {
      title:   "Total Orders",
      value:   formatCompactNumber(stats.month_orders ?? 0),
      icon:    Package,
      variant: "success" as const,
    },
  ];

  return (
    <div className="space-y-8 p-6">
      <section>
        <h2 className="mb-4 text-2xl font-bold text-gray-900">Overview</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat) => (
            <StatsCard key={stat.title} {...stat} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-2xl font-bold text-gray-900">Revenue Trend</h2>
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <RevenueChart data={chart} />
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-2xl font-bold text-gray-900">Recent Orders</h2>
        <OrdersTable orders={recentOrders} />
      </section>
    </div>
  );
}
