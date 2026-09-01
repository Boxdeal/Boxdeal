import type { ExcludedUnits as ExcludedUnitsType } from "@/types";

/**
 * The units held OUT of a product's item count, shown separately by reason.
 *
 * These are never netted off the headline count — "Units" means units actually
 * sold (confirmed → delivered), and anything never confirmed, cancelled or
 * returned is reported here instead.
 */

const PARTS = [
  { key: "placedUnits",    label: "not confirmed", color: "text-gray-500" },
  { key: "cancelledUnits", label: "cancelled",     color: "text-red-500" },
  { key: "returnedUnits",  label: "returned",      color: "text-orange-600" },
] as const;

export function excludedTotal(e: ExcludedUnitsType): number {
  return e.placedUnits + e.cancelledUnits + e.returnedUnits;
}

/** Compact inline breakdown for a table cell, e.g. "3 cancelled · 1 returned". */
export function ExcludedUnitsCell({ row }: { row: ExcludedUnitsType }) {
  const parts = PARTS.filter((p) => row[p.key] > 0);
  if (parts.length === 0) return <span className="text-gray-300">—</span>;

  return (
    <span className="whitespace-nowrap text-xs">
      {parts.map((p, i) => (
        <span key={p.key}>
          {i > 0 && <span className="text-gray-300"> · </span>}
          <span className={p.color}>
            {row[p.key]} {p.label}
          </span>
        </span>
      ))}
    </span>
  );
}

/** Full-width callout listing the same breakdown, for a summary area. */
export function ExcludedUnitsNote({ row, label }: { row: ExcludedUnitsType; label?: string }) {
  const parts = PARTS.filter((p) => row[p.key] > 0);
  if (parts.length === 0) return null;

  return (
    <div className="rounded-2xl border border-gray-100 bg-gray-50/70 px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
        Not counted in {label ?? "units"}
      </p>
      <div className="mt-1.5 flex flex-wrap items-baseline gap-x-5 gap-y-1">
        {parts.map((p) => (
          <span key={p.key} className="text-sm">
            <span className={`font-bold ${p.color}`}>{row[p.key]}</span>{" "}
            <span className="text-gray-500">{p.label}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
