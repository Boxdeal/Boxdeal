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
}

function CustomTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ value: number; name: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-3 shadow-lg text-sm">
      <p className="font-semibold text-gray-700">{label}</p>
      <p className="text-brand-600">
        Revenue: ₹{payload[0]?.value?.toLocaleString("en-IN")}
      </p>
      <p className="text-gray-500">
        Orders: {payload[1]?.value}
      </p>
    </div>
  );
}

export function RevenueChart({ data }: RevenueChartProps) {
  const formatted = data.map((d) => ({
    ...d,
    dateLabel: format(new Date(d.date), "dd MMM"),
  }));

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <h3 className="mb-4 font-semibold text-gray-900">Revenue (Last 30 Days)</h3>
      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={formatted} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
          <defs>
            <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#f97316" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
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
          <Tooltip content={<CustomTooltip />} />
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
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
