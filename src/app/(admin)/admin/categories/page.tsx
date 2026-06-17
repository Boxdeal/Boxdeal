import type { Metadata } from "next";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { CategoriesManager } from "@/components/admin/CategoriesManager";

export const metadata: Metadata = { title: "Categories — Admin" };

export default async function AdminCategoriesPage() {
  const supabase = await getSupabaseServerClient();
  const { data: categories } = await supabase
    .from("categories")
    .select(`
      id, name, description, image_url, sort_order, is_active,
      subcategories(id, name, image_url, sort_order, is_active, category_id)
    `)
    .order("sort_order")
    .order("name");

  const initial = (categories ?? []).map((c: Record<string, unknown>) => ({
    id:            c.id as string,
    name:          c.name as string,
    description:   (c.description as string) ?? null,
    image_url:     (c.image_url as string) ?? null,
    sort_order:    (c.sort_order as number) ?? 0,
    is_active:     c.is_active as boolean,
    subcategories: ((c.subcategories as Array<{ id: string; name: string; image_url: string | null; sort_order: number; is_active: boolean; category_id: string }>) ?? [])
      .sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name)),
  }));

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
      <p className="text-sm text-gray-500">Manage categories and their subcategories.</p>
      <CategoriesManager initial={initial} />
    </div>
  );
}
