import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + "…";
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

export function calculateShipping(subtotal: number): number {
  return subtotal >= 499 ? 0 : 49;
}

export function calculateCartTotal(
  subtotal: number,
  discount: number,
  shipping: number
): number {
  return Math.max(0, subtotal - discount + shipping);
}

export function isOutOfStock(stock: number): boolean {
  return stock <= 0;
}

export function isLowStock(stock: number, threshold: number): boolean {
  return stock > 0 && stock <= threshold;
}

export function buildUrl(
  base: string,
  params: Record<string, string | number | boolean | undefined | null>
): string {
  const url = new URL(base, "http://localhost");
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });
  return url.pathname + url.search;
}

export function parseSearchParams(
  params: Record<string, string | string[] | undefined>
): Record<string, string> {
  return Object.fromEntries(
    Object.entries(params)
      .filter(([, v]) => v !== undefined)
      .map(([k, v]) => [k, Array.isArray(v) ? v[0] : v!])
  );
}
