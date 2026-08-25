"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

/**
 * Manual AWB / courier entry, plus a pull-based reconcile with Shiprocket.
 *
 * Available at ANY order status on purpose: Shiprocket can fail to auto-assign a
 * courier, the courier can be reassigned from the Shiprocket panel (new AWB),
 * or the admin can simply have typed the wrong number — all of which need to be
 * fixable after the order has already moved past "shipped".
 */
export function TrackingEditor({
  orderId,
  trackingNumber,
  courierName,
  hasShiprocketOrder,
}: {
  orderId: string;
  trackingNumber: string | null;
  courierName: string | null;
  hasShiprocketOrder: boolean;
}) {
  const [awb, setAwb]         = useState(trackingNumber ?? "");
  const [courier, setCourier] = useState(courierName ?? "");
  const [loading, setLoading] = useState(false);
  const [open, setOpen]       = useState(!trackingNumber);
  const router = useRouter();

  const dirty = awb.trim() !== (trackingNumber ?? "") || courier.trim() !== (courierName ?? "");

  async function save() {
    if (!awb.trim() && trackingNumber && !confirm("Clear the tracking number for this order?")) return;
    setLoading(true);
    const res = await fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action:          "set_tracking",
        tracking_number: awb.trim(),
        courier_name:    courier.trim(),
      }),
    });
    const { error } = await res.json();
    setLoading(false);
    if (error) { toast.error(error); return; }
    toast.success(awb.trim() ? "Tracking updated" : "Tracking cleared");
    router.refresh();
  }

  async function sync() {
    setLoading(true);
    const res = await fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "sync_shiprocket" }),
    });
    const { error, changed, changes, refunded, message } = await res.json();
    setLoading(false);
    if (error) { toast.error(error); return; }
    if (!changed) { toast.info(message ?? "Already up to date."); return; }
    toast.success(`Synced from Shiprocket: ${(changes ?? []).join(", ")}`);
    if (refunded) toast.success("Refund initiated to the customer's original payment method.");
    router.refresh();
  }

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-semibold text-gray-900">Tracking / AWB</h2>
        <div className="flex gap-2">
          {hasShiprocketOrder && (
            <button
              onClick={sync}
              disabled={loading}
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60"
            >
              {loading ? "Working…" : "Sync from Shiprocket"}
            </button>
          )}
          {!open && (
            <button
              onClick={() => setOpen(true)}
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
            >
              Edit
            </button>
          )}
        </div>
      </div>

      {!open ? (
        <p className="text-sm text-gray-600">
          <span className="font-medium text-gray-900">{trackingNumber}</span>
          {courierName ? <span className="text-gray-400"> · {courierName}</span> : null}
        </p>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">AWB / Tracking number</label>
              <input
                value={awb}
                onChange={(e) => setAwb(e.target.value)}
                placeholder="e.g. 1234567890123"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Courier</label>
              <input
                value={courier}
                onChange={(e) => setCourier(e.target.value)}
                placeholder="e.g. Delhivery Surface"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none"
              />
            </div>
          </div>
          <p className="text-xs text-gray-400">
            Saving overwrites whatever Shiprocket assigned. Leave the AWB empty to clear tracking.
          </p>
          <div className="flex gap-3">
            <button
              onClick={save}
              disabled={loading || !dirty}
              className="rounded-xl bg-brand-500 px-4 py-2 text-sm font-bold text-white hover:bg-brand-600 disabled:opacity-60"
            >
              {loading ? "Saving…" : "Save tracking"}
            </button>
            {trackingNumber && (
              <button
                onClick={() => { setAwb(trackingNumber ?? ""); setCourier(courierName ?? ""); setOpen(false); }}
                disabled={loading}
                className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-60"
              >
                Cancel
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
