import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { ProductsTable } from "@/components/admin/ProductsTable";

export const metadata: Metadata = { title: "Products — Admin" };

interface Props {
  searchParams: Promise<{ filter?: string }>;
}

export default async function AdminProductsPage({ searchParams }: Props) {
  const { filter } = await searchParams;
  const lowStockOnly = filter === "low-stock";

  const supabase = await getSupabaseServerClient();
  const { data } = await supabase
    .from("products")
    .select(`
      id, name, sku, selling_price, mrp, stock_quantity, low_stock_threshold, is_active, is_featured,
      category:categories!category_id(name),
      subcategory:subcategories!subcategory_id(name),
      brand:brands!brand_id(name),
      product_images(image_url, thumbnail_url, is_primary)
    `)
    .order("created_at", { ascending: false });

  // Low-stock = active products at/under their threshold. PostgREST can't compare
  // two columns in a filter, so we narrow in JS.
  const products = lowStockOnly
    ? (data ?? []).filter(
        (p) => p.is_active && (p.stock_quantity ?? 0) <= (p.low_stock_threshold ?? 0)
      )
    : (data ?? []);

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          {lowStockOnly && (
            <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700">
              Low stock ({products.length})
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

      <div className="flex gap-2">
        <Link
          href="/admin/products"
          className={`rounded-full px-4 py-1.5 text-sm font-medium ${!lowStockOnly ? "bg-brand-500 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}
        >
          All
        </Link>
        <Link
          href="/admin/products?filter=low-stock"
          className={`rounded-full px-4 py-1.5 text-sm font-medium ${lowStockOnly ? "bg-brand-500 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}
        >
          Low Stock
        </Link>
      </div>

      <ProductsTable products={products as never} />
    </div>
  );
}
