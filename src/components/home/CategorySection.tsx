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
  const colorScheme = colorPalettes[index % colorPalettes.length];
  const gradientColor = isImageFirst ? colorScheme.ltr : colorScheme.rtl;

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
      <div className={`${styles.mobileWrapper} ${gradientColor}`}>
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
      <div className={`${styles.desktopWrapper} ${gradientColor}`}>
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
