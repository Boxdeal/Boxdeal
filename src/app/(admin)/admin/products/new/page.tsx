import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { ProductForm } from "@/components/admin/ProductForm";

export const metadata: Metadata = { title: "Add Product — Admin" };

export default async function NewProductPage() {
  const supabase = await getSupabaseServerClient();
  const [{ data: categories }, { data: subcategories }, { data: brands }] = await Promise.all([
    supabase.from("categories").select("id, name").order("name"),
    supabase.from("subcategories").select("id, name, category_id").order("name"),
    supabase.from("brands").select("id, name").order("name"),
  ]);

  return (
    <div className="p-6 space-y-4">
      <Link href="/admin/products" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900">
        <ArrowLeft className="h-4 w-4" /> Back to products
      </Link>
      <h1 className="text-2xl font-bold text-gray-900">Add Product</h1>
      <ProductForm
        categories={categories ?? []}
        subcategories={subcategories ?? []}
        brands={brands ?? []}
      />
    </div>
  );
}
