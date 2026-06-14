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
  subcategory_id?: string;
  product_images?: ProductImage[];
}

interface Props {
  category: Category;
  index: number;
}

export async function CategoryItemServer({ category, index }: Props) {
  const supabase = await getSupabaseServerClient();

  const { data: subcategories } = await supabase
    .from("subcategories")
    .select("id, category_id, name, slug, image_url, sort_order")
    .eq("category_id", category.id)
    .eq("is_active", true)
    .order("sort_order");

  const hasSubcategories = (subcategories ?? []).length > 0;

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

  // Case 1: Category HAS subcategories → Show only subcategory products
  if (hasSubcategories) {
    const subcategoryIds = (subcategories ?? []).map(s => s.id);
    const { data: products } = await supabase
      .from("products")
      .select("id, name, slug, mrp, selling_price, discount_percent, stock_quantity, rating, review_count, subcategory_id, product_images(image_url, thumbnail_url, is_primary)")
      .eq("is_active", true)
      .in("subcategory_id", subcategoryIds)
      .limit(20);

    if (!products || products.length === 0) return null;

    const productsBySubcategory = new Map<string, ReturnType<typeof mapProduct>[]>();
    (products ?? []).forEach((p: Product) => {
      if (p.subcategory_id) {
        if (!productsBySubcategory.has(p.subcategory_id)) productsBySubcategory.set(p.subcategory_id, []);
        productsBySubcategory.get(p.subcategory_id)!.push(mapProduct(p));
      }
    });

    const subcategoryData = ((subcategories ?? []) as Subcategory[]).map((subcat: Subcategory) => ({
      subcategory: subcat,
      products: (productsBySubcategory.get(subcat.id) ?? []).slice(0, 4),
    }));

    const hasValidSubcats = subcategoryData.some(sc => sc.products.length >= 4);
    if (!hasValidSubcats) return null;

    return (
      <>
        {subcategoryData.map((subcat, i) =>
          subcat.products.length >= 4 ? (
            <CategorySection
              key={`${category.id}-${subcat.subcategory.id}`}
              category={category}
              subcategory={subcat.subcategory}
              products={subcat.products as never}
              index={index + i}
            />
          ) : null
        )}
      </>
    );
  }

  // Case 2: Category has NO subcategories → Show category-level products
  const { data: categoryProducts } = await supabase
    .from("products")
    .select("id, name, slug, mrp, selling_price, discount_percent, stock_quantity, rating, review_count, product_images(image_url, thumbnail_url, is_primary)")
    .eq("category_id", category.id)
    .eq("is_active", true)
    .is("subcategory_id", null)
    .limit(4);

  if (!categoryProducts || categoryProducts.length < 4) return null;

  return (
    <CategorySection
      key={`${category.id}-direct`}
      category={category}
      products={categoryProducts.map(mapProduct) as never}
      index={index}
    />
  );
}
