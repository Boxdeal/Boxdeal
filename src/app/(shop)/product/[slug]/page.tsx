import type { Metadata } from "next";
import { cache } from "react";
import { notFound } from "next/navigation";
import { Shield, Truck, RefreshCw } from "lucide-react";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { ProductImageGallery } from "@/components/product/ProductImageGallery";
import { ProductSpecifications } from "@/components/product/ProductSpecifications";
import { ProductReviews } from "@/components/product/ProductReviews";
import { StarRating } from "@/components/shared/StarRating";
import { PriceDisplay } from "@/components/shared/PriceDisplay";
import { Breadcrumb } from "@/components/shared/Breadcrumb";
import { ProductGrid } from "@/components/product/ProductGrid";
import { AddToCartButton } from "./AddToCartButton";

export const revalidate = 3600;  // Cache for 1 hour

interface Props {
  params: Promise<{ slug: string }>;
}

const getProduct = cache(async (slug: string) => {
  const supabase = await getSupabaseServerClient();
  const { data } = await supabase
    .from("products")
    .select(`
      *,
      category:categories!category_id(*),
      subcategory:subcategories!subcategory_id(*),
      brand:brands!brand_id(*),
      images:product_images(* ),
      specifications:product_specifications(*)
    `)
    .eq("slug", slug)
    .eq("is_active", true)
    .single();
  return data;
});

async function getReviews(productId: string) {
  const supabase = await getSupabaseServerClient();
  const { data } = await supabase
    .from("reviews")
    .select("*, user:user_profiles(full_name, avatar_url)")
    .eq("product_id", productId)
    .eq("is_approved", true)
    .order("created_at", { ascending: false });
  return data ?? [];
}

async function getRelated(categoryId: string, excludeId: string) {
  const supabase = await getSupabaseServerClient();
  const { data } = await supabase
    .from("products")
    .select(`
      id, name, slug, short_description, mrp, selling_price, discount_percent,
      stock_quantity, rating, review_count, is_deal_of_day,
      product_images(image_url, thumbnail_url, is_primary)
    `)
    .eq("is_active", true)
    .eq("category_id", categoryId)
    .neq("id", excludeId)
    .order("sold_count", { ascending: false })
    .limit(5);

  return (data ?? []).map((p: Record<string, unknown>) => {
    const imgs = (p.product_images as Array<{ image_url: string; thumbnail_url: string; is_primary: boolean }>) ?? [];
    const primary = imgs.find((i) => i.is_primary) ?? imgs[0];
    return { ...p, primary_image: primary?.image_url ?? null, thumbnail_image: primary?.thumbnail_url ?? null };
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return {};
  return {
    title: product.meta_title ?? product.name,
    description: product.meta_description ?? product.short_description ?? "",
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  const [reviews, related] = await Promise.all([
    getReviews(product.id),
    getRelated(product.category_id, product.id),
  ]);

  const sortedImages = [...(product.images ?? [])].sort(
    (a, b) => (a.is_primary ? -1 : b.is_primary ? 1 : a.sort_order - b.sort_order)
  );

  const breadcrumbs = [
    { label: "Home",                                                         href: "/" },
    { label: product.category?.name ?? "Products",                          href: `/products?category=${product.category?.slug}` },
    ...(product.subcategory ? [{ label: product.subcategory.name,           href: `/products?subcategory=${product.subcategory.slug}` }] : []),
    { label: product.name },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 space-y-8">
      <Breadcrumb items={breadcrumbs} />

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Gallery */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <ProductImageGallery images={sortedImages} productName={product.name} />
        </div>

        {/* Info */}
        <div className="space-y-5">
          {product.brand && (
            <p className="text-sm font-medium text-brand-600 uppercase tracking-wide">
              {product.brand.name}
            </p>
          )}
          <h1 className="text-2xl font-bold text-gray-900 leading-snug">{product.name}</h1>

          {product.rating > 0 && (
            <StarRating
              rating={product.rating}
              reviewCount={product.review_count}
              size="md"
            />
          )}

          <PriceDisplay
            sellingPrice={product.selling_price}
            mrp={product.mrp}
            discountPercent={product.discount_percent}
            size="lg"
          />

          {product.short_description && (
            <p className="text-gray-600 leading-relaxed">{product.short_description}</p>
          )}

          {/* Stock status */}
          {product.stock_quantity <= 0 ? (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              <span className="font-semibold">Out of Stock</span>
            </div>
          ) : product.stock_quantity <= product.low_stock_threshold ? (
            <div className="flex items-center gap-2 rounded-lg bg-yellow-50 px-4 py-3 text-sm text-yellow-700">
              Only <span className="font-semibold">{product.stock_quantity} left</span> in stock!
            </div>
          ) : (
            <div className="text-sm text-green-600 font-medium">✓ In Stock</div>
          )}

          {/* Add to cart */}
          <AddToCartButton product={product} />

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-3 rounded-xl bg-gray-50 p-4">
            <div className="flex flex-col items-center gap-1 text-center">
              <Truck className="h-5 w-5 text-brand-500" />
              <span className="text-xs text-gray-600">Fast Delivery</span>
            </div>
            <div className="flex flex-col items-center gap-1 text-center">
              <Shield className="h-5 w-5 text-brand-500" />
              <span className="text-xs text-gray-600">Secure Payment</span>
            </div>
            <div className="flex flex-col items-center gap-1 text-center">
              <RefreshCw className="h-5 w-5 text-brand-500" />
              <span className="text-xs text-gray-600">Easy Returns</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="space-y-6">
        {product.description && (
          <section>
            <h2 className="mb-3 text-lg font-bold text-gray-900">About This Product</h2>
            <div
              className="prose prose-sm max-w-none text-gray-600"
              dangerouslySetInnerHTML={{ __html: product.description }}
            />
          </section>
        )}

        {(product.specifications ?? []).length > 0 && (
          <section>
            <h2 className="mb-3 text-lg font-bold text-gray-900">Specifications</h2>
            <ProductSpecifications specifications={product.specifications} />
          </section>
        )}

        <section>
          <h2 className="mb-3 text-lg font-bold text-gray-900">Customer Reviews</h2>
          <ProductReviews
            reviews={reviews as never}
            productRating={product.rating}
            reviewCount={product.review_count}
          />
        </section>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section>
          <h2 className="mb-4 text-lg font-bold text-gray-900">You May Also Like</h2>
          <ProductGrid products={related as never} />
        </section>
      )}
    </div>
  );
}
