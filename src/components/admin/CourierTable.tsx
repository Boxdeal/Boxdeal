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
function Count({ n, href, className }: { n: number; href: string; className?: string }) {
  if (n === 0) return <span className="text-gray-300">—</span>;
  return (
    <Link href={href} className={cn("font-semibold hover:underline", className)}>
      {n}
    </Link>
  );
}

function rateTone(value: number, good: boolean): string {
  const ok = good ? value >= 90 : value <= 10;
  const warn = good ? value >= 75 : value <= 25;
  return ok ? "text-green-600" : warn ? "text-amber-600" : "text-red-600";
}

function Rate({ value, good }: { value: number | null; good: boolean }) {
  if (value === null) return <span className="text-gray-300">—</span>;
  return <span className={cn("font-semibold", rateTone(value, good))}>{value.toFixed(1)}%</span>;
}

const days = (d: number | null) => (d === null ? "—" : `${d.toFixed(1)}d`);

/** A thin share-of-volume bar so the busiest partner is obvious at a glance. */
function ShareBar({ parcels, of }: { parcels: number; of: number }) {
  const pct = of > 0 ? (parcels / of) * 100 : 0;
  return (
    <div className="flex items-center gap-2">
      <span className="w-8 text-right font-semibold text-gray-900">{parcels}</span>
      <div className="h-1.5 w-12 overflow-hidden rounded-full bg-gray-100 xl:w-16">
        <div className="h-full rounded-full bg-brand-500" style={{ width: `${Math.max(pct, 2)}%` }} />
      </div>
      <span className="hidden w-8 text-[11px] text-gray-400 2xl:inline">{pct.toFixed(0)}%</span>
    </div>
  );
}

