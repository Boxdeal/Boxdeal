"use client";

import { useState, useRef, useEffect, useCallback, useTransition, useId } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Search, X, Loader2, Tag, Layers, Store, TrendingUp, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils/helpers";
import { formatPrice } from "@/lib/utils/format";

interface SearchBarProps {
  placeholder?: string;
  className?: string;
  onClose?: () => void;
  autoFocus?: boolean;
}

interface ProductHit {
  id: string;
  name: string;
  slug: string;
  selling_price: number;
  mrp: number;
  discount_percent: number;
  stock_quantity: number;
  thumbnail: string | null;
}
interface TermHit {
  id: string;
  name: string;
  slug: string;
  category?: { name: string; slug: string } | null;
}
interface Suggestions {
  products: ProductHit[];
  categories: TermHit[];
  subcategories: TermHit[];
  brands: TermHit[];
}

const EMPTY: Suggestions = { products: [], categories: [], subcategories: [], brands: [] };

// A single flat navigable item — lets arrow keys walk across every group.
type FlatItem = { href: string; key: string };

export function SearchBar({
  placeholder = "Search products, categories, brands…",
  className,
  onClose,
  autoFocus = false,
}: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Suggestions>(EMPTY);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [, startTransition] = useTransition();

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const listboxId = useId();

  // ── Build the flat, ordered list of navigable items ──────────────
  const flat: FlatItem[] = [
    ...results.products.map((p) => ({ href: `/product/${p.slug}`, key: `p-${p.id}` })),
    ...results.categories.map((c) => ({ href: `/products?category=${c.slug}`, key: `c-${c.id}` })),
    ...results.subcategories.map((s) => ({ href: `/products?subcategory=${s.slug}`, key: `s-${s.id}` })),
    ...results.brands.map((b) => ({ href: `/products?brand=${b.slug}`, key: `b-${b.id}` })),
  ];
  const hasResults = flat.length > 0;

  // ── Debounced fetch of suggestions ───────────────────────────────
  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 3) {
      setResults(EMPTY);
      setLoading(false);
      return;
    }
    setLoading(true);
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search/suggest?q=${encodeURIComponent(trimmed)}`, {
          signal: ctrl.signal,
        });
        const data = (await res.json()) as Suggestions;
        setResults(data);
        setActiveIndex(-1);
      } catch (err) {
        if (!(err instanceof DOMException && err.name === "AbortError")) setResults(EMPTY);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [query]);

  // ── Close on outside click ───────────────────────────────────────
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const go = useCallback(
    (href: string) => {
      setOpen(false);
      startTransition(() => {
        router.push(href);
        onClose?.();
      });
    },
    [router, onClose]
  );

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // If an item is highlighted, navigate to it; otherwise full search.
    if (activeIndex >= 0 && flat[activeIndex]) {
      go(flat[activeIndex].href);
      return;
    }
    const trimmed = query.trim();
    if (!trimmed) return;
    go(`/search?q=${encodeURIComponent(trimmed)}`);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % Math.max(flat.length, 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i <= 0 ? flat.length - 1 : i - 1));
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  const showDropdown = open && query.trim().length >= 3;

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <Search className="absolute left-3.5 h-4 w-4 text-brand-400 pointer-events-none" />

        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoFocus={autoFocus}
          autoComplete="off"
          role="combobox"
          aria-expanded={showDropdown}
          aria-controls={listboxId}
          className="w-full rounded-full border border-brand-200 bg-white py-2.5 pl-10 pr-9 text-sm shadow-sm placeholder:text-gray-400 transition focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100 focus:shadow-md"
        />

        <div className="absolute right-3 flex items-center">
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin text-brand-400" />
          ) : (
            query && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  inputRef.current?.focus();
                }}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )
          )}
        </div>
      </form>

      {/* ── Suggestions dropdown ── */}
      {showDropdown && (
        <div
          id={listboxId}
          role="listbox"
          className="absolute left-0 right-0 top-full z-50 mt-2 max-h-[70vh] overflow-y-auto rounded-2xl border border-gray-100 bg-white py-2 shadow-[0_12px_40px_rgba(0,0,0,0.12)]"
        >
          {!hasResults && !loading && (
            <div className="px-4 py-6 text-center text-sm text-gray-500">
              No matches for <span className="font-semibold text-gray-700">“{query.trim()}”</span>
            </div>
          )}

          {/* Products */}
          {results.products.length > 0 && (
            <Group label="Products">
              {results.products.map((p) => {
                const idx = flat.findIndex((f) => f.key === `p-${p.id}`);
                return (
                  <SuggestRow
                    key={p.id}
                    active={idx === activeIndex}
                    onMouseEnter={() => setActiveIndex(idx)}
                    onClick={() => go(`/product/${p.slug}`)}
                  >
                    <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-gray-50">
                      {p.thumbnail ? (
                        <Image src={p.thumbnail} alt={p.name} fill sizes="40px" className="object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-gray-300">
                          <Tag className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-800">{p.name}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-gray-900">{formatPrice(p.selling_price)}</span>
                        {p.discount_percent > 0 && (
                          <span className="text-xs text-gray-400 line-through">{formatPrice(p.mrp)}</span>
                        )}
                        {p.stock_quantity <= 0 && (
                          <span className="text-[10px] font-semibold uppercase text-red-500">Out of stock</span>
                        )}
                      </div>
                    </div>
                  </SuggestRow>
                );
              })}
            </Group>
          )}

          {/* Categories */}
          {results.categories.length > 0 && (
            <Group label="Categories">
              {results.categories.map((c) => {
                const idx = flat.findIndex((f) => f.key === `c-${c.id}`);
                return (
                  <SuggestRow
                    key={c.id}
                    active={idx === activeIndex}
                    onMouseEnter={() => setActiveIndex(idx)}
                    onClick={() => go(`/products?category=${c.slug}`)}
                  >
                    <IconChip icon={Layers} />
                    <span className="flex-1 truncate text-sm text-gray-700">{c.name}</span>
                  </SuggestRow>
                );
              })}
            </Group>
          )}

          {/* Subcategories */}
          {results.subcategories.length > 0 && (
            <Group label="Subcategories">
              {results.subcategories.map((s) => {
                const idx = flat.findIndex((f) => f.key === `s-${s.id}`);
                return (
                  <SuggestRow
                    key={s.id}
                    active={idx === activeIndex}
                    onMouseEnter={() => setActiveIndex(idx)}
                    onClick={() => go(`/products?subcategory=${s.slug}`)}
                  >
                    <IconChip icon={TrendingUp} />
                    <span className="flex-1 truncate text-sm text-gray-700">
                      {s.name}
                      {s.category?.name && (
                        <span className="ml-1.5 text-xs text-gray-400">in {s.category.name}</span>
                      )}
                    </span>
                  </SuggestRow>
                );
              })}
            </Group>
          )}

          {/* Brands */}
          {results.brands.length > 0 && (
            <Group label="Brands">
              {results.brands.map((b) => {
                const idx = flat.findIndex((f) => f.key === `b-${b.id}`);
                return (
                  <SuggestRow
                    key={b.id}
                    active={idx === activeIndex}
                    onMouseEnter={() => setActiveIndex(idx)}
                    onClick={() => go(`/products?brand=${b.slug}`)}
                  >
                    <IconChip icon={Store} />
                    <span className="flex-1 truncate text-sm text-gray-700">{b.name}</span>
                  </SuggestRow>
                );
              })}
            </Group>
          )}

          {/* View all */}
          {query.trim().length >= 3 && (
            <button
              type="button"
              onClick={() => go(`/search?q=${encodeURIComponent(query.trim())}`)}
              className="mt-1 flex w-full items-center justify-between border-t border-gray-100 px-4 py-2.5 text-sm font-semibold text-brand-600 hover:bg-brand-50"
            >
              <span>
                See all results for “{query.trim()}”
              </span>
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="py-1">
      <p className="px-4 pb-1 pt-1 text-[11px] font-semibold uppercase tracking-wide text-gray-400">{label}</p>
      {children}
    </div>
  );
}

function SuggestRow({
  active,
  onClick,
  onMouseEnter,
  children,
}: {
  active: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="option"
      aria-selected={active}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      className={cn(
        "flex w-full items-center gap-3 px-4 py-2 text-left transition-colors",
        active ? "bg-brand-50" : "hover:bg-gray-50"
      )}
    >
      {children}
    </button>
  );
}

function IconChip({ icon: Icon }: { icon: React.ComponentType<{ className?: string }> }) {
  return (
    <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-500">
      <Icon className="h-4 w-4" />
    </span>
  );
}
