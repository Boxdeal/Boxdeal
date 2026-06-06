import Link from "next/link";
import {
  Headphones, Zap, Tablet, Watch, Camera, Volume2,
  Laptop, Monitor, Gamepad2, Smartphone, Lightbulb,
  Music, Keyboard, Tv, Mouse, ShoppingBag, Cable, Printer, Wifi,
} from "lucide-react";
import type { Category } from "@/types";
import type { ComponentType, SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { strokeWidth?: number | string };
type IconComponent = ComponentType<IconProps>;

// AirPod-style earbuds — teardrop bud + stem
function EarbudsIcon({ className, strokeWidth = 1.5 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth}
      strokeLinecap="round" strokeLinejoin="round" className={className}>
      {/* Left earbud */}
      <path d="M8 4a3 3 0 0 0-3 3c0 1.5.8 2.7 1.8 3.5L7 15a1 1 0 0 0 2 0l.2-4.5A4 4 0 0 0 11 7a3 3 0 0 0-3-3z" />
      {/* Right earbud */}
      <path d="M16 4a3 3 0 0 1 3 3c0 1.5-.8 2.7-1.8 3.5L17 15a1 1 0 0 1-2 0l-.2-4.5A4 4 0 0 1 13 7a3 3 0 0 1 3-3z" />
    </svg>
  );
}


const SLUG_ICON: Record<string, IconComponent> = {
  earbuds:                EarbudsIcon,
  headphone:              Headphones,
  headphones:             Headphones,
  neckband:               Music,
  charger:                Zap,
  chargers:               Zap,
  cables:                 Cable,
  cable:                  Cable,
  speaker:                Volume2,
  speakers:               Volume2,
  tablet:                 Tablet,
  tablets:                Tablet,
  "smart-watches":        Watch,
  smartwatches:           Watch,
  "camera-accessories":   Camera,
  cameras:                Camera,
  "ringlight-and-tripods":Lightbulb,
  "computer-accessories": Laptop,
  smartphones:            Smartphone,
  mobiles:                Smartphone,
  laptops:                Laptop,
  gaming:                 Gamepad2,
  "mobile-accessories":   Smartphone,
  tv:                     Tv,
  monitors:               Monitor,
  keyboards:              Keyboard,
  mice:                   Mouse,
  printers:               Printer,
  networking:             Wifi,
  accessories:            ShoppingBag,
};

function getCategoryIcon(slug: string): IconComponent {
  return SLUG_ICON[slug] ?? ShoppingBag;
}

interface Props { categories: Category[] }

export function CategoryGrid({ categories }: Props) {
  if (!categories.length) return null;

  return (
    <section className="w-full bg-white py-8">
      <div className="px-6 sm:px-10 lg:px-16">

        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Shop by Category</h2>
          <Link href="/products" className="text-sm font-semibold text-brand-500 hover:text-brand-600 transition-colors">
            View all →
          </Link>
        </div>

        <div
          className="grid grid-cols-4 gap-3 pb-1 lg:grid-cols-[repeat(auto-fit,minmax(90px,1fr))] lg:overflow-visible lg:pb-0"
        >
          {categories.map((cat) => {
            const Icon = getCategoryIcon(cat.slug);
            return (
              <Link
                key={cat.id}
                href={`/products?category=${cat.slug}`}
                className="group flex flex-shrink-0 flex-col items-center gap-2.5 rounded-xl border border-gray-100 bg-white px-3 py-4 text-center shadow-sm transition-all duration-200 hover:border-brand-200 hover:shadow-md hover:-translate-y-1 lg:flex-shrink"
              >
                <div className="flex h-10 sm:h-12 w-10 sm:w-12 items-center justify-center rounded-xl bg-orange-50 transition-colors duration-200 group-hover:bg-brand-500">
                  <Icon
                    className="h-5 sm:h-6 w-5 sm:w-6 text-brand-500 transition-colors duration-200 group-hover:text-white"
                    strokeWidth={1.5}
                  />
                </div>
                <span className="text-[8px] sm:text-[11px] font-semibold leading-tight text-gray-700 transition-colors duration-200 group-hover:text-brand-600">
                  {cat.name}
                </span>
              </Link>
            );
          })}
        </div>

      </div>
    </section>
  );
}
