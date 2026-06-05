import { Tag, Package, Shield, Headphones } from "lucide-react";

const items = [
  { icon: Tag,        title: "Exclusive Offers",  desc: "Up to 70% off daily deals"  },
  { icon: Package,    title: "1000+ Products",    desc: "Huge variety, top brands"    },
  { icon: Shield,     title: "Secure Payment",    desc: "100% safe & encrypted"       },
  { icon: Headphones, title: "24/7 Support",      desc: "Always here to help"         },
];

export function TrustStrip() {
  return (
    <div className="w-full border-y border-gray-100 bg-white">
      <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-y divide-gray-100 sm:grid-cols-4 sm:divide-y-0">
        {items.map((item) => (
          <div
            key={item.title}
            className="flex items-center gap-1.5 px-2 py-2.5 sm:justify-center sm:gap-2 sm:px-2 sm:py-3 md:gap-3 md:px-5 md:py-4 lg:gap-4 lg:px-8 lg:py-5"
          >
            <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-brand-50 sm:h-8 sm:w-8 md:h-9 md:w-9 lg:h-10 lg:w-10">
              <item.icon className="h-3.5 w-3.5 text-brand-500 sm:h-4 sm:w-4 lg:h-5 lg:w-5" />
            </div>
            <div className="min-w-0">
              <p className="truncate font-bold text-gray-900" style={{ fontSize: "clamp(9px, 1.4vw, 14px)" }}>{item.title}</p>
              <p className="truncate text-gray-500" style={{ fontSize: "clamp(8px, 1.1vw, 12px)" }}>{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
