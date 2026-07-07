import Link from "next/link";
import Image from "next/image";
import type { ProductCard, Category, Subcategory } from "@/types";
import { ProductCard as ProductCardComponent } from "@/components/product/ProductCard";
import styles from "./CategorySection.module.css";

interface CategorySectionProps {
  category?: Category;
  subcategory?: Subcategory;
  products: ProductCard[];
  index: number;
}

const colorPalettes = [
  { ltr: styles.gradientBlueLtr, rtl: styles.gradientBlueRtl },
  { ltr: styles.gradientPurpleLtr, rtl: styles.gradientPurpleRtl },
  { ltr: styles.gradientPinkLtr, rtl: styles.gradientPinkRtl },
  { ltr: styles.gradientOrangeLtr, rtl: styles.gradientOrangeRtl },
  { ltr: styles.gradientGreenLtr, rtl: styles.gradientGreenRtl },
  { ltr: styles.gradientCyanLtr, rtl: styles.gradientCyanRtl },
  { ltr: styles.gradientRedLtr, rtl: styles.gradientRedRtl },
  { ltr: styles.gradientIndigoLtr, rtl: styles.gradientIndigoRtl },
  { ltr: styles.gradientAmberLtr, rtl: styles.gradientAmberRtl },
  { ltr: styles.gradientTealLtr, rtl: styles.gradientTealRtl },
];

// Pick a palette from a stable key (the category/subcategory slug) so each
// category keeps the SAME colour regardless of its position in the list.
// Adding/removing a category no longer shifts everyone else's colour, and a
// new category deterministically gets its own colour from its slug.
function paletteIndexForKey(key: string): number {
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  }
  return hash % colorPalettes.length;
}

// Explicit brand colour per category/subcategory slug. These always win over
// the hashed palette, so each of these sections keeps exactly this colour.
const categoryBaseColors: Record<string, string> = {
  earbuds: "#05458c",
  "gaming-headphone": "#68225f",
  "normal-headphone": "#5e0e16",
  "mobile-charger": "#d54e0a",
  "laptop-charger": "#0b8f5d",
  neckband: "#0a8ca6",
  mic: "#8f1716",
  "portable-speaker": "#4c47df",
  soundbar: "#b35a00",
  "home-theatre": "#004ba8",
  partybox: "#018d82",
  tablet: "#662a9e",
  "smart-watches": "#a92a47",
  "graphic-pads": "#f95702",
  "landline-phones": "#5047e5",
};

// Build a vibrant, glossy left-to-right gradient from a base colour. The full
// saturated base holds across the coloured edge (so the colour really pops),
// then transitions through a rich tint to white (reversed when the image sits
// on the right), with a soft white sheen on top for a shiny look.
function buildGradient(base: string, imageFirst: boolean): string {
  const light = `color-mix(in srgb, ${base} 45%, #ffffff)`;
  const colorLayer = imageFirst
    ? `linear-gradient(to right, ${base} 0%, ${base} 22%, ${light} 62%, #ffffff 100%)`
    : `linear-gradient(to right, #ffffff 0%, ${light} 38%, ${base} 78%, ${base} 100%)`;
  // Glossy highlight: bright at the top, fading out toward the middle.
  const sheen = "linear-gradient(to bottom, rgba(255,255,255,0.28), rgba(255,255,255,0) 50%)";
  return `${sheen}, ${colorLayer}`;
}

