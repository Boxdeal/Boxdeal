import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Package } from "lucide-react";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { EmptyState } from "@/components/shared/EmptyState";
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from "@/constants";
import { formatPrice, formatDate } from "@/lib/utils/format";
import { cn } from "@/lib/utils/helpers";

export const metadata: Metadata = { title: "My Orders", robots: { index: false, follow: false } };

export default async function OrdersPage() {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: orders } = await supabase
    .from("orders")
    .select("*, items:order_items(product_name, product_image, quantity, selling_price)")
    .eq("user_id", user.id)
    .order("placed_at", { ascending: false });

  if (!orders?.length) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">My Orders</h1>
        <EmptyState
          icon={Package}
          title="No orders yet"
          description="You haven't placed any orders. Start shopping!"
          action={{ label: "Shop Now", href: "/products" }}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
      {orders.map((order) => (
        <Link
          key={order.id}
          href={`/orders/${order.id}`}
          className="block rounded-2xl border border-gray-100 bg-white p-5 hover:border-brand-200 hover:shadow-sm transition-all"
        >
          <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
            <div>
              <p className="font-mono font-semibold text-gray-900">{order.order_number}</p>
              <p className="text-xs text-gray-400 mt-0.5">{formatDate(order.placed_at)}</p>
            </div>
            <div className="text-right">
              <span className={cn("rounded-full px-3 py-1 text-xs font-semibold", ORDER_STATUS_COLORS[order.status as keyof typeof ORDER_STATUS_COLORS])}>
                {ORDER_STATUS_LABELS[order.status as keyof typeof ORDER_STATUS_LABELS]}
              </span>
              <p className="mt-1 font-bold text-gray-900">{formatPrice(order.total_amount)}</p>
            </div>
          </div>
          <div className="text-sm text-gray-500">
            {(order.items ?? []).slice(0, 2).map((item: { product_name: string; quantity: number }) => (
              <span key={item.product_name}>{item.product_name} ×{item.quantity} · </span>
            ))}
            {(order.items ?? []).length > 2 && (
              <span>+{(order.items ?? []).length - 2} more</span>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}
