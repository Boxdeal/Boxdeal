"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useState } from "react";
import { CalendarDays } from "lucide-react";
import type { DashboardPeriod } from "@/types";

const PRESETS: { value: DashboardPeriod; label: string }[] = [
  { value: "today",      label: "Today" },
  { value: "yesterday",  label: "Yesterday" },
  { value: "week",       label: "This Week" },
  { value: "month",      label: "This Month" },
  { value: "last_month", label: "Last Month" },
  { value: "all",        label: "All Time" },
];

const pillBase = "rounded-full px-4 py-1.5 text-sm font-medium whitespace-nowrap transition-colors";
const pillOn   = "bg-brand-500 text-white";
const pillOff  = "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50";

/**
 * URL-driven period picker: preset pills + a custom from–to range. Preserves
 * any other query params already on the page (e.g. ?status=shipped).
 */
export function PeriodSelector({ defaultPeriod = "today" }: { defaultPeriod?: DashboardPeriod }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const activePeriod = (params.get("period") as DashboardPeriod | null) ?? defaultPeriod;
  const urlFrom = params.get("from") ?? "";
  const urlTo = params.get("to") ?? "";
  const [from, setFrom] = useState(urlFrom);
  const [to, setTo] = useState(urlTo);
  // A custom range where both ends are the same day is a single-day view.
  const isSingleDay = activePeriod === "custom" && !!urlFrom && urlFrom === urlTo;
  const [day, setDay] = useState(isSingleDay ? urlFrom : "");

  function apply(next: Record<string, string | null>) {
    const sp = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(next)) {
      if (v === null || v === "") sp.delete(k);
      else sp.set(k, v);
    }
    router.push(`${pathname}?${sp.toString()}`);
  }

  const selectPreset = (value: DashboardPeriod) => {
    setDay("");
    apply({ period: value, from: null, to: null });
  };

  const applyCustom = () => {
    if (!from || !to) return;
    setDay(from === to ? from : "");
    apply({ period: "custom", from, to });
  };

  // "Kisi bhi din" — a single date is just a custom range with from === to.
  const applyDay = (value: string) => {
    setDay(value);
    if (value) apply({ period: "custom", from: value, to: value });
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {PRESETS.map((p) => (
        <button
          key={p.value}
          type="button"
          onClick={() => selectPreset(p.value)}
          className={`${pillBase} ${activePeriod === p.value ? pillOn : pillOff}`}
        >
          {p.label}
        </button>
      ))}

      {/* Pick any single day */}
      <label
        className={`flex items-center gap-1.5 rounded-full border px-3 py-1 ${
          isSingleDay ? "border-brand-500 bg-brand-50" : "border-gray-200 bg-white"
        }`}
      >
        <CalendarDays className="h-3.5 w-3.5 text-gray-400" />
        <span className="text-xs font-medium text-gray-500">Any day</span>
        <input
          type="date"
          value={day}
          onChange={(e) => applyDay(e.target.value)}
          className="rounded bg-transparent px-1 py-0.5 text-sm text-gray-700 outline-none"
          aria-label="Pick a single day"
        />
      </label>

      <div
        className={`flex items-center gap-1.5 rounded-full border px-2 py-1 ${
          activePeriod === "custom" && !isSingleDay ? "border-brand-500 bg-brand-50" : "border-gray-200 bg-white"
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
