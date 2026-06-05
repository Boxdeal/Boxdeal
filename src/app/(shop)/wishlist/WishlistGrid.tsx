"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { useWishlist } from "@/store/hooks";
import { ProductGrid } from "@/components/product/ProductGrid";
import { EmptyState } from "@/components/shared/EmptyState";
import type { ProductCard } from "@/types";

export function WishlistGrid({ serverWishlistIds }: { serverWishlistIds: string[] }) {
  const reduxIds = useWishlist();
  const allIds = [...new Set([...serverWishlistIds, ...reduxIds])];
  const [products, setProducts] = useState<ProductCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!allIds.length) { setLoading(false); return; }
    fetch(`/api/products?ids=${allIds.join(",")}`)
      .then((r) => r.json())
      .then(({ data }) => setProducts(data ?? []))
      .finally(() => setLoading(false));
  }, []);

  if (!loading && !allIds.length) {
    return (
      <EmptyState
        icon={Heart}
        title="Your wishlist is empty"
        description="Save products you love to your wishlist."
        action={{ label: "Browse Products", href: "/products" }}
      />
    );
  }

  return <ProductGrid products={products} loading={loading} />;
}
