import type { ProductCard } from "@/types";
import { ProductCard as ProductCardComponent } from "./ProductCard";
import { ProductGridSkeleton } from "@/components/shared/LoadingSpinner";

interface ProductGridProps {
  products: ProductCard[];
  loading?: boolean;
}

export function ProductGrid({ products, loading }: ProductGridProps) {
  if (loading) return <ProductGridSkeleton />;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 sm:gap-4">
      {products.map((p) => (
        <ProductCardComponent key={p.id} product={p} />
      ))}
    </div>
  );
}
