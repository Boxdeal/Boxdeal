"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ORDER_STATUS_COLORS, ORDER_STATUS_LABELS } from "@/constants";
import type { ProductStatusCount } from "@/types";

/**
 * Order-status filter for one product's day-wise view.
 *
 * URL-driven (`?status=`) rather than local state so it survives a period change
 * and stays shareable — and so the day/chart/orders numbers, which are all
 * computed on the server, follow the selection.
 *
 * Only statuses this product actually has in the period are shown; the counts
 * come from the unfiltered period, so they stay put while a filter is applied.
 */
export function ProductStatusFilter({
  counts,
  active,
}: {
  counts: ProductStatusCount[];
  active?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  if (counts.length === 0) return null;

  function select(status: string | null) {
    const sp = new URLSearchParams(params.toString());
    if (status) sp.set("status", status);
    else sp.delete("status");
    router.push(`${pathname}?${sp.toString()}`);
  }

  const totalUnits  = counts.reduce((a, c) => a + c.units, 0);
  const totalOrders = counts.reduce((a, c) => a + c.orders, 0);

  const pill = "rounded-full px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors";

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <p className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-gray-400">
        Filter by order status
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => select(null)}
          className={`${pill} ${
            !active
              ? "bg-brand-500 text-white"
              : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
          }`}
        >
          All
          <span className={`ml-1.5 font-normal ${!active ? "text-white/70" : "text-gray-400"}`}>
            {totalUnits} units · {totalOrders} orders
          </span>
        </button>

        {counts.map((c) => {
          const on = active === c.status;
          return (
            <button
              key={c.status}
              type="button"
              onClick={() => select(c.status)}
              className={`${pill} ${
                on
                  ? "bg-brand-500 text-white"
                  : `${ORDER_STATUS_COLORS[c.status]} hover:opacity-80`
              }`}
            >
              {ORDER_STATUS_LABELS[c.status]}
              <span className={`ml-1.5 font-normal ${on ? "text-white/70" : "opacity-60"}`}>
                {c.units} units · {c.orders} orders
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
