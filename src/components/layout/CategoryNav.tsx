import Link from "next/link";
import { cache } from "react";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { CategoryDropdownItem } from "./CategoryDropdownItem";
import { CategoryNavMobile } from "./CategoryNavMobile";
import styles from "./CategoryNav.module.css";

type Sub = { id: string; name: string; slug: string; is_active: boolean; sort_order: number };
type Cat = { id: string; name: string; slug: string; subcategories: Sub[] | null };

const getCategories = cache(async () => {
  const queryStart = performance.now();
  const supabase = await getSupabaseServerClient();

  const { data } = await supabase
    .from("categories")
    .select("id, name, slug, subcategories(id, name, slug, is_active, sort_order)")
    .eq("is_active", true)
    .order("sort_order")
    .limit(12);

  const queryTime = performance.now() - queryStart;
  console.log(`[DB Performance] Categories query: ${queryTime.toFixed(0)}ms`);

  return (data ?? []) as Cat[];
});

export async function CategoryNav() {
  const categories = await getCategories();

  return (
    <>
      {/* Desktop Nav (900px+) */}
      <nav className={styles.nav}>
        <div className={styles.navContainer}>

          <Link
            href="/products"
            className={styles.allProductsLink}
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
                className={styles.categoryLink}
              >
                {cat.name}
              </Link>
            );
          })}

          <span className={styles.separator}>|</span>

          <Link
            href="/products?is_deal_of_day=true"
            className={styles.dealsLink}
          >
            🔥 Deals
          </Link>
        </div>
      </nav>

      {/* Mobile Nav (<900px) */}
      <CategoryNavMobile categories={categories} />
    </>
  );
}
