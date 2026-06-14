import { Suspense } from "react";
import { HeroBanner } from "@/components/home/HeroBanner";
import { TrustStrip } from "@/components/home/TrustStrip";
import { ProductGridSkeleton } from "@/components/shared/LoadingSpinner";
import { BrandMarqueeServer } from "@/components/home/BrandMarqueeServer";
import { CategoryGridServer } from "@/components/home/CategoryGridServer";
import { DealsSectionServer } from "@/components/home/DealsSectionServer";
import { FeaturedProductsServer } from "@/components/home/FeaturedProductsServer";
import { CategoryListServer } from "@/components/home/CategoryListServer";
import { getSupabaseServerClient } from "@/lib/supabase/server";

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

async function getHeroBannersData() {
  const supabase = await getSupabaseServerClient();
  const { data: banners } = await supabase
    .from("banners")
    .select("id, badge, title, mid_heading, subtitle, cta_text, cta_link, image_url, text_theme, sort_order")
    .eq("is_active", true)
    .eq("banner_type", "hero")
    .order("sort_order")
    .limit(5);
  return banners ?? [];
}

export default async function HomePage() {
  const banners = await getHeroBannersData();

  return (
    <div>
      {/* Hero Banner - Immediate render */}
      {banners.length > 0 ? (
        <HeroBanner banners={banners as never} />
      ) : (
        <HeroBannerSkeleton />
      )}

      <TrustStrip />

      {/* Brands - Server component with independent data fetch */}
      <Suspense fallback={null}>
        <BrandMarqueeServer />
      </Suspense>

      {/* Category Grid - Server component with independent data fetch */}
      <Suspense fallback={<CategoryGridSkeleton />}>
        <CategoryGridServer />
      </Suspense>

      {/* Deal Section - Server component with independent data fetch */}
      <Suspense fallback={<DealsSectionSkeleton />}>
        <DealsSectionServer />
      </Suspense>

      <div className="space-y-8 px-4 py-6 sm:py-8 bg-gradient-to-b from-gray-50 to-white">
        <div className="mx-auto max-w-full space-y-8 px-0 sm:px-4 lg:px-8">
          {/* Featured Products - Server component with independent data fetch */}
          <Suspense fallback={<ProductGridSkeleton count={10} />}>
            <FeaturedProductsServer />
          </Suspense>

          {/* Category List - Progressive streaming (each category loads independently) */}
          <CategoryListServer />

        </div>
      </div>
    </div>
  );
}
