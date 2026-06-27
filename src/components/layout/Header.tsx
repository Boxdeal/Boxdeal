"use client";

import { memo, useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ShoppingCart, Heart, User, Search, LogOut, Settings } from "lucide-react";
import { useAppDispatch, useAppSelector, useCartItemCount, useUser, useProfile } from "@/store/hooks";
import { openCart, openSearch } from "@/store/slices/uiSlice";
import { SearchBar } from "@/components/shared/SearchBar";
import { authService } from "@/services/auth";
import { toast } from "sonner";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/hooks";

function HeaderContent() {
  const dispatch      = useAppDispatch();
  const cartCount     = useCartItemCount();
  const reduxUser     = useUser();
  const profile       = useProfile();
  const wishlistCount = useAppSelector((s) => s.wishlist.productIds.length);
  const router        = useRouter();
  const pathname      = usePathname();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef   = useRef<HTMLDivElement>(null);
  const { user: authUser } = useAuth();

  // Use Supabase auth user if available, otherwise Redux
  const user = authUser || reduxUser;
  const firstName = profile?.full_name?.split(" ")[0] || authUser?.email?.split("@")[0];

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }

    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showDropdown]);

  async function handleLogout() {
    try {
      await authService.logout();
      toast.success("Logged out successfully!");
      router.push("/login");
      router.refresh();
    } catch (err) {
      toast.error("Failed to logout");
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 shadow-[0_2px_20px_rgba(0,0,0,0.06)] backdrop-blur-md">

      {/* Announcement bar */}
      <div className="bg-brand-500 py-1.5 text-center text-xs font-medium tracking-wide text-white">
        Flat delivery — capped at ₹200, no matter where you are &nbsp;🚀
      </div>

      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:gap-4 sm:py-3.5">

        {/* Logo */}
        <Link href="/" className="flex-shrink-0" prefetch={true}>
          <span className="text-xl font-black tracking-tight text-gray-900">
            Box<span className="text-brand-500">Deal</span>
          </span>
        </Link>

        {/* Desktop search */}
        <div className="hidden flex-1 lg:block lg:max-w-2xl">
          <SearchBar />
        </div>

        {/* Mobile search */}
        <button
          onClick={() => dispatch(openSearch())}
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl text-gray-600 transition-colors hover:bg-gray-100 lg:hidden"
          aria-label="Search"
        >
          <Search className="h-5 w-5" />
        </button>

        {/* Right actions */}
        <div className="ml-auto flex items-center gap-1">

          {/* Wishlist */}
          <Link
            href="/wishlist"
            className="relative flex h-9 w-9 items-center justify-center rounded-xl text-gray-600 transition-colors hover:bg-gray-100"
            aria-label="Wishlist"
            prefetch={true}
          >
            <Heart className="h-5 w-5" />
            {wishlistCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand-500 text-[9px] font-bold text-white">
                {wishlistCount > 9 ? "9+" : wishlistCount}
              </span>
            )}
          </Link>

          {/* Account */}
          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-50 text-xs font-bold text-brand-600">
                  {firstName?.[0]?.toUpperCase() ?? <User className="h-4 w-4" />}
                </div>
                <span className="hidden sm:inline">{firstName ?? "Account"}</span>
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white shadow-lg border border-gray-100 overflow-hidden z-50">
                  <Link
                    href="/account"
                    className="flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => setShowDropdown(false)}
                  >
                    <User className="h-4 w-4" />
                    My Account
                  </Link>
                  <Link
                    href="/account/settings"
                    className="flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 border-t border-gray-100"
                    onClick={() => setShowDropdown(false)}
                  >
                    <Settings className="h-4 w-4" />
                    Settings
                  </Link>
                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      handleLogout();
                    }}
                    className="flex w-full items-center gap-2 px-4 py-3 text-sm text-red-600 hover:bg-red-50 border-t border-gray-100"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href={`/login?redirect=${encodeURIComponent(pathname)}`}
              className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
              prefetch={true}
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-gray-500">
                <User className="h-4 w-4" />
              </div>
              <span className="hidden sm:inline">Sign in</span>
            </Link>
          )}

          {/* Cart */}
          <button
            onClick={() => dispatch(openCart())}
            className="relative ml-1 flex h-9 items-center gap-2 rounded-xl bg-brand-500 px-3 py-2 text-sm font-semibold text-white shadow-md shadow-brand-500/25 transition-all hover:bg-brand-600 hover:shadow-brand-500/40 active:scale-95"
            aria-label={`Cart (${cartCount} items)`}
          >
            <ShoppingCart className="h-4 w-4" />
            <span className="hidden sm:inline">Cart</span>
            {cartCount > 0 ? (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 text-xs font-black text-brand-600">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            ) : null}
          </button>

        </div>
      </div>
    </header>
  );
}

export const Header = memo(HeaderContent);
