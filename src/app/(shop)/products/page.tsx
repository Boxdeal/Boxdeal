import type { Metadata } from "next";
import { Suspense } from "react";
import { unstable_cache } from "next/cache";
import { getSupabasePublicClient } from "@/lib/supabase/server";
import { ProductGrid } from "@/components/product/ProductGrid";
import { ProductFilters } from "@/components/product/ProductFilters";
import { ProductSort } from "@/components/product/ProductSort";
import { Pagination } from "@/components/shared/Pagination";
import { EmptyState } from "@/components/shared/EmptyState";
import { ShoppingBag, ChevronRight } from "lucide-react";
import { PRODUCTS_PER_PAGE } from "@/constants";
import type { Brand, Category, Subcategory } from "@/types";
import Link from "next/link";


export const revalidate = 3600;  // Cache for 1 hour

interface Props {
  searchParams: Promise<Record<string, string>>;
}

// Filter ke hisaab se dynamic title/description/canonical — har category ka
// apna indexable page banta hai (e.g. "Chargers — Buy Online | BoxDeal").
export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams;
  const filters = await getFilters();

  const category = params.category
    ? filters.categories.find((c) => c.slug === params.category)
    : null;
  const subcategory = params.subcategory
    ? filters.subcategories.find((s) => s.slug === params.subcategory)
    : null;
  const brand = params.brand
    ? filters.brands.find((b) => b.slug === params.brand)
    : null;

  const focus = subcategory?.name ?? category?.name ?? brand?.name;
  const title = focus ? `${focus} — Buy Online at Best Prices` : "All Products";
  const description = focus
    ? `Shop ${focus} at BoxDeal. Genuine products, unbeatable deals, secure payments, and fast delivery across India.`
    : "Browse all products at BoxDeal — electronics, mobile accessories and more at the best prices in India.";

  // Canonical: sirf ek clean filter param rakho; page/sort/search variants
  // ko canonical me include nahi karte taaki duplicate content na bane.
  let canonical = "/products";
  if (params.category) canonical = `/products?category=${params.category}`;
  else if (params.subcategory) canonical = `/products?subcategory=${params.subcategory}`;
  else if (params.brand) canonical = `/products?brand=${params.brand}`;

  // Search-within-listing ya paginated pages ko index se hataao (thin/duplicate).
  const noindex = Boolean(params.q) || Number(params.page ?? 1) > 1;

  return {
    title,
    description,
    alternates: { canonical },
    ...(noindex ? { robots: { index: false, follow: true } } : {}),
    openGraph: { title, description, url: canonical },
  };
}

interface Filters {
  categories: Category[];
  subcategories: Subcategory[];
  brands: Brand[];
}

// Catalog filter data (categories/subcategories/brands) changes rarely, so
// cache it once per hour and share it across every request instead of
// re-querying on each filter toggle. Uses the cookieless public client.
const getFilters = unstable_cache(
  async () => {
    const supabase = getSupabasePublicClient();
    const [{ data: categories }, { data: subcategories }, { data: brands }] =
      await Promise.all([
        supabase.from("categories").select("*").eq("is_active", true).order("sort_order"),
        supabase.from("subcategories").select("*").eq("is_active", true),
        supabase.from("brands").select("*").eq("is_active", true),
      ]);
    return {
      categories: (categories ?? []) as Category[],
      subcategories: (subcategories ?? []) as Subcategory[],
      brands: (brands ?? []) as Brand[],
    };
  },
  ["catalog-filters"],
  { revalidate: 3600, tags: ["catalog-filters"] }
);

