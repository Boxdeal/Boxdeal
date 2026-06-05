import Link from "next/link";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { CategoryDropdownItem } from "./CategoryDropdownItem";

type Sub = { id: string; name: string; slug: string; is_active: boolean; sort_order: number };
type Cat = { id: string; name: string; slug: string; subcategories: Sub[] | null };

export async function CategoryNav() {
  const supabase = await getSupabaseServerClient();

  const { data } = await supabase
    .from("categories")
    .select("id, name, slug, subcategories(id, name, slug, is_active, sort_order)")
    .eq("is_active", true)
    .order("sort_order")
    .limit(12);

  const categories = (data ?? []) as Cat[];

  return (
    <nav className="hidden border-t border-gray-100 bg-white lg:block">
      <div className="mx-auto flex max-w-7xl items-center justify-center px-4">

        <Link
          href="/products"
          className="flex-shrink-0 whitespace-nowrap px-3 py-2.5 text-sm font-semibold text-gray-800 transition-colors hover:text-brand-600"
        >
          All Products
        </Link>

        {categories.map((cat) => {
          const subs = (cat.subcategories ?? [])
            .filter((s) => s.is_active)
            .sort((a, b) => a.sort_order - b.sort_order);

          return subs.length > 0 ? (
            <CategoryDropdownItem key={cat.id} name={cat.name} slug={cat.slug} subs={subs} />
          ) : (
            <Link
              key={cat.id}
              href={`/products?category=${cat.slug}`}
              className="flex-shrink-0 whitespace-nowrap px-3 py-2.5 text-sm text-gray-600 transition-colors hover:text-brand-600"
            >
              {cat.name}
            </Link>
          );
        })}

        <span className="mx-2 select-none text-gray-200">|</span>

        <Link
          href="/products?is_deal_of_day=true"
          className="flex-shrink-0 whitespace-nowrap px-3 py-2.5 text-sm font-bold text-red-600 transition-colors hover:text-red-700"
        >
          🔥 Deals
        </Link>
      </div>
    </nav>
  );
}
