import { CategorySection } from "./CategorySection";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { Category, Subcategory } from "@/types";

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
  category_id: string;
  subcategory_id?: string;
  product_images: ProductImage[];
}

function mapProduct(p: Product) {
  const images = p.product_images ?? [];
  const primary = images.find((i: ProductImage) => i.is_primary) ?? images[0];
  return {
    ...p,
    primary_image: primary?.image_url ?? null,
    thumbnail_image: primary?.thumbnail_url ?? null,
    product_images: images,
  };
}

export async function CategorySections({ categories }: { categories: Category[] }) {
  const supabase = await getSupabaseServerClient();

  const [subcatsResult, productsResult] = await Promise.all([
    supabase
      .from("subcategories")
      .select("*")
      .eq("is_active", true),
    supabase
      .from("products")
      .select("id, name, slug, mrp, selling_price, discount_percent, stock_quantity, rating, review_count, category_id, subcategory_id, product_images(image_url, thumbnail_url, is_primary)")
      .eq("is_active", true)
      .in("category_id", categories.map((c: Category) => c.id))
      .limit(500),
  ]);

  const allSubcategories = (subcatsResult.data as Subcategory[] | null) ?? [];
  const allProducts = (productsResult.data as Product[] | null) ?? [];

  const productsBySubcat = new Map<string, ReturnType<typeof mapProduct>[]>();
  const productsByCat = new Map<string, ReturnType<typeof mapProduct>[]>();

  allProducts.forEach((p: Product) => {
    if (p.subcategory_id) {
      if (!productsBySubcat.has(p.subcategory_id)) productsBySubcat.set(p.subcategory_id, []);
      productsBySubcat.get(p.subcategory_id)!.push(mapProduct(p));
    }
    if (p.category_id) {
      if (!productsByCat.has(p.category_id)) productsByCat.set(p.category_id, []);
      productsByCat.get(p.category_id)!.push(mapProduct(p));
    }
  });

  let index = 0;

  return (
    <>
      {categories.map((cat: Category) => {
        const subcats = allSubcategories.filter((s: Subcategory) => s.category_id === cat.id);

        return (
          <div key={cat.id}>
            {subcats.length > 0 ? (
              subcats.map((subcat: Subcategory) => {
                const products = (productsBySubcat.get(subcat.id) ?? []).slice(0, 4);
                if (products.length < 4) return null;
                return (
                  <CategorySection
                    key={subcat.id}
                    category={cat}
                    subcategory={subcat}
                    products={products as never}
                    index={index++}
                  />
                );
              })
            ) : (
              (() => {
                const products = (productsByCat.get(cat.id) ?? []).slice(0, 4);
                if (products.length < 4) return null;
                return (
                  <CategorySection
                    category={cat}
                    products={products as never}
                    index={index++}
                  />
                );
              })()
            )}
          </div>
        );
      })}
    </>
  );
}
