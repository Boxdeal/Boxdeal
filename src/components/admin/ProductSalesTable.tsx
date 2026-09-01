"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Package, Search, X } from "lucide-react";
import { formatPrice } from "@/lib/utils/format";
import { ExcludedUnitsCell, ExcludedUnitsNote } from "@/components/admin/ExcludedUnits";
import type { ProductSalesRow } from "@/types";

/**
 * Product-wise sales list with a client-side search. Every row for the period is
 * already loaded, so filtering happens in the browser — instantly, and the
 * summary cards follow the filter so a search like "zebronics" reads out that
 * brand's units and revenue rather than the whole period's.
 *
 * "Units" counts only live orders (confirmed → delivered). Never-confirmed,
 * cancelled and returned units are held out and reported in their own column /
 * summary note rather than being mixed into the item count.
 */
export function ProductSalesTable({ rows, qs }: { rows: ProductSalesRow[]; qs: string }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    const terms = q.split(/\s+/);
    return rows.filter((r) => {
      const hay = `${r.product_name} ${r.product_sku}`.toLowerCase();
      return terms.every((t) => hay.includes(t));
    });
  }, [rows, query]);

  const totalUnits = filtered.reduce((a, r) => a + r.units, 0);
  const totalRevenue = filtered.reduce((a, r) => a + r.revenue, 0);
  const totalPending = filtered.reduce((a, r) => a + r.pendingRevenue, 0);
  const isFiltered = filtered.length !== rows.length;

  const excluded = filtered.reduce(
    (a, r) => ({
      placedUnits:    a.placedUnits    + r.placedUnits,
      cancelledUnits: a.cancelledUnits + r.cancelledUnits,
      returnedUnits:  a.returnedUnits  + r.returnedUnits,
    }),
    { placedUnits: 0, cancelledUnits: 0, returnedUnits: 0 }
  );

  return (
    <div className="space-y-5">
      <div className="relative max-w-xl">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search product name or SKU…"
          aria-label="Search products"
          className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-10 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label="Clear search"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <Card title={isFiltered ? "Products matched" : "Products sold"} value={String(filtered.length)} />
        <Card title="Units sold" value={String(totalUnits)} />
        <Card title="Collected" value={formatPrice(totalRevenue)} />
        <Card title="Estimated incoming" value={formatPrice(totalPending)} amber />
      </div>

      <ExcludedUnitsNote row={excluded} label="units sold" />

      {isFiltered && (
        <p className="-mt-2 text-xs text-gray-400">
          Totals above cover the {filtered.length} matching product
          {filtered.length === 1 ? "" : "s"} of {rows.length}.
        </p>
      )}

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-gray-100 bg-white p-10 text-center text-sm text-gray-400 shadow-sm">
          {rows.length === 0 ? "No products sold in this period." : "No products match this search."}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Product</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-600">Orders</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-600">Units sold</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-600">Prepaid / COD</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-600">Collected</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-600">Est. incoming</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-600">Not counted</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.product_id} className="border-b border-gray-50 transition-colors hover:bg-gray-50/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {r.product_image ? (
                        <Image
                          src={r.product_image}
                          alt=""
                          width={36}
                          height={36}
                          className="h-9 w-9 flex-shrink-0 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100">
                          <Package className="h-4 w-4 text-gray-400" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="truncate font-medium text-gray-800">{r.product_name}</p>
                        <p className="font-mono text-xs text-gray-400">{r.product_sku}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600">{r.orders}</td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-900">{r.units}</td>
                  <td className="px-4 py-3 text-right text-xs text-gray-500">
                    {r.prepaidUnits} / {r.codUnits}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-900">{formatPrice(r.revenue)}</td>
                  <td className="px-4 py-3 text-right text-amber-700">
                    {r.pendingRevenue > 0 ? formatPrice(r.pendingRevenue) : "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <ExcludedUnitsCell row={r} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/dashboard/products${qs}&product=${r.product_id}`}
                      className="font-medium text-brand-600 hover:text-brand-700"
                    >
                      Day-wise
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Card({ title, value, amber }: { title: string; value: string; amber?: boolean }) {
  return (
    <div
      className={`rounded-2xl border p-5 shadow-sm ${
        amber ? "border-amber-100 bg-amber-50/50" : "border-gray-100 bg-white"
      }`}
    >
      <p className={`text-sm ${amber ? "text-amber-700" : "text-gray-500"}`}>{title}</p>
      <p className={`mt-1 text-2xl font-black ${amber ? "text-amber-900" : "text-gray-900"}`}>{value}</p>
    </div>
  );
}
