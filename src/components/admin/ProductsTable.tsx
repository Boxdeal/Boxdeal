"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Edit, Trash2, Search } from "lucide-react";
import { toast } from "sonner";
import { formatPrice } from "@/lib/utils/format";
import { cn } from "@/lib/utils/helpers";

interface ProductRow {
  id: string;
  name: string;
  sku: string;
  selling_price: number;
  stock_quantity: number;
  is_active: boolean;
  is_featured: boolean;
  is_deal_of_day: boolean;
  category: { name: string } | null;
  subcategory: { name: string } | null;
  brand: { name: string } | null;
  product_images: Array<{ image_url: string; thumbnail_url: string | null; is_primary: boolean }>;
}

export function ProductsTable({ products }: { products: ProductRow[] }) {
  const [rows, setRows] = useState<ProductRow[]>(products);
  const [query, setQuery] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    const terms = q.split(/\s+/);
    return rows.filter((p) => {
      const haystack = [
        p.name,
        p.sku,
        p.category?.name,
        p.subcategory?.name,
        p.brand?.name,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      // every word must match somewhere → highly filtered
      return terms.every((t) => haystack.includes(t));
    });
  }, [rows, query]);

  async function handleDelete(p: ProductRow) {
    if (!confirm(`Delete "${p.name}" permanently?`)) return;
    setDeletingId(p.id);
    const res = await fetch(`/api/admin/products/${p.id}`, { method: "DELETE" });
    const json = await res.json();
    setDeletingId(null);
    if (json.error) {
      toast.error(json.error);
      return;
    }
    setRows((prev) => prev.filter((row) => row.id !== p.id));
    toast.success("Product deleted");
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, SKU, category, subcategory or brand…"
          className="w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 py-2.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
        />
      </div>

      <p className="text-xs text-gray-400">
        {filtered.length} of {rows.length} product{rows.length !== 1 ? "s" : ""}
      </p>

      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Product</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">SKU</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Price</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Stock</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Status</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Placement</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-gray-400">
                  No products found
                </td>
              </tr>
            )}
            {filtered.map((p) => {
              const imgs = p.product_images ?? [];
              const img = imgs.find((i) => i.is_primary) ?? imgs[0];
              const stock = p.stock_quantity;
              const lowStock = stock <= 5 && stock > 0;
              return (
                <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                        {img && <Image src={img.thumbnail_url || img.image_url} alt="" fill sizes="40px" className="object-cover" />}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 line-clamp-1">{p.name}</p>
                        <p className="text-xs text-gray-400">
                          {p.category?.name}{p.subcategory?.name ? ` › ${p.subcategory.name}` : ""}{p.brand?.name ? ` · ${p.brand.name}` : ""}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{p.sku}</td>
                  <td className="px-4 py-3 font-semibold">{formatPrice(p.selling_price)}</td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      "rounded-full px-2 py-0.5 text-xs font-semibold",
                      stock <= 0 ? "bg-red-100 text-red-700" : lowStock ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"
                    )}>
                      {stock <= 0 ? "Out of stock" : `${stock} in stock`}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn("rounded-full px-2 py-0.5 text-xs font-semibold", p.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500")}>
                      {p.is_active ? "Active" : "Hidden"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {p.is_featured && (
                        <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-semibold text-purple-700">
                          Featured
                        </span>
                      )}
                      {p.is_deal_of_day && (
                        <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-semibold text-orange-700">
                          Deal of Day
                        </span>
                      )}
                      {!p.is_featured && !p.is_deal_of_day && (
                        <span className="text-xs text-gray-300">—</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/admin/products/${p.id}`} className="flex items-center gap-1 rounded-lg px-2 py-1 text-brand-600 hover:bg-brand-50">
                        <Edit className="h-4 w-4" /> Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(p)}
                        disabled={deletingId === p.id}
                        className="flex items-center gap-1 rounded-lg px-2 py-1 text-red-600 hover:bg-red-50 disabled:opacity-50"
                      >
                        <Trash2 className="h-4 w-4" /> {deletingId === p.id ? "…" : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
