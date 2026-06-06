import { Suspense } from "react";
import { HeroBanner } from "@/components/home/HeroBanner";
import { TrustStrip } from "@/components/home/TrustStrip";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { DealsSection } from "@/components/home/DealsSection";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { CategorySection } from "@/components/home/CategorySection";
import { ProductGridSkeleton } from "@/components/shared/LoadingSpinner";
import { BrandMarquee } from "@/components/home/BrandMarquee";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export const revalidate = 3600;

async function getHomeData() {
  const supabase = await getSupabaseServerClient();

  const [{ data: banners }, { data: dealOfDayBanner }, { data: categories }, { data: brands }, { data: dealOfDayProducts }, { data: featured }] =
    await Promise.all([
      supabase
        .from("banners")
        .select("*")
        .eq("is_active", true)
        .eq("banner_type", "hero")
        .or("starts_at.is.null,starts_at.lte.now()")
        .or("ends_at.is.null,ends_at.gt.now()")
        .order("sort_order"),
      supabase
        .from("banners")
        .select("*")
        .eq("is_active", true)
        .eq("banner_type", "deal_of_day")
        .or("starts_at.is.null,starts_at.lte.now()")
        .or("ends_at.is.null,ends_at.gt.now()")
        .maybeSingle(),
      supabase
        .from("categories")
        .select("*")
        .eq("is_active", true)
        .order("sort_order"),
      supabase
        .from("brands")
        .select("id, name, slug")
        .eq("is_active", true),
      supabase
        .from("products")
        .select(`
          id, name, slug, short_description, mrp, selling_price, discount_percent,
          stock_quantity, rating, review_count, is_deal_of_day,
          product_images!inner(image_url, thumbnail_url, is_primary, sort_order)
        `)
        .eq("is_active", true)
        .eq("is_deal_of_day", true)
        .order("created_at", { ascending: false })
        .limit(8),
      supabase
        .from("products")
        .select(`
          id, name, slug, short_description, mrp, selling_price, discount_percent,
          stock_quantity, rating, review_count, is_deal_of_day,
          product_images(image_url, thumbnail_url, is_primary, sort_order)
        `)
        .eq("is_active", true)
        .eq("is_featured", true)
        .order("sold_count", { ascending: false })
        .limit(10),
    ]);

  function mapProduct(p: Record<string, unknown>) {
    const images =
      (p.product_images as Array<{
        image_url: string;
        thumbnail_url: string;
        is_primary: boolean;
      }>) ?? [];
    const primary = images.find((i) => i.is_primary) ?? images[0];
    return {
      ...p,
      primary_image:   primary?.image_url ?? null,
      thumbnail_image: primary?.thumbnail_url ?? null,
      product_images:  images,
    };
  }

  // Fetch category/subcategory sections
  let allSections: any[] = [];
  try {
    const categoryData = await Promise.all(
      (categories ?? []).map(async (category: { id: string }) => {
        const { data: categoryProds } = await supabase
          .from("products")
          .select(`
            id, name, slug, short_description, mrp, selling_price, discount_percent,
            stock_quantity, rating, review_count, is_deal_of_day,
            product_images(image_url, thumbnail_url, is_primary, sort_order)
          `)
          .eq("is_active", true)
          .eq("category_id", category.id)
          .order("sold_count", { ascending: false })
          .limit(4);

        const { data: subcats } = await supabase
          .from("subcategories")
          .select("*")
          .eq("category_id", category.id)
          .eq("is_active", true)
          .order("sort_order");

        const subcategoryData = await Promise.all(
          (subcats ?? []).map(async (subcat: { id: string }) => {
            const { data: subcatProds } = await supabase
              .from("products")
              .select(`
                id, name, slug, short_description, mrp, selling_price, discount_percent,
                stock_quantity, rating, review_count, is_deal_of_day,
                product_images(image_url, thumbnail_url, is_primary, sort_order)
              `)
              .eq("is_active", true)
              .eq("subcategory_id", subcat.id)
              .order("sold_count", { ascending: false })
              .limit(4);
            return {
              subcategory: subcat,
              products: (subcatProds ?? []).map(mapProduct),
            };
          })
        );

        return { category, categoryProducts: (categoryProds ?? []).map(mapProduct), subcategoryData };
      })
    );

    let globalIndex = 0;
    categoryData.forEach((cat) => {
      if (cat.subcategoryData.length > 0) {
        cat.subcategoryData.forEach((subcat: any) => {
          if (subcat.products.length >= 4) {
            allSections.push({
              type: 'subcategory',
              index: globalIndex++,
              category: cat.category,
              subcategory: subcat.subcategory,
              products: subcat.products,
            });
          }
        });
      } else {
        if (cat.categoryProducts.length >= 4) {
          allSections.push({
            type: 'category',
            index: globalIndex++,
            category: cat.category,
            products: cat.categoryProducts,
          });
        }
      }
    });
  } catch (error) {
    console.error('Error fetching category sections:', error);
  }

  console.log('[DEAL_OF_DAY_DEBUG]', {
    bannerExists: !!dealOfDayBanner,
    bannerId: dealOfDayBanner?.id,
    imageUrl: dealOfDayBanner?.image_url,
    hasTrailingWhitespace: dealOfDayBanner?.image_url?.endsWith('\n'),
  });

  return {
    banners:             (banners ?? []) as import("@/types").Banner[],
    dealOfDayBanner:     dealOfDayBanner as import("@/types").Banner | null,
    categories:          categories ?? [],
    brands:              (brands ?? []) as { id: string; name: string; slug: string }[],
    dealOfDayProducts:   (dealOfDayProducts ?? []).map(mapProduct),
    featured:            (featured ?? []).map(mapProduct),
    allSections,
  };
}

export default async function HomePage() {
  const { banners, dealOfDayBanner, categories, brands, dealOfDayProducts, featured, allSections } = await getHomeData();

  return (
    <div>
      <HeroBanner banners={banners} />
      <TrustStrip />
      <BrandMarquee brands={brands} />

      <CategoryGrid categories={categories} />

      {dealOfDayProducts.length > 0 && (
        <DealsSection
          products={dealOfDayProducts as never}
          backgroundImage={dealOfDayBanner?.image_url}
        />
      )}

      <div className="space-y-8 px-4 py-6 sm:py-8 bg-gradient-to-b from-gray-50 to-white">
        <div className="mx-auto max-w-full space-y-8 px-0 sm:px-4 lg:px-8">
          <Suspense fallback={<ProductGridSkeleton count={10} />}>
            {featured.length > 0 && <FeaturedProducts products={featured as never} />}
          </Suspense>
        </div>
      </div>

      {/* Category Sections with Alternating Layout */}
      <section className="px-4 sm:px-8 lg:px-12 py-8 bg-white">
        <div className="mx-auto max-w-full">
          {allSections.map((section: any) => (
            <CategorySection
              key={`${section.type}-${section.subcategory?.id || section.category?.id}`}
              category={section.category}
              subcategory={section.subcategory}
              products={section.products as never}
              index={section.index}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
