import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { MapPin, Package, Heart, Settings } from "lucide-react";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import Link from "next/link";

export const metadata: Metadata = { title: "My Account", robots: { index: false, follow: false } };

export default async function AccountPage() {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  const { count: orderCount } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  const menuItems = [
    { icon: Package, label: "My Orders",    href: "/orders",   badge: orderCount },
    { icon: MapPin,  label: "Addresses",    href: "/account/addresses" },
    { icon: Heart,   label: "Wishlist",     href: "/wishlist" },
    { icon: Settings, label: "Settings",    href: "/account/settings" },
  ];

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">My Account</h1>

      {/* Profile card */}
      <Link href="/account/profile" className="rounded-2xl border border-gray-100 bg-white p-6 flex items-center gap-4 hover:bg-gray-50 transition-colors">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 text-2xl font-bold text-brand-700">
          {profile?.full_name?.charAt(0)?.toUpperCase() ?? user.email?.charAt(0)?.toUpperCase() ?? "U"}
        </div>
        <div className="flex-1">
          <p className="text-lg font-bold text-gray-900">
            {profile?.full_name ?? "Welcome!"}
          </p>
          <p className="text-sm text-gray-500">{user.email}</p>
          {profile?.phone && (
            <p className="text-sm text-gray-500">{profile.phone}</p>
          )}
        </div>
        <span className="text-gray-300">›</span>
      </Link>

      {/* Menu */}
      <div className="rounded-2xl border border-gray-100 bg-white overflow-hidden divide-y divide-gray-100">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <item.icon className="h-5 w-5 text-gray-400" />
              <span className="font-medium text-gray-700">{item.label}</span>
            </div>
            <div className="flex items-center gap-2">
              {item.badge ? (
                <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-bold text-brand-700">
                  {item.badge}
                </span>
              ) : null}
              <span className="text-gray-300">›</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
