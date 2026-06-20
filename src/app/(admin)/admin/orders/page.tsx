import type { Metadata } from "next";
import Link from "next/link";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import { OrdersTable } from "@/components/admin/OrdersTable";
import type { Order, OrderStatus } from "@/types";
import { ORDER_STATUS_LABELS } from "@/constants";

export const metadata: Metadata = { title: "Orders — Admin" };

// Admin order list must always reflect live status — no cached snapshot.
export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ status?: OrderStatus; page?: string }>;
}

export default async function AdminOrdersPage({ searchParams }: Props) {
  const { status, page: pageStr } = await searchParams;
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

  const { data: orders, count } = await query;
  const totalPages = Math.ceil((count ?? 0) / per);

  const statuses: OrderStatus[] = ["placed", "confirmed", "packed", "shipped", "delivered", "cancelled"];

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Orders</h1>

      {/* Status filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        <Link
          href="/admin/orders"
          className={`rounded-full px-4 py-1.5 text-sm font-medium whitespace-nowrap transition-colors ${
            !status ? "bg-brand-500 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
          }`}
        >
          All
        </Link>
        {statuses.map((s) => (
          <Link
            key={s}
            href={`/admin/orders?status=${s}`}
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
              href={`/admin/orders?${status ? `status=${status}&` : ""}page=${p}`}
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
