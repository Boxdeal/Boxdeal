import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import { OrdersTable } from "@/components/admin/OrdersTable";
import { PeriodSelector } from "@/components/admin/PeriodSelector";
import { getPeriodStats, getISTPeriodRange } from "@/lib/admin/periods";
import { formatPrice } from "@/lib/utils/format";
import { ORDER_STATUS_LABELS } from "@/constants";
import type { DashboardPeriod, Order, OrderStatus } from "@/types";

export const metadata: Metadata = { title: "Orders — Admin" };
export const dynamic = "force-dynamic";

const STATUS_ORDER: OrderStatus[] = [
  "placed", "confirmed", "packed", "shipped", "out_for_delivery", "delivered", "cancelled", "returned",
];

interface Props {
  searchParams: Promise<{
    period?: DashboardPeriod; from?: string; to?: string;
    status?: OrderStatus; filter?: "pending" | "overdue";
  }>;
}

export default async function OrdersDetailPage({ searchParams }: Props) {
  const { period = "today", from, to, status, filter } = await searchParams;

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

  const { data: orders } = await query;

  // Preserve period params across the status pills.
  const base = new URLSearchParams({ period });
  if (from) base.set("from", from);
  if (to) base.set("to", to);
  const linkWith = (extra: Record<string, string>) => {
    const sp = new URLSearchParams(base.toString());
    for (const [k, v] of Object.entries(extra)) sp.set(k, v);
    return `?${sp.toString()}`;
  };
  const allActive = !status && !filter;

  const title = filter === "pending" ? "Pending Orders"
    : filter === "overdue" ? "Overdue Packing"
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

      {/* Totals */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Total Orders</p>
          <p className="mt-1 text-2xl font-black text-gray-900">{p.orders}</p>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Paid Orders</p>
          <p className="mt-1 text-2xl font-black text-gray-900">{p.paidOrders}</p>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Revenue (paid)</p>
          <p className="mt-1 text-2xl font-black text-gray-900">{formatPrice(p.revenue)}</p>
        </div>
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
