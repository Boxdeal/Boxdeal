import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import { OrderStatusUpdater } from "./OrderStatusUpdater";
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from "@/constants";
import { formatPrice, formatDateTime } from "@/lib/utils/format";
import { cn } from "@/lib/utils/helpers";
import Image from "next/image";

export const metadata: Metadata = { title: "Order Detail — Admin" };

// Admin must always see live order/shipment data (status, AWB, tracking) —
// never a cached snapshot. Force fresh render on every request.
export const dynamic = "force-dynamic";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const admin = getSupabaseAdminClient();

  const { data: order } = await admin
    .from("orders")
    .select(`
      *,
      items:order_items(*),
      status_history:order_status_history(* )
    `)
    .eq("id", id)
    .single();

  if (!order) notFound();

  const { data: userProfile } = await admin
    .from("user_profiles")
    .select("full_name, phone")
    .eq("id", order.user_id)
    .single();

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">{order.order_number}</h1>
        <span className={cn("rounded-full px-3 py-1 text-sm font-semibold", ORDER_STATUS_COLORS[order.status as keyof typeof ORDER_STATUS_COLORS])}>
          {ORDER_STATUS_LABELS[order.status as keyof typeof ORDER_STATUS_LABELS]}
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Items */}
          <div className="rounded-2xl border border-gray-100 bg-white p-5">
            <h2 className="mb-4 font-semibold text-gray-900">Order Items</h2>
            <div className="space-y-3">
              {(order.items ?? []).map((item: { product_image: string; product_name: string; product_sku: string; quantity: number; selling_price: number; total_price: number }) => (
                <div key={item.product_name} className="flex items-center gap-3">
                  <div className="relative h-12 w-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                    {item.product_image && (
                      <Image src={item.product_image} alt={item.product_name} fill className="object-cover" sizes="48px" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{item.product_name}</p>
                    <p className="text-xs text-gray-400">SKU: {item.product_sku}</p>
                  </div>
                  <div className="text-right text-sm">
                    <p className="font-semibold">{formatPrice(item.total_price)}</p>
                    <p className="text-gray-400">{item.quantity} × {formatPrice(item.selling_price)}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 space-y-1 border-t pt-4 text-sm">
              <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>{formatPrice(order.subtotal)}</span></div>
              {order.discount_amount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-{formatPrice(order.discount_amount)}</span></div>}
              <div className="flex justify-between text-gray-600"><span>Shipping</span><span>{order.shipping_charge > 0 ? formatPrice(order.shipping_charge) : "FREE"}</span></div>
              <div className="flex justify-between font-bold text-base"><span>Total</span><span>{formatPrice(order.total_amount)}</span></div>
            </div>
          </div>

          {/* Update status */}
          <OrderStatusUpdater orderId={order.id} currentStatus={order.status} hasTracking={!!order.tracking_number} trackingNumber={order.tracking_number} courierName={order.courier_name} />
        </div>

        <div className="space-y-4">
          {/* Customer */}
          <div className="rounded-2xl border border-gray-100 bg-white p-4">
            <h2 className="mb-3 font-semibold text-gray-900">Customer</h2>
            <p className="text-sm font-medium">{userProfile?.full_name ?? order.shipping_full_name}</p>
            <p className="text-sm text-gray-500">{order.shipping_phone}</p>
          </div>

          {/* Delivery */}
          <div className="rounded-2xl border border-gray-100 bg-white p-4">
            <h2 className="mb-3 font-semibold text-gray-900">Delivery Address</h2>
            <p className="text-sm text-gray-700">
              {order.shipping_full_name}<br />
              {order.shipping_address1}{order.shipping_address2 ? `, ${order.shipping_address2}` : ""}<br />
              {order.shipping_city}, {order.shipping_state} — {order.shipping_pincode}
            </p>
          </div>

          {/* Payment */}
          <div className="rounded-2xl border border-gray-100 bg-white p-4">
            <h2 className="mb-3 font-semibold text-gray-900">Payment</h2>
            <div className="text-sm space-y-1">
              <div className="flex justify-between"><span className="text-gray-500">Method</span><span className="font-medium">{order.payment_method === "cod" ? "Cash on Delivery" : "Online"}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Status</span><span className={`capitalize font-medium ${order.payment_status === "paid" ? "text-green-600" : "text-yellow-600"}`}>{order.payment_status}</span></div>
              {order.razorpay_payment_id && <p className="text-xs text-gray-400 truncate">{order.razorpay_payment_id}</p>}
            </div>
          </div>

          {/* Shipment (Shiprocket) */}
          {(order.tracking_number || order.shiprocket_order_id) && (
            <div className="rounded-2xl border border-gray-100 bg-white p-4">
              <h2 className="mb-3 font-semibold text-gray-900">Shipment</h2>
              <div className="text-sm space-y-1">
                {order.courier_name && (
                  <div className="flex justify-between"><span className="text-gray-500">Courier</span><span className="font-medium">{order.courier_name}</span></div>
                )}
                {order.tracking_number && (
                  <div className="flex justify-between gap-2">
                    <span className="text-gray-500">AWB</span>
                    {order.tracking_url ? (
                      <a href={order.tracking_url} target="_blank" rel="noopener noreferrer" className="font-medium text-brand-600 hover:underline truncate">{order.tracking_number}</a>
                    ) : (
                      <span className="font-medium">{order.tracking_number}</span>
                    )}
                  </div>
                )}
                {order.shiprocket_order_id && (
                  <div className="flex justify-between"><span className="text-gray-500">Shiprocket ID</span><span className="font-medium">{order.shiprocket_order_id}</span></div>
                )}
              </div>
            </div>
          )}

          {/* Timeline */}
          <div className="rounded-2xl border border-gray-100 bg-white p-4">
            <h2 className="mb-3 font-semibold text-gray-900">Timeline</h2>
            <div className="space-y-2">
              {(order.status_history ?? []).map((h: { id: string; status: string; created_at: string; note?: string }) => (
                <div key={h.id} className="flex gap-2 text-xs">
                  <span className={cn("rounded-full px-2 py-0.5 font-medium", ORDER_STATUS_COLORS[h.status as keyof typeof ORDER_STATUS_COLORS])}>
                    {ORDER_STATUS_LABELS[h.status as keyof typeof ORDER_STATUS_LABELS]}
                  </span>
                  <span className="text-gray-400">{formatDateTime(h.created_at)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
