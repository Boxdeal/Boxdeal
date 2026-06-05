"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ORDER_STATUS_LABELS } from "@/constants";
import type { OrderStatus } from "@/types";
import { toast } from "sonner";

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  placed:   "confirmed",
  confirmed: "packed",
  packed:    "shipped",
  shipped:   "out_for_delivery",
  out_for_delivery: "delivered",
};

export function OrderStatusUpdater({
  orderId,
  currentStatus,
}: {
  orderId: string;
  currentStatus: OrderStatus;
}) {
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState("");
  const [trackingNum, setTrackingNum] = useState("");
  const router = useRouter();

  const next = NEXT_STATUS[currentStatus];

  async function update() {
    setLoading(true);
    const res = await fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status:          next,
        note:            note || undefined,
        tracking_number: trackingNum || undefined,
      }),
    });
    const { error } = await res.json();
    setLoading(false);
    if (error) { toast.error(error); return; }
    toast.success(`Order marked as ${ORDER_STATUS_LABELS[next!]}`);
    router.refresh();
  }

  async function cancelOrder() {
    if (!confirm("Cancel this order?")) return;
    setLoading(true);
    const res = await fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "cancelled" }),
    });
    const { error } = await res.json();
    setLoading(false);
    if (error) { toast.error(error); return; }
    toast.success("Order cancelled");
    router.refresh();
  }

  if (!next && currentStatus !== "placed" && currentStatus !== "confirmed") return null;

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 space-y-4">
      <h2 className="font-semibold text-gray-900">Update Status</h2>
      {next === "shipped" && (
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Tracking Number</label>
          <input
            value={trackingNum}
            onChange={(e) => setTrackingNum(e.target.value)}
            placeholder="AWB / Tracking number"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none"
          />
        </div>
      )}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Note (optional)</label>
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="e.g. Packed, dispatched via Bluedart"
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none"
        />
      </div>
      <div className="flex gap-3">
        {next && (
          <button
            onClick={update}
            disabled={loading}
            className="flex-1 rounded-xl bg-brand-500 py-2.5 text-sm font-bold text-white hover:bg-brand-600 disabled:opacity-60"
          >
            {loading ? "Updating…" : `Mark as ${ORDER_STATUS_LABELS[next]}`}
          </button>
        )}
        {["placed", "confirmed"].includes(currentStatus) && (
          <button
            onClick={cancelOrder}
            disabled={loading}
            className="rounded-xl border border-red-200 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-60"
          >
            Cancel Order
          </button>
        )}
      </div>
    </div>
  );
}