export function CategorySection({
  category,
  subcategory,
  products,
  index,
}: CategorySectionProps) {
  if (!products.length) return null;

  const categorySlug = subcategory?.slug || category?.slug;
  const categoryName = subcategory?.name || category?.name;
  const imageUrl = subcategory?.image_url || category?.image_url;
  const categoryHref = categorySlug
    ? `/products?${subcategory ? "subcategory" : "category"}=${categorySlug}`
    : null;
  const isImageFirst = index % 2 === 0;
  const slugLower = (categorySlug ?? "").toLowerCase();

  // Prefer an explicit pinned colour for this slug; otherwise fall back to the
  // stable hashed palette class.
  const baseColor = categoryBaseColors[slugLower];
  const colorScheme =
    colorPalettes[paletteIndexForKey(categorySlug ?? categoryName ?? String(index))];
  const gradientColor = baseColor ? "" : isImageFirst ? colorScheme.ltr : colorScheme.rtl;
  const gradientStyle: { background: string } | undefined = baseColor
    ? { background: buildGradient(baseColor, isImageFirst) }
    : undefined;

  return (
    <div className={styles.container}>
      {/* Heading with View All */}
      <div className={styles.header}>
        <h2 className={styles.title}>
          {categoryName}
        </h2>
        {categoryHref && (
          <Link href={categoryHref} className={styles.viewAllLink}>
            View all →
          </Link>
        )}
      </div>

      {/* Mobile App-like Structure: Image on top, 2x2 grid (< 800px) */}
      {products.length > 0 && (
      <div className={`${styles.mobileWrapper} ${gradientColor}`} style={gradientStyle}>
        {/* Category Image - Full Width on Top */}
        <CategoryImageCard
          href={categoryHref}
          imageUrl={imageUrl}
          name={categoryName}
          sizes="100vw"
          containerClass={styles.categoryImageContainer}
          wrapperClass={styles.imageWrapper}
          imageClass={styles.image}
        />

        {/* 4 Products in 2x2 Grid */}
        <div className={styles.mobileProductsGrid}>
          {products.slice(0, 4).map((product) => (
            <ProductCardComponent key={product.id} product={product} />
          ))}
        </div>
      </div>
      )}

      {/* Desktop Layout: Original alternating design (>= 800px) */}
      {products.length > 0 && (
      <div className={`${styles.desktopWrapper} ${gradientColor}`} style={gradientStyle}>
        <div className={styles.desktopProductsGrid}>
        {/* Image First (Even Index) */}
        {isImageFirst && (
          <CategoryImageCard
            href={categoryHref}
            imageUrl={imageUrl}
            name={categoryName}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            containerClass={styles.productCard}
            wrapperClass={styles.productImageWrapper}
            imageClass={styles.productImage}
          />
        )}

        {/* 4 Products */}
        {products.slice(0, 4).map((product) => (
          <ProductCardComponent key={product.id} product={product} />
        ))}

        {/* Image Last (Odd Index) */}
        {!isImageFirst && (
          <CategoryImageCard
            href={categoryHref}
            imageUrl={imageUrl}
            name={categoryName}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            containerClass={styles.productCard}
            wrapperClass={styles.productImageWrapper}
            imageClass={styles.productImage}
          />
        )}
        </div>
      </div>
      )}
    </div>
  );
}

interface CategoryImageCardProps {
  href: string | null;
  imageUrl?: string | null;
  name?: string;
  sizes: string;
  containerClass: string;
  wrapperClass: string;
  imageClass: string;
}

// Clickable category image that links to the category/subcategory route.
// Falls back to a plain div when there is no slug to link to.
function CategoryImageCard({
  href,
  imageUrl,
  name,
  sizes,
  containerClass,
  wrapperClass,
  imageClass,
}: CategoryImageCardProps) {
  const inner = (
    <>
      <div className={wrapperClass}>
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name || "Category image"}
            fill
            sizes={sizes}
            className={imageClass}
            priority={false}
            loading="lazy"
          />
        ) : (
          <div className={styles.noImagePlaceholder}>
            <div className={styles.noImageIcon}>📦</div>
            <p className={styles.noImageText}>No image</p>
          </div>
        )}
      </div>
      <div className={styles.categoryNameContainer}>
        <p className={styles.categoryName}>{name}</p>
      </div>
    </>
  );

  return href ? (
    <Link href={href} className={containerClass} aria-label={`Shop ${name ?? "category"}`}>
      {inner}
    </Link>
  ) : (
    <div className={containerClass}>{inner}</div>
  );
}
