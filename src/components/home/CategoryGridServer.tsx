import { CategoryGrid } from "./CategoryGrid";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function CategoryGridServer() {
  const supabase = await getSupabaseServerClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("id, name, slug, image_url, sort_order")
    .eq("is_active", true)
    .order("sort_order");

  if (!categories || categories.length === 0) return null;

  return <CategoryGrid categories={categories as never} />;
}
