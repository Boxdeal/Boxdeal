"use client";

import { useState } from "react";
import { Plus, Trash2, Loader2, Pencil, Ticket } from "lucide-react";
import { toast } from "sonner";
import { formatPrice } from "@/lib/utils/format";

export interface Coupon {
  id: string;
  code: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  min_order_amount: number;
  max_discount: number | null;
  usage_limit: number | null;
  used_count: number;
  expires_at: string | null;
  is_active: boolean;
  eligibility: "all" | "first_order";
}

type FormState = {
  code: string;
  discount_type: "percentage" | "fixed";
  discount_value: string;
  min_order_amount: string;
  max_discount: string;
  usage_limit: string;
  expires_at: string;
  is_active: boolean;
  eligibility: "all" | "first_order";
};

const emptyForm: FormState = {
  code: "",
  discount_type: "percentage",
  discount_value: "",
  min_order_amount: "0",
  max_discount: "",
  usage_limit: "",
  expires_at: "",
  is_active: true,
  eligibility: "all",
};

function toForm(c: Coupon): FormState {
  return {
    code: c.code,
    discount_type: c.discount_type,
    discount_value: String(c.discount_value),
    min_order_amount: String(c.min_order_amount),
    max_discount: c.max_discount != null ? String(c.max_discount) : "",
    usage_limit: c.usage_limit != null ? String(c.usage_limit) : "",
    expires_at: c.expires_at ? c.expires_at.slice(0, 10) : "",
    is_active: c.is_active,
    eligibility: c.eligibility,
  };
}

const inputCls =
  "w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100";
const labelCls = "mb-1 block text-xs font-medium text-gray-600";

