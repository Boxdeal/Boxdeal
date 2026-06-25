import Link from "next/link";
import { Mail, Phone } from "lucide-react";

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
                <span>support@boxdeal.in</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-brand-400 flex-shrink-0" />
                <span>+91 98765 43210</span>
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
