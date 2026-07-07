import Link from "next/link";
import { Mail, Phone, MapPin, Instagram, Facebook, Send } from "lucide-react";

const social = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/smartaccessorieshub_",
    icon: Instagram,
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/p/Smart-Accessories-Hub-100092980800251/",
    icon: Facebook,
  },
  {
    label: "Telegram",
    href: "https://t.me/smartaccessorieshub",
    icon: Send,
  },
];

// Backet — hamara in-house brand (BoxDeal store se alag entity).
const backetSocial = [
  { label: "Backet on Instagram", href: "https://www.instagram.com/backet_india/", icon: Instagram },
  { label: "Backet on Facebook", href: "https://www.facebook.com/backetindia001/", icon: Facebook },
];

const links = {
  shop: [
    { label: "All Products", href: "/products" },
    { label: "Deals of the Day", href: "/products?is_deal_of_day=true" },
    { label: "New Arrivals", href: "/products?sort=newest" },
    { label: "Top Rated", href: "/products?sort=rating" },
  ],
  account: [
    { label: "My Account", href: "/account" },
    { label: "My Orders", href: "/orders" },
    { label: "Wishlist", href: "/wishlist" },
    { label: "Track Order", href: "/orders#track" },
  ],
  help: [
    { label: "About Us", href: "/about" },
    { label: "FAQ", href: "/faq" },
    { label: "Return Policy", href: "/returns" },
    { label: "Shipping Info", href: "/shipping" },
    { label: "Contact Us", href: "/contact" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-2">
            <span className="text-2xl font-black text-white">
              Box<span className="text-brand-400">Deal</span>
            </span>
            <p className="mt-3 text-sm leading-relaxed text-gray-400">
              India&apos;s fastest growing e-commerce platform. Quality products,
              lightning-fast delivery, and unbeatable prices.
            </p>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-brand-400 flex-shrink-0" />
                <span>admin@boxdeal.in</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-brand-400 flex-shrink-0" />
                <span>+91 93551 51182</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-brand-400 flex-shrink-0 mt-0.5" />
                <span>15A/59 Karol Bagh, Delhi - 110005</span>
              </div>
            </div>
            <div className="-ml-2.5 mt-5 flex gap-2">
              {social.map((s) => {
                const Icon = s.icon;
                return (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-800 text-gray-300 transition-colors hover:bg-brand-500 hover:text-white"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                );
              })}
            </div>

            {/* Backet — in-house brand */}
            <div className="mt-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Our in-house brand
              </p>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-sm font-bold text-white">Backet</span>
                <div className="flex gap-2">
                  {backetSocial.map((s) => {
                    const Icon = s.icon;
                    return (
                      <a
                        key={s.label}
                        href={s.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={s.label}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-800 text-gray-300 transition-colors hover:bg-brand-500 hover:text-white"
                      >
                        <Icon className="h-3.5 w-3.5" />
                      </a>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h3 className="mb-3 font-semibold text-white">Shop</h3>
            <ul className="space-y-2 text-sm">
              {links.shop.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <h3 className="mb-3 font-semibold text-white">Account</h3>
            <ul className="space-y-2 text-sm">
              {links.account.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <h3 className="mb-3 font-semibold text-white">Help</h3>
            <ul className="space-y-2 text-sm">
              {links.help.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-gray-800 pt-8 text-sm sm:flex-row">
          <p className="text-gray-500">
            © 2026 BoxDeal. All rights reserved.
          </p>
          <div className="flex gap-4 text-gray-500">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
