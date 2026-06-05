"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

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
      className="relative flex-shrink-0"
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
        className="flex items-center gap-0.5 whitespace-nowrap px-3 py-2.5 text-sm text-gray-600 transition-colors hover:text-brand-600"
      >
        {name}
        {subs.length > 0 && (
          <ChevronDown
            className={`h-3.5 w-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          />
        )}
      </Link>

      {/* Dropdown */}
      {open && subs.length > 0 && (
        <div className="absolute left-0 top-full z-50 pt-1">
          <div className="min-w-[200px] rounded-xl border border-gray-100 bg-white p-1.5 shadow-lg shadow-black/8">

            <Link
              href={`/products?category=${slug}`}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-brand-600 hover:bg-brand-50"
            >
              All {name}
            </Link>

            <div className="my-1 border-t border-gray-100" />

            {subs.map((sub) => (
              <Link
                key={sub.id}
                href={`/products?subcategory=${sub.slug}`}
                className="flex items-center rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-brand-600"
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
