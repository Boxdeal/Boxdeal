import type { Metadata } from "next";
import { Heart } from "lucide-react";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { WishlistGrid } from "./WishlistGrid";
import { EmptyState } from "@/components/shared/EmptyState";

export const metadata: Metadata = { title: "Wishlist" };

export default async function WishlistPage() {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  let serverWishlistIds: string[] = [];
  if (user) {
    const { data } = await supabase
      .from("wishlists")
      .select("product_id")
      .eq("user_id", user.id);
    serverWishlistIds = (data ?? []).map((w) => w.product_id);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">My Wishlist</h1>
      <WishlistGrid serverWishlistIds={serverWishlistIds} />
    </div>
  );
}
