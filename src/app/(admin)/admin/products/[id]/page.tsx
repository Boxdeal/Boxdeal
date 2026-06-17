import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { ProductForm, type ProductInitial } from "@/components/admin/ProductForm";

export const metadata: Metadata = { title: "Edit Product — Admin" };

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await getSupabaseServerClient();

  const [{ data: product }, { data: categories }, { data: subcategories }, { data: brands }] = await Promise.all([
    supabase
      .from("products")
      .select(`
        id, name, sku, description, short_description, category_id, subcategory_id, brand_id,
        mrp, selling_price, stock_quantity, low_stock_threshold, weight_grams,
        is_active, is_featured, is_deal_of_day, meta_title, meta_description,
        product_images(image_url, thumbnail_url, is_primary, sort_order),
        product_specifications(spec_group, spec_name, spec_value, sort_order)
      `)
      .eq("id", id)
      .single(),
    supabase.from("categories").select("id, name").order("name"),
    supabase.from("subcategories").select("id, name, category_id").order("name"),
    supabase.from("brands").select("id, name").order("name"),
  ]);

  if (!product) notFound();

  const images = ((product.product_images as Array<{ image_url: string; thumbnail_url: string | null; is_primary: boolean; sort_order: number }>) ?? [])
    .sort((a, b) => (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0) || a.sort_order - b.sort_order)
    .map((img) => ({ image_url: img.image_url, thumbnail_url: img.thumbnail_url }));

  const specs = ((product.product_specifications as Array<{ spec_group: string; spec_name: string; spec_value: string; sort_order: number }>) ?? [])
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((s) => ({ spec_group: s.spec_group, spec_name: s.spec_name, spec_value: s.spec_value }));

  const initial: ProductInitial = {
    id:                  product.id,
    name:                product.name,
    sku:                 product.sku,
    description:         product.description,
    short_description:   product.short_description,
    category_id:         product.category_id,
    subcategory_id:      product.subcategory_id,
    brand_id:            product.brand_id,
    mrp:                 product.mrp,
    selling_price:       product.selling_price,
    stock_quantity:      product.stock_quantity,
    low_stock_threshold: product.low_stock_threshold,
    weight_grams:        product.weight_grams,
    is_active:           product.is_active,
    is_featured:         product.is_featured,
    is_deal_of_day:      product.is_deal_of_day,
    meta_title:          product.meta_title,
    meta_description:    product.meta_description,
    images,
    specs,
  };

  return (
    <div className="p-6 space-y-4">
      <Link href="/admin/products" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900">
        <ArrowLeft className="h-4 w-4" /> Back to products
      </Link>
      <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
      <ProductForm
        product={initial}
        categories={categories ?? []}
        subcategories={subcategories ?? []}
        brands={brands ?? []}
      />
    </div>
  );
}
