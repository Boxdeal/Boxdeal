"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { formatPrice } from "@/lib/utils/format";
import { cn } from "@/lib/utils/helpers";

interface Box { length: number; breadth: number; height: number; actualKg: number; chargeableKg: number }

/**
 * Shipping money for one order: what checkout quoted, the parcel that ships
 * (editable before packing), what Shiprocket charged, and the gap.
 */
export function ShippingPanel({
  orderId,
  migrated,
  customerCharge,
  quoted,
  computed,
  resolved,
  override,
  parcelEditable,
  shipped,
  extra,
}: {
  orderId: string;
  /** False until database/shipping_quality.sql has been run. */
  migrated: boolean;
  customerCharge: number;
  quoted: { courier: string | null; rate: number | null; weightKg: number | null } | null;
  computed: Box;
  resolved: Box;
  override: { length: number | null; breadth: number | null; height: number | null; weightKg: number | null };
  parcelEditable: boolean;
  shipped: { courier: string | null; weightKg: number | null; cost: number | null } | null;
  extra: number;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [editingParcel, setEditingParcel] = useState(false);
  const [parcel, setParcel] = useState({
    length:  override.length?.toString()   ?? "",
    breadth: override.breadth?.toString()  ?? "",
    height:  override.height?.toString()   ?? "",
    weight:  override.weightKg?.toString() ?? "",
  });
  const [extraValue, setExtraValue] = useState(extra ? String(extra) : "");

  const hasOverride = override.length || override.weightKg;
  const totalCost = shipped?.cost != null ? shipped.cost + extra : null;
  const net = totalCost != null ? customerCharge - totalCost : null;

  async function patch(body: object, ok: string) {
    setLoading(true);
    const res = await fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok || json.error) { toast.error(json.error ?? "Couldn't save"); return false; }
    toast.success(ok);
    router.refresh();
    return true;
  }

  async function saveParcel(clear = false) {
    const body = clear
      ? { action: "set_parcel" }
      : {
          action: "set_parcel",
          length_cm: parcel.length, breadth_cm: parcel.breadth, height_cm: parcel.height,
          weight_kg: parcel.weight,
        };
    if (await patch(body, clear ? "Parcel override removed" : "Parcel saved")) setEditingParcel(false);
  }

  const row = "flex justify-between gap-3";
  const input = "w-full rounded-lg border border-gray-200 px-2 py-1.5 text-sm focus:border-brand-400 focus:outline-none";
  const boxText = (b: Box) => `${b.length}×${b.breadth}×${b.height} cm · ${b.chargeableKg} kg`;

  return (
    <div className="space-y-4 rounded-2xl border border-gray-100 bg-white p-5">
      <h2 className="font-semibold text-gray-900">Shipping Cost</h2>

      {!migrated && (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
          Run <code>database/shipping_quality.sql</code> in Supabase to start recording quotes and costs.
        </p>
      )}

      {/* Checkout */}
      <div className="space-y-1 text-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">At checkout</p>
        <div className={row}><span className="text-gray-500">Customer paid for delivery</span><span className="font-medium">{formatPrice(customerCharge)}</span></div>
        {quoted?.rate != null ? (
          <>
            <div className={row}><span className="text-gray-500">Quoted courier</span><span className="text-right font-medium">{quoted.courier ?? "—"}</span></div>
            <div className={row}><span className="text-gray-500">Shiprocket rate quoted</span><span className="font-medium">{formatPrice(quoted.rate)}{quoted.weightKg ? ` · ${quoted.weightKg} kg` : ""}</span></div>
          </>
        ) : (
          <p className="text-xs text-gray-400">No quote saved for this order (placed before quotes were recorded).</p>
        )}
      </div>

      {/* Parcel */}
      <div className="space-y-1 border-t pt-3 text-sm">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Parcel</p>
          {parcelEditable && migrated && !editingParcel && (
            <button onClick={() => setEditingParcel(true)} className="text-xs font-medium text-brand-600 hover:underline">
              {hasOverride ? "Change" : "Set real box / weight"}
            </button>
          )}
        </div>
        <div className={row}><span className="text-gray-500">Calculated from products</span><span className="font-medium">{boxText(computed)}</span></div>
        {hasOverride && (
          <div className={row}><span className="text-gray-500">Measured by admin</span><span className="font-medium text-brand-700">{boxText(resolved)}</span></div>
        )}

        {editingParcel && (
          <div className="mt-2 space-y-2 rounded-lg bg-gray-50 p-3">
            <p className="text-xs text-gray-500">
              Fill in what you measured on the packed box. Leave the size empty to keep the calculated box.
              Used for the Shiprocket order and courier choice when you mark it Packed.
            </p>
            <div className="grid grid-cols-4 gap-2">
              <input className={input} placeholder="L cm" inputMode="decimal" value={parcel.length} onChange={(e) => setParcel((p) => ({ ...p, length: e.target.value }))} />
              <input className={input} placeholder="B cm" inputMode="decimal" value={parcel.breadth} onChange={(e) => setParcel((p) => ({ ...p, breadth: e.target.value }))} />
              <input className={input} placeholder="H cm" inputMode="decimal" value={parcel.height} onChange={(e) => setParcel((p) => ({ ...p, height: e.target.value }))} />
              <input className={input} placeholder="kg" inputMode="decimal" value={parcel.weight} onChange={(e) => setParcel((p) => ({ ...p, weight: e.target.value }))} />
            </div>
            <div className="flex gap-2">
              <button onClick={() => saveParcel()} disabled={loading} className="rounded-lg bg-brand-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-600 disabled:opacity-60">Save</button>
              {hasOverride && (
                <button onClick={() => saveParcel(true)} disabled={loading} className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-600 hover:bg-white">Use calculated</button>
              )}
              <button onClick={() => setEditingParcel(false)} disabled={loading} className="px-2 text-xs text-gray-500">Cancel</button>
            </div>
          </div>
        )}
      </div>

      {/* Actual */}
      <div className="space-y-1 border-t pt-3 text-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Actual</p>
        {shipped ? (
          <>
            <div className={row}><span className="text-gray-500">Shipped with</span><span className="text-right font-medium">{shipped.courier ?? "—"}</span></div>
            <div className={row}><span className="text-gray-500">Weight sent to Shiprocket</span><span className="font-medium">{shipped.weightKg != null ? `${shipped.weightKg} kg` : "—"}</span></div>
            <div className={row}><span className="text-gray-500">Shiprocket cost</span><span className="font-medium">{shipped.cost != null ? formatPrice(shipped.cost) : "—"}</span></div>
          </>
        ) : (
          <p className="text-xs text-gray-400">Recorded when the AWB is generated.</p>
        )}

        {migrated && shipped && (
          <div className="flex items-center justify-between gap-3 pt-1">
            <span className="text-gray-500">Extra charged later <span className="text-xs text-gray-400">(weight discrepancy etc.)</span></span>
            <div className="flex w-36 gap-1">
              <input className={input} inputMode="decimal" placeholder="0" value={extraValue} onChange={(e) => setExtraValue(e.target.value)} />
              <button
                onClick={() => patch({ action: "set_shipping_extra", amount: Number(extraValue || 0) }, "Saved")}
                disabled={loading}
                className="rounded-lg border border-gray-200 px-2 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
              >
                Save
              </button>
            </div>
          </div>
        )}

        {net != null && (
          <div className={cn(row, "mt-2 rounded-lg px-3 py-2 font-semibold", net >= 0 ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700")}>
            <span>{net >= 0 ? "Delivery covered" : "BoxDeal paid extra"}</span>
            <span>{net >= 0 ? `+${formatPrice(net)}` : `−${formatPrice(-net)}`}</span>
          </div>
        )}
      </div>
    </div>
  );
}
