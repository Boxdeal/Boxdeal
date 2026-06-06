import Link from "next/link";
import Image from "next/image";
import type { ProductCard, Category, Subcategory } from "@/types";
import { ProductCard as ProductCardComponent } from "@/components/product/ProductCard";

interface CategorySectionProps {
  category?: Category;
  subcategory?: Subcategory;
  products: ProductCard[];
  index: number;
}

const colorPalettes = [
  { ltr: 'from-blue-600 via-blue-300 to-white', rtl: 'from-white via-blue-300 to-blue-600' },
  { ltr: 'from-purple-600 via-purple-300 to-white', rtl: 'from-white via-purple-300 to-purple-600' },
  { ltr: 'from-pink-600 via-pink-300 to-white', rtl: 'from-white via-pink-300 to-pink-600' },
  { ltr: 'from-orange-600 via-orange-300 to-white', rtl: 'from-white via-orange-300 to-orange-600' },
  { ltr: 'from-green-600 via-green-300 to-white', rtl: 'from-white via-green-300 to-green-600' },
  { ltr: 'from-cyan-600 via-cyan-300 to-white', rtl: 'from-white via-cyan-300 to-cyan-600' },
  { ltr: 'from-red-600 via-red-300 to-white', rtl: 'from-white via-red-300 to-red-600' },
  { ltr: 'from-indigo-600 via-indigo-300 to-white', rtl: 'from-white via-indigo-300 to-indigo-600' },
  { ltr: 'from-amber-600 via-amber-300 to-white', rtl: 'from-white via-amber-300 to-amber-600' },
  { ltr: 'from-teal-600 via-teal-300 to-white', rtl: 'from-white via-teal-300 to-teal-600' },
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
    <div className="border-b border-gray-200 py-8 last:border-b-0">
      {/* Heading with View All */}
      <div className="mb-4 sm:mb-6 flex items-center justify-between gap-2">
        <h2 className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-2xl font-bold text-gray-900">
          {categoryName}
        </h2>
        {categorySlug && (
          <Link
            href={`/products?${subcategory ? "subcategory" : "category"}=${categorySlug}`}
            className="text-xs sm:text-sm font-medium text-brand-600 hover:text-brand-700 whitespace-nowrap"
          >
            View all →
          </Link>
        )}
      </div>

      {/* One Line Grid - Image + 4 Products (Alternating) */}
      {/* Only show if we have products (image conditional) */}
      {products.length > 0 && (
      <div className={`relative rounded-lg sm:rounded-xl overflow-hidden p-3 sm:p-6 -mx-3 sm:-mx-6 px-3 sm:px-6 mb-4 sm:mb-6 bg-gradient-to-r ${gradientColor}`}>
        {/* Grid inside gradient background */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 relative z-10 auto-rows-max">
        {/* Image First (Even Index) */}
        {isImageFirst && (
          <div className="group relative flex flex-col rounded-xl border border-gray-100 bg-white overflow-hidden hover:border-brand-200 hover:shadow-md transition-all duration-200">
            <div className="relative aspect-[3/4] overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={categoryName || "Category image"}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  priority={false}
                />
              ) : (
                <div className="text-center">
                  <div className="text-4xl mb-2">📦</div>
                  <p className="text-xs text-gray-400">No image</p>
                </div>
              )}
            </div>
            <div className="flex flex-col p-2 sm:p-3 text-center">
              <p className="text-xs sm:text-sm font-semibold text-gray-800">{categoryName}</p>
            </div>
          </div>
        )}

        {/* 4 Products */}
        {products.slice(0, 4).map((product) => (
          <ProductCardComponent key={product.id} product={product} />
        ))}

        {/* Image Last (Odd Index) */}
        {!isImageFirst && (
          <div className="group relative flex flex-col rounded-xl border border-gray-100 bg-white overflow-hidden hover:border-brand-200 hover:shadow-md transition-all duration-200">
            <div className="relative aspect-[3/4] overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={categoryName || "Category image"}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  priority={false}
                />
              ) : (
                <div className="text-center">
                  <div className="text-4xl mb-2">📦</div>
                  <p className="text-xs text-gray-400">No image</p>
                </div>
              )}
            </div>
            <div className="flex flex-col p-2 sm:p-3 text-center">
              <p className="text-xs sm:text-sm font-semibold text-gray-800">{categoryName}</p>
            </div>
          </div>
        )}
        </div>
      </div>
      )}
    </div>
  );
}
