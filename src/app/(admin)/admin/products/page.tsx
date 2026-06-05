import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Plus, Edit } from "lucide-react";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/utils/format";
import { cn } from "@/lib/utils/helpers";

export const metadata: Metadata = { title: "Products — Admin" };

export default async function AdminProductsPage() {
  const supabase = await getSupabaseServerClient();
  const { data: products } = await supabase
    .from("products")
    .select(`
      id, name, sku, selling_price, mrp, stock_quantity, is_active, is_featured,
      category:categories!category_id(name),
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

      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Product</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">SKU</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Price</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Stock</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {(products ?? []).map((p: Record<string, unknown>) => {
              const imgs = (p.product_images as Array<{ image_url: string; thumbnail_url: string; is_primary: boolean }>) ?? [];
              const img = imgs.find((i) => i.is_primary) ?? imgs[0];
              const stock = p.stock_quantity as number;
              const lowStock = stock <= 5 && stock > 0;
              return (
                <tr key={p.id as string} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                        {img && <Image src={img.thumbnail_url || img.image_url} alt="" fill sizes="40px" className="object-cover" />}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 line-clamp-1">{p.name as string}</p>
                        <p className="text-xs text-gray-400">{(p.category as { name: string })?.name} · {(p.brand as { name: string })?.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{p.sku as string}</td>
                  <td className="px-4 py-3 font-semibold">{formatPrice(p.selling_price as number)}</td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      "rounded-full px-2 py-0.5 text-xs font-semibold",
                      stock <= 0 ? "bg-red-100 text-red-700" : lowStock ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"
                    )}>
                      {stock <= 0 ? "Out of stock" : `${stock} in stock`}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn("rounded-full px-2 py-0.5 text-xs font-semibold", (p.is_active as boolean) ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500")}>
                      {(p.is_active as boolean) ? "Active" : "Hidden"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/products/${p.id as string}`} className="flex items-center gap-1 text-brand-600 hover:text-brand-700">
                      <Edit className="h-4 w-4" /> Edit
                    </Link>
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
