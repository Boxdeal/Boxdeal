"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { X } from "lucide-react";
import { INDIA_STATES } from "@/constants";
import { cn } from "@/lib/utils/helpers";
import type { Brand, Category, Subcategory } from "@/types";

interface ProductFiltersProps {
  categories: Category[];
  subcategories: Subcategory[];
  brands: Brand[];
}

export function ProductFilters({
  categories,
  subcategories,
  brands,
}: ProductFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeCategory = searchParams.get("category") ?? "";
  const activeBrand = searchParams.get("brand") ?? "";
  const minPrice = searchParams.get("min_price") ?? "";
  const maxPrice = searchParams.get("max_price") ?? "";
  const minRating = searchParams.get("rating") ?? "";
  const inStock = searchParams.get("in_stock") === "true";

  const filteredSubs = subcategories.filter(
    (s) => !activeCategory || categories.find((c) => c.slug === activeCategory)?.id === s.category_id
  );

  const update = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === null || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
      params.delete("page");
      router.push(`${pathname}?${params.toString()}`);
    },
    [searchParams, router, pathname]
  );

  function clearAll() {
    router.push(pathname);
  }

  const hasFilters = !![activeCategory, activeBrand, minPrice, maxPrice, minRating].some(Boolean) || inStock;

  return (
    <aside className="w-56 flex-shrink-0 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Filters</h3>
        {hasFilters && (
          <button
            onClick={clearAll}
            className="flex items-center gap-1 text-xs text-brand-600 hover:text-brand-700"
          >
            <X className="h-3 w-3" /> Clear all
          </button>
        )}
      </div>

      {/* Categories */}
      <FilterSection title="Category">
        {categories.map((cat) => (
          <FilterOption
            key={cat.id}
            label={cat.name}
            active={activeCategory === cat.slug}
            onClick={() => update("category", activeCategory === cat.slug ? null : cat.slug)}
          />
        ))}
      </FilterSection>

      {/* Subcategories */}
      {filteredSubs.length > 0 && (
        <FilterSection title="Subcategory">
          {filteredSubs.map((sub) => {
            const activeSub = searchParams.get("subcategory") ?? "";
            return (
              <FilterOption
                key={sub.id}
                label={sub.name}
                active={activeSub === sub.slug}
                onClick={() => update("subcategory", activeSub === sub.slug ? null : sub.slug)}
              />
            );
          })}
        </FilterSection>
      )}

      {/* Brands */}
      {brands.length > 0 && (
        <FilterSection title="Brand">
          {brands.map((brand) => (
            <FilterOption
              key={brand.id}
              label={brand.name}
              active={activeBrand === brand.slug}
              onClick={() => update("brand", activeBrand === brand.slug ? null : brand.slug)}
            />
          ))}
        </FilterSection>
      )}

      {/* Price */}
      <FilterSection title="Price Range">
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min"
            defaultValue={minPrice}
            onBlur={(e) => update("min_price", e.target.value)}
            className="w-full rounded-lg border border-gray-200 px-2 py-1.5 text-sm focus:border-brand-400 focus:outline-none"
          />
          <input
            type="number"
            placeholder="Max"
            defaultValue={maxPrice}
            onBlur={(e) => update("max_price", e.target.value)}
            className="w-full rounded-lg border border-gray-200 px-2 py-1.5 text-sm focus:border-brand-400 focus:outline-none"
          />
        </div>
      </FilterSection>

      {/* Rating */}
      <FilterSection title="Min Rating">
        {[4, 3, 2].map((r) => (
          <FilterOption
            key={r}
            label={`${r}★ & above`}
            active={minRating === String(r)}
            onClick={() => update("rating", minRating === String(r) ? null : String(r))}
          />
        ))}
      </FilterSection>

      {/* Availability */}
      <FilterSection title="Availability">
        <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={inStock}
            onChange={(e) => update("in_stock", e.target.checked ? "true" : null)}
            className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-400"
          />
          In stock only
        </label>
      </FilterSection>
    </aside>
  );
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">{title}</h4>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function FilterOption({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm text-left transition-colors",
        active ? "bg-brand-50 font-semibold text-brand-700" : "text-gray-600 hover:bg-gray-50"
      )}
    >
      <span
        className={cn(
          "flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border",
          active ? "border-brand-500 bg-brand-500" : "border-gray-300"
        )}
      >
        {active && (
          <svg className="h-2.5 w-2.5 text-white" fill="currentColor" viewBox="0 0 12 12">
            <path d="M10.28 2.28L5 7.56 1.72 4.28a1 1 0 00-1.41 1.41l4 4a1 1 0 001.41 0l6-6a1 1 0 00-1.41-1.41z" />
          </svg>
        )}
      </span>
      {label}
    </button>
  );
}
