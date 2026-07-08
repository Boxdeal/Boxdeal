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

/**
 * Brand ke official social/profile links. Knowledge-panel ("boxdeal" search pe
 * Google ke right side wala brand box) aur brand SERP ke liye ye `sameAs` me
 * jaate hain. Jo accounts aapke real ho, unhe yahan daalein — jitne zyada
 * verified profiles, utna strong brand signal.
 */
export const SOCIAL_LINKS: string[] = [
  "https://www.linkedin.com/company/boxdealindia",
  "https://www.instagram.com/smartaccessorieshub_",
  "https://www.facebook.com/p/Smart-Accessories-Hub-100092980800251/",
  "https://t.me/smartaccessorieshub",
];

/** Customer-support email — schema + contact pages me use hota hai. */
export const SUPPORT_EMAIL = "admin@boxdeal.in";

/**
 * In-house / featured brands — jinhe hum khud promote karna chahte hain.
 * Key = brand ka slug (jaisa DB brands.slug me hai). Ye info Brand schema me
 * jaati hai (sameAs = brand ke apne social profiles, description) taaki Google
 * "Backet" ko ek alag brand entity ke roop me samjhe aur "Backet <product>"
 * searches pe hamara page rank kare.
 */
export const BRANDS: Record<string, { name: string; sameAs: string[]; description: string }> = {
  backet: {
    name: "Backet",
    sameAs: [
      "https://www.instagram.com/backet_india/",
      "https://www.facebook.com/backetindia001/",
    ],
    description:
      "Backet is BoxDeal's in-house electronics brand — party speakers, audio and lifestyle gadgets built for bold sound, RGB lighting and unbeatable value. Available exclusively on BoxDeal.",
  },
};

/** Product/brand-page ke liye poora Brand entity (name + url + logo + sameAs). */
export function brandEntity(input?: {
  name?: string | null;
  slug?: string | null;
  logo?: string | null;
}) {
  if (!input?.name) return undefined;
  const known = input.slug ? BRANDS[input.slug.toLowerCase()] : undefined;
  return {
    "@type": "Brand",
    name: input.name,
    ...(input.slug ? { url: absoluteUrl(`/products?brand=${input.slug}`) } : {}),
    ...(input.logo ? { logo: input.logo } : {}),
    ...(known?.sameAs ? { sameAs: known.sameAs } : {}),
  };
}

/** Standalone Brand JSON-LD — brand landing page (/products?brand=slug) ke liye. */
export function brandJsonLd(slug: string, name: string, logo?: string | null) {
  const known = BRANDS[slug.toLowerCase()];
  return {
    "@context": "https://schema.org",
    "@type": "Brand",
    "@id": `${SITE_URL}/products?brand=${slug}#brand`,
    name,
    url: absoluteUrl(`/products?brand=${slug}`),
    ...(logo ? { logo } : {}),
    ...(known?.description ? { description: known.description } : {}),
    ...(known?.sameAs ? { sameAs: known.sameAs } : {}),
  } as const;
}

/**
 * Company founders — Organization schema ke `founder` me jaate hain (Person +
 * LinkedIn sameAs). Ye brand trust / E-E-A-T signal aur knowledge panel me
 * founders dikhane me madad karta hai.
 */
export const FOUNDERS: Array<{ name: string; linkedin: string; jobTitle: string }> = [
  { name: "Sahib Sahni", linkedin: "https://www.linkedin.com/in/sahib-sahni-80365514b/", jobTitle: "Co-Founder" },
  { name: "Mohit Bhasin", linkedin: "https://www.linkedin.com/in/mohit-bhasin-2a9745237/", jobTitle: "Co-Founder" },
];

/** Public business contact — Organization schema + footer me use hota hai. */
export const BUSINESS_PHONE = "+91 93551 51182";
export const BUSINESS_ADDRESS = {
  street: "15A/59 Karol Bagh",
  locality: "New Delhi",
  region: "Delhi",
  postalCode: "110005",
  country: "IN",
} as const;

