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

  @keyframes scroll {
    0% {
      transform: translateX(0);
    }
    100% {
      transform: translateX(calc(-200px * 5));
    }
  }

  .marquee-container {
    overflow: hidden;
    background: linear-gradient(135deg, #f8f9fa 0%, #fff 100%);
    padding: 20px 0;
  }

  .marquee-track {
    display: flex;
    gap: 20px;
    animation: scroll 20s linear infinite;
  }

  .marquee-track:hover {
    animation-play-state: paused;
  }

  .marquee-container:active .marquee-track {
    animation-play-state: paused;
  }

  .marquee-item {
    flex: 0 0 auto;
    width: 200px;
  }

  @media (max-width: 899px) {
    .deals-overlay {
      display: none;
    }
  }

  @media (min-width: 900px) {
    .marquee-below {
      display: none;
    }

    .deals-overlay > div:nth-child(3) > div:nth-child(1) > p {
      font-size: clamp(0.7rem, 1.2vw, 1rem);
      padding: clamp(0.4rem, 0.6vw, 0.75rem) clamp(0.6rem, 0.9vw, 1.25rem);
    }

    .deals-overlay > div:nth-child(3) > div:nth-child(1) > h2 {
      font-size: clamp(0.85rem, 2vw, 1.1rem);
      margin-top: clamp(0.3rem, 0.5vw, 0.5rem);
    }

    @media (max-width: 1199px) {
      .deals-overlay > div:nth-child(3) > div:nth-child(1) {
        padding-top: 0;
        padding-bottom: 0;
      }

      .deals-overlay > div:nth-child(3) > div:nth-child(1) > h2 {
        font-size: clamp(0.45rem, 0.9vw, 0.6rem);
        margin-top: 0;
        margin-bottom: 0;
      }

      .deals-overlay > div:nth-child(3) > div:nth-child(1) > p {
        font-size: clamp(0.55rem, 0.9vw, 0.7rem);
        padding-top: 0;
        padding-bottom: 0;
        margin: 0;
      }
    }

    @media (min-width: 1200px) {
      .deals-overlay > div:nth-child(3) > div:nth-child(1) > h2 {
        font-size: clamp(0.9rem, 1.5vw, 1rem);
      }
    }

    .deals-overlay .swiper-slide > a {
      width: clamp(130px, calc(100vw * 0.095), 180px);
    }

    .deals-overlay .swiper-slide a .relative {
      padding: clamp(0.35rem, 0.8vw, 0.6rem);
    }

    .deals-overlay .swiper-slide p {
      font-size: clamp(0.6rem, 1.1vw, 0.8rem);
      line-height: clamp(1rem, 1.4vw, 1.2rem);
    }

    .deals-overlay .swiper-slide .font-black {
      font-size: clamp(0.8rem, 1.5vw, 1rem);
    }

    .deals-overlay .swiper-slide .h-3 {
      width: clamp(0.6rem, 0.7vw, 0.75rem);
      height: clamp(0.6rem, 0.7vw, 0.75rem);
    }

    .deals-overlay .swiper-slide .text-xs {
      font-size: clamp(0.55rem, 0.9vw, 0.75rem);
    }

    @media (max-width: 1199px) {
      .deals-overlay .swiper-slide .flex.items-center.gap-1.mt-2 {
        display: none;
      }

      .deals-overlay .swiper-slide a .relative {
        aspect-ratio: 1 / 0.85;
        padding: clamp(0.25rem, 0.6vw, 0.4rem);
      }

      .deals-overlay .swiper-slide a .relative img {
        padding: clamp(0.2rem, 0.5vw, 0.3rem);
      }
    }

    @media (min-width: 1200px) {
      .deals-overlay .swiper-slide > a {
        padding-top: clamp(0.5rem, 1.2vw, 1rem);
      }
    }

    @media (min-width: 1210px) {
      .deals-overlay .swiper-slide > a {
        width: clamp(120px, calc(100vw * 0.08), 155px);
      }

      .deals-overlay .swiper-slide a .relative {
        padding: clamp(0.3rem, 0.65vw, 0.5rem);
      }

      .deals-overlay .swiper-slide p {
        font-size: clamp(0.55rem, 0.9vw, 0.7rem);
        line-height: clamp(0.9rem, 1.1vw, 1rem);
      }

      .deals-overlay .swiper-slide .font-black {
        font-size: clamp(0.75rem, 1.2vw, 0.9rem);
      }

      .deals-overlay .swiper-slide .h-3 {
        width: clamp(0.55rem, 0.6vw, 0.7rem);
        height: clamp(0.55rem, 0.6vw, 0.7rem);
      }

      .deals-overlay .swiper-slide .text-xs {
        font-size: clamp(0.5rem, 0.7vw, 0.65rem);
      }
    }
  }

  .mobile-deal-title {
    font-size: clamp(0.875rem, 4vw, 2.75rem);
    padding-left: clamp(0.5rem, 2.5vw, 1.5rem);
  }

  .mobile-deal-badge {
    font-size: clamp(0.625rem, 1.5vw, 0.875rem);
    padding-left: clamp(0.7rem, 2vw, 0.75rem);
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
    <>
      <style>{typingStyles}</style>

      {/* Desktop Layout - With Overlay (visible on 900px+) */}
      <section className="deals-overlay relative w-full overflow-hidden" style={{ aspectRatio: "1440 / 500" }}>
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
          <div className="flex-1 overflow-hidden flex items-center justify-center pl-6 sm:pl-8 relative" style={{ paddingTop: 'clamp(0.5rem, 1vw, 1rem)' }}>
            <Swiper
              modules={[Autoplay, Navigation]}
              autoplay={{
                delay: 3000,
                disableOnInteraction: false,
              }}
              navigation={{
                prevEl: ".swiper-button-prev-deal",
                nextEl: ".swiper-button-next-deal",
              }}
              breakpoints={{
                900: {
                  slidesPerView: 3,
                },
                1200: {
                  slidesPerView: 4,
                },
              }}
              spaceBetween={16}
              className="w-full h-full"
              style={{ display: 'flex', alignItems: 'center', paddingLeft: '16px', paddingRight: '16px' }}
            >
              {dealProducts.map((p, idx) => (
                <SwiperSlide key={`deal-${idx}`} style={{ width: 'auto' }}>
                  <Link
                    href={`/product/${p.slug}`}
                    style={{ width: 'clamp(130px, calc(100vw * 0.095), 180px)' }}
                    className="flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:shadow-lg hover:border-brand-300 group"
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
                          loading="lazy"
                          quality={80}
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

      {/* Mobile Layout - Marquee Only (visible below 900px) */}
      <div className="marquee-below w-full">
        {/* Background Image with full width on mobile */}
        <div className="relative w-full" style={{ aspectRatio: "1440 / 500" }}>
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
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-black/20" />

          {/* Text Overlay - Left Side, Middle */}
          <div className="absolute inset-y-0 left-0 flex flex-col justify-center items-start z-10 marquee-below:pl-2">
            <p className="mobile-deal-badge font-bold uppercase tracking-widest text-white bg-red-500 px-2 sm:px-3 md:px-5 py-1 sm:py-2 md:py-3 rounded-r-lg inline-block -ml-2">Hot Deal</p>
            <h2 className="mobile-deal-title font-black text-white mt-1 sm:mt-2 typing-text">Deal of the Day</h2>
          </div>
        </div>

        {/* Marquee Section - Products Below */}
        <div className="marquee-container">
          {/* Header with View All Button */}
          <div className="px-4 sm:px-6 py-3 flex items-center justify-between bg-gradient-to-b from-gray-50 to-white">
            <div>
              <p className="text-xs sm:text-sm font-bold uppercase tracking-widest text-red-500">Hot Deal</p>
              <h3 className="text-sm sm:text-base font-black text-gray-900">Deal of the Day</h3>
            </div>
            <Link
              href="/products?is_deal_of_day=true"
              className="flex items-center gap-1 rounded-lg border-2 border-brand-500 bg-white px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm font-bold text-brand-600 transition-all hover:bg-brand-50 whitespace-nowrap"
            >
              View All <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
            </Link>
          </div>

          {/* Marquee Track */}
          <div className="marquee-track">
            {/* Show deal products duplicated 2 times for seamless loop + performance */}
            {Array(2).fill(dealProducts).flat().map((p, idx) => (
              <div key={`marquee-${idx}`} className="marquee-item">
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
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
