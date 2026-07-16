"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Loader2, Upload, X, Trash2, Star, Plus } from "lucide-react";
import { toast } from "sonner";

interface Option { id: string; name: string }
interface SubOption extends Option { category_id: string }
interface ExistingImage { image_url: string; thumbnail_url: string | null }

export interface Spec { spec_group: string; spec_name: string; spec_value: string }

export interface ProductInitial {
  id: string;
  name: string;
  sku: string;
  description: string | null;
  short_description: string | null;
  category_id: string;
  subcategory_id: string | null;
  brand_id: string | null;
  mrp: number;
  selling_price: number;
  stock_quantity: number;
  low_stock_threshold: number;
  weight_grams: number;
  length_cm: number;
  breadth_cm: number;
  height_cm: number;
  is_active: boolean;
  is_featured: boolean;
  is_deal_of_day: boolean;
  meta_title: string | null;
  meta_description: string | null;
  images: ExistingImage[];
  specs: Spec[];
}

interface ProductFormProps {
  categories: Option[];
  subcategories: SubOption[];
  brands: Option[];
  product?: ProductInitial;
}

export function ProductForm({ categories, subcategories, brands, product }: ProductFormProps) {
  const router = useRouter();
  const isEdit = !!product;

  const [form, setForm] = useState({
    name:                product?.name ?? "",
    sku:                 product?.sku ?? "",
    description:         product?.description ?? "",
    short_description:   product?.short_description ?? "",
    category_id:         product?.category_id ?? "",
    subcategory_id:      product?.subcategory_id ?? "",
    brand_id:            product?.brand_id ?? "",
    mrp:                 product ? String(product.mrp) : "",
    selling_price:       product ? String(product.selling_price) : "",
    stock_quantity:      product ? String(product.stock_quantity) : "",
    low_stock_threshold: product ? String(product.low_stock_threshold) : "5",
    weight_grams:        product ? String(product.weight_grams) : "0",
    length_cm:           product ? String(product.length_cm ?? 0) : "0",
    breadth_cm:          product ? String(product.breadth_cm ?? 0) : "0",
    height_cm:           product ? String(product.height_cm ?? 0) : "0",
    is_active:           product?.is_active ?? true,
    is_featured:         product?.is_featured ?? false,
    is_deal_of_day:      product?.is_deal_of_day ?? false,
    meta_title:          product?.meta_title ?? "",
    meta_description:    product?.meta_description ?? "",
  });

  const [existingImages, setExistingImages] = useState<ExistingImage[]>(product?.images ?? []);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [specs, setSpecs] = useState<Spec[]>(product?.specs ?? []);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const newPreviews = useMemo(() => newFiles.map((f) => URL.createObjectURL(f)), [newFiles]);

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  const filteredSubs = subcategories.filter((s) => s.category_id === form.category_id);

  const mrpNum = Number(form.mrp) || 0;
  const sellNum = Number(form.selling_price) || 0;
  const discount = mrpNum > 0 && sellNum > 0 ? Math.round(((mrpNum - sellNum) / mrpNum) * 100) : 0;

  function addFiles(files: FileList | null) {
    if (!files) return;
    setNewFiles((prev) => [...prev, ...Array.from(files)]);
  }

  function addSpec() {
    setSpecs((prev) => [...prev, { spec_group: "General", spec_name: "", spec_value: "" }]);
  }
  function updateSpec(i: number, key: keyof Spec, value: string) {
    setSpecs((prev) => prev.map((s, j) => (j === i ? { ...s, [key]: value } : s)));
  }
  function removeSpec(i: number) {
    setSpecs((prev) => prev.filter((_, j) => j !== i));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.sku || !form.category_id || !form.mrp || !form.selling_price) {
      toast.error("Name, SKU, category, MRP and selling price are required");
      return;
    }
    if (sellNum > mrpNum) {
      toast.error("Selling price cannot be more than MRP");
      return;
    }
    if (existingImages.length === 0 && newFiles.length === 0) {
      toast.error("Please add at least one product image");
      return;
    }

    const cleanSpecs = specs
      .filter((s) => s.spec_name.trim() && s.spec_value.trim())
      .map((s) => ({
        spec_group: s.spec_group.trim() || "General",
        spec_name:  s.spec_name.trim(),
        spec_value: s.spec_value.trim(),
      }));

    setSaving(true);
    try {
      // 1. Create the product first (so uploads have a product_id) or reuse the id.
      let productId = product?.id;
      if (!productId) {
        const res = await fetch("/api/admin/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const json = await res.json();
        if (json.error) throw new Error(json.error);
        productId = json.data.id as string;
      }

      // 2. Upload any newly-selected image files.
      const uploaded: ExistingImage[] = [];
      for (const file of newFiles) {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("product_id", productId);
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        const json = await res.json();
        if (json.error) throw new Error(json.error);
        uploaded.push({ image_url: json.data.url, thumbnail_url: json.data.thumbnail_url });
      }

      // 3. Save fields (edit only) + the full image set + specs. First image = primary.
      const images = [...existingImages, ...uploaded];
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          isEdit ? { ...form, images, specs: cleanSpecs } : { images, specs: cleanSpecs }
        ),
      });
      const json = await res.json();
      if (json.error) throw new Error(json.error);

      toast.success(isEdit ? "Product updated" : "Product created");
      router.push("/admin/products");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!product || !confirm("Delete this product permanently?")) return;
    setDeleting(true);
    const res = await fetch(`/api/admin/products/${product.id}`, { method: "DELETE" });
    const json = await res.json();
    if (json.error) {
      toast.error(json.error);
      setDeleting(false);
      return;
    }
    toast.success("Product deleted");
    router.push("/admin/products");
    router.refresh();
  }

  const inputCls =
    "w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100";
  const labelCls = "mb-1 block text-sm font-medium text-gray-700";

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
      {/* Basic info */}
      <section className="rounded-2xl border border-gray-100 bg-white p-5 space-y-4">
        <h2 className="font-bold text-gray-900">Basic Info</h2>
        <div>
          <label className={labelCls}>Product Name *</label>
          <input className={inputCls} value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Samsung 45W Charger" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls}>SKU *</label>
            <input className={inputCls} value={form.sku} onChange={(e) => set("sku", e.target.value)} placeholder="Unique code e.g. SAM-45W-BLK" />
          </div>
          <div>
            <label className={labelCls}>Brand</label>
            <select className={inputCls} value={form.brand_id} onChange={(e) => set("brand_id", e.target.value)}>
              <option value="">No brand</option>
              {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls}>Category *</label>
            <select
              className={inputCls}
              value={form.category_id}
              onChange={(e) => { set("category_id", e.target.value); set("subcategory_id", ""); }}
            >
              <option value="">Select category</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Subcategory</label>
            <select
              className={inputCls}
              value={form.subcategory_id}
              onChange={(e) => set("subcategory_id", e.target.value)}
              disabled={!form.category_id || filteredSubs.length === 0}
            >
              <option value="">None</option>
              {filteredSubs.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className={labelCls}>Short Description</label>
          <input className={inputCls} value={form.short_description} onChange={(e) => set("short_description", e.target.value)} placeholder="One-line summary shown on cards" />
        </div>
        <div>
          <label className={labelCls}>Full Description</label>
          <textarea className={`${inputCls} min-h-[100px]`} value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Detailed product description" />
        </div>
      </section>

      {/* Pricing & stock */}
      <section className="rounded-2xl border border-gray-100 bg-white p-5 space-y-4">
        <h2 className="font-bold text-gray-900">Pricing & Stock</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className={labelCls}>MRP (₹) *</label>
            <input type="number" min="0" className={inputCls} value={form.mrp} onChange={(e) => set("mrp", e.target.value)} placeholder="3799" />
          </div>
          <div>
            <label className={labelCls}>Selling Price (₹) *</label>
            <input type="number" min="0" className={inputCls} value={form.selling_price} onChange={(e) => set("selling_price", e.target.value)} placeholder="1799" />
          </div>
          <div>
            <label className={labelCls}>Discount</label>
            <div className="rounded-lg bg-green-50 px-3 py-2.5 text-sm font-semibold text-green-700">{discount}% off</div>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className={labelCls}>Stock Quantity *</label>
            <input type="number" min="0" className={inputCls} value={form.stock_quantity} onChange={(e) => set("stock_quantity", e.target.value)} placeholder="50" />
          </div>
          <div>
            <label className={labelCls}>Low Stock Alert</label>
            <input type="number" min="0" className={inputCls} value={form.low_stock_threshold} onChange={(e) => set("low_stock_threshold", e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Weight (grams)</label>
            <input type="number" min="0" className={inputCls} value={form.weight_grams} onChange={(e) => set("weight_grams", e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Length (cm)</label>
            <input type="number" min="0" step="0.1" className={inputCls} value={form.length_cm} onChange={(e) => set("length_cm", e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Breadth (cm)</label>
            <input type="number" min="0" step="0.1" className={inputCls} value={form.breadth_cm} onChange={(e) => set("breadth_cm", e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Height (cm)</label>
            <input type="number" min="0" step="0.1" className={inputCls} value={form.height_cm} onChange={(e) => set("height_cm", e.target.value)} />
          </div>
        </div>
        <p className="text-xs text-gray-500">
          Dimensions set the parcel&apos;s volumetric weight (L×B×H ÷ 5000), used to calculate the
          courier&apos;s chargeable weight for delivery rates.
        </p>
      </section>

      {/* Images */}
      <section className="rounded-2xl border border-gray-100 bg-white p-5 space-y-4">
        <h2 className="font-bold text-gray-900">Images</h2>
        <p className="text-xs text-gray-500">First image is the primary (shown on cards). Click the star to make an image primary.</p>
        <div className="flex flex-wrap gap-3">
          {existingImages.map((img, i) => (
            <div key={img.image_url} className="relative h-24 w-24 overflow-hidden rounded-lg border border-gray-200">
              <Image src={img.thumbnail_url || img.image_url} alt="" fill sizes="96px" className="object-cover" />
              {i === 0 && <span className="absolute left-1 top-1 rounded bg-brand-500 px-1 text-[10px] font-bold text-white">Primary</span>}
              <div className="absolute inset-x-0 bottom-0 flex justify-between bg-black/40 px-1 py-0.5">
                {i !== 0 ? (
                  <button type="button" title="Make primary" onClick={() => setExistingImages((p) => [p[i], ...p.filter((_, j) => j !== i)])}>
                    <Star className="h-3.5 w-3.5 text-white" />
                  </button>
                ) : <span />}
                <button type="button" title="Remove" onClick={() => setExistingImages((p) => p.filter((_, j) => j !== i))}>
                  <X className="h-3.5 w-3.5 text-white" />
                </button>
              </div>
            </div>
          ))}
          {newFiles.map((file, i) => (
            <div key={`${file.name}-${i}`} className="relative h-24 w-24 overflow-hidden rounded-lg border border-dashed border-brand-300">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={newPreviews[i]} alt="" className="h-full w-full object-cover" />
              <button type="button" className="absolute right-1 top-1 rounded-full bg-black/50 p-0.5" onClick={() => setNewFiles((p) => p.filter((_, j) => j !== i))}>
                <X className="h-3 w-3 text-white" />
              </button>
            </div>
          ))}
          <label className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-gray-300 text-gray-400 hover:border-brand-300 hover:text-brand-500">
            <Upload className="h-5 w-5" />
            <span className="text-[11px]">Add</span>
            <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => addFiles(e.target.files)} />
          </label>
        </div>
      </section>

      {/* Specifications */}
      <section className="rounded-2xl border border-gray-100 bg-white p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-gray-900">Specifications</h2>
          <button type="button" onClick={addSpec} className="flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700">
            <Plus className="h-4 w-4" /> Add spec
          </button>
        </div>
        {specs.length === 0 && <p className="text-xs text-gray-400">No specifications added. e.g. Group: General, Name: Color, Value: Black</p>}
        {specs.map((s, i) => (
          <div key={i} className="grid items-center gap-2 sm:grid-cols-[1fr_1fr_1fr_auto]">
            <input className={inputCls} value={s.spec_group} onChange={(e) => updateSpec(i, "spec_group", e.target.value)} placeholder="Group (General)" />
            <input className={inputCls} value={s.spec_name} onChange={(e) => updateSpec(i, "spec_name", e.target.value)} placeholder="Name (Color)" />
            <input className={inputCls} value={s.spec_value} onChange={(e) => updateSpec(i, "spec_value", e.target.value)} placeholder="Value (Black)" />
            <button type="button" onClick={() => removeSpec(i)} className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500">
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </section>

      {/* Visibility */}
      <section className="rounded-2xl border border-gray-100 bg-white p-5 space-y-3">
        <h2 className="font-bold text-gray-900">Visibility</h2>
        <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" checked={form.is_active} onChange={(e) => set("is_active", e.target.checked)} className="rounded text-brand-500" />
          Active (visible in store)
        </label>
        <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" checked={form.is_featured} onChange={(e) => set("is_featured", e.target.checked)} className="rounded text-brand-500" />
          Featured product
        </label>
        <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" checked={form.is_deal_of_day} onChange={(e) => set("is_deal_of_day", e.target.checked)} className="rounded text-brand-500" />
          Deal of the day
        </label>
      </section>

      {/* SEO */}
      <section className="rounded-2xl border border-gray-100 bg-white p-5 space-y-4">
        <h2 className="font-bold text-gray-900">SEO <span className="text-xs font-normal text-gray-400">(optional)</span></h2>
        <div>
          <label className={labelCls}>Meta Title</label>
          <input className={inputCls} value={form.meta_title} onChange={(e) => set("meta_title", e.target.value)} placeholder="Defaults to product name if empty" />
        </div>
        <div>
          <label className={labelCls}>Meta Description</label>
          <textarea className={`${inputCls} min-h-[70px]`} value={form.meta_description} onChange={(e) => set("meta_description", e.target.value)} placeholder="Short description for search engines" />
        </div>
      </section>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving || deleting}
          className="flex items-center gap-2 rounded-xl bg-brand-500 px-6 py-3 text-sm font-bold text-white hover:bg-brand-600 disabled:opacity-60"
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          {saving ? "Saving…" : isEdit ? "Save Changes" : "Create Product"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/products")}
          className="rounded-xl border border-gray-200 px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        {isEdit && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting || saving}
            className="ml-auto flex items-center gap-1.5 rounded-xl border border-red-200 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-60"
          >
            <Trash2 className="h-4 w-4" /> {deleting ? "Deleting…" : "Delete"}
          </button>
        )}
      </div>
    </form>
  );
}
