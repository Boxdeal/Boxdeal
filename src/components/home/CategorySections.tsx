import { Suspense } from "react";
import { CategorySection } from "./CategorySection";
import { getSupabaseServerClient } from "@/lib/supabase/server";

function mapProduct(p: any) {
  const images = p.product_images ?? [];
  const primary = images.find((i: any) => i.is_primary) ?? images[0];
  return {
    ...p,
    primary_image: primary?.image_url ?? null,
    thumbnail_image: primary?.thumbnail_url ?? null,
    product_images: images,
  };
}

export async function CategorySections({ categories }: any) {
  const supabase = await getSupabaseServerClient();

  const [{ data: allSubcategories }, { data: allProducts }] = await Promise.all([
    supabase
      .from("subcategories")
      .select("id, name, category_id")
      .eq("is_active", true),
    supabase
      .from("products")
      .select("id, name, slug, mrp, selling_price, discount_percent, stock_quantity, rating, review_count, category_id, subcategory_id, product_images(image_url, thumbnail_url, is_primary)")
      .eq("is_active", true)
      .in("category_id", categories.map((c: any) => c.id))
      .limit(500),
  ]);

  const productsBySubcat = new Map();
  const productsByCat = new Map();

  (allProducts ?? []).forEach((p: any) => {
    if (p.subcategory_id) {
      if (!productsBySubcat.has(p.subcategory_id)) productsBySubcat.set(p.subcategory_id, []);
      productsBySubcat.get(p.subcategory_id).push(mapProduct(p));
    }
    if (p.category_id) {
      if (!productsByCat.has(p.category_id)) productsByCat.set(p.category_id, []);
      productsByCat.get(p.category_id).push(mapProduct(p));
    }
  });

  let index = 0;

  return (
    <>
      {categories.map((cat: any) => {
        const subcats = (allSubcategories ?? []).filter((s: any) => s.category_id === cat.id);

        return (
          <div key={cat.id}>
            {subcats.length > 0 ? (
              subcats.map((subcat: any) => {
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
