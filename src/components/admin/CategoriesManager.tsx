"use client";

import { useState } from "react";
import { Plus, Trash2, Loader2, X, Upload } from "lucide-react";
import { toast } from "sonner";

interface Subcategory {
  id: string;
  name: string;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
  category_id: string;
}
interface Category {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
  subcategories: Subcategory[];
}

const inputCls =
  "w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100";

// ── Reusable image picker (uploads to the public bucket, returns a URL) ──
function ImagePicker({ folder, value, onChange }: { folder: string; value: string; onChange: (url: string) => void }) {
  const [uploading, setUploading] = useState(false);

  async function handleFile(file?: File | null) {
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", folder);
    const res = await fetch("/api/admin/upload-image", { method: "POST", body: fd });
    const json = await res.json();
    setUploading(false);
    if (json.error) { toast.error(json.error); return; }
    onChange(json.data.url);
  }

  if (value) {
    return (
      <div className="relative h-20 w-20 overflow-hidden rounded-lg border border-gray-200">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={value} alt="" className="h-full w-full object-cover" />
        <button type="button" onClick={() => onChange("")} className="absolute right-1 top-1 rounded-full bg-black/50 p-0.5">
          <X className="h-3 w-3 text-white" />
        </button>
      </div>
    );
  }
  return (
    <label className="flex h-20 w-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-gray-300 text-gray-400 hover:border-brand-300 hover:text-brand-500">
      {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
      <span className="text-[10px]">Image</span>
      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
    </label>
  );
}

const emptyCat = { name: "", description: "", image_url: "", sort_order: "0", is_active: true };
const emptySub = { name: "", image_url: "", sort_order: "0", is_active: true };

export function CategoriesManager({ initial }: { initial: Category[] }) {
  const [categories, setCategories] = useState<Category[]>(initial);
  const [catForm, setCatForm] = useState({ ...emptyCat });
  const [showCatForm, setShowCatForm] = useState(false);
  const [savingCat, setSavingCat] = useState(false);

  const [openSubFor, setOpenSubFor] = useState<string | null>(null);
  const [subForm, setSubForm] = useState({ ...emptySub });
  const [busy, setBusy] = useState<string | null>(null);

  async function addCategory() {
    if (!catForm.name.trim()) { toast.error("Category name is required"); return; }
    setSavingCat(true);
    const res = await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(catForm),
    });
    const json = await res.json();
    setSavingCat(false);
    if (json.error) { toast.error(json.error); return; }
    setCategories((prev) => [...prev, { ...json.data, subcategories: [] }]);
    setCatForm({ ...emptyCat });
    setShowCatForm(false);
    toast.success("Category added");
  }

  async function deleteCategory(cat: Category) {
    if (!confirm(`Delete category "${cat.name}"?`)) return;
    setBusy(cat.id);
    const res = await fetch(`/api/admin/categories/${cat.id}`, { method: "DELETE" });
    const json = await res.json();
    setBusy(null);
    if (json.error) { toast.error(json.error); return; }
    setCategories((prev) => prev.filter((c) => c.id !== cat.id));
    toast.success("Category deleted");
  }

  async function addSubcategory(catId: string) {
    if (!subForm.name.trim()) { toast.error("Subcategory name is required"); return; }
    setBusy(`sub-${catId}`);
    const res = await fetch("/api/admin/subcategories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...subForm, category_id: catId }),
    });
    const json = await res.json();
    setBusy(null);
    if (json.error) { toast.error(json.error); return; }
    setCategories((prev) =>
      prev.map((c) => (c.id === catId ? { ...c, subcategories: [...c.subcategories, json.data] } : c))
    );
    setSubForm({ ...emptySub });
    setOpenSubFor(null);
    toast.success("Subcategory added");
  }

  async function deleteSubcategory(catId: string, sub: Subcategory) {
    setBusy(sub.id);
    const res = await fetch(`/api/admin/subcategories/${sub.id}`, { method: "DELETE" });
    const json = await res.json();
    setBusy(null);
    if (json.error) { toast.error(json.error); return; }
    setCategories((prev) =>
      prev.map((c) => (c.id === catId ? { ...c, subcategories: c.subcategories.filter((s) => s.id !== sub.id) } : c))
    );
    toast.success("Subcategory deleted");
  }

  return (
    <div className="space-y-5">
      {/* Add category */}
      {!showCatForm ? (
        <button
          onClick={() => setShowCatForm(true)}
          className="flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-bold text-white hover:bg-brand-600"
        >
          <Plus className="h-4 w-4" /> Add Category
        </button>
      ) : (
        <div className="rounded-2xl border border-gray-100 bg-white p-5 space-y-4 max-w-2xl">
          <h3 className="font-bold text-gray-900">New Category</h3>
          <div className="flex gap-4">
            <ImagePicker folder="categories" value={catForm.image_url} onChange={(url) => setCatForm((p) => ({ ...p, image_url: url }))} />
            <div className="flex-1 space-y-3">
              <input className={inputCls} placeholder="Category name *" value={catForm.name} onChange={(e) => setCatForm((p) => ({ ...p, name: e.target.value }))} />
              <input className={inputCls} placeholder="Description (optional)" value={catForm.description} onChange={(e) => setCatForm((p) => ({ ...p, description: e.target.value }))} />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              Sort order
              <input type="number" className="w-20 rounded-lg border border-gray-200 px-2 py-1.5 text-sm" value={catForm.sort_order} onChange={(e) => setCatForm((p) => ({ ...p, sort_order: e.target.value }))} />
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" checked={catForm.is_active} onChange={(e) => setCatForm((p) => ({ ...p, is_active: e.target.checked }))} className="rounded text-brand-500" />
              Active
            </label>
          </div>
          <div className="flex gap-2">
            <button onClick={addCategory} disabled={savingCat} className="flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-bold text-white hover:bg-brand-600 disabled:opacity-60">
              {savingCat && <Loader2 className="h-4 w-4 animate-spin" />} Save
            </button>
            <button onClick={() => { setShowCatForm(false); setCatForm({ ...emptyCat }); }} className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
          </div>
        </div>
      )}

      {categories.length === 0 && <p className="text-sm text-gray-400">No categories yet.</p>}

      {/* Category cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {categories.map((cat) => (
          <div key={cat.id} className="rounded-2xl border border-gray-100 bg-white p-5 space-y-3">
            <div className="flex items-start gap-3">
              <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                {cat.image_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={cat.image_url} alt="" className="h-full w-full object-cover" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-gray-900">{cat.name}</h3>
                  {!cat.is_active && <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-500">Hidden</span>}
                </div>
                {cat.description && <p className="text-xs text-gray-500 line-clamp-1">{cat.description}</p>}
                <p className="text-[11px] text-gray-400">Sort: {cat.sort_order}</p>
              </div>
              <button onClick={() => deleteCategory(cat)} disabled={busy === cat.id} className="flex items-center gap-1 rounded-lg px-2 py-1 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            {/* Subcategory chips */}
            <div className="flex flex-wrap gap-2">
              {cat.subcategories.length === 0 && <span className="text-xs text-gray-400">No subcategories</span>}
              {cat.subcategories.map((sub) => (
                <span key={sub.id} className="flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-700">
                  {sub.image_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={sub.image_url} alt="" className="h-4 w-4 rounded-full object-cover" />
                  )}
                  {sub.name}
                  {!sub.is_active && <span className="text-[9px] text-gray-400">(hidden)</span>}
                  <button onClick={() => deleteSubcategory(cat.id, sub)} disabled={busy === sub.id} className="text-gray-400 hover:text-red-500 disabled:opacity-50" title="Remove">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>

            {/* Add subcategory */}
            {openSubFor === cat.id ? (
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-3 space-y-3">
                <div className="flex gap-3">
                  <ImagePicker folder="subcategories" value={subForm.image_url} onChange={(url) => setSubForm((p) => ({ ...p, image_url: url }))} />
                  <div className="flex-1 space-y-2">
                    <input className={inputCls} placeholder="Subcategory name *" value={subForm.name} onChange={(e) => setSubForm((p) => ({ ...p, name: e.target.value }))} />
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-1.5 text-xs text-gray-600">
                        Sort
                        <input type="number" className="w-16 rounded border border-gray-200 px-2 py-1 text-xs" value={subForm.sort_order} onChange={(e) => setSubForm((p) => ({ ...p, sort_order: e.target.value }))} />
                      </label>
                      <label className="flex cursor-pointer items-center gap-1.5 text-xs text-gray-600">
                        <input type="checkbox" checked={subForm.is_active} onChange={(e) => setSubForm((p) => ({ ...p, is_active: e.target.checked }))} className="rounded text-brand-500" />
                        Active
                      </label>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => addSubcategory(cat.id)} disabled={busy === `sub-${cat.id}`} className="flex items-center gap-1 rounded-lg bg-brand-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-brand-600 disabled:opacity-60">
                    {busy === `sub-${cat.id}` && <Loader2 className="h-3 w-3 animate-spin" />} Add
                  </button>
                  <button onClick={() => { setOpenSubFor(null); setSubForm({ ...emptySub }); }} className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50">Cancel</button>
                </div>
              </div>
            ) : (
              <button onClick={() => { setOpenSubFor(cat.id); setSubForm({ ...emptySub }); }} className="flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700">
                <Plus className="h-4 w-4" /> Add subcategory
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
