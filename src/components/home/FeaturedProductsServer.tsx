import { FeaturedProducts } from "./FeaturedProducts";
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

export async function FeaturedProductsServer() {
  const supabase = await getSupabaseServerClient();
  const { data: featured } = await supabase
    .from("products")
    .select("id, name, slug, mrp, selling_price, discount_percent, stock_quantity, rating, review_count, product_images(image_url, thumbnail_url, is_primary)")
    .eq("is_active", true)
    .eq("is_featured", true)
    .order("sold_count", { ascending: false })
    .limit(8);

  if (!featured || featured.length === 0) return null;

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

  return <FeaturedProducts products={featured.map(mapProduct) as never} />;
}