/**
 * Partner-wise delivery scorecard. Each row expands to the individual Shiprocket
 * services (weight slabs / air vs surface) that make up the partner's volume,
 * because that's what actually shows on the AWB.
 *
 * Thirteen columns can't shrink into a phone, and a horizontally scrolled table
 * hides the very numbers this page exists for — so below `lg` the same data is
 * rendered as one card per partner instead of a table in a scroller.
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
      <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-sm sm:p-10">
        <Truck className="mx-auto h-8 w-8 text-gray-300" />
        <p className="mt-2 text-sm text-gray-400">
          No parcel was handed to a courier in this period.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Sort control. Scrolls sideways on a phone rather than stacking into
          four cramped rows. */}
      <div className="-mx-4 flex items-center gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
        <span className="flex-shrink-0 text-xs font-medium text-gray-500">Sort by</span>
        {SORTS.map((s) => (
          <button
            key={s.key}
            type="button"
            onClick={() => setSort(s.key)}
            className={cn(
              "flex-shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors",
              sort === s.key
                ? "bg-brand-500 text-white"
                : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
            )}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* ── Phone / tablet: one card per partner ─────────────────────────── */}
      <div className="space-y-3 lg:hidden">
        {sorted.map((r) => {
          const expanded = open.has(r.name);
          const multi = r.services.length > 1;
          const share = totalParcels > 0 ? (r.parcels / totalParcels) * 100 : 0;
          return (
            <div key={r.name} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <Link href={link(r.name)} className="block truncate font-bold text-gray-900 hover:text-brand-600">
                    {r.name}
                  </Link>
                  <p className="mt-0.5 text-[11px] text-gray-400">
                    {r.services.length} service{r.services.length === 1 ? "" : "s"} ·{" "}
                    {formatPrice(r.value)} shipped
                  </p>
                </div>
                <div className="flex-shrink-0 text-right">
                  <p className="text-xl font-black leading-none text-gray-900">{r.parcels}</p>
                  <p className="text-[11px] text-gray-400">{share.toFixed(0)}% of all</p>
                </div>
              </div>

              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-gray-100">
                <div className="h-full rounded-full bg-brand-500" style={{ width: `${Math.max(share, 2)}%` }} />
              </div>

              <dl className="mt-3 grid grid-cols-3 gap-x-2 gap-y-3 border-t border-gray-50 pt-3 text-center">
                <Stat label="Delivered"><Count n={r.delivered} href={link(r.name, "delivered")} className="text-green-600" /></Stat>
                <Stat label="RTO"><Count n={r.rto} href={link(r.name, "rto")} className="text-red-600" /></Stat>
                <Stat label="In transit"><Count n={r.inTransit} href={link(r.name, "transit")} className="text-blue-600" /></Stat>
                <Stat label="Returned"><Count n={r.customerReturn} href={link(r.name, "returned")} className="text-gray-500" /></Stat>
                <Stat label="Cancelled"><Count n={r.cancelled} href={link(r.name, "cancelled")} className="text-amber-600" /></Stat>
                <Stat label="Avg days"><span className="font-semibold text-gray-700">{days(r.avgDeliveryDays)}</span></Stat>
              </dl>

              <div className="mt-3 flex items-center justify-between gap-2 border-t border-gray-50 pt-3 text-xs">
                <span className="text-gray-500">
                  Delivery <Rate value={r.deliveryRate} good />
                </span>
                <span className="text-gray-500">
                  RTO <Rate value={r.rtoRate} good={false} />
                </span>
                <span className="text-gray-500">
                  {r.codParcels} COD / {r.prepaidParcels} prepaid
                </span>
              </div>

              {multi && (
                <>
                  <button
                    type="button"
                    onClick={() => toggle(r.name)}
                    aria-expanded={expanded}
                    className="mt-3 flex w-full items-center justify-center gap-1 rounded-lg bg-gray-50 py-1.5 text-xs font-medium text-gray-600"
                  >
                    {expanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                    {expanded ? "Hide" : "Show"} {r.services.length} services
                  </button>
                  {expanded && (
                    <ul className="mt-2 space-y-1.5">
                      {r.services.map((s) => (
                        <li key={s.name} className="rounded-lg bg-gray-50 px-3 py-2">
                          <Link href={link(s.name)} className="flex items-center justify-between gap-2 text-xs">
                            <span className="min-w-0 truncate text-gray-700">{s.name}</span>
                            <span className="flex-shrink-0 font-semibold text-gray-900">{s.parcels}</span>
                          </Link>
                          <p className="mt-1 flex flex-wrap gap-x-3 text-[11px] text-gray-500">
                            <span className="text-green-600">{s.delivered} delivered</span>
                            <span className="text-red-600">{s.rto} RTO</span>
                            <span>{days(s.avgDeliveryDays)}</span>
                            {s.deliveryRate !== null && (
                              <span className={rateTone(s.deliveryRate, true)}>
                                {s.deliveryRate.toFixed(0)}%
                              </span>
                            )}
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Desktop: the full table ──────────────────────────────────────── */}
      <div className="hidden overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm lg:block">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="whitespace-nowrap border-b border-gray-100 bg-gray-50 text-left">
              <th className="px-2.5 py-3 font-semibold text-gray-600">Courier&nbsp;partner</th>
              <th className="px-2.5 py-3 font-semibold text-gray-600">Parcels</th>
              <th className="px-2.5 py-3 font-semibold text-gray-600">In&nbsp;transit</th>
              <th className="px-2.5 py-3 font-semibold text-gray-600">Delivered</th>
              <th className="px-2.5 py-3 font-semibold text-gray-600">RTO</th>
              <th className="px-2.5 py-3 font-semibold text-gray-600">Returned</th>
              <th className="px-2.5 py-3 font-semibold text-gray-600">Cancelled</th>
              <th className="px-2.5 py-3 font-semibold text-gray-600">Delivery&nbsp;rate</th>
              <th className="px-2.5 py-3 font-semibold text-gray-600">RTO&nbsp;rate</th>
              <th className="px-2.5 py-3 font-semibold text-gray-600">Avg&nbsp;days</th>
              <th className="px-2.5 py-3 font-semibold text-gray-600">COD&nbsp;/&nbsp;Prepaid</th>
              <th className="px-2.5 py-3 font-semibold text-gray-600">Value&nbsp;shipped</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((r) => {
              const expanded = open.has(r.name);
              const multi = r.services.length > 1;
              return (
                <Fragment key={r.name}>
                  <tr className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="px-2.5 py-3">
                      <div className="flex items-center gap-1.5">
                        {multi ? (
                          <button
                            type="button"
                            onClick={() => toggle(r.name)}
                            aria-expanded={expanded}
                            aria-label={`${expanded ? "Hide" : "Show"} ${r.name} services`}
                            className="rounded text-gray-400 hover:text-gray-700"
                          >
                            {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                          </button>
                        ) : (
                          <span className="w-4" />
                        )}
                        <Link
                          href={link(r.name)}
                          className="whitespace-nowrap font-semibold text-gray-900 hover:text-brand-600"
                        >
                          {r.name}
                        </Link>
                      </div>
                      <span className="ml-6 block whitespace-nowrap text-[11px] text-gray-400">
                        {r.services.length} service{r.services.length === 1 ? "" : "s"}
                      </span>
                    </td>
                    <td className="px-2.5 py-3"><ShareBar parcels={r.parcels} of={totalParcels} /></td>
                    <td className="px-2.5 py-3"><Count n={r.inTransit} href={link(r.name, "transit")} className="text-blue-600" /></td>
                    <td className="px-2.5 py-3"><Count n={r.delivered} href={link(r.name, "delivered")} className="text-green-600" /></td>
                    <td className="px-2.5 py-3"><Count n={r.rto} href={link(r.name, "rto")} className="text-red-600" /></td>
                    <td className="px-2.5 py-3"><Count n={r.customerReturn} href={link(r.name, "returned")} className="text-gray-500" /></td>
                    <td className="px-2.5 py-3"><Count n={r.cancelled} href={link(r.name, "cancelled")} className="text-amber-600" /></td>
                    <td className="px-2.5 py-3"><Rate value={r.deliveryRate} good /></td>
                    <td className="px-2.5 py-3"><Rate value={r.rtoRate} good={false} /></td>
                    <td className="px-2.5 py-3 text-gray-600">{days(r.avgDeliveryDays)}</td>
                    <td className="px-2.5 py-3 text-gray-600">
                      {r.codParcels} / {r.prepaidParcels}
                      {r.codCollected > 0 && (
                        <span className="block whitespace-nowrap text-[11px] text-gray-400">
                          {formatPrice(r.codCollected)} collected
                        </span>
                      )}
                    </td>
                    <td className="px-2.5 py-3 font-semibold text-gray-900">
                      {formatPrice(r.value)}
                      <span className="block whitespace-nowrap text-[11px] font-normal text-gray-400">
                        {formatPrice(r.deliveredValue)} delivered
                      </span>
                    </td>
                  </tr>

                  {expanded &&
                    r.services.map((s) => (
                      <tr key={`${r.name}::${s.name}`} className="border-b border-gray-50 bg-gray-50/40 text-[13px]">
                        <td className="whitespace-nowrap py-2 pl-8 pr-2.5">
                          <Link href={link(s.name)} className="text-gray-600 hover:text-brand-600">
                            {s.name}
                          </Link>
                        </td>
                        <td className="px-2.5 py-2"><ShareBar parcels={s.parcels} of={r.parcels} /></td>
                        <td className="px-2.5 py-2"><Count n={s.inTransit} href={link(s.name, "transit")} className="text-blue-600" /></td>
                        <td className="px-2.5 py-2"><Count n={s.delivered} href={link(s.name, "delivered")} className="text-green-600" /></td>
                        <td className="px-2.5 py-2"><Count n={s.rto} href={link(s.name, "rto")} className="text-red-600" /></td>
                        <td className="px-2.5 py-2"><Count n={s.customerReturn} href={link(s.name, "returned")} className="text-gray-500" /></td>
                        <td className="px-2.5 py-2"><Count n={s.cancelled} href={link(s.name, "cancelled")} className="text-amber-600" /></td>
                        <td className="px-2.5 py-2"><Rate value={s.deliveryRate} good /></td>
                        <td className="px-2.5 py-2"><Rate value={s.rtoRate} good={false} /></td>
                        <td className="px-2.5 py-2 text-gray-600">{days(s.avgDeliveryDays)}</td>
                        <td className="px-2.5 py-2 text-gray-600">{s.codParcels} / {s.prepaidParcels}</td>
                        <td className="px-2.5 py-2 text-gray-700">{formatPrice(s.value)}</td>
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

function Stat({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[10px] uppercase tracking-wide text-gray-400">{label}</dt>
      <dd className="mt-0.5 text-base">{children}</dd>
    </div>
  );
}
