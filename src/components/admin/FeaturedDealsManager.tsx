"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Search, Loader2, Plus, Check, Edit, Sparkles, Flame } from "lucide-react";
import { toast } from "sonner";
import { formatPrice } from "@/lib/utils/format";
import { cn } from "@/lib/utils/helpers";

export type MerchFlag = "is_featured" | "is_deal_of_day";

export interface MerchProduct {
  id: string;
  name: string;
  sku: string;
  selling_price: number;
  stock_quantity: number;
  is_active: boolean;
  is_featured: boolean;
  is_deal_of_day: boolean;
  product_images: Array<{ image_url: string; thumbnail_url: string | null; is_primary: boolean }>;
}

// Homepage caps per section — see src/app/(shop)/page.tsx.
const SECTIONS = {
  is_featured: {
    title: "Featured Products",
    limit: 10,
    icon: Sparkles,
    iconCls: "text-purple-500",
    orderNote: "Ordered by units sold (best sellers first).",
  },
  is_deal_of_day: {
    title: "Deal of the Day",
    limit: 8,
    icon: Flame,
    iconCls: "text-orange-500",
    orderNote: "Ordered by newest first.",
  },
} as const;

function primaryImage(p: MerchProduct) {
  const imgs = p.product_images ?? [];
  const img = imgs.find((i) => i.is_primary) ?? imgs[0];
  return img ? img.thumbnail_url || img.image_url : null;
}

/** iOS-style on/off switch. */
function Toggle({
  on,
  busy,
  onClick,
  label,
}: {
  on: boolean;
  busy: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      disabled={busy}
      onClick={onClick}
      className={cn(
        "relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors disabled:opacity-50",
        on ? "bg-brand-500" : "bg-gray-200"
      )}
    >
      <span
        className={cn(
          "inline-flex h-5 w-5 items-center justify-center rounded-full bg-white shadow transition-transform",
          on ? "translate-x-[22px]" : "translate-x-0.5"
        )}
      >
        {busy && <Loader2 className="h-3 w-3 animate-spin text-gray-400" />}
      </span>
    </button>
  );
}

