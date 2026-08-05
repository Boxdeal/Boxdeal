import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { ProductsTable } from "@/components/admin/ProductsTable";

export const metadata: Metadata = { title: "Products — Admin" };

type Filter = "all" | "low-stock" | "featured" | "deal-of-day";

interface Props {
  searchParams: Promise<{ filter?: string }>;
}

export default async function AdminProductsPage({ searchParams }: Props) {
  const { filter } = await searchParams;
  const active: Filter =
    filter === "low-stock" || filter === "featured" || filter === "deal-of-day"
      ? filter
      : "all";

  const supabase = await getSupabaseServerClient();
  const { data } = await supabase
    .from("products")
    .select(`
      id, name, sku, selling_price, mrp, stock_quantity, low_stock_threshold, is_active, is_featured, is_deal_of_day,
      category:categories!category_id(name),
      subcategory:subcategories!subcategory_id(name),
      brand:brands!brand_id(name),
      product_images(image_url, thumbnail_url, is_primary)
    `)
    .order("created_at", { ascending: false });

  const all = data ?? [];

  // Low-stock = active products at/under their threshold. PostgREST can't compare
  // two columns in a filter, so we narrow in JS.
  const isLowStock = (p: (typeof all)[number]) =>
    p.is_active && (p.stock_quantity ?? 0) <= (p.low_stock_threshold ?? 0);

  const counts = {
    all: all.length,
    "low-stock": all.filter(isLowStock).length,
    featured: all.filter((p) => p.is_featured).length,
    "deal-of-day": all.filter((p) => p.is_deal_of_day).length,
  } satisfies Record<Filter, number>;

  const products =
    active === "low-stock"  ? all.filter(isLowStock)
    : active === "featured"    ? all.filter((p) => p.is_featured)
    : active === "deal-of-day" ? all.filter((p) => p.is_deal_of_day)
    : all;

  const tabs: Array<{ key: Filter; label: string; href: string }> = [
    { key: "all",         label: "All",             href: "/admin/products" },
    { key: "low-stock",   label: "Low Stock",       href: "/admin/products?filter=low-stock" },
    { key: "featured",    label: "Featured",        href: "/admin/products?filter=featured" },
    { key: "deal-of-day", label: "Deal of the Day", href: "/admin/products?filter=deal-of-day" },
  ];

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          {active === "low-stock" && (
            <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700">
              Low stock ({products.length})
            </span>
          )}
          {active === "featured" && (
            <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700">
              Featured ({products.length})
            </span>
          )}
          {active === "deal-of-day" && (
            <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">
              Deal of the Day ({products.length})
            </span>
          )}
        </div>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-brand-600"
        >
          <Plus className="h-4 w-4" /> Add Product
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <Link
            key={t.key}
            href={t.href}
            className={`rounded-full px-4 py-1.5 text-sm font-medium ${active === t.key ? "bg-brand-500 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}
          >
            {t.label} ({counts[t.key]})
          </Link>
        ))}
      </div>

      {(active === "featured" || active === "deal-of-day") && (
        <p className="text-xs text-gray-500">
          {active === "featured"
            ? "The homepage shows the top 10 featured products (by units sold)."
            : "The homepage shows the 8 newest deal-of-the-day products."}{" "}
          <Link
            href={active === "featured" ? "/admin/featured" : "/admin/featured?tab=deal-of-day"}
            className="font-semibold text-brand-600 hover:underline"
          >
            Manage this section →
          </Link>
        </p>
      )}

      <ProductsTable products={products as never} />
    </div>
  );
}