/** Relative path -> absolute canonical URL. */
export function absoluteUrl(path = "/"): string {
  if (/^https?:\/\//.test(path)) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * Organization schema — sirf ek baar (root layout me) inject hota hai.
 * "Store" type + logo + sameAs se Google ka brand knowledge panel banta hai.
 */
export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "OnlineStore",
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    alternateName: "BoxDeal India",
    url: SITE_URL,
    logo: {
      "@type": "ImageObject",
      url: `${SITE_URL}/logo-512.png`,
      width: 512,
      height: 512,
    },
    image: DEFAULT_OG_IMAGE,
    description: SITE_DESCRIPTION,
    slogan: "Genuine open-box deals, up to 60% off.",
    email: SUPPORT_EMAIL,
    telephone: BUSINESS_PHONE,
    address: {
      "@type": "PostalAddress",
      streetAddress: BUSINESS_ADDRESS.street,
      addressLocality: BUSINESS_ADDRESS.locality,
      addressRegion: BUSINESS_ADDRESS.region,
      postalCode: BUSINESS_ADDRESS.postalCode,
      addressCountry: BUSINESS_ADDRESS.country,
    },
    areaServed: { "@type": "Country", name: "India" },
    ...(FOUNDERS.length
      ? {
          founder: FOUNDERS.map((f) => ({
            "@type": "Person",
            name: f.name,
            jobTitle: f.jobTitle,
            sameAs: [f.linkedin],
          })),
        }
      : {}),
    ...(SOCIAL_LINKS.length ? { sameAs: SOCIAL_LINKS } : {}),
    contactPoint: {
      "@type": "ContactPoint",
      email: SUPPORT_EMAIL,
      telephone: BUSINESS_PHONE,
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

export interface ProductReviewInput {
  author?: string | null;
  rating: number;
  title?: string | null;
  body?: string | null;
  datePublished?: string | null;
}

interface ProductJsonLdInput {
  name: string;
  slug: string;
  description?: string | null;
  sku?: string | null;
  mpn?: string | null;
  brand?: string | null;
  brandSlug?: string | null;
  brandLogo?: string | null;
  category?: string | null;
  images?: string[];
  price: number;
  currency?: string;
  inStock: boolean;
  condition?: "new" | "used" | "refurbished";
  rating?: number | null;
  reviewCount?: number | null;
  reviews?: ProductReviewInput[];
}

/** In-stock offer ke liye ~1 saal aage ki price-validity date. */
function defaultPriceValidUntil(): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() + 1);
  return d.toISOString().split("T")[0];
}

/** Free-shipping OfferShippingDetails (Google Merchant listing warnings kam karta hai). */
function shippingDetails() {
  return {
    "@type": "OfferShippingDetails",
    shippingRate: { "@type": "MonetaryAmount", value: "0", currency: "INR" },
    shippingDestination: { "@type": "DefinedRegion", addressCountry: "IN" },
    deliveryTime: {
      "@type": "ShippingDeliveryTime",
      handlingTime: { "@type": "QuantitativeValue", minValue: 0, maxValue: 2, unitCode: "DAY" },
      transitTime: { "@type": "QuantitativeValue", minValue: 2, maxValue: 7, unitCode: "DAY" },
    },
  };
}

/** 7-day return policy (rich results ke merchant fields ke liye). */
function returnPolicy() {
  return {
    "@type": "MerchantReturnPolicy",
    applicableCountry: "IN",
    returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
    merchantReturnDays: 7,
    returnMethod: "https://schema.org/ReturnByMail",
    returnFees: "https://schema.org/FreeReturn",
  };
}

const CONDITION_MAP = {
  new: "https://schema.org/NewCondition",
  used: "https://schema.org/UsedCondition",
  refurbished: "https://schema.org/RefurbishedCondition",
} as const;

/**
 * Product schema — Offer + AggregateRating + individual reviews + shipping/return
 * policy. Ye sab milke Google ke product rich results (price, ⭐ rating, stock,
 * "Free delivery", "7-day returns") enable karte hain.
 */
export function productJsonLd(p: ProductJsonLdInput) {
  const url = absoluteUrl(`/product/${p.slug}`);
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    url,
    ...(p.description ? { description: p.description } : {}),
    ...(p.sku ? { sku: p.sku, mpn: p.mpn ?? p.sku } : {}),
    ...(p.category ? { category: p.category } : {}),
    ...(p.brand
      ? { brand: brandEntity({ name: p.brand, slug: p.brandSlug, logo: p.brandLogo }) }
      : {}),
    ...(p.images && p.images.length ? { image: p.images } : {}),
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: p.currency ?? "INR",
      price: p.price.toFixed(2),
      priceValidUntil: defaultPriceValidUntil(),
      availability: p.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      itemCondition: CONDITION_MAP[p.condition ?? "new"],
      seller: { "@type": "Organization", name: SITE_NAME },
      shippingDetails: shippingDetails(),
      hasMerchantReturnPolicy: returnPolicy(),
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
  const reviews = (p.reviews ?? []).filter((r) => r.rating > 0).slice(0, 10);
  if (reviews.length) {
    data.review = reviews.map((r) => ({
      "@type": "Review",
      reviewRating: {
        "@type": "Rating",
        ratingValue: r.rating,
        bestRating: "5",
        worstRating: "1",
      },
      author: { "@type": "Person", name: r.author?.trim() || "Verified Buyer" },
      ...(r.title ? { name: r.title } : {}),
      ...(r.body ? { reviewBody: r.body } : {}),
      ...(r.datePublished ? { datePublished: r.datePublished.split("T")[0] } : {}),
    }));
  }
  return data;
}

interface ItemListEntry {
  name: string;
  slug: string;
}

/**
 * ItemList schema for category/search listing pages — Google ko batata hai ki
 * ye ek product-list page hai (carousel/rich-listing eligibility).
 */
export function itemListJsonLd(items: ItemListEntry[], name?: string) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    ...(name ? { name } : {}),
    numberOfItems: items.length,
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: absoluteUrl(`/product/${it.slug}`),
      name: it.name,
    })),
  } as const;
}

/** Reusable <script type="application/ld+json"> props builder. */
export function jsonLdScriptProps(data: unknown) {
  return {
    type: "application/ld+json",
    dangerouslySetInnerHTML: { __html: JSON.stringify(data) },
  } as const;
}