async function getProducts(params: Record<string, string>, filters: Filters) {
  const supabase = getSupabasePublicClient();
  const page = Math.max(1, Number(params.page ?? 1));
  const from = (page - 1) * PRODUCTS_PER_PAGE;
  const to = from + PRODUCTS_PER_PAGE - 1;

  // Resolve slugs → IDs in-memory from the cached filters (no extra queries).
  const categoryId    = params.category    ? filters.categories.find((c) => c.slug === params.category)?.id : null;
  const subcategoryId = params.subcategory ? filters.subcategories.find((s) => s.slug === params.subcategory)?.id : null;
  const brandId       = params.brand       ? filters.brands.find((b) => b.slug === params.brand)?.id : null;

  let query = supabase
    .from("products")
    .select(
      `id, name, slug, short_description, mrp, selling_price, discount_percent,
       stock_quantity, rating, review_count, is_deal_of_day,
       category_id, subcategory_id,
       product_images(image_url, thumbnail_url, is_primary),
       category:categories!category_id(id, name, slug),
       subcategory:subcategories!subcategory_id(id, name, slug),
       brand:brands!brand_id(slug)`,
      { count: "exact" }
    )
    .eq("is_active", true);

  if (categoryId)    query = query.eq("category_id",    categoryId);
  if (subcategoryId) query = query.eq("subcategory_id", subcategoryId);
  if (brandId)       query = query.eq("brand_id",       brandId);
  if (params.min_price)   query = query.gte("selling_price",   Number(params.min_price));
  if (params.max_price)   query = query.lte("selling_price",   Number(params.max_price));
  if (params.rating)      query = query.gte("rating",          Number(params.rating));
  if (params.in_stock === "true")         query = query.gt("stock_quantity", 0);
  if (params.is_featured === "true")      query = query.eq("is_featured",     true);
  if (params.is_deal_of_day === "true")   query = query.eq("is_deal_of_day",  true);
  // Partial substring match (e.g. "son" → "sony"), served by the pg_trgm
  // GIN indexes from database/search_indexes.sql.
  if (params.q) {
    const safe = params.q.replace(/[%_,()]/g, " ").trim();
    if (safe) query = query.or(`name.ilike.%${safe}%,slug.ilike.%${safe}%,short_description.ilike.%${safe}%`);
  }

  const sortMap: Record<string, { column: string; ascending: boolean }> = {
    price_asc:  { column: "selling_price", ascending: true  },
    price_desc: { column: "selling_price", ascending: false },
    rating:     { column: "rating",        ascending: false },
    newest:     { column: "created_at",    ascending: false },
    popular:    { column: "sold_count",    ascending: false },
  };
  const sort = sortMap[params.sort ?? "popular"] ?? sortMap.popular;
  query = query.order(sort.column, { ascending: sort.ascending }).range(from, to);

  const { data, count } = await query;

  const products = (data ?? []).map((p: Record<string, unknown>) => {
    const imgs = (p.product_images as Array<{ image_url: string; thumbnail_url: string; is_primary: boolean }>) ?? [];
    const primary = imgs.find((i) => i.is_primary) ?? imgs[0];
    return {
      ...p,
      primary_image:   primary?.image_url   ?? null,
      thumbnail_image: primary?.thumbnail_url ?? null,
    };
  });

  return { products, total: count ?? 0 };
}

