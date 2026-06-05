"use client";

import Link from "next/link";
import Image from "next/image";
import { Star, ArrowRight } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "swiper/css";
import "swiper/css/navigation";
import type { ProductCard } from "@/types";

const typingStyles = `
  @keyframes typing {
    0% {
      width: 0;
    }
    40% {
      width: 100%;
    }
    60% {
      width: 100%;
    }
    100% {
      width: 0;
    }
  }

  .typing-text {
    overflow: hidden;
    white-space: nowrap;
    animation: typing 6s steps(20, end) infinite;
  }
`;


interface Props {
  products: ProductCard[];
  backgroundImage?: string;
}

export function DealsSection({ products, backgroundImage }: Props) {
  const dealProducts = products;

  if (!dealProducts.length) return null;

  const fmt = (n: number) => "₹" + n.toLocaleString("en-IN");

  return (
    <section className="relative w-full overflow-hidden" style={{ aspectRatio: "1440 / 500" }}>
      <style>{typingStyles}</style>
      {/* Background Image - Full Width */}
      <div className="absolute inset-0">
        {backgroundImage && (
          <Image
            src={backgroundImage}
            alt="Deal of the Day"
            fill
            className="object-cover object-center"
            priority
            quality={85}
          />
        )}
      </div>

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/20" />

      {/* Content Overlay - Left Side */}
      <div className="absolute inset-y-0 left-0 w-1/2 bg-white/98 flex flex-col overflow-hidden z-10">
        {/* Header - Top with View All Button */}
        <div className="px-4 sm:px-6 py-3 shrink-0 flex items-center justify-between">
          <div>
            <p className="text-base sm:text-lg font-bold uppercase tracking-widest text-white bg-red-500 px-4 sm:px-5 py-2 sm:py-3 rounded-r-lg inline-block -ml-4 sm:-ml-6">Hot Deal</p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white mt-2 typing-text">Deal of the Day</h2>
          </div>
          <Link
            href="/products?is_deal_of_day=true"
            className="flex items-center gap-1 rounded-lg border-2 border-brand-500 bg-white px-3 py-2 text-sm font-bold text-brand-600 transition-all hover:bg-brand-50 whitespace-nowrap"
          >
            View All <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Products Carousel - Centered with Swiper */}
        <div className="flex-1 overflow-hidden flex items-center justify-center pt-6 pl-6 sm:pt-8 sm:pl-8 relative">
          <Swiper
            modules={[Autoplay, Navigation]}
            autoplay={{
              delay: 5000,
              disableOnInteraction: false,
            }}
            navigation={{
              prevEl: ".swiper-button-prev-deal",
              nextEl: ".swiper-button-next-deal",
            }}
            slidesPerView={4}
            spaceBetween={16}
            className="w-full h-full"
            style={{ display: 'flex', alignItems: 'center', paddingLeft: '16px', paddingRight: '16px' }}
          >
            {dealProducts.map((p, idx) => (
              <SwiperSlide key={`deal-${idx}`} style={{ width: 'auto' }}>
                <Link
                  href={`/product/${p.slug}`}
                  className="w-40 sm:w-48 flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:shadow-lg hover:border-brand-300 group"
                >
                  {/* Image */}
                  <div className="relative aspect-square bg-gray-50 overflow-hidden">
                    {p.discount_percent > 0 && (
                      <span className="absolute left-2 top-2 z-10 rounded-full bg-red-500 px-2 py-1 text-xs font-black text-white">
                        -{Math.round(p.discount_percent)}%
                      </span>
                    )}
                    {p.primary_image ? (
                      <Image
                        src={p.thumbnail_image ?? p.primary_image}
                        alt={p.name}
                        fill
                        className="object-contain p-3 transition-transform duration-300 group-hover:scale-110"
                        sizes="200px"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-4xl">🛍️</div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex flex-1 flex-col p-3">
                    <p className="line-clamp-2 font-semibold text-gray-800 text-sm">{p.name}</p>
                    <div className="mt-auto pt-2 space-y-1">
                      <p className="font-black text-lg text-gray-900">{fmt(p.selling_price)}</p>
                      {p.mrp > p.selling_price && (
                        <p className="text-xs text-gray-400 line-through">{fmt(p.mrp)}</p>
                      )}
                    </div>
                    {p.rating !== undefined && (
                      <div className="flex items-center gap-1 mt-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${
                                i < Math.round(p.rating)
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-500">({p.review_count || 0})</span>
                      </div>
                    )}
                  </div>
                </Link>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Transparent Navigation Arrows */}
          <button className="swiper-button-prev-deal absolute left-2 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/30 hover:bg-white/50 transition-all text-white backdrop-blur-sm">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button className="swiper-button-next-deal absolute right-2 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/30 hover:bg-white/50 transition-all text-white backdrop-blur-sm">
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
