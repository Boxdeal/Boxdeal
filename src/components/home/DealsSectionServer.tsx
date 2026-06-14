import { DealsSection } from "./DealsSection";
import { getSupabaseServerClient } from "@/lib/supabase/server";

interface ProductImage {
  image_url: string;
  thumbnail_url: string;
  is_primary: boolean;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  mrp: number;
  selling_price: number;
  discount_percent: number;
  stock_quantity: number;
  rating: number;
  review_count: number;
  product_images?: ProductImage[];
}

export async function DealsSectionServer() {
  const supabase = await getSupabaseServerClient();

  const [
    { data: dealOfDayBanner },
    { data: dealOfDayProducts }
  ] = await Promise.all([
    supabase
      .from("banners")
      .select("id, badge, title, mid_heading, subtitle, cta_text, cta_link, image_url, text_theme, sort_order")
      .eq("is_active", true)
      .eq("banner_type", "deal_of_day")
      .maybeSingle(),
    supabase
      .from("products")
      .select("id, name, slug, mrp, selling_price, discount_percent, stock_quantity, rating, review_count, product_images(image_url, thumbnail_url, is_primary)")
      .eq("is_active", true)
      .eq("is_deal_of_day", true)
      .order("created_at", { ascending: false })
      .limit(6)
  ]);

  if (!dealOfDayProducts || dealOfDayProducts.length === 0) return null;

  function mapProduct(p: Product) {
    const images = p.product_images ?? [];
    const primary = images.find((i) => i.is_primary) ?? images[0];
    return {
      ...p,
      primary_image: primary?.image_url ?? null,
      thumbnail_image: primary?.thumbnail_url ?? null,
      product_images: images,
    };
  }

  return (
    <DealsSection
      products={dealOfDayProducts.map(mapProduct) as never}
      backgroundImage={dealOfDayBanner?.image_url}
    />
  );
}
