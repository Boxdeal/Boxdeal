import type { OrderStatus } from "@/types";

/**
 * Map Shiprocket's free-text shipment status to our internal order status.
 *
 * Uses the text label (current_status / shipment_status) rather than the numeric
 * current_status_id, since the IDs are inconsistent (e.g. both 18 and 20 report
 * "IN TRANSIT"). Order matters: negative/failure states are checked first so
 * their substrings aren't misread as success — e.g. "UNDELIVERED" contains
 * "delivered", and "RTO DELIVERED" must count as a return, not a delivery.
 *
 * Shared by the webhook and the admin "Sync from Shiprocket" action so a pushed
 * event and a pulled reconciliation can never disagree.
 */
export function mapShiprocketStatus(srStatus: string): OrderStatus | null {
  const s = srStatus.toLowerCase();
  if (s.includes("rto") || s.includes("return"))     return "returned";
  if (s.includes("cancel"))                          return "cancelled";
  if (s.includes("undelivered"))                     return null; // failed attempt — keep current state
  if (s.includes("out for delivery"))                return "out_for_delivery";
  if (s.includes("delivered"))                       return "delivered";
  if (s.includes("picked up") || s.includes("shipped") || s.includes("in transit")) return "shipped";
  return null;
}

/** Column to stamp with the transition time for each terminal-ish status. */
export const STATUS_TIMESTAMP_FIELD: Partial<Record<OrderStatus, string>> = {
  shipped:   "shipped_at",
  delivered: "delivered_at",
  cancelled: "cancelled_at",
};

/**
 * Statuses an order can't move backwards out of. Once an order is in one of
 * these, only the identical status is accepted again (a no-op).
 */
export const ENDED_STATUSES: OrderStatus[] = ["delivered", "cancelled", "returned"];
