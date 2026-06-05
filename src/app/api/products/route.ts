import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const ids = searchParams.get("ids");

  const supabase = await getSupabaseServerClient();

  let query = supabase
    .from("products")
    .select(`
      id, name, slug, short_description, mrp, selling_price, discount_percent,
      stock_quantity, rating, review_count, is_deal_of_day,
      product_images(image_url, thumbnail_url, is_primary)
    `)
    .eq("is_active", true);

  if (ids) {
    query = query.in("id", ids.split(",").filter(Boolean));
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const products = (data ?? []).map((p: Record<string, unknown>) => {
    const imgs = (p.product_images as Array<{ image_url: string; thumbnail_url: string; is_primary: boolean }>) ?? [];
    const primary = imgs.find((i) => i.is_primary) ?? imgs[0];
    return { ...p, primary_image: primary?.image_url ?? null, thumbnail_image: primary?.thumbnail_url ?? null };
  });

  return NextResponse.json({ data: products });
}
