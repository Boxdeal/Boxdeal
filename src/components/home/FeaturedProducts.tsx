"use client";

import Link from "next/link";
import type { ProductCard } from "@/types";
import { ProductCard as ProductCardComponent } from "@/components/product/ProductCard";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import styles from "./FeaturedProducts.module.css";

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
      <Swiper
        modules={[Autoplay, Pagination]}
        spaceBetween={12}
        breakpoints={{
          0: { slidesPerView: 2, slidesPerGroup: 1 },
          640: { slidesPerView: 3, slidesPerGroup: 1 },
          1024: { slidesPerView: 4, slidesPerGroup: 1 },
          1280: { slidesPerView: 5, slidesPerGroup: 1 },
        }}
        autoplay={{ delay: 2000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        className={styles.swiperContainer}
      >
        {products.slice(0, 5).map((p) => (
          <SwiperSlide key={p.id} className="!h-auto">
            <div className="h-80 flex flex-col">
              <ProductCardComponent product={p} />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
