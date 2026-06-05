"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import { cn } from "@/lib/utils/helpers";
import type { ProductImage } from "@/types";

interface ProductImageGalleryProps {
  images: ProductImage[];
  productName: string;
}

export function ProductImageGallery({ images, productName }: ProductImageGalleryProps) {
  const [current, setCurrent] = useState(0);
  const [zoomed, setZoomed] = useState(false);

  if (!images.length) {
    return (
      <div className="aspect-square rounded-2xl bg-gray-100 flex items-center justify-center text-6xl">
        🛍️
      </div>
    );
  }

  const mainImage = images[current];

  return (
    <div className="space-y-3">
      {/* Main image */}
      <div
        className="relative aspect-square overflow-hidden rounded-2xl bg-white cursor-zoom-in"
        onClick={() => setZoomed(true)}
      >
        <Image
          src={mainImage.image_url}
          alt={`${productName} — image ${current + 1}`}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-contain transition-transform duration-300"
          priority={current === 0}
        />
        <button className="absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 shadow hover:bg-white">
          <ZoomIn className="h-4 w-4 text-gray-600" />
        </button>
        {images.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); setCurrent((c) => (c - 1 + images.length) % images.length); }}
              className="absolute left-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 shadow"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setCurrent((c) => (c + 1) % images.length); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 shadow"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setCurrent(i)}
              className={cn(
                "relative h-16 w-16 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all",
                i === current ? "border-brand-500" : "border-gray-200 hover:border-gray-300"
              )}
            >
              <Image
                src={img.thumbnail_url ?? img.image_url}
                alt={`${productName} thumbnail ${i + 1}`}
                fill
                sizes="64px"
                className="object-contain"
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {zoomed && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setZoomed(false)}
        >
          <div className="relative max-h-full max-w-3xl w-full aspect-square">
            <Image
              src={mainImage.image_url}
              alt={productName}
              fill
              className="object-contain"
              sizes="100vw"
            />
          </div>
        </div>
      )}
    </div>
  );
}
