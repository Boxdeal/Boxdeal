"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, ChevronDown } from "lucide-react";
import styles from "./CategoryNav.mobile.module.css";

type Sub = { id: string; name: string; slug: string; is_active: boolean; sort_order: number };
type Cat = { id: string; name: string; slug: string; subcategories: Sub[] | null };

// Shorter labels for the nav (links/slugs are unaffected)
const NAV_LABELS: Record<string, string> = {
  "Landline Phones": "Landline",
};
const navLabel = (name: string) => NAV_LABELS[name] ?? name;

interface Props {
  categories: Cat[];
}

export function CategoryNavMobile({ categories }: Props) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleCategory = (catId: string) => {
    setExpandedCategory(expandedCategory === catId ? null : catId);
  };

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <nav className={styles.mobileNav}>
      {/* Mobile Header */}
      <div className={styles.mobileHeader}>
        <button
          onClick={toggleMenu}
          className={styles.hamburgerButton}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        <Link
          href="/products?is_deal_of_day=true"
          className={styles.dealsButton}
          onClick={closeMenu}
        >
          🔥 Deals
        </Link>
      </div>

      {/* Mobile Menu */}
      <div className={`${styles.mobileMenu} ${isMenuOpen ? styles.open : ""}`}>
        {/* All Products */}
        <Link
          href="/products"
          className={styles.menuItem}
          onClick={closeMenu}
        >
          All Products
        </Link>

        {/* Categories */}
        {categories.map((cat) => {
          const subs = (cat.subcategories ?? [])
            .filter((s) => s.is_active)
            .sort((a, b) => a.sort_order - b.sort_order);

          const isExpanded = expandedCategory === cat.id;

          if (subs.length === 0) {
            return (
              <Link
                key={cat.id}
                href={`/products?category=${cat.slug}`}
                className={styles.menuItem}
                onClick={closeMenu}
              >
                {navLabel(cat.name)}
              </Link>
            );
          }

          return (
            <div key={cat.id}>
              <button
                onClick={() => toggleCategory(cat.id)}
                className={styles.categoryButton}
              >
                <span>{navLabel(cat.name)}</span>
                <ChevronDown
                  size={12}
                  className={`${styles.chevron} ${
                    isExpanded ? styles.rotated : ""
                  }`}
                />
              </button>

              <div className={`${styles.subCategoryList} ${isExpanded ? styles.open : ""}`}>
                <Link
                  href={`/products?category=${cat.slug}`}
                  className={styles.subCategoryItem}
                  onClick={closeMenu}
                >
                  All {cat.name}
                </Link>

                {subs.map((sub) => (
                  <Link
                    key={sub.id}
                    href={`/products?subcategory=${sub.slug}`}
                    className={styles.subCategoryItem}
                    onClick={closeMenu}
                  >
                    {sub.name}
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </nav>
  );
}
