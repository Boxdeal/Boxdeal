"use client";

import Link from "next/link";
import { X, User, ShoppingBag, Heart, Home, Tag } from "lucide-react";
import { useAppDispatch, useUI, useUser } from "@/store/hooks";
import { closeMobileMenu } from "@/store/slices/uiSlice";
import { SearchBar } from "@/components/shared/SearchBar";
import { cn } from "@/lib/utils/helpers";

const navItems = [
  { label: "Home",           href: "/",                       icon: Home },
  { label: "All Products",   href: "/products",               icon: ShoppingBag },
  { label: "Deals",          href: "/products?is_deal_of_day=true", icon: Tag },
  { label: "Wishlist",       href: "/wishlist",               icon: Heart },
];

export function MobileMenu() {
  const dispatch = useAppDispatch();
  const { mobileMenuOpen } = useUI();
  const user = useUser();

  function close() {
    dispatch(closeMobileMenu());
  }

  return (
    <>
      {/* Overlay */}
      <div
        className={cn(
          "fixed inset-0 z-50 bg-black/40 transition-opacity duration-300 lg:hidden",
          mobileMenuOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={close}
      />

      {/* Drawer */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-xl transition-transform duration-300 lg:hidden flex flex-col",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between border-b p-4">
          <span className="text-lg font-black">
            Box<span className="text-brand-500">Deal</span>
          </span>
          <button
            onClick={close}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4">
          <SearchBar onClose={close} />
        </div>

        <nav className="flex-1 overflow-y-auto px-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={close}
              className="flex items-center gap-3 rounded-lg px-3 py-3 text-gray-700 hover:bg-gray-50 hover:text-brand-600 transition-colors"
            >
              <item.icon className="h-5 w-5 flex-shrink-0 text-gray-400" />
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="border-t p-4">
          <Link
            href={user ? "/account" : "/login"}
            onClick={close}
            className="flex items-center gap-3 rounded-lg px-3 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <User className="h-5 w-5 text-gray-400" />
            <span className="font-medium">{user ? "My Account" : "Sign In"}</span>
          </Link>
        </div>
      </aside>
    </>
  );
}
