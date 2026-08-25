import type { SupabaseClient } from "@supabase/supabase-js";
import type { OrderStatus } from "@/types";
import { refundRazorpayPayment } from "@/lib/razorpay/index";
import { cancelShipmentAwb, cancelShiprocketOrder } from "@/lib/shiprocket/index";

/**
 * Shared post-cancellation / post-return settlement used by BOTH the admin API
 * and the Shiprocket webhook, so an order cancelled from the Shiprocket panel is
 * settled exactly like one cancelled from the web panel (stock back + refund).
 */

// Statuses at which an order's stock has already been decremented (online at
// payment verify, COD at creation). Cancelling from any of these must give the
// stock back; cancelling a still-"placed" (unpaid online) order must not.
export const STOCK_TAKEN_STATUSES: OrderStatus[] = [
  "confirmed", "packed", "shipped", "out_for_delivery", "delivered",
];

/** The order fields the settlement helpers need. */
export interface SettleableOrder {
  id: string;
  status: string | null;
  payment_status: string | null;
  payment_method: string | null;
  razorpay_payment_id: string | null;
  total_amount: number;
  tracking_number?: string | null;
  shiprocket_order_id?: string | null;
}

/**
 * Return an order's items to stock. Best-effort & safe to call once per
 * cancellation: only call it when the order was in a stock-taken status.
 */
export async function restoreOrderStock(admin: SupabaseClient, id: string): Promise<void> {
  const { data: items } = await admin
    .from("order_items")
    .select("product_id, quantity")
    .eq("order_id", id);
  if (!items?.length) return;

  const results = await Promise.allSettled(
    items.map((it) =>
      admin.rpc("restore_stock", { p_product_id: it.product_id, p_quantity: it.quantity })
    )
  );
  results.forEach((r, i) => {
    if (r.status === "rejected") {
      console.error(`Stock restore failed for ${items[i].product_id} on order ${id}:`, r.reason);
    }
  });
}

/**
 * Refund a cancelled/returned order's payment back to the customer, if it was
 * paid online via Razorpay. Best-effort & safe to call for any order: COD or
 * unpaid orders are a no-op. A refund failure is returned (not thrown) so the
 * caller can still cancel the order and surface the error for a manual refund.
 */
export async function refundOrderPayment(
  id: string,
  order: Pick<SettleableOrder, "payment_status" | "payment_method" | "razorpay_payment_id" | "total_amount">
): Promise<{ refunded: boolean; error: string | null }> {
  const wasPaidOnline =
    order.payment_status === "paid" &&
    order.payment_method === "razorpay" &&
    !!order.razorpay_payment_id;

  if (!wasPaidOnline) return { refunded: false, error: null };

  const refundAmount = order.total_amount;
  if (refundAmount <= 0) return { refunded: false, error: null };

  try {
    await refundRazorpayPayment(
      order.razorpay_payment_id as string,
      Math.round(refundAmount * 100)
    );
    return { refunded: true, error: null };
  } catch (e) {
    console.error(`Razorpay refund failed for order ${id}:`, e);
    return {
      refunded: false,
      error: e instanceof Error ? e.message : "Refund failed",
    };
  }
}

/**
 * Cancel the order on Shiprocket's side too. Without this a web/app cancellation
 * only flips OUR status — the courier still picks up and delivers the parcel.
 *
 * Order matters: once an AWB is assigned the shipment must be cancelled first,
 * otherwise Shiprocket refuses to cancel the order. Both steps are best-effort;
 * the caller still cancels locally and surfaces the error.
 */
export async function cancelOnShiprocket(
  order: Pick<SettleableOrder, "tracking_number" | "shiprocket_order_id">
): Promise<{ cancelled: boolean; error: string | null }> {
  if (!order.shiprocket_order_id && !order.tracking_number) {
    return { cancelled: false, error: null }; // never pushed to Shiprocket
  }
  try {
    if (order.tracking_number) await cancelShipmentAwb(order.tracking_number);
    if (order.shiprocket_order_id) await cancelShiprocketOrder(order.shiprocket_order_id);
    return { cancelled: true, error: null };
  } catch (e) {
    console.error("Shiprocket cancellation failed:", e);
    return {
      cancelled: false,
      error: e instanceof Error ? e.message : "Shiprocket cancellation failed",
    };
  }
}

/**
 * Everything that must happen when an order ends as cancelled or returned,
 * regardless of where the cancellation originated (admin panel, customer, or a
 * Shiprocket webhook): give the stock back and refund an online payment.
 *
 * Idempotent by caller contract — only call it on the transition INTO
 * cancelled/returned, never for an order already in that state.
 */
export async function settleEndedOrder(
  admin: SupabaseClient,
  order: SettleableOrder
): Promise<{ refunded: boolean; refundError: string | null }> {
  const { refunded, error: refundError } = await refundOrderPayment(order.id, order);
  if (STOCK_TAKEN_STATUSES.includes(order.status as OrderStatus)) {
    await restoreOrderStock(admin, order.id);
  }
  return { refunded, refundError };
}
