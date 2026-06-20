import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  CheckCircle, ChevronLeft, MapPin, CreditCard,
  ShoppingBag, BadgeCheck, Package, Truck, MapPinned, PartyPopper, X,
} from "lucide-react";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { ORDER_STATUS_LABELS } from "@/constants";
import { formatPrice, formatDate, formatDateTime } from "@/lib/utils/format";
import { cn } from "@/lib/utils/helpers";
import type { Order, OrderItem, OrderStatusHistory } from "@/types";

export const metadata: Metadata = { title: "Order Details" };

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/login?redirect=/orders/${id}`);

  const { data: order } = await supabase
    .from("orders")
    .select("*, items:order_items(*), status_history:order_status_history(*)")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!order) notFound();

  const typedOrder = order as Order & { items: OrderItem[]; status_history: OrderStatusHistory[] };
  const items = typedOrder.items ?? [];
  const history = typedOrder.status_history ?? [];

  // Build a map of status → timestamp from history for the journey stepper
  const historyMap = new Map<string, string>(
    history.map((h) => [h.status, h.created_at])
  );

  const isCancelled = typedOrder.status === "cancelled" || typedOrder.status === "returned";

  const JOURNEY: { status: string; label: string; icon: React.ElementType }[] = [
    { status: "placed",           label: "Order Placed",      icon: ShoppingBag   },
    { status: "confirmed",        label: "Confirmed",         icon: BadgeCheck    },
    { status: "packed",           label: "Packed",            icon: Package       },
    { status: "shipped",          label: "Shipped",           icon: Truck         },
    { status: "out_for_delivery", label: "Out for Delivery",  icon: MapPinned     },
    { status: "delivered",        label: "Delivered",         icon: PartyPopper   },
  ];

  const STEP_ORDER = JOURNEY.map((s) => s.status);
  const currentIdx = STEP_ORDER.indexOf(typedOrder.status);

  function stepState(stepStatus: string): "done" | "current" | "pending" {
    if (isCancelled) return historyMap.has(stepStatus) ? "done" : "pending";
    const stepIdx = STEP_ORDER.indexOf(stepStatus);
    if (stepIdx < currentIdx) return "done";
    if (stepIdx === currentIdx) return "current";
    return "pending";
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 space-y-5">
      {/* Back link */}
      <Link
        href="/orders"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
      >
        <ChevronLeft className="h-4 w-4" />
        My Orders
      </Link>

      {/* Order header */}
      <div className="rounded-2xl border border-gray-100 bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="font-mono font-bold text-gray-900 text-lg">{typedOrder.order_number}</p>
            <p className="text-sm text-gray-400 mt-0.5">Placed on {formatDate(typedOrder.placed_at)}</p>
          </div>
          <span className="rounded-full bg-brand-50 px-3 py-1 text-sm font-semibold text-brand-700">
            {ORDER_STATUS_LABELS[typedOrder.status as keyof typeof ORDER_STATUS_LABELS]}
          </span>
        </div>
      </div>

      {/* Journey stepper */}
      <div className="rounded-2xl border border-gray-100 bg-white p-5">
        <h2 className="mb-5 font-semibold text-gray-900">Order Journey</h2>

        {isCancelled && (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-50 border border-red-100 px-4 py-3">
            <X className="h-4 w-4 text-red-500 flex-shrink-0" />
            <p className="text-sm font-medium text-red-700">
              This order was {typedOrder.status}.
              {historyMap.get(typedOrder.status) && (
                <span className="ml-1 font-normal text-red-500">
                  {formatDateTime(historyMap.get(typedOrder.status)!)}
                </span>
              )}
            </p>
          </div>
        )}

        <div className="relative">
          {JOURNEY.map((step, idx) => {
            const state = stepState(step.status);
            const ts = historyMap.get(step.status);
            const Icon = step.icon;
            const isLast = idx === JOURNEY.length - 1;

            return (
              <div key={step.status} className="flex gap-4">
                {/* Left: circle + connecting line */}
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      "flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border-2 transition-all",
                      state === "done"
                        ? "border-brand-500 bg-brand-500 text-white"
                        : state === "current"
                        ? "border-brand-500 bg-brand-50 text-brand-600"
                        : "border-gray-200 bg-white text-gray-300"
                    )}
                  >
                    {state === "done" ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <Icon className="h-4 w-4" />
                    )}
                  </div>
                  {!isLast && (
                    <div
                      className={cn(
                        "mt-1 w-0.5 flex-1 min-h-[2rem]",
                        state === "done" ? "bg-brand-400" : "bg-gray-200"
                      )}
                    />
                  )}
                </div>

                {/* Right: label + timestamp */}
                <div className={cn("pb-6 pt-1.5", isLast && "pb-0")}>
                  <p
                    className={cn(
                      "text-sm font-semibold leading-none",
                      state === "pending" ? "text-gray-400" : "text-gray-900"
                    )}
                  >
                    {step.label}
                    {state === "current" && (
                      <span className="ml-2 inline-block rounded-full bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-700 align-middle">
                        Current
                      </span>
                    )}
                  </p>
                  {ts && (
                    <p className="mt-1 text-xs text-gray-400">{formatDateTime(ts)}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Items */}
      <div className="rounded-2xl border border-gray-100 bg-white p-5 space-y-4">
        <h2 className="font-semibold text-gray-900">Items</h2>
        <div className="divide-y divide-gray-100">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
              <div className="relative h-14 w-14 flex-shrink-0 rounded-xl bg-gray-100 overflow-hidden">
                {item.product_image && (
                  <Image
                    src={item.product_image}
                    alt={item.product_name}
                    fill
                    className="object-cover"
                    sizes="56px"
                  />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{item.product_name}</p>
                <p className="text-xs text-gray-400">Qty: {item.quantity} · {formatPrice(item.selling_price)} each</p>
              </div>
              <p className="text-sm font-semibold text-gray-900 flex-shrink-0">
                {formatPrice(item.total_price ?? item.selling_price * item.quantity)}
              </p>
            </div>
          ))}
        </div>

        {/* Pricing summary */}
        <div className="space-y-1.5 border-t border-gray-100 pt-4 text-sm">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal</span>
            <span>{formatPrice(typedOrder.subtotal)}</span>
          </div>
          {typedOrder.discount_amount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Discount{typedOrder.coupon_code ? ` (${typedOrder.coupon_code})` : ""}</span>
              <span>-{formatPrice(typedOrder.discount_amount)}</span>
            </div>
          )}
          <div className="flex justify-between text-gray-600">
            <span>Shipping</span>
            <span>{typedOrder.shipping_charge > 0 ? formatPrice(typedOrder.shipping_charge) : "FREE"}</span>
          </div>
          <div className="flex justify-between font-bold text-base pt-1 border-t border-gray-100">
            <span>Total</span>
            <span>{formatPrice(typedOrder.total_amount)}</span>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Delivery address */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5">
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="h-4 w-4 text-gray-400" />
            <h2 className="font-semibold text-gray-900">Delivery Address</h2>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed">
            <span className="font-medium">{typedOrder.shipping_full_name}</span><br />
            {typedOrder.shipping_phone}<br />
            {typedOrder.shipping_address1}
            {typedOrder.shipping_address2 ? `, ${typedOrder.shipping_address2}` : ""}<br />
            {typedOrder.shipping_city}, {typedOrder.shipping_state} — {typedOrder.shipping_pincode}
          </p>
        </div>

        {/* Payment */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5">
          <div className="flex items-center gap-2 mb-3">
            <CreditCard className="h-4 w-4 text-gray-400" />
            <h2 className="font-semibold text-gray-900">Payment</h2>
          </div>
          <div className="text-sm space-y-1.5">
            <div className="flex justify-between">
              <span className="text-gray-500">Method</span>
              <span className="capitalize font-medium">{typedOrder.payment_method}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Status</span>
              <span
                className={cn(
                  "font-medium capitalize",
                  typedOrder.payment_status === "paid" ? "text-green-600" : "text-yellow-600"
                )}
              >
                {typedOrder.payment_status}
              </span>
            </div>
            {typedOrder.razorpay_payment_id && (
              <p className="text-xs text-gray-400 truncate pt-1">{typedOrder.razorpay_payment_id}</p>
            )}
          </div>
        </div>
      </div>

      {/* Tracking (shown when available) */}
      {typedOrder.tracking_number && (
        <div className="rounded-2xl border border-gray-100 bg-white p-5">
          <h2 className="font-semibold text-gray-900 mb-3">Tracking</h2>
          <div className="text-sm space-y-1">
            {typedOrder.courier_name && (
              <div className="flex justify-between">
                <span className="text-gray-500">Courier</span>
                <span className="font-medium">{typedOrder.courier_name}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-500">Tracking No.</span>
              {typedOrder.tracking_url ? (
                <a
                  href={typedOrder.tracking_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-brand-600 hover:underline"
                >
                  {typedOrder.tracking_number}
                </a>
              ) : (
                <span className="font-medium">{typedOrder.tracking_number}</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
