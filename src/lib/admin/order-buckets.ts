import type { SupabaseClient } from "@supabase/supabase-js";
import type { OrderStatus, PaymentStatus } from "@/types";

// One place that decides which bucket an order falls into, so the dashboard,
// the drill-downs and the Failed/Cancelled tabs can never disagree.
//
//   revenue   — confirmed → delivered. This is the ESTIMATE: COD is counted the
//               moment the order is confirmed, prepaid the moment it is paid.
//   failed    — the checkout never completed: payment_status "failed" (customer
//               dismissed Razorpay / bad signature) or still sitting at "placed"
//               (prepaid order created but never paid for). Never revenue.
//   cancelled — a real cancellation of a live order, by the customer or by us.
//   returned  — the goods came back: an RTO (courier never delivered it) or a
//               customer return after delivery. Its value is OUT of revenue.

/** Statuses whose money counts toward the revenue estimate. */
export const REVENUE_STATUSES: OrderStatus[] = [
  "confirmed", "packed", "shipped", "out_for_delivery", "delivered",
];

/**
 * What belongs in the working Orders list. Failed checkouts, never-confirmed
 * "placed" orders, cancellations and RTO/returns are all excluded — each has its
 * own tab — so this is exactly the set that makes up the revenue estimate.
 */
export const LIVE_ORDER_STATUSES: OrderStatus[] = REVENUE_STATUSES;

export type OrderBucket = "revenue" | "failed" | "cancelled" | "returned";

/** The fields any bucket decision needs — works on a full Order or a slim row. */
export interface BucketableOrder {
  status: OrderStatus | string;
  payment_status: PaymentStatus | string;
}

export function orderBucket(o: BucketableOrder): OrderBucket {
  // A dismissed / failed Razorpay payment is stored as cancelled + failed. That
  // is a failed checkout, not a cancellation, so it must be checked first.
  if (o.payment_status === "failed") return "failed";
  if (o.status === "placed")         return "failed";
  if (o.status === "cancelled")      return "cancelled";
  if (o.status === "returned")       return "returned";
  return REVENUE_STATUSES.includes(o.status as OrderStatus) ? "revenue" : "failed";
}

export const countsAsRevenue = (o: BucketableOrder) => orderBucket(o) === "revenue";

/** Why a failed order failed — shown in the Failed Orders tab. */
export function failureReason(o: BucketableOrder): string {
  if (o.payment_status === "failed") return "Payment failed / abandoned";
  if (o.status === "placed")         return "Awaiting payment — never confirmed";
  return "Not confirmed";
}

// ── PostgREST filters ───────────────────────────────────────────────────────
// Mirrors of the rules above, for queries that fetch one bucket directly.
// Chain them straight onto the builder:
//   failed:    .or(FAILED_OR_FILTER)
//   cancelled: .eq("status", "cancelled").neq("payment_status", "failed")
//   revenue:   .in("status", REVENUE_STATUSES).neq("payment_status", "failed")

/** `.or(...)` argument matching every failed / never-confirmed order. */
export const FAILED_OR_FILTER = "payment_status.eq.failed,status.eq.placed";

// ── RTO vs customer return ──────────────────────────────────────────────────
// Both land on status "returned". Shiprocket's RTO statuses fire on a shipment
// that was never handed over, so `delivered_at` is the reliable separator: an
// RTO never has one, a genuine customer return always does.

export type ReturnKind = "rto" | "customer";

export const RETURN_KIND_LABELS: Record<ReturnKind, string> = {
  rto:      "RTO",
  customer: "Customer return",
};

export const RETURN_KIND_COLORS: Record<ReturnKind, string> = {
  rto:      "bg-orange-100 text-orange-700",
  customer: "bg-gray-100 text-gray-600",
};

export const RETURN_KIND_HINTS: Record<ReturnKind, string> = {
  rto:      "Never delivered — came back to origin",
  customer: "Delivered, then returned by the customer",
};

export function returnKind(o: { delivered_at?: string | null }): ReturnKind {
  return o.delivered_at ? "customer" : "rto";
}

// ── Who cancelled ───────────────────────────────────────────────────────────

export type CancelActor = "customer" | "boxdeal" | "system";

export const CANCEL_ACTOR_LABELS: Record<CancelActor, string> = {
  customer: "Customer",
  boxdeal:  "BoxDeal",
  system:   "System / Courier",
};

export const CANCEL_ACTOR_COLORS: Record<CancelActor, string> = {
  customer: "bg-amber-100 text-amber-700",
  boxdeal:  "bg-red-100 text-red-700",
  system:   "bg-gray-100 text-gray-600",
};

export interface CancelInfo {
  actor: CancelActor;
  note: string | null;
  at: string | null;
}

interface HistoryRow {
  order_id: string;
  updated_by: string | null;
  note: string | null;
  created_at: string;
}

/**
 * Work out who cancelled each order. There is no `cancelled_by` column, so the
 * answer comes from the "cancelled" row in order_status_history: written with
 * the buyer's id on a self-cancel, with the admin's id from the panel, and with
 * no id at all when Shiprocket's webhook cancels it.
 */
export async function getCancelInfo(
  admin: SupabaseClient,
  orders: Array<{ id: string; user_id: string; cancelled_at?: string | null }>
): Promise<Map<string, CancelInfo>> {
  const out = new Map<string, CancelInfo>();
  if (orders.length === 0) return out;

  const { data } = await admin
    .from("order_status_history")
    .select("order_id, updated_by, note, created_at")
    .eq("status", "cancelled")
    .in("order_id", orders.map((o) => o.id))
    .order("created_at", { ascending: false });

  // Newest first, so the first row seen for an order is the one that matters.
  const latest = new Map<string, HistoryRow>();
  for (const r of (data ?? []) as HistoryRow[]) {
    if (!latest.has(r.order_id)) latest.set(r.order_id, r);
  }

  for (const o of orders) {
    const h = latest.get(o.id);
    let actor: CancelActor;
    if (!h)                             actor = "system";      // no trail (e.g. payment flow)
    else if (h.updated_by === o.user_id) actor = "customer";
    else if (h.updated_by)               actor = "boxdeal";    // an admin did it
    else                                 actor = "system";     // webhook / courier
    out.set(o.id, { actor, note: h?.note ?? null, at: h?.created_at ?? o.cancelled_at ?? null });
  }

  return out;
}
