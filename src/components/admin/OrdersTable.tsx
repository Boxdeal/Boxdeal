import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils/helpers";
import { formatPrice, formatDateTime } from "@/lib/utils/format";
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, PAYMENT_STATUS_LABELS } from "@/constants";
import type { Order } from "@/types";

interface OrdersTableProps {
  orders: Order[];
}

export function OrdersTable({ orders }: OrdersTableProps) {
  const now = new Date();

  return (
    <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50">
            <th className="px-4 py-3 text-left font-semibold text-gray-600">Order</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-600">Customer</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-600">Amount</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-600">Payment</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-600">Status</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-600">Date</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {orders.length === 0 && (
            <tr>
              <td colSpan={7} className="px-4 py-10 text-center text-gray-400">
                No orders found
              </td>
            </tr>
          )}
          {orders.map((order) => {
            const isOverdue =
              order.status === "placed" &&
              new Date(order.pack_deadline) < now;

            return (
              <tr
                key={order.id}
                className={cn(
                  "border-b border-gray-50 transition-colors hover:bg-gray-50/50",
                  isOverdue && "bg-red-50/30"
                )}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {isOverdue && (
                      <AlertCircle className="h-4 w-4 flex-shrink-0 text-red-500" />
                    )}
                    <span className="font-mono font-semibold text-gray-800">
                      {order.order_number}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {order.shipping_full_name}
                </td>
                <td className="px-4 py-3 font-semibold text-gray-900">
                  {formatPrice(order.total_amount)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-col gap-0.5">
                    <span
                      className={cn(
                        "w-fit rounded-full px-2.5 py-0.5 text-xs font-semibold",
                        order.payment_method === "cod"
                          ? "bg-indigo-100 text-indigo-700"
                          : "bg-brand-100 text-brand-700"
                      )}
                    >
                      {order.payment_method === "cod" ? "COD" : "Prepaid"}
                    </span>
                    <span
                      className={cn(
                        "text-[11px] font-medium",
                        order.payment_status === "paid" ? "text-green-600" : "text-gray-400"
                      )}
                    >
                      {PAYMENT_STATUS_LABELS[order.payment_status] ?? order.payment_status}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-0.5 text-xs font-semibold",
                      ORDER_STATUS_COLORS[order.status]
                    )}
                  >
                    {ORDER_STATUS_LABELS[order.status]}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500">
                  {formatDateTime(order.placed_at)}
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="text-brand-600 hover:text-brand-700 font-medium"
                  >
                    View
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
