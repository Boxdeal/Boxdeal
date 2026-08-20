"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, ShoppingBag, Package, Users,
  Tag, Ticket, BarChart3, LogOut, Sparkles, TrendingUp, XCircle, Ban,
} from "lucide-react";
import { cn } from "@/lib/utils/helpers";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useAppDispatch } from "@/store/hooks";
import { logout } from "@/store/slices/authSlice";

const navItems = [
  { label: "Dashboard",   href: "/admin",            icon: LayoutDashboard },
  { label: "Orders",      href: "/admin/orders",     icon: Package },
  { label: "Failed Orders", href: "/admin/dashboard/failed", icon: XCircle },
  { label: "Cancelled Orders", href: "/admin/dashboard/cancelled", icon: Ban },
  { label: "Product Sales", href: "/admin/dashboard/products", icon: TrendingUp },
  { label: "Products",    href: "/admin/products",   icon: ShoppingBag },
  { label: "Featured & Deals", href: "/admin/featured", icon: Sparkles },
  { label: "Categories",  href: "/admin/categories", icon: Tag },
  { label: "Customers",   href: "/admin/customers",  icon: Users },
  { label: "Coupons",     href: "/admin/coupons",    icon: Ticket },
  { label: "Analytics",   href: "/admin/analytics",  icon: BarChart3 },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const dispatch = useAppDispatch();

  async function handleLogout() {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    dispatch(logout());
    window.location.href = "/login";
  }

  return (
    <aside className="flex h-screen w-56 flex-shrink-0 flex-col border-r border-gray-100 bg-white">
      <div className="border-b p-5">
        <span className="text-lg font-black">
          Box<span className="text-brand-500">Deal</span>
        </span>
        <p className="text-xs text-gray-500 mt-0.5">Admin Panel</p>
      </div>

      <nav className="flex-1 overflow-y-auto p-2">
        {navItems.map((item) => {
          const active =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-brand-50 text-brand-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <item.icon className={cn("h-4 w-4 flex-shrink-0", active ? "text-brand-600" : "text-gray-400")} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-2">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
