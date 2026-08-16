import type { Metadata } from "next";
import Link from "next/link";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import { OrdersTable } from "@/components/admin/OrdersTable";
import { OrdersSearch } from "@/components/admin/OrdersSearch";
import { getISTPeriodRange } from "@/lib/admin/periods";
import { buildOrderSearchFilter } from "@/lib/admin/order-search";
import type { DashboardPeriod, Order, OrderStatus } from "@/types";
import { ORDER_STATUS_LABELS } from "@/constants";

export const metadata: Metadata = { title: "Orders — Admin" };

// Admin order list must always reflect live status — no cached snapshot.
export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{
    status?: OrderStatus; page?: string; q?: string;
    period?: DashboardPeriod; from?: string; to?: string;
  }>;
}

export default async function AdminOrdersPage({ searchParams }: Props) {
  const { status, page: pageStr, q, period, from: fromDate, to: toDate } = await searchParams;
  const page = Math.max(1, Number(pageStr ?? 1));
  const per = 20;
  const from = (page - 1) * per;
  const to = from + per - 1;

  const admin = getSupabaseAdminClient();
  let query = admin
    .from("orders")
    .select("*", { count: "exact" })
    .order("placed_at", { ascending: false })
    .range(from, to);

  if (status) query = query.eq("status", status);

  // Optional IST date-range filter (period preset or custom from/to).
  if (period || fromDate || toDate) {
    const range = getISTPeriodRange(period ?? "custom", { from: fromDate, to: toDate });
    query = query
      .gte("placed_at", range.start.toISOString())
      .lte("placed_at", range.end.toISOString());
  }

  // Free-text search across order, customer, shipping and item fields.
  const searchFilter = q ? await buildOrderSearchFilter(q) : null;
  if (searchFilter) query = query.or(searchFilter);

  const { data: orders, count } = await query;
  const totalPages = Math.ceil((count ?? 0) / per);

  // Carry search + date filters through the status tabs / pagination links.
  const carry = new URLSearchParams();
  if (q) carry.set("q", q);
  if (period) carry.set("period", period);
  if (fromDate) carry.set("from", fromDate);
  if (toDate) carry.set("to", toDate);
  const carryStr = carry.toString();

  const statuses: OrderStatus[] = ["placed", "confirmed", "packed", "shipped", "delivered", "cancelled"];

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Orders</h1>

      <OrdersSearch resultCount={count ?? 0} />

      {/* Status filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        <Link
          href={`/admin/orders${carryStr ? `?${carryStr}` : ""}`}
          className={`rounded-full px-4 py-1.5 text-sm font-medium whitespace-nowrap transition-colors ${
            !status ? "bg-brand-500 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
          }`}
        >
          All
        </Link>
        {statuses.map((s) => (
          <Link
            key={s}
            href={`/admin/orders?status=${s}${carryStr ? `&${carryStr}` : ""}`}
            className={`rounded-full px-4 py-1.5 text-sm font-medium whitespace-nowrap transition-colors ${
              status === s ? "bg-brand-500 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {ORDER_STATUS_LABELS[s]}
          </Link>
        ))}
      </div>

      <OrdersTable orders={(orders ?? []) as Order[]} />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/admin/orders?${status ? `status=${status}&` : ""}${carryStr ? `${carryStr}&` : ""}page=${p}`}
              className={`h-9 w-9 flex items-center justify-center rounded-lg border text-sm ${
                p === page ? "border-brand-500 bg-brand-500 text-white" : "border-gray-200 text-gray-600"
              }`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
