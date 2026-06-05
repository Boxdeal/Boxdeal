import type { Metadata } from "next";
import {
  ShoppingBag, IndianRupee, Package, AlertTriangle,
  Users, TrendingUp, Clock,
} from "lucide-react";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { StatsCard } from "@/components/admin/StatsCard";
import { RevenueChart } from "@/components/admin/RevenueChart";
import { OrdersTable } from "@/components/admin/OrdersTable";
import { formatPrice, formatCompactNumber } from "@/lib/utils/format";
import type { DashboardStats, RevenueChartPoint, Order } from "@/types";

export const metadata: Metadata = { title: "Admin Dashboard" };

async function getDashboardData() {
  const supabase = await getSupabaseServerClient();

  const [statsRes, chartRes, recentOrdersRes] = await Promise.all([
    supabase.rpc("get_dashboard_stats"),
    supabase.rpc("get_revenue_chart", { p_days: 30 }),
    supabase
      .from("orders")
      .select("*")
      .order("placed_at", { ascending: false })
      .limit(10),
  ]);

  return {
    stats:        (statsRes.data ?? {}) as DashboardStats,
    chart:        (chartRes.data ?? []) as RevenueChartPoint[],
    recentOrders: (recentOrdersRes.data ?? []) as Order[],
  };
}

export default async function AdminDashboard() {
  const { stats, chart, recentOrders } = await getDashboardData();

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
      icon:    TrendingUp,
      variant: "success" as const,
    },
    {
      title:   "Month Orders",
      value:   stats.month_orders ?? 0,
      icon:    ShoppingBag,
      variant: "default" as const,
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statCards.map((card) => (
          <StatsCard key={card.title} {...card} />
        ))}
      </div>

      {/* Revenue chart */}
      <RevenueChart data={chart} />

      {/* Recent orders */}
      <div>
        <h2 className="mb-3 font-semibold text-gray-900">Recent Orders</h2>
        <OrdersTable orders={recentOrders} />
      </div>
    </div>
  );
}
