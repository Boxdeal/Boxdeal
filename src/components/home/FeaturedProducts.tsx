import Link from "next/link";
import type { ProductCard } from "@/types";
import { ProductCard as ProductCardComponent } from "@/components/product/ProductCard";

interface FeaturedProductsProps {
  products: ProductCard[];
}

export function FeaturedProducts({ products }: FeaturedProductsProps) {
  if (!products.length) return null;

  return (
    <section className="px-4 sm:px-8 lg:px-12">
      <div className="mb-4 sm:mb-6 flex items-center justify-between gap-2">
        <h2 className="text-sm sm:text-base md:text-lg lg:text-2xl xl:text-3xl font-bold text-gray-900">Featured Products</h2>
        <Link href="/products?is_featured=true" className="text-xs sm:text-sm font-medium text-brand-600 hover:text-brand-700 whitespace-nowrap">
          See all →
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {products.slice(0, 5).map((p) => (
          <ProductCardComponent key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