export function CouponsManager({ initial }: { initial: Coupon[] }) {
  const [coupons, setCoupons] = useState<Coupon[]>(initial);
  const [form, setForm] = useState<FormState>({ ...emptyForm });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  function openCreate() {
    setEditingId(null);
    setForm({ ...emptyForm });
    setShowForm(true);
  }
  function openEdit(c: Coupon) {
    setEditingId(c.id);
    setForm(toForm(c));
    setShowForm(true);
  }
  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setForm({ ...emptyForm });
  }

  async function save() {
    if (!form.code.trim()) { toast.error("Coupon code is required"); return; }
    if (!form.discount_value || Number(form.discount_value) <= 0) { toast.error("Enter a valid discount value"); return; }
    setSaving(true);
    const url = editingId ? `/api/admin/coupons/${editingId}` : "/api/admin/coupons";
    const res = await fetch(url, {
      method: editingId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const json = await res.json();
    setSaving(false);
    if (json.error) { toast.error(json.error); return; }

    if (editingId) {
      setCoupons((prev) => prev.map((c) => (c.id === editingId ? json.data : c)));
      toast.success("Coupon updated");
    } else {
      setCoupons((prev) => [json.data, ...prev]);
      toast.success("Coupon created");
    }
    closeForm();
  }

  async function remove(c: Coupon) {
    if (!confirm(`Delete coupon "${c.code}"?`)) return;
    setBusy(c.id);
    const res = await fetch(`/api/admin/coupons/${c.id}`, { method: "DELETE" });
    const json = await res.json();
    setBusy(null);
    if (json.error) { toast.error(json.error); return; }
    setCoupons((prev) => prev.filter((x) => x.id !== c.id));
    toast.success("Coupon deleted");
  }

  return (
    <div className="space-y-5">
      {!showForm ? (
        <button onClick={openCreate} className="flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-bold text-white hover:bg-brand-600">
          <Plus className="h-4 w-4" /> Create Coupon
        </button>
      ) : (
        <div className="rounded-2xl border border-gray-100 bg-white p-5 space-y-4 max-w-2xl">
          <h3 className="font-bold text-gray-900">{editingId ? "Edit Coupon" : "New Coupon"}</h3>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls}>Coupon Code *</label>
              <input className={`${inputCls} uppercase`} value={form.code} onChange={(e) => set("code", e.target.value.toUpperCase())} placeholder="WELCOME100" />
            </div>
            <div>
              <label className={labelCls}>Who can use it?</label>
              <select className={inputCls} value={form.eligibility} onChange={(e) => set("eligibility", e.target.value as FormState["eligibility"])}>
                <option value="all">Everyone</option>
                <option value="first_order">First-time customers only</option>
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className={labelCls}>Discount Type</label>
              <select className={inputCls} value={form.discount_type} onChange={(e) => set("discount_type", e.target.value as FormState["discount_type"])}>
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed (₹)</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Value *</label>
              <input type="number" min="0" className={inputCls} value={form.discount_value} onChange={(e) => set("discount_value", e.target.value)} placeholder={form.discount_type === "percentage" ? "10" : "100"} />
            </div>
            <div>
              <label className={labelCls}>Max Discount (₹)</label>
              <input type="number" min="0" className={inputCls} value={form.max_discount} onChange={(e) => set("max_discount", e.target.value)} placeholder="Cap (optional)" disabled={form.discount_type === "fixed"} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className={labelCls}>Min Order (₹)</label>
              <input type="number" min="0" className={inputCls} value={form.min_order_amount} onChange={(e) => set("min_order_amount", e.target.value)} placeholder="0" />
            </div>
            <div>
              <label className={labelCls}>Usage Limit</label>
              <input type="number" min="0" className={inputCls} value={form.usage_limit} onChange={(e) => set("usage_limit", e.target.value)} placeholder="Unlimited" />
            </div>
            <div>
              <label className={labelCls}>Expires On</label>
              <input type="date" className={inputCls} value={form.expires_at} onChange={(e) => set("expires_at", e.target.value)} />
            </div>
          </div>

          <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={form.is_active} onChange={(e) => set("is_active", e.target.checked)} className="rounded text-brand-500" />
            Active
          </label>

          <div className="flex gap-2">
            <button onClick={save} disabled={saving} className="flex items-center gap-2 rounded-lg bg-brand-500 px-5 py-2 text-sm font-bold text-white hover:bg-brand-600 disabled:opacity-60">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />} {editingId ? "Save Changes" : "Create"}
            </button>
            <button onClick={closeForm} className="rounded-lg border border-gray-200 px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
          </div>
        </div>
      )}

      {coupons.length === 0 && <p className="text-sm text-gray-400">No coupons yet.</p>}

      {/* Coupon list */}
      <div className="grid gap-3 md:grid-cols-2">
        {coupons.map((c) => {
          const expired = c.expires_at ? new Date(c.expires_at) < new Date() : false;
          return (
            <div key={c.id} className="rounded-2xl border border-gray-100 bg-white p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Ticket className="h-5 w-5 text-brand-500" />
                  <span className="font-mono text-lg font-bold tracking-wide text-gray-900">{c.code}</span>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(c)} className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-brand-600" title="Edit">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button onClick={() => remove(c)} disabled={busy === c.id} className="rounded-lg p-1.5 text-gray-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-50" title="Delete">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <p className="mt-1 text-sm font-semibold text-green-700">
                {c.discount_type === "percentage" ? `${c.discount_value}% off` : `${formatPrice(c.discount_value)} off`}
                {c.max_discount ? ` (up to ${formatPrice(c.max_discount)})` : ""}
              </p>

              <div className="mt-2 flex flex-wrap gap-1.5 text-[11px]">
                <span className={`rounded-full px-2 py-0.5 font-medium ${c.eligibility === "first_order" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}`}>
                  {c.eligibility === "first_order" ? "First-time only" : "Everyone"}
                </span>
                <span className={`rounded-full px-2 py-0.5 font-medium ${c.is_active && !expired ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                  {expired ? "Expired" : c.is_active ? "Active" : "Inactive"}
                </span>
                {c.min_order_amount > 0 && (
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-gray-600">Min {formatPrice(c.min_order_amount)}</span>
                )}
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-gray-600">
                  Used {c.used_count}{c.usage_limit != null ? `/${c.usage_limit}` : ""}
                </span>
                {c.expires_at && (
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-gray-600">
                    Till {new Date(c.expires_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
