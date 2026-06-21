"use client";

import { useState, memo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Heart, ShoppingCart, Zap } from "lucide-react";
import { useAppDispatch, useIsWishlisted } from "@/store/hooks";
import { addItem } from "@/store/slices/cartSlice";
import { toggleWishlist } from "@/store/slices/wishlistSlice";
import { openCart } from "@/store/slices/uiSlice";
import { StarRating } from "@/components/shared/StarRating";
import { PriceDisplay } from "@/components/shared/PriceDisplay";
import { cn } from "@/lib/utils/helpers";
import type { ProductCard as ProductCardType } from "@/types";
import { toast } from "sonner";

interface ProductCardProps {
  product: ProductCardType;
  isDeal?: boolean;
}

function ProductCardComponent({ product, isDeal }: ProductCardProps) {
  const [isHovering, setIsHovering] = useState(false);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const isWishlisted = useIsWishlisted(product.id);

  function cartPayload() {
    return {
      product_id:     product.id,
      name:           product.name,
      slug:           product.slug,
      image:          product.thumbnail_image ?? product.primary_image,
      mrp:            product.mrp,
      selling_price:  product.selling_price,
      quantity:       1,
      stock_quantity: product.stock_quantity,
    };
  }

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    dispatch(addItem(cartPayload()));
    dispatch(openCart());
    toast.success("Added to cart!");
  }

  function handleBuyNow(e: React.MouseEvent) {
    e.preventDefault();
    // Add to cart and go straight to checkout (don't open the drawer).
    dispatch(addItem(cartPayload()));
    router.push("/checkout");
  }

  function handleWishlist(e: React.MouseEvent) {
    e.preventDefault();
    dispatch(toggleWishlist(product.id));
    toast.success(isWishlisted ? "Removed from wishlist" : "Added to wishlist");
  }

  const outOfStock = product.stock_quantity <= 0;

  // The main image shown is the primary (thumbnail_image ?? primary_image).
  // For the hover swap we need the first OTHER image — not blindly index [1],
  // because the primary may sit at any index in product_images.
  const mainImage = product.thumbnail_image ?? product.primary_image;
  const secondaryImage = product.product_images?.find(
    (img) => img.image_url && img.image_url !== mainImage && img.image_url !== product.primary_image
  )?.image_url;

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group relative flex flex-col rounded-xl border border-gray-100 bg-white overflow-hidden hover:border-brand-200 hover:shadow-md transition-all duration-200"
    >
      {/* Image */}
      <div
        className="relative aspect-square overflow-hidden bg-white"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {product.primary_image ? (
          <>
            <Image
              src={product.thumbnail_image ?? product.primary_image}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              loading="lazy"
              quality={75}
              priority={false}
              placeholder="blur"
              blurDataURL="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Crect fill='%23f3f4f6' width='200' height='200'/%3E%3C/svg%3E"
              className={cn(
                "object-contain transition-opacity duration-500 group-hover:scale-105",
                isHovering ? "opacity-0" : "opacity-100"
              )}
            />
            {secondaryImage && (
              <Image
                src={secondaryImage}
                alt={`${product.name} - alternate`}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                loading="lazy"
                quality={75}
                priority={false}
                placeholder="blur"
                blurDataURL="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Crect fill='%23f3f4f6' width='200' height='200'/%3E%3C/svg%3E"
                className={cn(
                  "object-contain transition-opacity duration-500 group-hover:scale-105",
                  isHovering ? "opacity-100" : "opacity-0"
                )}
              />
            )}
          </>
        ) : (
          <div className="flex h-full w-full items-center justify-center text-gray-300 text-4xl">
            🛍️
          </div>
        )}

        {/* Badges */}
        <div className="absolute left-2 top-2 flex flex-col gap-1">
          {isDeal && (
            <span className="flex items-center gap-0.5 rounded bg-red-500 px-1.5 py-0.5 text-xs font-bold text-white">
              <Zap className="h-2.5 w-2.5 fill-current" /> DEAL
            </span>
          )}
          {product.discount_percent > 0 && (
            <span className="rounded bg-green-500 px-1.5 py-0.5 text-xs font-bold text-white">
              {Math.round(product.discount_percent)}% OFF
            </span>
          )}
          {outOfStock && (
            <span className="rounded bg-gray-700 px-1.5 py-0.5 text-xs font-bold text-white">
              OUT OF STOCK
            </span>
          )}
        </div>

        {/* Wishlist button */}
        <button
          onClick={handleWishlist}
          className={cn(
            "absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full shadow transition-all",
            isWishlisted
              ? "bg-red-50 text-red-500"
              : "bg-white text-gray-400 opacity-0 group-hover:opacity-100"
          )}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart className={cn("h-4 w-4", isWishlisted && "fill-current")} />
        </button>
      </div>

      {/* Details */}
      <div className="flex flex-1 flex-col p-3">
        <p className="mb-1 line-clamp-2 text-sm font-medium text-gray-800 leading-snug">
          {product.name}
        </p>

        {product.rating > 0 && (
          <StarRating
            rating={product.rating}
            reviewCount={product.review_count}
            size="sm"
            className="mb-2"
          />
        )}

        <div className="mt-auto">
          <PriceDisplay
            sellingPrice={product.selling_price}
            mrp={product.mrp}
            discountPercent={product.discount_percent}
            size="sm"
          />

          {outOfStock ? (
            <button
              disabled
              className="mt-2 flex w-full items-center justify-center gap-1 rounded-lg bg-gray-100 py-1.5 text-[11px] font-semibold text-gray-400 cursor-not-allowed sm:gap-1.5 sm:py-2 sm:text-xs"
            >
              <ShoppingCart className="h-3 w-3 shrink-0 sm:h-3.5 sm:w-3.5" />
              Out of Stock
            </button>
          ) : (
            <div className="mt-2 flex flex-row gap-1.5">
              <button
                onClick={handleAddToCart}
                className="flex flex-1 items-center justify-center gap-1 whitespace-nowrap rounded-lg border border-brand-500 py-1.5 text-[11px] font-semibold text-brand-600 transition-colors hover:bg-brand-50 active:scale-95 sm:gap-1.5 sm:py-2 sm:text-xs"
              >
                <ShoppingCart className="h-3 w-3 shrink-0 sm:h-3.5 sm:w-3.5" />
                Add to Cart
              </button>
              <button
                onClick={handleBuyNow}
                className="flex flex-1 items-center justify-center gap-1 whitespace-nowrap rounded-lg bg-brand-500 py-1.5 text-[11px] font-semibold text-white transition-colors hover:bg-brand-600 active:scale-95 sm:gap-1.5 sm:py-2 sm:text-xs"
              >
                <Zap className="h-3 w-3 shrink-0 fill-current sm:h-3.5 sm:w-3.5" />
                Buy Now
              </button>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

export const ProductCard = memo(ProductCardComponent);
