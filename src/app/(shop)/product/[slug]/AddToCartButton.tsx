"use client";

import { useState } from "react";
import { ShoppingCart, Heart, Minus, Plus } from "lucide-react";
import { useAppDispatch, useIsWishlisted } from "@/store/hooks";
import { addItem } from "@/store/slices/cartSlice";
import { toggleWishlist } from "@/store/slices/wishlistSlice";
import { openCart } from "@/store/slices/uiSlice";
import { cn } from "@/lib/utils/helpers";
import { toast } from "sonner";
import type { Product } from "@/types";

export function AddToCartButton({ product }: { product: Product }) {
  const [qty, setQty] = useState(1);
  const dispatch = useAppDispatch();
  const isWishlisted = useIsWishlisted(product.id);
  const outOfStock = product.stock_quantity <= 0;

  const primaryImage =
    product.images?.find((i) => i.is_primary)?.thumbnail_url ??
    product.images?.[0]?.thumbnail_url ??
    null;

  function handleAddToCart() {
    dispatch(
      addItem({
        product_id:     product.id,
        name:           product.name,
        slug:           product.slug,
        image:          primaryImage,
        mrp:            product.mrp,
        selling_price:  product.selling_price,
        quantity:       qty,
        stock_quantity: product.stock_quantity,
      })
    );
    dispatch(openCart());
    toast.success("Added to cart!");
  }

  return (
    <div className="space-y-3">
      {/* Qty selector */}
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-gray-700">Quantity</span>
        <div className="flex items-center rounded-xl border border-gray-200">
          <button
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            disabled={qty <= 1}
            className="flex h-10 w-10 items-center justify-center text-gray-600 disabled:opacity-30 hover:text-brand-600"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-12 text-center font-semibold">{qty}</span>
          <button
            onClick={() => setQty((q) => Math.min(product.stock_quantity, q + 1))}
            disabled={qty >= product.stock_quantity}
            className="flex h-10 w-10 items-center justify-center text-gray-600 disabled:opacity-30 hover:text-brand-600"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleAddToCart}
          disabled={outOfStock}
          className={cn(
            "flex flex-1 items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold transition-all active:scale-95",
            outOfStock
              ? "cursor-not-allowed bg-gray-100 text-gray-400"
              : "bg-brand-500 text-white hover:bg-brand-600"
          )}
        >
          <ShoppingCart className="h-4 w-4" />
          {outOfStock ? "Out of Stock" : "Add to Cart"}
        </button>

        <button
          onClick={() => {
            dispatch(toggleWishlist(product.id));
            toast.success(isWishlisted ? "Removed from wishlist" : "Added to wishlist");
          }}
          className={cn(
            "flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border-2 transition-all",
            isWishlisted
              ? "border-red-200 bg-red-50 text-red-500"
              : "border-gray-200 text-gray-400 hover:border-red-200 hover:text-red-500"
          )}
        >
          <Heart className={cn("h-5 w-5", isWishlisted && "fill-current")} />
        </button>
      </div>
    </div>
  );
}
