import type { Metadata } from "next";
import { Search } from "lucide-react";
import { getSupabasePublicClient } from "@/lib/supabase/server";
import { ProductGrid } from "@/components/product/ProductGrid";
import { EmptyState } from "@/components/shared/EmptyState";

interface Props {
  searchParams: Promise<{ q?: string }>;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q } = await searchParams;
  return {
    title: q ? `"${q}" — Search Results` : "Search",
    // Search result pages thin/duplicate hote hain — index se bahar, par
    // product links crawl hone do.
    robots: { index: false, follow: true },
  };
}

export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams;

  if (!q?.trim()) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <EmptyState icon={Search} title="Search for products" description="Enter a product name, brand, or category." />
      </div>
    );
  }

  const supabase = getSupabasePublicClient();
  // Partial substring match (e.g. "son" → "sony"), served by the pg_trgm
  // GIN indexes from database/search_indexes.sql.
  const safe = q.trim().replace(/[%_,()]/g, " ").trim();
  const { data } = await supabase
    .from("products")
    .select(`
      id, name, slug, short_description, mrp, selling_price, discount_percent,
      stock_quantity, rating, review_count, is_deal_of_day,
      product_images(image_url, thumbnail_url, is_primary)
    `)
    .eq("is_active", true)
    .or(`name.ilike.%${safe}%,slug.ilike.%${safe}%,short_description.ilike.%${safe}%`)
    .order("sold_count", { ascending: false })
    .limit(48);

  const products = (data ?? []).map((p: Record<string, unknown>) => {
    const imgs = (p.product_images as Array<{ image_url: string; thumbnail_url: string; is_primary: boolean }>) ?? [];
    const primary = imgs.find((i) => i.is_primary) ?? imgs[0];
    return { ...p, primary_image: primary?.image_url ?? null, thumbnail_image: primary?.thumbnail_url ?? null };
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">
          {products.length > 0
            ? `${products.length} results for "${q}"`
            : `No results for "${q}"`}
        </h1>
      </div>
      {products.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No products found"
          description="Try a different search term or browse all products."
          action={{ label: "Browse All Products", href: "/products" }}
        />
      ) : (
        <ProductGrid products={products as never} />
      )}
    </div>
  );
}
