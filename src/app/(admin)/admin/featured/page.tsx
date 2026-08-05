import type { Metadata } from "next";
import Link from "next/link";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { FeaturedDealsManager, type MerchProduct, type MerchFlag } from "@/components/admin/FeaturedDealsManager";

export const metadata: Metadata = { title: "Featured & Deals — Admin" };
export const dynamic = "force-dynamic";

const SELECT = `
  id, name, sku, selling_price, stock_quantity, is_active, is_featured, is_deal_of_day,
  product_images(image_url, thumbnail_url, is_primary)
`;

interface Props {
  searchParams: Promise<{ tab?: string }>;
}

export default async function FeaturedAndDealsPage({ searchParams }: Props) {
  const { tab } = await searchParams;
  const isDeals = tab === "deal-of-day";
  const flag: MerchFlag = isDeals ? "is_deal_of_day" : "is_featured";

  const supabase = await getSupabaseServerClient();

  // Match the homepage's ordering so this list mirrors what shoppers see.
  const [featuredRes, dealsRes] = await Promise.all([
    supabase.from("products").select(SELECT).eq("is_featured", true)
      .order("sold_count", { ascending: false }),
    supabase.from("products").select(SELECT).eq("is_deal_of_day", true)
      .order("created_at", { ascending: false }),
  ]);

  const featured = (featuredRes.data ?? []) as unknown as MerchProduct[];
  const deals = (dealsRes.data ?? []) as unknown as MerchProduct[];
  const products = isDeals ? deals : featured;

  const tabs = [
    { key: "featured",    label: "Featured Products", href: "/admin/featured",                    count: featured.length, active: !isDeals },
    { key: "deal-of-day", label: "Deal of the Day",   href: "/admin/featured?tab=deal-of-day",    count: deals.length,    active: isDeals  },
  ];

  return (
    <div className="space-y-4 p-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Featured &amp; Deals</h1>
        <p className="mt-0.5 text-sm text-gray-500">
          Pick the products that appear in the homepage sections.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <Link
            key={t.key}
            href={t.href}
            className={`rounded-full px-4 py-1.5 text-sm font-medium ${
              t.active
                ? "bg-brand-500 text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {t.label} ({t.count})
          </Link>
        ))}
      </div>

      <FeaturedDealsManager key={flag} flag={flag} products={products} />
    </div>
  );
}
