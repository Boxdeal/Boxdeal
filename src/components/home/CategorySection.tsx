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
        {categorySlug && (
          <Link
            href={`/products?${subcategory ? "subcategory" : "category"}=${categorySlug}`}
            className={styles.viewAllLink}
          >
            View all →
          </Link>
        )}
      </div>

      {/* Mobile App-like Structure: Image on top, 2x2 grid (< 800px) */}
      {products.length > 0 && (
      <div className={`${styles.mobileWrapper} ${gradientColor}`}>
        {/* Category Image - Full Width on Top */}
        <div className={styles.categoryImageContainer}>
          <div className={styles.imageWrapper}>
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={categoryName || "Category image"}
                fill
                sizes="100vw"
                className={styles.image}
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
            <p className={styles.categoryName}>{categoryName}</p>
          </div>
        </div>

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
          <div className={styles.productCard}>
            <div className={styles.productImageWrapper}>
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={categoryName || "Category image"}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className={styles.productImage}
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
              <p className={styles.categoryName}>{categoryName}</p>
            </div>
          </div>
        )}

        {/* 4 Products */}
        {products.slice(0, 4).map((product) => (
          <ProductCardComponent key={product.id} product={product} />
        ))}

        {/* Image Last (Odd Index) */}
        {!isImageFirst && (
          <div className={styles.productCard}>
            <div className={styles.productImageWrapper}>
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={categoryName || "Category image"}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className={styles.productImage}
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
              <p className={styles.categoryName}>{categoryName}</p>
            </div>
          </div>
        )}
        </div>
      </div>
      )}
    </div>
  );
}
