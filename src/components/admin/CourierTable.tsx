"use client";

import { Fragment, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronRight, Truck } from "lucide-react";
import { cn } from "@/lib/utils/helpers";
import { formatPrice } from "@/lib/utils/format";
import type { ParcelState } from "@/lib/admin/order-buckets";
import type { CourierRow } from "@/types";

type SortKey = "parcels" | "delivered" | "deliveryRate" | "rto" | "value" | "avgDeliveryDays";

const SORTS: { key: SortKey; label: string }[] = [
  { key: "parcels",         label: "Parcels" },
  { key: "delivered",       label: "Delivered" },
  { key: "deliveryRate",    label: "Delivery rate" },
  { key: "rto",             label: "RTO" },
  { key: "value",           label: "Value" },
  { key: "avgDeliveryDays", label: "Speed" },
];

/** null sorts last on every key — an unmeasured courier isn't a good one. */
function compare(a: CourierRow, b: CourierRow, key: SortKey): number {
  if (key === "avgDeliveryDays") {
    // Fastest first, and a courier with nothing delivered yet has no speed.
    if (a.avgDeliveryDays === null) return b.avgDeliveryDays === null ? 0 : 1;
    if (b.avgDeliveryDays === null) return -1;
    return a.avgDeliveryDays - b.avgDeliveryDays;
  }
  const av = a[key] ?? -1;
  const bv = b[key] ?? -1;
  return (bv as number) - (av as number);
}

/**
 * A count that drills into exactly the parcels behind it. Zero stays plain text
 * — a link to an empty list is just a dead end.
 */
function Count({
  n, href, className,
}: { n: number; href: string; className?: string }) {
  if (n === 0) return <span className="text-gray-300">—</span>;
  return (
    <Link href={href} className={cn("font-semibold hover:underline", className)}>
      {n}
    </Link>
  );
}

function Rate({ value, good }: { value: number | null; good: boolean }) {
  if (value === null) return <span className="text-gray-300">—</span>;
  const ok = good ? value >= 90 : value <= 10;
  const warn = good ? value >= 75 : value <= 25;
  return (
    <span
      className={cn(
        "font-semibold",
        ok ? "text-green-600" : warn ? "text-amber-600" : "text-red-600"
      )}
    >
      {value.toFixed(1)}%
    </span>
  );
}

/** A thin share-of-volume bar so the busiest partner is obvious at a glance. */
function ShareBar({ parcels, of }: { parcels: number; of: number }) {
  const pct = of > 0 ? (parcels / of) * 100 : 0;
  return (
    <div className="flex items-center gap-2">
      <span className="w-10 text-right font-semibold text-gray-900">{parcels}</span>
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-gray-100">
        <div className="h-full rounded-full bg-brand-500" style={{ width: `${Math.max(pct, 2)}%` }} />
      </div>
      <span className="w-10 text-[11px] text-gray-400">{pct.toFixed(0)}%</span>
    </div>
  );
}

/**
 * Partner-wise delivery scorecard. Each row expands to the individual Shiprocket
 * services (weight slabs / air vs surface) that make up the partner's volume,
 * because that's what actually shows on the AWB.
 */
