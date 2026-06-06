"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import styles from "./CategoryDropdownItem.module.css";

interface Sub { id: string; name: string; slug: string }
interface Props {
  name: string;
  slug: string;
  subs: Sub[];
}

export function CategoryDropdownItem({ name, slug, subs }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={styles.dropdownContainer}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          setOpen(false);
        }
      }}
    >
      {/* Category trigger */}
      <Link
        href={`/products?category=${slug}`}
        className={styles.triggerLink}
      >
        {name}
        {subs.length > 0 && (
          <ChevronDown
            className={`${styles.chevronIcon} ${open ? styles.rotated : ""}`}
          />
        )}
      </Link>

      {/* Dropdown */}
      {open && subs.length > 0 && (
        <div className={styles.dropdownMenu}>
          <div className={styles.dropdownContent}>

            <Link
              href={`/products?category=${slug}`}
              className={styles.allCategoryLink}
            >
              All {name}
            </Link>

            <div className={styles.divider} />

            {subs.map((sub) => (
              <Link
                key={sub.id}
                href={`/products?subcategory=${sub.slug}`}
                className={styles.subCategoryLink}
              >
                {sub.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
