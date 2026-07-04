/**
 * Central SEO configuration and structured-data (JSON-LD) helpers.
 *
 * Ye ek hi jagah hai jahan se site ka canonical domain, default social image,
 * aur saare Schema.org JSON-LD blocks generate hote hain. Har page yahi
 * helpers use karta hai taaki metadata consistent rahe.
 */

/**
 * Production canonical origin.
 * Vercel pe primary domain `www.boxdeal.in` hai aur apex `boxdeal.in` ussi par
 * 308 redirect karta hai — isliye canonical hamesha www wala hona chahiye,
 * warna har canonical ek redirecting URL ko point karega.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ??
  process.env.NEXT_PUBLIC_APP_URL ??
  "https://www.boxdeal.in"
)
  // localhost fallback ko production canonical ke roop me mat lo — SEO ke liye
  // hamesha asli serving domain (www) chahiye.
  .replace(/^http:\/\/localhost.*$/, "https://www.boxdeal.in")
  .replace(/\/+$/, "");

export const SITE_NAME = "BoxDeal";
export const SITE_DESCRIPTION =
  "Buy genuine open-box electronics & mobile accessories in like-new condition at 30–60% off retail. Backed by an 8-step quality check, brand warranty & BoxDeal Assurance. Fast delivery across India.";

/** Default social-share image (1200x630 recommended). */
export const DEFAULT_OG_IMAGE = `${SITE_URL}/about1.png`;

/** Relative path -> absolute canonical URL. */
export function absoluteUrl(path = "/"): string {
  if (/^https?:\/\//.test(path)) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Organization schema — sirf ek baar (root layout me) inject hota hai. */
export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/icon-512.png`,
    description: SITE_DESCRIPTION,
    contactPoint: {
      "@type": "ContactPoint",
      email: "support@boxdeal.in",
      contactType: "customer support",
      areaServed: "IN",
      availableLanguage: ["en", "hi"],
    },
  } as const;
}

/** WebSite schema with Sitelinks search box. */
export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  } as const;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

/** BreadcrumbList schema from an array of {label, href}. */
export function breadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.label,
      ...(item.href ? { item: absoluteUrl(item.href) } : {}),
    })),
  } as const;
}

interface ProductJsonLdInput {
  name: string;
  slug: string;
  description?: string | null;
  sku?: string | null;
  brand?: string | null;
  images?: string[];
  price: number;
  currency?: string;
  inStock: boolean;
  rating?: number | null;
  reviewCount?: number | null;
}

/** Product schema with Offer + optional AggregateRating (rich results ke liye). */
export function productJsonLd(p: ProductJsonLdInput) {
  const url = absoluteUrl(`/product/${p.slug}`);
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    url,
    ...(p.description ? { description: p.description } : {}),
    ...(p.sku ? { sku: p.sku } : {}),
    ...(p.brand ? { brand: { "@type": "Brand", name: p.brand } } : {}),
    ...(p.images && p.images.length ? { image: p.images } : {}),
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: p.currency ?? "INR",
      price: p.price.toFixed(2),
      availability: p.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@type": "Organization", name: SITE_NAME },
    },
  };
  if (p.rating && p.reviewCount && p.reviewCount > 0) {
    data.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: p.rating.toFixed(1),
      reviewCount: p.reviewCount,
      bestRating: "5",
      worstRating: "1",
    };
  }
  return data;
}

/** Reusable <script type="application/ld+json"> props builder. */
export function jsonLdScriptProps(data: unknown) {
  return {
    type: "application/ld+json",
    dangerouslySetInnerHTML: { __html: JSON.stringify(data) },
  } as const;
}