export function FeaturedDealsManager({
  flag,
  products,
}: {
  flag: MerchFlag;
  products: MerchProduct[];
}) {
  const router = useRouter();
  const section = SECTIONS[flag];

  const [rows, setRows] = useState<MerchProduct[]>(products);
  const [busyId, setBusyId] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<MerchProduct[]>([]);
  const [searching, setSearching] = useState(false);

  // Server data is the source of truth; re-sync when the tab or list changes.
  useEffect(() => {
    setRows(products);
  }, [products]);

  // Debounced admin search for the "add product" picker.
  const reqId = useRef(0);
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    const id = ++reqId.current;
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/admin/products?q=${encodeURIComponent(q)}`);
        const json = await res.json();
        if (id !== reqId.current) return; // a newer keystroke won
        if (json.error) {
          toast.error(json.error);
          setResults([]);
        } else {
          setResults(json.data as MerchProduct[]);
        }
      } catch {
        if (id === reqId.current) toast.error("Search failed");
      } finally {
        if (id === reqId.current) setSearching(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  const flaggedIds = useMemo(() => new Set(rows.map((r) => r.id)), [rows]);

  const setFlag = useCallback(
    async (product: MerchProduct, next: boolean) => {
      setBusyId(product.id);
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [flag]: next }),
      });
      const json = await res.json();
      setBusyId(null);

      if (json.error) {
        toast.error(json.error);
        return;
      }

      setRows((prev) =>
        next
          ? prev.some((r) => r.id === product.id)
            ? prev
            : [{ ...product, [flag]: true }, ...prev]
          : prev.filter((r) => r.id !== product.id)
      );
      setResults((prev) =>
        prev.map((r) => (r.id === product.id ? { ...r, [flag]: next } : r))
      );
      toast.success(next ? `Added to ${section.title}` : `Removed from ${section.title}`);
      router.refresh();
    },
    [flag, router, section.title]
  );

  const shown = Math.min(rows.length, section.limit);

  return (
    <div className="space-y-5">
      {/* ── Add products ─────────────────────────────────────────── */}
      <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-sm font-bold text-gray-900">
          Add a product to {section.title}
        </h2>

        <div className="relative max-w-xl">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products by name or SKU…"
            className="w-full rounded-xl border border-gray-200 bg-white pl-10 pr-10 py-2.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
          {searching && (
            <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-gray-400" />
          )}
        </div>

        {query.trim().length >= 2 && !searching && results.length === 0 && (
          <p className="mt-3 text-sm text-gray-400">No products match “{query.trim()}”.</p>
        )}

        {results.length > 0 && (
          <ul className="mt-3 max-h-80 divide-y divide-gray-50 overflow-y-auto rounded-xl border border-gray-100">
            {results.map((p) => {
              const already = flaggedIds.has(p.id);
              const img = primaryImage(p);
              return (
                <li key={p.id} className="flex items-center gap-3 px-3 py-2.5">
                  <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                    {img && <Image src={img} alt="" fill sizes="40px" className="object-cover" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-1 text-sm font-medium text-gray-900">{p.name}</p>
                    <p className="text-xs text-gray-400">
                      <span className="font-mono">{p.sku}</span> · {formatPrice(p.selling_price)}
                      {!p.is_active && " · Hidden"}
                      {p.stock_quantity <= 0 && " · Out of stock"}
                    </p>
                  </div>
                  {already ? (
                    <span className="flex items-center gap-1 rounded-lg bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700">
                      <Check className="h-3.5 w-3.5" /> Added
                    </span>
                  ) : (
                    <button
                      onClick={() => setFlag(p, true)}
                      disabled={busyId === p.id}
                      className="flex items-center gap-1 rounded-lg bg-brand-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-brand-600 disabled:opacity-50"
                    >
                      {busyId === p.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Plus className="h-3.5 w-3.5" />
                      )}
                      Add
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* ── Current list ─────────────────────────────────────────── */}
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 px-4 py-3">
          <h2 className="flex items-center gap-2 text-sm font-bold text-gray-900">
            <section.icon className={cn("h-4 w-4", section.iconCls)} />
            In {section.title}{" "}
            <span className="font-normal text-gray-400">({rows.length})</span>
          </h2>
          <p className="text-xs text-gray-500">
            Homepage shows {shown} of {rows.length}. {section.orderNote}
          </p>
        </div>

        {rows.length === 0 ? (
          <p className="px-4 py-12 text-center text-sm text-gray-400">
            No products in this section yet — search above to add one.
          </p>
        ) : (
          <ul className="divide-y divide-gray-50">
            {rows.map((p, i) => {
              const img = primaryImage(p);
              const overflow = i >= section.limit;
              return (
                <li
                  key={p.id}
                  className={cn(
                    "flex flex-wrap items-center gap-3 px-4 py-3",
                    overflow && "bg-gray-50/60"
                  )}
                >
                  <span className="w-6 text-xs font-semibold text-gray-400">{i + 1}</span>

                  <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                    {img && <Image src={img} alt="" fill sizes="48px" className="object-cover" />}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-1 font-medium text-gray-900">{p.name}</p>
                    <p className="text-xs text-gray-400">
                      <span className="font-mono">{p.sku}</span> · {formatPrice(p.selling_price)}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {!p.is_active && (
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-500">
                        Hidden
                      </span>
                    )}
                    {p.stock_quantity <= 0 && (
                      <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
                        Out of stock
                      </span>
                    )}
                    {overflow && (
                      <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-semibold text-yellow-700">
                        Not on homepage
                      </span>
                    )}
                  </div>

                  <Link
                    href={`/admin/products/${p.id}`}
                    className="flex items-center gap-1 rounded-lg px-2 py-1 text-sm text-brand-600 hover:bg-brand-50"
                  >
                    <Edit className="h-4 w-4" /> Edit
                  </Link>

                  <Toggle
                    on
                    busy={busyId === p.id}
                    onClick={() => setFlag(p, false)}
                    label={`Remove ${p.name} from ${section.title}`}
                  />
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