export function CourierTable({
  rows,
  totalParcels,
  qs,
}: {
  rows: CourierRow[];
  totalParcels: number;
  qs: string;
}) {
  const [sort, setSort] = useState<SortKey>("parcels");
  const [open, setOpen] = useState<Set<string>>(new Set());

  const sorted = useMemo(() => [...rows].sort((a, b) => compare(a, b, sort)), [rows, sort]);

  /** Drill-down for one courier, optionally narrowed to a single parcel state. */
  const link = (name: string, state?: ParcelState) =>
    `/admin/dashboard/delivery${qs}&courier=${encodeURIComponent(name)}` +
    (state ? `&state=${state}` : "");

  function toggle(name: string) {
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white p-10 text-center shadow-sm">
        <Truck className="mx-auto h-8 w-8 text-gray-300" />
        <p className="mt-2 text-sm text-gray-400">
          No parcel was handed to a courier in this period.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-gray-500">Sort by</span>
        {SORTS.map((s) => (
          <button
            key={s.key}
            type="button"
            onClick={() => setSort(s.key)}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium transition-colors",
              sort === s.key
                ? "bg-brand-500 text-white"
                : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
            )}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50 text-left">
              <th className="px-4 py-3 font-semibold text-gray-600">Courier partner</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Parcels</th>
              <th className="px-4 py-3 font-semibold text-gray-600">In transit</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Delivered</th>
              <th className="px-4 py-3 font-semibold text-gray-600">RTO</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Returned</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Cancelled</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Delivery&nbsp;rate</th>
              <th className="px-4 py-3 font-semibold text-gray-600">RTO&nbsp;rate</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Avg&nbsp;days</th>
              <th className="px-4 py-3 font-semibold text-gray-600">COD&nbsp;/&nbsp;Prepaid</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Value shipped</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {sorted.map((r) => {
              const expanded = open.has(r.name);
              const multi = r.services.length > 1;
              return (
                <Fragment key={r.name}>
                  <tr className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => multi && toggle(r.name)}
                        disabled={!multi}
                        className={cn(
                          "flex items-center gap-1.5 text-left font-semibold text-gray-900",
                          multi && "hover:text-brand-600"
                        )}
                        aria-expanded={multi ? expanded : undefined}
                      >
                        {multi ? (
                          expanded ? <ChevronDown className="h-4 w-4 text-gray-400" />
                                   : <ChevronRight className="h-4 w-4 text-gray-400" />
                        ) : (
                          <span className="w-4" />
                        )}
                        {r.name}
                      </button>
                      <span className="ml-6 block text-[11px] text-gray-400">
                        {r.services.length} service{r.services.length === 1 ? "" : "s"}
                        {multi && !expanded && " — click to expand"}
                      </span>
                    </td>
                    <td className="px-4 py-3"><ShareBar parcels={r.parcels} of={totalParcels} /></td>
                    <td className="px-4 py-3"><Count n={r.inTransit} href={link(r.name, "transit")} className="text-blue-600" /></td>
                    <td className="px-4 py-3"><Count n={r.delivered} href={link(r.name, "delivered")} className="text-green-600" /></td>
                    <td className="px-4 py-3"><Count n={r.rto} href={link(r.name, "rto")} className="text-red-600" /></td>
                    <td className="px-4 py-3"><Count n={r.customerReturn} href={link(r.name, "returned")} className="text-gray-500" /></td>
                    <td className="px-4 py-3"><Count n={r.cancelled} href={link(r.name, "cancelled")} className="text-amber-600" /></td>
                    <td className="px-4 py-3"><Rate value={r.deliveryRate} good /></td>
                    <td className="px-4 py-3"><Rate value={r.rtoRate} good={false} /></td>
                    <td className="px-4 py-3 text-gray-600">
                      {r.avgDeliveryDays === null ? "—" : `${r.avgDeliveryDays.toFixed(1)}d`}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {r.codParcels} / {r.prepaidParcels}
                      {r.codCollected > 0 && (
                        <span className="block text-[11px] text-gray-400">
                          {formatPrice(r.codCollected)} cash collected
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-900">
                      {formatPrice(r.value)}
                      <span className="block text-[11px] font-normal text-gray-400">
                        {formatPrice(r.deliveredValue)} delivered
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={link(r.name)}
                        className="font-medium text-brand-600 hover:text-brand-700"
                      >
                        Parcels
                      </Link>
                    </td>
                  </tr>

                  {expanded &&
                    r.services.map((s) => (
                      <tr key={`${r.name}::${s.name}`} className="border-b border-gray-50 bg-gray-50/40 text-[13px]">
                        <td className="py-2 pl-12 pr-4 text-gray-600">{s.name}</td>
                        <td className="px-4 py-2"><ShareBar parcels={s.parcels} of={r.parcels} /></td>
                        <td className="px-4 py-2"><Count n={s.inTransit} href={link(s.name, "transit")} className="text-blue-600" /></td>
                        <td className="px-4 py-2"><Count n={s.delivered} href={link(s.name, "delivered")} className="text-green-600" /></td>
                        <td className="px-4 py-2"><Count n={s.rto} href={link(s.name, "rto")} className="text-red-600" /></td>
                        <td className="px-4 py-2"><Count n={s.customerReturn} href={link(s.name, "returned")} className="text-gray-500" /></td>
                        <td className="px-4 py-2"><Count n={s.cancelled} href={link(s.name, "cancelled")} className="text-amber-600" /></td>
                        <td className="px-4 py-2"><Rate value={s.deliveryRate} good /></td>
                        <td className="px-4 py-2"><Rate value={s.rtoRate} good={false} /></td>
                        <td className="px-4 py-2 text-gray-600">
                          {s.avgDeliveryDays === null ? "—" : `${s.avgDeliveryDays.toFixed(1)}d`}
                        </td>
                        <td className="px-4 py-2 text-gray-600">{s.codParcels} / {s.prepaidParcels}</td>
                        <td className="px-4 py-2 text-gray-700">{formatPrice(s.value)}</td>
                        <td className="px-4 py-2">
                          <Link
                            href={link(s.name)}
                            className="text-xs font-medium text-brand-600 hover:text-brand-700"
                          >
                            Parcels
                          </Link>
                        </td>
                      </tr>
                    ))}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
