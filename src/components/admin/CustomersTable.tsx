"use client";

import { useMemo, useState } from "react";
import { Search, Mail, Phone } from "lucide-react";
import { formatPrice } from "@/lib/utils/format";
import { getInitials } from "@/lib/utils/helpers";

export interface CustomerRow {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  joined: string;
  orderCount: number;
  totalSpent: number;
}

export function CustomersTable({ customers }: { customers: CustomerRow[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return customers;
    const terms = q.split(/\s+/);
    return customers.filter((c) => {
      const hay = [c.name, c.email, c.phone].filter(Boolean).join(" ").toLowerCase();
      return terms.every((t) => hay.includes(t));
    });
  }, [customers, query]);

  return (
    <div className="space-y-4">
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, email or phone…"
          className="w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 py-2.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
        />
      </div>

      <p className="text-xs text-gray-400">
        {filtered.length} of {customers.length} customer{customers.length !== 1 ? "s" : ""}
      </p>

      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Customer</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Contact</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Orders</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Total Spent</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Joined</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-gray-400">No customers found</td>
              </tr>
            )}
            {filtered.map((c) => (
              <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
                      {getInitials(c.name) || "U"}
                    </div>
                    <span className="font-medium text-gray-900">{c.name || "Unnamed"}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-600">
                  <div className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5 text-gray-400" /> {c.email || "—"}</div>
                  {c.phone && <div className="mt-0.5 flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 text-gray-400" /> {c.phone}</div>}
                </td>
                <td className="px-4 py-3 font-semibold text-gray-900">{c.orderCount}</td>
                <td className="px-4 py-3 font-semibold text-gray-900">{formatPrice(c.totalSpent)}</td>
                <td className="px-4 py-3 text-gray-500">{new Date(c.joined).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
