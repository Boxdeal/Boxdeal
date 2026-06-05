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
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Featured Products</h2>
        <Link href="/products?is_featured=true" className="text-sm font-medium text-brand-600 hover:text-brand-700">
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
