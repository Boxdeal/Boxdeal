"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import { ChevronLeft, ChevronRight, ArrowRight, Tag, Zap, ShieldCheck, Package } from "lucide-react";
import { cn } from "@/lib/utils/helpers";
import type { Banner } from "@/types";

const FEATURES = [
  { icon: Tag,         label: "Up to 70%", sub: "OFF Deals"  },
  { icon: Zap,         label: "1000+",     sub: "Products"   },
  { icon: ShieldCheck, label: "Genuine",   sub: "Products"   },
  { icon: Package,     label: "Top",       sub: "Brands"     },
];

interface Props { banners: Banner[] }

export function HeroBanner({ banners }: Props) {
  const [idx, setIdx]         = useState(0);
  const [animKey, setAnimKey] = useState(0);
  const timer                 = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  function advance(next: number) {
    setIdx(next);
    setAnimKey((k) => k + 1);
  }

  function resetTimer() {
    clearInterval(timer.current);
    if (banners.length < 2) return;
    timer.current = setInterval(() => {
      setIdx((i) => {
        setAnimKey((k) => k + 1);
        return (i + 1) % banners.length;
      });
    }, 5000);
  }

  useEffect(() => {
    resetTimer();
    return () => clearInterval(timer.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [banners.length]);

  if (!banners.length) return null;

  const b     = banners[idx];
  const light = b.text_theme === "light";

  function prev() { advance((idx - 1 + banners.length) % banners.length); resetTimer(); }
  function next() { advance((idx + 1) % banners.length); resetTimer(); }

  return (
    <section className="relative overflow-hidden">

      {/* Image container — aspect ratio keeps full image visible on all screens */}
      <div
        className="relative w-full bg-gray-50"
        style={{ aspectRatio: "1440 / 500" }}
      >
        {/* All images preloaded — opacity switch = instant slide change */}
        {banners.map((banner, i) => (
          <Image
            key={banner.id}
            src={banner.image_url}
            alt={banner.title}
            fill
            priority={i === 0}
            className={cn(
              "object-contain object-center transition-opacity duration-500",
              i === idx ? "opacity-100" : "opacity-0",
            )}
            sizes="100vw"
            quality={85}
          />
        ))}

        {/* Text overlay — always left 35%, right 65% reserved for product images */}
        <div className="absolute inset-0 flex items-center pl-4 sm:pl-10 lg:pl-16">
          <div key={animKey} className="flex w-[35%] flex-col">

            {/* Accent line */}
            <div className={cn(
              "mb-1 h-[2px] w-5 rounded-full sm:mb-2.5 sm:h-[3px] sm:w-10 lg:w-14",
              "animate-banner-in [animation-delay:0ms]",
              light ? "bg-white" : "bg-brand-500",
            )} />

            {/* Badge */}
            {b.badge && (
              <span className={cn(
                "mb-1 hidden items-center gap-1 self-start sm:mb-2 sm:flex",
                "animate-banner-in [animation-delay:60ms]",
                light ? "text-white/70" : "text-brand-500",
              )}
              style={{ fontSize: "clamp(0.5rem, 0.7vw, 0.7rem)", letterSpacing: "0.15em" }}
              >
                <svg viewBox="0 0 8 8" className="h-1.5 w-1.5 flex-shrink-0 fill-current">
                  <path d="M4 0L8 4L4 8L0 4Z" />
                </svg>
                <span className="truncate font-bold uppercase">{b.badge}</span>
              </span>
            )}

            {/* Title */}
            <h2
              className={cn(
                "mb-1 font-black uppercase leading-[1.1] tracking-tight",
                "animate-banner-in [animation-delay:120ms]",
                "whitespace-pre-line break-words",
                light ? "text-white" : "text-gray-900",
              )}
              style={{ fontSize: "clamp(0.6rem, 2.6vw, 2.9rem)" }}
            >
              {b.title}
            </h2>

            {/* Mid heading — between title and subtitle */}
            {b.mid_heading && (
              <p
                className={cn(
                  "mb-1 hidden font-semibold leading-snug sm:mb-2 sm:block",
                  "animate-banner-in [animation-delay:180ms]",
                  light ? "text-white/90" : "text-brand-500",
                )}
                style={{ fontSize: "clamp(0.6rem, 1.3vw, 1.35rem)" }}
              >
                {b.mid_heading}
              </p>
            )}

            {/* Subtitle */}
            {b.subtitle && (
              <p
                className={cn(
                  "mb-2 hidden leading-relaxed sm:mb-3 sm:block lg:mb-4",
                  "animate-banner-in [animation-delay:240ms]",
                  light ? "text-white/80" : "text-gray-600",
                )}
                style={{ fontSize: "clamp(0.6rem, 0.9vw, 0.95rem)" }}
              >
                {b.subtitle}
              </p>
            )}

            {/* CTA Button */}
            <Link
              href={b.cta_link}
              className={cn(
                "group inline-flex items-center self-start rounded-md font-bold uppercase tracking-wider shadow-md",
                "transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0",
                "animate-banner-in [animation-delay:280ms]",
                light
                  ? "bg-white text-gray-900 hover:bg-gray-50"
                  : "bg-brand-500 text-white hover:bg-brand-600",
              )}
              style={{
                fontSize:   "clamp(7px, 0.75vw, 12px)",
                gap:        "clamp(4px, 0.4vw, 8px)",
                padding:    "clamp(5px, 0.6vw, 12px) clamp(8px, 1.2vw, 28px)",
                borderRadius:"clamp(6px, 0.6vw, 12px)",
              }}
            >
              {b.cta_text}
              <ArrowRight
                className="flex-shrink-0 transition-transform duration-300 group-hover:translate-x-1"
                style={{ width: "clamp(8px, 0.9vw, 14px)", height: "clamp(8px, 0.9vw, 14px)" }}
              />
            </Link>

            {/* Feature strip — compact */}
            <div className={cn(
              "mt-2 hidden overflow-hidden rounded-lg border sm:mt-3 sm:flex lg:mt-4",
              "w-full",
              "animate-banner-in [animation-delay:380ms]",
              light
                ? "border-white/25 bg-white/15 backdrop-blur-sm"
                : "border-gray-200 bg-white/80 shadow-sm backdrop-blur-sm",
            )}>
              {FEATURES.map(({ icon: Icon, label, sub }, i) => (
                <div
                  key={label + sub}
                  className={cn(
                    "flex flex-1 flex-col items-center justify-center gap-0.5 py-1.5 sm:py-2",
                    i !== 0 && (light ? "border-l border-white/20" : "border-l border-gray-200"),
                  )}
                >
                  <Icon
                    className={cn(
                      "h-3 w-3 sm:h-4 sm:w-4",
                      light ? "text-white/80" : "text-brand-500",
                    )}
                    strokeWidth={1.5}
                  />
                  <span
                    className={cn(
                      "text-center font-semibold leading-tight",
                      "text-[7px] sm:text-[9px] lg:text-[10px]",
                      light ? "text-white/80" : "text-gray-700",
                    )}
                  >
                    {label}<br />{sub}
                  </span>
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* Prev / Next arrows */}
        {banners.length > 1 && (
          <>
            <button aria-label="Previous banner" onClick={prev}
              className="absolute left-1.5 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 shadow transition hover:bg-white sm:h-8 sm:w-8">
              <ChevronLeft className="h-3 w-3 text-gray-700 sm:h-4 sm:w-4" />
            </button>
            <button aria-label="Next banner" onClick={next}
              className="absolute right-1.5 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 shadow transition hover:bg-white sm:h-8 sm:w-8">
              <ChevronRight className="h-3 w-3 text-gray-700 sm:h-4 sm:w-4" />
            </button>
          </>
        )}

        {/* Dot indicators */}
        {banners.length > 1 && (
          <div className="absolute bottom-1.5 left-1/2 flex -translate-x-1/2 gap-1 sm:bottom-3 sm:gap-1.5">
            {banners.map((_, i) => (
              <button
                key={i}
                aria-label={`Go to banner ${i + 1}`}
                onClick={() => { advance(i); resetTimer(); }}
                className={cn(
                  "rounded-full transition-all duration-300",
                  i === idx ? "h-1.5 w-4 bg-white sm:h-2 sm:w-6" : "h-1.5 w-1.5 bg-white/55 sm:h-2 sm:w-2",
                )}
              />
            ))}
          </div>
        )}

      </div>
    </section>
  );
}
