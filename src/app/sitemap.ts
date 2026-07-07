import type { MetadataRoute } from "next";
import { getSupabasePublicClient } from "@/lib/supabase/server";
import { SITE_URL } from "@/lib/seo";

// Har request pe fresh na banaye — har ghante regenerate (naye products crawl ho).
export const revalidate = 3600;

/**
 * Dynamic sitemap. Static marketing pages + saare active products + saari
 * active categories Supabase se pull karke ek hi XML me deta hai. Yahi Google
 * ko har page discover karne ka fastest signal hai.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: `${SITE_URL}/products`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/faq`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    { url: `${SITE_URL}/shipping`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/returns`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  try {
    const supabase = getSupabasePublicClient();

    const [{ data: products }, { data: categories }] = await Promise.all([
      supabase
        .from("products")
        .select("slug, updated_at, product_images(image_url, is_primary)")
        .eq("is_active", true)
        .order("updated_at", { ascending: false })
        .limit(50000),
      supabase
        .from("categories")
        .select("slug, updated_at")
        .eq("is_active", true),
    ]);

    type Row = { slug: string; updated_at: string | null };
    type ProductRow = Row & {
      product_images?: Array<{ image_url: string | null; is_primary: boolean }>;
    };

    const productRoutes: MetadataRoute.Sitemap = ((products ?? []) as ProductRow[]).map((p) => {
      // Image sitemap — Google Images me product photos index/rank hote hain.
      const imgs = (p.product_images ?? [])
        .slice()
        .sort((a, b) => (a.is_primary ? -1 : b.is_primary ? 1 : 0))
        .map((i) => i.image_url)
        .filter((u): u is string => Boolean(u));
      return {
        url: `${SITE_URL}/product/${p.slug}`,
        lastModified: p.updated_at ? new Date(p.updated_at) : now,
        changeFrequency: "weekly",
        priority: 0.8,
        ...(imgs.length ? { images: imgs.slice(0, 5) } : {}),
      };
    });

    const categoryRoutes: MetadataRoute.Sitemap = ((categories ?? []) as Row[]).map((c) => ({
      url: `${SITE_URL}/products?category=${c.slug}`,
      lastModified: c.updated_at ? new Date(c.updated_at) : now,
      changeFrequency: "daily",
      priority: 0.7,
    }));

    return [...staticRoutes, ...categoryRoutes, ...productRoutes];
  } catch {
    // DB down ho to bhi static routes wala valid sitemap serve ho.
    return staticRoutes;
  }
}
