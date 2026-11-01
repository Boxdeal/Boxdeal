"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil } from "lucide-react";
import { toast } from "sonner";
import { INDIA_STATES } from "@/constants";

export interface OrderAddress {
  full_name: string;
  phone: string;
  address1: string;
  address2: string | null;
  city: string;
  state: string;
  pincode: string;
}

/**
 * The order's delivery address, editable until the parcel leaves. Changing
 * the pincode after the order is on Shiprocket re-ships it — the server asks
 * for that first (409 needs_reship) and the admin confirms here.
 */
export function AddressEditor({
  orderId,
  address,
  editable,
  onShiprocket,
}: {
  orderId: string;
  address: OrderAddress;
  editable: boolean;
  onShiprocket: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ ...address, address2: address.address2 ?? "" });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function save(reship = false) {
    setLoading(true);
    const res = await fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "update_address", address: form, reship }),
    });
    const json = await res.json().catch(() => ({}));
    setLoading(false);

    if (json.needs_reship) {
      if (confirm(`${json.error}\n\nContinue?`)) return save(true);
      return;
    }
    if (!res.ok || json.error) {
      toast.error(json.error ?? "Couldn't update the address");
      return;
    }
    toast.success(json.reshipped ? "Address changed — old shipment cancelled" : "Address updated");
    if (json.shiprocket_error) {
      toast.warning(`New shipment not created yet: ${json.shiprocket_error}. Use "Retry Shiprocket" below.`);
    }
    setEditing(false);
    router.refresh();
  }

  const input = "w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none";

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-semibold text-gray-900">Delivery Address</h2>
        {editable && !editing && (
          <button
            onClick={() => setEditing(true)}
            className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:underline"
          >
            <Pencil className="h-3.5 w-3.5" /> Edit
          </button>
        )}
      </div>

      {!editing ? (
        <p className="text-sm text-gray-700">
          {address.full_name}<br />
          {address.address1}{address.address2 ? `, ${address.address2}` : ""}<br />
          {address.city}, {address.state} — {address.pincode}<br />
          <span className="text-gray-500">{address.phone}</span>
        </p>
      ) : (
        <div className="space-y-2">
          <input className={input} value={form.full_name} onChange={(e) => set("full_name", e.target.value)} placeholder="Full name" />
          <input className={input} value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="10-digit mobile" inputMode="numeric" />
          <input className={input} value={form.address1} onChange={(e) => set("address1", e.target.value)} placeholder="House no., street, area" />
          <input className={input} value={form.address2} onChange={(e) => set("address2", e.target.value)} placeholder="Landmark (optional)" />
          <div className="grid grid-cols-2 gap-2">
            <input className={input} value={form.city} onChange={(e) => set("city", e.target.value)} placeholder="City" />
            <input className={input} value={form.pincode} onChange={(e) => set("pincode", e.target.value)} placeholder="Pincode" inputMode="numeric" maxLength={6} />
          </div>
          <select className={input} value={form.state} onChange={(e) => set("state", e.target.value)}>
            {!INDIA_STATES.includes(form.state) && <option value={form.state}>{form.state || "Select state"}</option>}
            {INDIA_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <p className="text-xs text-gray-400">
            {onShiprocket
              ? "Also updated on Shiprocket. A new pincode cancels the current shipment and creates a new one."
              : "The customer's delivery charge stays as it is."}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => save()}
              disabled={loading}
              className="flex-1 rounded-lg bg-brand-500 py-2 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-60"
            >
              {loading ? "Saving…" : "Save"}
            </button>
            <button
              onClick={() => { setEditing(false); setForm({ ...address, address2: address.address2 ?? "" }); }}
              disabled={loading}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