export default async function ProductsPage({ searchParams }: Props) {
  const params = await searchParams;

  const isCategoryView   = !!params.category && !params.subcategory;
  const isSubcategoryView = !!params.subcategory;

  // Filters are cached, so this resolves instantly after the first request.
  const filters = await getFilters();
  const { products, total } = await getProducts(params, filters);

  // Derive breadcrumb/grouping info from the cached filters — no extra queries.
  const categoryInfo = isCategoryView
    ? (() => {
        const cat = filters.categories.find((c) => c.slug === params.category);
        if (!cat) return null;
        return {
          id: cat.id,
          name: cat.name,
          subcategories: filters.subcategories.filter((s) => s.category_id === cat.id),
        };
      })()
    : null;

  const subcategoryInfo = isSubcategoryView
    ? (() => {
        const sub = filters.subcategories.find((s) => s.slug === params.subcategory);
        if (!sub) return null;
        const cat = filters.categories.find((c) => c.id === sub.category_id);
        return {
          id: sub.id,
          name: sub.name,
          slug: sub.slug,
          category: { name: cat?.name ?? "", slug: cat?.slug ?? "" },
        };
      })()
    : null;

  const page       = Math.max(1, Number(params.page ?? 1));
  const totalPages = Math.ceil(total / PRODUCTS_PER_PAGE);

  // Group products by subcategory when in category view
  type Product = typeof products[number] & {
    subcategory?: { id: string; name: string; slug: string } | null;
  };
  const grouped = isCategoryView
    ? products.reduce<Record<string, Product[]>>((acc, p) => {
        const sub = (p as Product).subcategory;
        const key = sub?.name ?? "Other";
        if (!acc[key]) acc[key] = [];
        acc[key].push(p as Product);
        return acc;
      }, {})
    : null;

  // Subcategory order for grouped view
  const subOrder = (categoryInfo?.subcategories ?? [])
    .filter((s) => s.is_active)
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((s) => s.name);

  const groupedKeys = grouped
    ? [...subOrder.filter((k) => grouped[k]), ...Object.keys(grouped).filter((k) => !subOrder.includes(k))]
    : [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">

      {/* Breadcrumb */}
      {(isCategoryView || isSubcategoryView) && (
        <nav className="mb-4 flex items-center gap-1.5 text-sm text-gray-500">
          <Link href="/products" className="hover:text-brand-600">All Products</Link>
          {isCategoryView && categoryInfo && (
            <>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="font-semibold text-gray-800">{categoryInfo.name}</span>
            </>
          )}
          {isSubcategoryView && subcategoryInfo && (
            <>
              <ChevronRight className="h-3.5 w-3.5" />
              <Link href={`/products?category=${subcategoryInfo.category.slug}`} className="hover:text-brand-600">
                {subcategoryInfo.category.name}
              </Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="font-semibold text-gray-800">{subcategoryInfo.name}</span>
            </>
          )}
        </nav>
      )}

      <div className="flex gap-6">
        {/* Sidebar filters */}
        <div className="hidden lg:block">
          <Suspense fallback={null}>
            <ProductFilters {...filters} />
          </Suspense>
        </div>

        {/* Main content */}
        <div className="min-w-0 flex-1 space-y-6">

          {/* Top bar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-gray-500">
              {total.toLocaleString()} product{total !== 1 ? "s" : ""} found
              {isCategoryView && categoryInfo && (
                <span className="ml-1 font-semibold text-gray-700">in {categoryInfo.name}</span>
              )}
              {isSubcategoryView && subcategoryInfo && (
                <span className="ml-1 font-semibold text-gray-700">in {subcategoryInfo.name}</span>
              )}
            </p>
            <Suspense fallback={null}>
              <ProductSort />
            </Suspense>
          </div>

          {products.length === 0 ? (
            <EmptyState
              icon={ShoppingBag}
              title="No products found"
              description="Try adjusting your filters or search query."
              action={{ label: "Clear filters", href: "/products" }}
            />
          ) : isCategoryView && grouped ? (
            /* ── Category view: grouped by subcategory ── */
            <div className="space-y-10">
              {groupedKeys.map((subName) => {
                const subProducts = grouped[subName];
                const subSlug = (subProducts[0] as Product)?.subcategory?.slug;
                return (
                  <div key={subName}>
                    {/* Subcategory heading */}
                    <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-3">
                      <h2 className="text-lg font-bold text-gray-900">{subName}</h2>
                      {subSlug && (
                        <Link
                          href={`/products?subcategory=${subSlug}`}
                          className="flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700"
                        >
                          View all <ChevronRight className="h-4 w-4" />
                        </Link>
                      )}
                    </div>
                    <ProductGrid products={subProducts as never} />
                  </div>
                );
              })}

              <Suspense fallback={null}>
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  totalItems={total}
                  perPage={PRODUCTS_PER_PAGE}
                />
              </Suspense>
            </div>
          ) : (
            /* ── Normal / subcategory view ── */
            <>
              <ProductGrid products={products as never} />
              <Suspense fallback={null}>
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  totalItems={total}
                  perPage={PRODUCTS_PER_PAGE}
                />
              </Suspense>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
