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
  category_id?: string;
  subcategory_id?: string;
  product_images?: ProductImage[];
}

export async function CategorySectionsServer() {
  const supabase = await getSupabaseServerClient();

  const [
    { data: categories },
    { data: allSubcategories },
    { data: allCategoryProducts }
  ] = await Promise.all([
    supabase
      .from("categories")
      .select("id, name, slug, image_url, sort_order")
      .eq("is_active", true)
      .order("sort_order"),
    supabase
      .from("subcategories")
      .select("id, category_id, name, slug, image_url, sort_order")
      .eq("is_active", true)
      .order("sort_order"),
    supabase
      .from("products")
      .select("id, name, slug, mrp, selling_price, discount_percent, stock_quantity, rating, review_count, category_id, subcategory_id, product_images(image_url, thumbnail_url, is_primary)")
      .eq("is_active", true)
      .limit(50)
  ]);

  if (!categories || categories.length === 0) return null;

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

  const productsByCategory = new Map<string, ReturnType<typeof mapProduct>[]>();
  const productsBySubcategory = new Map<string, ReturnType<typeof mapProduct>[]>();

  (allCategoryProducts ?? []).forEach((p: Product) => {
    if (p.category_id) {
      if (!productsByCategory.has(p.category_id)) productsByCategory.set(p.category_id, []);
      productsByCategory.get(p.category_id)!.push(mapProduct(p));
    }
    if (p.subcategory_id) {
      if (!productsBySubcategory.has(p.subcategory_id)) productsBySubcategory.set(p.subcategory_id, []);
      productsBySubcategory.get(p.subcategory_id)!.push(mapProduct(p));
    }
  });

  const categoryData = ((categories ?? []) as Category[]).map((category: Category) => {
    const subcats = ((allSubcategories ?? []) as Subcategory[]).filter((s: Subcategory) => s.category_id === category.id);
    const subcategoryData = subcats.map((subcat: Subcategory) => ({
      subcategory: subcat,
      products: (productsBySubcategory.get(subcat.id) ?? []).slice(0, 4),
    }));
    return {
      category,
      categoryProducts: (productsByCategory.get(category.id) ?? []).slice(0, 4),
      subcategoryData,
    };
  });

  let globalIndex = 0;
  const allSections: Array<{
    category: Category;
    subcategory?: Subcategory;
    products: ReturnType<typeof mapProduct>[];
    index: number;
  }> = [];

  categoryData.forEach((cat) => {
    if (cat.subcategoryData.length > 0) {
      cat.subcategoryData.forEach((subcat) => {
        if (subcat.products.length >= 4) {
          allSections.push({
            category: cat.category,
            subcategory: subcat.subcategory,
            products: subcat.products,
            index: globalIndex++,
          });
        }
      });
    } else {
      if (cat.categoryProducts.length >= 4) {
        allSections.push({
          category: cat.category,
          products: cat.categoryProducts,
          index: globalIndex++,
        });
      }
    }
  });

  return (
    <>
      {allSections.map((section) => (
        <CategorySection
          key={section.index}
          category={section.category}
          subcategory={section.subcategory}
          products={section.products as never}
          index={section.index}
        />
      ))}
    </>
  );
}
