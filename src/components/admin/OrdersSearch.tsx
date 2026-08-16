"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search, X, Loader2 } from "lucide-react";

/**
 * URL-driven search box for the admin orders list. Debounces typing into `?q=`,
 * keeps the other filters (status, period) intact and resets pagination, since
 * page 3 of the old list means nothing for a new result set.
 */
export function OrdersSearch({ resultCount }: { resultCount?: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const urlQuery = params.get("q") ?? "";
  const [value, setValue] = useState(urlQuery);

  // Keep in sync when the URL changes from elsewhere (status tab, back button).
  useEffect(() => setValue(urlQuery), [urlQuery]);

  useEffect(() => {
    if (value === urlQuery) return;
    const t = setTimeout(() => {
      const sp = new URLSearchParams(params.toString());
      if (value.trim()) sp.set("q", value.trim());
      else sp.delete("q");
      sp.delete("page");
      startTransition(() => router.push(`${pathname}?${sp.toString()}`));
    }, 350);
    return () => clearTimeout(t);
  }, [value, urlQuery, params, pathname, router]);

  return (
    <div className="space-y-1.5">
      <div className="relative max-w-xl">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Search order no, AWB, name, phone, email, city, product, coupon…"
          aria-label="Search orders"
          className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-10 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
        />
        {isPending ? (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-gray-400" />
        ) : (
          value && (
            <button
              type="button"
              onClick={() => setValue("")}
              aria-label="Clear search"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )
        )}
      </div>

      {urlQuery && resultCount !== undefined && (
        <p className="text-xs text-gray-400">
          {resultCount} order{resultCount === 1 ? "" : "s"} matching &ldquo;{urlQuery}&rdquo;
        </p>
      )}
    </div>
  );
}
