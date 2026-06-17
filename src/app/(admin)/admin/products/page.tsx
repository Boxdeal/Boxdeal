import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { ProductsTable } from "@/components/admin/ProductsTable";

export const metadata: Metadata = { title: "Products — Admin" };

export default async function AdminProductsPage() {
  const supabase = await getSupabaseServerClient();
  const { data: products } = await supabase
    .from("products")
    .select(`
      id, name, sku, selling_price, mrp, stock_quantity, is_active, is_featured,
      category:categories!category_id(name),
      subcategory:subcategories!subcategory_id(name),
      brand:brands!brand_id(name),
      product_images(image_url, thumbnail_url, is_primary)
    `)
    .order("created_at", { ascending: false });

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-brand-600"
        >
          <Plus className="h-4 w-4" /> Add Product
        </Link>
      </div>

      <ProductsTable products={(products ?? []) as never} />
    </div>
  );
}
