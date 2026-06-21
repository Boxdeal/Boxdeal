"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

export interface FaqItem {
  q: string;
  a: React.ReactNode;
}

export interface FaqCategory {
  title: string;
  items: FaqItem[];
}

export function FaqAccordion({ categories }: { categories: FaqCategory[] }) {
  // Track open item by a unique "catIndex-itemIndex" key.
  const [open, setOpen] = useState<string | null>(null);

  return (
    <div className="space-y-10">
      {categories.map((cat, ci) => (
        <section key={cat.title}>
          <h2 className="mb-4 text-lg font-bold text-gray-900">{cat.title}</h2>
          <div className="space-y-3">
            {cat.items.map((item, ii) => {
              const key = `${ci}-${ii}`;
              const isOpen = open === key;
              return (
                <div
                  key={key}
                  className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm"
                >
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : key)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-gray-50"
                  >
                    <span className="text-sm font-semibold text-gray-900 sm:text-[15px]">
                      {item.q}
                    </span>
                    <ChevronDown
                      className={`h-5 w-5 flex-shrink-0 text-brand-500 transition-transform duration-200 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  <div
                    className={`grid transition-all duration-200 ease-in-out ${
                      isOpen
                        ? "grid-rows-[1fr] opacity-100"
                        : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div className="policy-prose border-t border-gray-100 px-5 py-4 text-sm leading-relaxed text-gray-600">
                        {item.a}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
