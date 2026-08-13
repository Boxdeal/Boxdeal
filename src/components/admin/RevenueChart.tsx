"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";
import type { RevenueChartPoint } from "@/types";

interface RevenueChartProps {
  data: RevenueChartPoint[];
  title?: string;
  /** Split the revenue area into prepaid vs COD instead of one total line. */
  split?: boolean;
}

const inr = (v: number | undefined) => `₹${(v ?? 0).toLocaleString("en-IN")}`;

function CustomTooltip({ active, payload, label, split }: {
  active?: boolean;
  payload?: Array<{ value: number; name: string; dataKey: string }>;
  label?: string;
  split?: boolean;
}) {
  if (!active || !payload?.length) return null;
  const at = (key: string) => payload.find((p) => p.dataKey === key)?.value;

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-3 shadow-lg text-sm">
      <p className="font-semibold text-gray-700">{label}</p>
      {split ? (
        <>
          <p className="text-brand-600">Prepaid: {inr(at("prepaidRevenue"))}</p>
          <p className="text-indigo-600">COD: {inr(at("codRevenue"))}</p>
          <p className="mt-1 border-t border-gray-100 pt-1 font-semibold text-gray-700">
            Total: {inr((at("prepaidRevenue") ?? 0) + (at("codRevenue") ?? 0))}
          </p>
        </>
      ) : (
        <>
          <p className="text-brand-600">Revenue: {inr(at("revenue"))}</p>
          <p className="text-gray-500">Orders: {at("orders")}</p>
        </>
      )}
    </div>
  );
}

export function RevenueChart({ data, title = "Revenue (Last 30 Days)", split = false }: RevenueChartProps) {
  const formatted = data.map((d) => ({
    ...d,
    dateLabel: format(new Date(d.date), "dd MMM"),
  }));

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-semibold text-gray-900">{title}</h3>
        {split && (
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-brand-500" /> Prepaid
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-indigo-500" /> COD
            </span>
          </div>
        )}
      </div>
      {formatted.length === 0 ? (
        <div className="flex h-[240px] items-center justify-center text-sm text-gray-400">
          No orders in this period.
        </div>
      ) : (
      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={formatted} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
          <defs>
            <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#f97316" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="codGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
          <XAxis
            dataKey="dateLabel"
            tick={{ fontSize: 11, fill: "#9ca3af" }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#9ca3af" }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`}
          />
          <Tooltip content={<CustomTooltip split={split} />} />
          {split ? (
            <>
              {/* Stacked so the band height reads as total revenue. */}
              <Area
                type="monotone"
                stackId="rev"
                dataKey="prepaidRevenue"
                stroke="#f97316"
                strokeWidth={2}
                fill="url(#revenueGrad)"
              />
              <Area
                type="monotone"
                stackId="rev"
                dataKey="codRevenue"
                stroke="#6366f1"
                strokeWidth={2}
                fill="url(#codGrad)"
              />
            </>
          ) : (
            <>
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#f97316"
                strokeWidth={2}
                fill="url(#revenueGrad)"
              />
              <Area
                type="monotone"
                dataKey="orders"
                stroke="#6366f1"
                strokeWidth={2}
                fill="none"
              />
            </>
          )}
        </AreaChart>
      </ResponsiveContainer>
      )}
    </div>
  );
}
