import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

// Lightweight autocomplete endpoint for the advanced header search.
// Returns grouped, highly-filtered matches across products, categories,
// subcategories and brands as the user types.
export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get("q") ?? "").trim();

  // Require ≥3 chars so the trigram GIN indexes are always usable
  // (a 2-char term forces a sequential scan).
  if (q.length < 3) {
    return NextResponse.json({ products: [], categories: [], subcategories: [], brands: [] });
  }

  // Escape PostgREST `ilike` wildcards so user input is treated literally.
  const safe = q.replace(/[%_,()]/g, " ").trim();
  const pattern = `%${safe}%`;

  const supabase = await getSupabaseServerClient();

  const [products, categories, subcategories, brands] = await Promise.all([
    supabase
      .from("products")
      .select(
        `id, name, slug, selling_price, mrp, discount_percent, stock_quantity,
         product_images(thumbnail_url, image_url, is_primary)`
      )
      .eq("is_active", true)
      .or(`name.ilike.${pattern},slug.ilike.${pattern},short_description.ilike.${pattern}`)
      .order("sold_count", { ascending: false })
      .limit(6),
    supabase
      .from("categories")
      .select("id, name, slug")
      .eq("is_active", true)
      .ilike("name", pattern)
      .order("sort_order")
      .limit(4),
    supabase
      .from("subcategories")
      .select("id, name, slug, category:categories!category_id(name, slug)")
      .eq("is_active", true)
      .ilike("name", pattern)
      .limit(4),
    supabase
      .from("brands")
      .select("id, name, slug")
      .eq("is_active", true)
      .ilike("name", pattern)
      .limit(4),
  ]);

  const mappedProducts = (products.data ?? []).map((p: Record<string, unknown>) => {
    const imgs =
      (p.product_images as Array<{ thumbnail_url: string | null; image_url: string; is_primary: boolean }>) ?? [];
    const primary = imgs.find((i) => i.is_primary) ?? imgs[0];
    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      selling_price: p.selling_price,
      mrp: p.mrp,
      discount_percent: p.discount_percent,
      stock_quantity: p.stock_quantity,
      thumbnail: primary?.thumbnail_url ?? primary?.image_url ?? null,
    };
  });

  return NextResponse.json({
    products: mappedProducts,
    categories: categories.data ?? [],
    subcategories: subcategories.data ?? [],
    brands: brands.data ?? [],
  });
}
