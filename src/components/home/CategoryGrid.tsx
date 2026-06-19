import Image from "next/image";
import Link from "next/link";
import {
  ShoppingBag, Laptop, Monitor, Gamepad2, Smartphone,
  Keyboard, Tv, Mouse, Printer, Wifi,
} from "lucide-react";
import type { Category } from "@/types";
import type { ComponentType, SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { strokeWidth?: number | string };
type IconComponent = ComponentType<IconProps>;

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;

function bucketUrl(filename: string) {
  return `${SUPABASE_URL}/storage/v1/object/public/shop-by-category/${filename}`;
}

// Slugs that have images in the shop-by-category bucket
const SLUG_IMAGE: Record<string, string> = {
  cables:                  "cables.jpg",
  cable:                   "cables.jpg",
  "camera-accessories":    "camera-accessories.jpg",
  cameras:                 "camera-accessories.jpg",
  charger:                 "charger.jpg",
  chargers:                "charger.jpg",
  "computer-accessories":  "computer-accessories.jpg",
  earbuds:                 "earbuds.jpg",
  headphone:               "headphone.jpg",
  headphones:              "headphone.jpg",
  neckband:                "neckband.jpg",
  "ringlight-and-tripods": "ringlights-and-tripods.jpg",
  "smart-watches":         "smart-watches.jpg",
  smartwatches:            "smart-watches.jpg",
  speaker:                 "speaker.jpg",
  speakers:                "speaker.jpg",
  tablet:                  "tablet.jpg",
  tablets:                 "tablet.jpg",
};

// Fallback icons for slugs without bucket images
const SLUG_ICON: Record<string, IconComponent> = {
  laptop:               Laptop,
  laptops:              Laptop,
  monitor:              Monitor,
  monitors:             Monitor,
  gaming:               Gamepad2,
  smartphone:           Smartphone,
  smartphones:          Smartphone,
  mobiles:              Smartphone,
  "mobile-accessories": Smartphone,
  tv:                   Tv,
  keyboards:            Keyboard,
  mice:                 Mouse,
  printers:             Printer,
  networking:           Wifi,
};

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

        <div className="grid grid-cols-4 gap-3 pb-1 lg:grid-cols-[repeat(auto-fit,minmax(90px,1fr))] lg:overflow-visible lg:pb-0">
          {categories.map((cat) => {
            const imageFile = SLUG_IMAGE[cat.slug];
            const FallbackIcon = SLUG_ICON[cat.slug] ?? ShoppingBag;

            return (
              <Link
                key={cat.id}
                href={`/products?category=${cat.slug}`}
                className="group flex flex-shrink-0 flex-col items-center gap-2.5 rounded-xl border border-gray-100 bg-white px-3 py-4 text-center shadow-sm transition-all duration-200 hover:border-brand-200 hover:shadow-md hover:-translate-y-1 lg:flex-shrink"
              >
                <div className={`flex h-10 sm:h-12 w-10 sm:w-12 items-center justify-center rounded-xl overflow-hidden transition-all duration-200 ${
                  imageFile
                    ? "bg-orange-50 group-hover:bg-orange-100"
                    : "bg-orange-50 group-hover:bg-brand-500"
                }`}>
                  {imageFile ? (
                    <Image
                      src={bucketUrl(imageFile)}
                      alt={cat.name}
                      width={48}
                      height={48}
                      sizes="48px"
                      className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-110"
                    />
                  ) : (
                    <FallbackIcon
                      className="h-5 sm:h-6 w-5 sm:w-6 text-brand-500 transition-colors duration-200 group-hover:text-white"
                      strokeWidth={1.5}
                    />
                  )}
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
