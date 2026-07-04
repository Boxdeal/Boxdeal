import { HeroBanner } from "@/components/home/HeroBanner";
import { TrustStrip } from "@/components/home/TrustStrip";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { DealsSection } from "@/components/home/DealsSection";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { CategorySection } from "@/components/home/CategorySection";
import { ProductGridSkeleton } from "@/components/shared/LoadingSpinner";
import { BrandMarquee } from "@/components/home/BrandMarquee";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { Category, Subcategory } from "@/types";
import type { Metadata } from "next";
import { SITE_DESCRIPTION } from "@/lib/seo";

export const metadata: Metadata = {
  title: "BoxDeal — Best Deals on Electronics & Mobile Accessories in India",
  description: SITE_DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    title: "BoxDeal — Best Deals on Electronics & Mobile Accessories in India",
    description: SITE_DESCRIPTION,
    url: "/",
  },
};

export const revalidate = 1800;

// Loading skeleton components
function HeroBannerSkeleton() {
  return <div className="h-96 bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse" />;
}

function CategoryGridSkeleton() {
  return (
    <div className="w-full bg-white py-8 px-6">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
        {Array(6).fill(0).map((_, i) => (
          <div key={i} className="aspect-square bg-gray-200 rounded-lg animate-pulse" />
        ))}
      </div>
    </div>
  );
}

function DealsSectionSkeleton() {
  return <div className="h-80 bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse rounded-lg" />;
}

async function getHomeData() {
  const supabase = await getSupabaseServerClient();

  const [
    { data: banners },
    { data: dealOfDayBanner },
    { data: categories },
    { data: brands },
    { data: dealOfDayProducts },
    { data: featured },
    { data: allSubcategories },
    { data: allCategoryProducts }
  ] = await Promise.all([
    supabase
      .from("banners")
      .select("id, badge, title, mid_heading, subtitle, cta_text, cta_link, image_url, text_theme, sort_order, is_active, starts_at, ends_at, created_at, updated_at")
      .eq("is_active", true)
      .eq("banner_type", "hero")
      .order("sort_order")
      .limit(5),
    supabase
      .from("banners")
      .select("id, badge, title, mid_heading, subtitle, cta_text, cta_link, image_url, text_theme, sort_order, is_active, starts_at, ends_at, created_at, updated_at")
      .eq("is_active", true)
      .eq("banner_type", "deal_of_day")
      .maybeSingle(),
    supabase
      .from("categories")
      .select("id, name, slug, image_url, description, is_active, sort_order, created_at, updated_at")
      .eq("is_active", true)
      .order("sort_order"),
    supabase
      .from("brands")
      .select("id, name, slug")
      .eq("is_active", true)
      .limit(15),
    supabase
      .from("products")
      .select("id, name, slug, mrp, selling_price, discount_percent, stock_quantity, rating, review_count, product_images(image_url, thumbnail_url, is_primary)")
      .eq("is_active", true)
      .eq("is_deal_of_day", true)
      .order("created_at", { ascending: false })
      .limit(8),
    supabase
      .from("products")
      .select("id, name, slug, mrp, selling_price, discount_percent, stock_quantity, rating, review_count, product_images(image_url, thumbnail_url, is_primary)")
      .eq("is_active", true)
      .eq("is_featured", true)
      .order("sold_count", { ascending: false })
      .limit(10),
    supabase
      .from("subcategories")
      .select("id, category_id, name, slug, image_url, is_active, sort_order, created_at, updated_at")
      .eq("is_active", true),
    supabase
      .from("products")
      .select("id, name, slug, mrp, selling_price, discount_percent, stock_quantity, rating, review_count, category_id, subcategory_id, product_images(image_url, thumbnail_url, is_primary)")
      .eq("is_active", true)
      .limit(80)
  ]);

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

  const categoryData = (categories ?? []).map((category: Category) => {
    const subcats = (allSubcategories ?? []).filter((s: Subcategory) => s.category_id === category.id);
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

  return {
    banners: banners ?? [],
    dealOfDayBanner: dealOfDayBanner ?? null,
    categories: categories ?? [],
    brands: brands ?? [],
    dealOfDayProducts: (dealOfDayProducts ?? []).map(mapProduct),
    featured: (featured ?? []).map(mapProduct),
    allSections,
  };
}

export default async function HomePage() {
  const { banners, dealOfDayBanner, categories, brands, dealOfDayProducts, featured, allSections } = await getHomeData();

  return (
    <div>
      {/* Hero Banner */}
      {banners.length > 0 ? (
        <HeroBanner banners={banners as never} />
      ) : (
        <HeroBannerSkeleton />
      )}

      <TrustStrip />

      {/* Brands */}
      {brands.length > 0 && <BrandMarquee brands={brands as never} />}

      {/* Category Grid */}
      {categories.length > 0 ? (
        <CategoryGrid categories={categories as never} />
      ) : (
        <CategoryGridSkeleton />
      )}

      {/* Deal Section */}
      {dealOfDayProducts.length > 0 ? (
        <DealsSection
          products={dealOfDayProducts as never}
          backgroundImage={dealOfDayBanner?.image_url}
        />
      ) : (
        <DealsSectionSkeleton />
      )}

      <div className="space-y-8 px-4 py-6 sm:py-8 bg-gradient-to-b from-gray-50 to-white">
        <div className="mx-auto max-w-full space-y-8 px-0 sm:px-4 lg:px-8">
          {/* Featured Products */}
          {featured.length > 0 ? (
            <FeaturedProducts products={featured as never} />
          ) : (
            <ProductGridSkeleton count={10} />
          )}

          {/* Category Sections */}
          {allSections.length > 0 ? (
            allSections.map((section) => (
              <CategorySection
                key={section.index}
                category={section.category}
                subcategory={section.subcategory}
                products={section.products as never}
                index={section.index}
              />
            ))
          ) : (
            <ProductGridSkeleton count={8} />
          )}
        </div>
      </div>
    </div>
  );
}
