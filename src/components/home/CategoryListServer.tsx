import { Suspense } from "react";
import { CategoryItemServer } from "./CategoryItemServer";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { ProductGridSkeleton } from "@/components/shared/LoadingSpinner";
import type { Category } from "@/types";

export async function CategoryListServer() {
  const supabase = await getSupabaseServerClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("id, name, slug, image_url, sort_order")
    .eq("is_active", true)
    .order("sort_order");

  if (!categories || categories.length === 0) return null;

  return (
    <>
      {(categories as Category[]).map((category, index) => (
        <Suspense key={category.id} fallback={<ProductGridSkeleton count={4} />}>
          <CategoryItemServer category={category} index={index} />
        </Suspense>
      ))}
    </>
  );
}
