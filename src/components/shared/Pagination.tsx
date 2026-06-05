"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils/helpers";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  perPage: number;
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  perPage,
}: PaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function goTo(page: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    router.push(`${pathname}?${params.toString()}`);
  }

  if (totalPages <= 1) return null;

  const pages = buildPageList(currentPage, totalPages);
  const from = (currentPage - 1) * perPage + 1;
  const to = Math.min(currentPage * perPage, totalItems);

  return (
    <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
      <p className="text-sm text-gray-500">
        Showing {from}–{to} of {totalItems.toLocaleString()} products
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => goTo(currentPage - 1)}
          disabled={currentPage === 1}
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-lg border text-gray-600 transition",
            currentPage === 1
              ? "cursor-not-allowed opacity-40"
              : "hover:bg-gray-50"
          )}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        {pages.map((p, i) =>
          p === "..." ? (
            <span key={`ellipsis-${i}`} className="px-2 text-gray-400">
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => goTo(Number(p))}
              className={cn(
                "h-9 min-w-[36px] rounded-lg border px-2 text-sm font-medium transition",
                p === currentPage
                  ? "border-brand-500 bg-brand-500 text-white"
                  : "text-gray-600 hover:bg-gray-50"
              )}
            >
              {p}
            </button>
          )
        )}
        <button
          onClick={() => goTo(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-lg border text-gray-600 transition",
            currentPage === totalPages
              ? "cursor-not-allowed opacity-40"
              : "hover:bg-gray-50"
          )}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function buildPageList(
  current: number,
  total: number
): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, "...", total];
  if (current >= total - 3)
    return [1, "...", total - 4, total - 3, total - 2, total - 1, total];
  return [1, "...", current - 1, current, current + 1, "...", total];
}
