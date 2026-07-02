"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useState } from "react";
import type { DashboardPeriod } from "@/types";

const PRESETS: { value: DashboardPeriod; label: string }[] = [
  { value: "today",      label: "Today" },
  { value: "week",       label: "This Week" },
  { value: "month",      label: "This Month" },
  { value: "last_month", label: "Last Month" },
  { value: "all",        label: "All Time" },
];

/**
 * URL-driven period picker: preset pills + a custom from–to range. Preserves
 * any other query params already on the page (e.g. ?status=shipped).
 */
export function PeriodSelector({ defaultPeriod = "today" }: { defaultPeriod?: DashboardPeriod }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const activePeriod = (params.get("period") as DashboardPeriod | null) ?? defaultPeriod;
  const [from, setFrom] = useState(params.get("from") ?? "");
  const [to, setTo] = useState(params.get("to") ?? "");

  function apply(next: Record<string, string | null>) {
    const sp = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(next)) {
      if (v === null || v === "") sp.delete(k);
      else sp.set(k, v);
    }
    router.push(`${pathname}?${sp.toString()}`);
  }

  const selectPreset = (value: DashboardPeriod) =>
    apply({ period: value, from: null, to: null });

  const applyCustom = () => {
    if (!from || !to) return;
    apply({ period: "custom", from, to });
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {PRESETS.map((p) => (
        <button
          key={p.value}
          type="button"
          onClick={() => selectPreset(p.value)}
          className={`rounded-full px-4 py-1.5 text-sm font-medium whitespace-nowrap transition-colors ${
            activePeriod === p.value
              ? "bg-brand-500 text-white"
              : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
          }`}
        >
          {p.label}
        </button>
      ))}

      <div
        className={`flex items-center gap-1.5 rounded-full border px-2 py-1 ${
          activePeriod === "custom" ? "border-brand-500 bg-brand-50" : "border-gray-200 bg-white"
        }`}
      >
        <input
          type="date"
          value={from}
          max={to || undefined}
          onChange={(e) => setFrom(e.target.value)}
          className="rounded bg-transparent px-1.5 py-0.5 text-sm text-gray-700 outline-none"
          aria-label="From date"
        />
        <span className="text-gray-400">→</span>
        <input
          type="date"
          value={to}
          min={from || undefined}
          onChange={(e) => setTo(e.target.value)}
          className="rounded bg-transparent px-1.5 py-0.5 text-sm text-gray-700 outline-none"
          aria-label="To date"
        />
        <button
          type="button"
          onClick={applyCustom}
          disabled={!from || !to}
          className="rounded-full bg-brand-500 px-3 py-1 text-xs font-semibold text-white disabled:opacity-40"
        >
          Apply
        </button>
      </div>
    </div>
  );
}
