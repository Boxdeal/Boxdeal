import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Truck, IndianRupee, Scale, AlertTriangle } from "lucide-react";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import { StatsCard } from "@/components/admin/StatsCard";
import { PeriodSelector } from "@/components/admin/PeriodSelector";
import { getISTPeriodRange } from "@/lib/admin/periods";
import { fetchAllResult } from "@/lib/admin/fetch-all";
import { formatPrice, formatDate } from "@/lib/utils/format";
import { cn } from "@/lib/utils/helpers";
import type { DashboardPeriod } from "@/types";

export const metadata: Metadata = { title: "Shipping Cost — Admin" };
export const dynamic = "force-dynamic";

interface Row {
  id: string;
  order_number: string;
  placed_at: string;
  payment_method: string;
  status: string;
  courier_name: string | null;
  shipping_charge: number;
  quoted_courier_name: string | null;
  quoted_rate: number | null;
  quoted_weight_kg: number | null;
  shipped_weight_kg: number | null;
  shipping_cost: number | null;
  shipping_cost_extra: number | null;
}

interface Props {
  searchParams: Promise<{ period?: DashboardPeriod; from?: string; to?: string; show?: "loss" | "all" }>;
}

/**
 * What each shipment cost against what the customer paid for delivery.
 * Shipping cost is recorded when the AWB is generated (Shiprocket's price for
 * the courier that got it); the extra column is what Shiprocket charged later,
 * typed in by an admin from the Shiprocket panel.
 */
export default async function ShippingCostPage({ searchParams }: Props) {
  const { period = "month", from, to, show = "all" } = await searchParams;
  const range = getISTPeriodRange(period, { from, to });
  const admin = getSupabaseAdminClient();

  const { data, error } = await fetchAllResult<Row>((f, t) =>
    admin
      .from("orders")
      .select("id, order_number, placed_at, payment_method, status, courier_name, shipping_charge, quoted_courier_name, quoted_rate, quoted_weight_kg, shipped_weight_kg, shipping_cost, shipping_cost_extra")
      .not("tracking_number", "is", null)
      .gte("placed_at", range.start.toISOString())
      .lte("placed_at", range.end.toISOString())
      .order("id")
      .range(f, t)
  );

  const header = (
    <div>
      <Link href="/admin" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-brand-600">
        <ArrowLeft className="h-4 w-4" /> Dashboard
      </Link>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-900">Shipping Cost · {range.label}</h1>
        <PeriodSelector defaultPeriod="month" />
      </div>
      <p className="mt-1 text-sm text-gray-500">
        What the customer paid for delivery against what Shiprocket charged. Cost is recorded when the
        AWB is generated; add any later charge (weight discrepancy) on the order page. Orders shipped
        before this was set up have no cost and are left out of the totals.
      </p>
    </div>
  );

  if (error) {
    return (
      <div className="space-y-5 p-6">
        {header}
        <p className="rounded-2xl bg-amber-50 p-5 text-sm text-amber-800">
          Run <code>database/shipping_quality.sql</code> in Supabase first — the cost columns don&apos;t exist yet.
        </p>
      </div>
    );
  }

  const rows = (data ?? []).map((r) => {
    const charge = Number(r.shipping_charge) || 0;
    const cost = r.shipping_cost != null ? Number(r.shipping_cost) : null;
    const extra = Number(r.shipping_cost_extra) || 0;
    const total = cost != null ? cost + extra : null;
    return { ...r, charge, cost, extra, total, net: total != null ? charge - total : null };
  });

  const costed = rows.filter((r) => r.total != null);
  const paid = costed.reduce((s, r) => s + r.charge, 0);
  const spent = costed.reduce((s, r) => s + (r.total ?? 0), 0);
  const extraTotal = costed.reduce((s, r) => s + r.extra, 0);
  const losses = costed.filter((r) => (r.net ?? 0) < 0);
  const courierChanged = costed.filter(
    (r) => r.quoted_courier_name && r.courier_name && r.quoted_courier_name !== r.courier_name
  ).length;

  const list = (show === "loss" ? losses : rows).sort((a, b) => (a.net ?? Infinity) - (b.net ?? Infinity));

  const q = new URLSearchParams({ period });
  if (from) q.set("from", from);
  if (to) q.set("to", to);
  const showLink = (s: "loss" | "all") => {
    const sp = new URLSearchParams(q.toString());
    sp.set("show", s);
    return `?${sp.toString()}`;
  };
  const pill = (active: boolean) =>
    `rounded-full px-4 py-1.5 text-sm font-medium ${
      active ? "bg-brand-500 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
    }`;

  return (
    <div className="space-y-5 p-6">
      {header}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Shipments with cost" value={`${costed.length}`}
          subtitle={`${rows.length - costed.length} shipped without a recorded cost`}
          icon={Truck}
        />
        <StatsCard
          title="Customers paid for delivery" value={formatPrice(paid)}
          subtitle={`Shiprocket charged ${formatPrice(spent)}`}
          icon={IndianRupee}
        />
        <StatsCard
          title={paid - spent >= 0 ? "Delivery covered" : "BoxDeal paid extra"}
          value={formatPrice(Math.abs(paid - spent))}
          subtitle={`${losses.length} order${losses.length === 1 ? "" : "s"} cost more than charged`}
          icon={Scale}
          variant={paid - spent >= 0 ? "success" : "danger"}
        />
        <StatsCard
          title="Charged later" value={formatPrice(extraTotal)}
          subtitle={`${courierChanged} shipped with a different courier than quoted`}
          icon={AlertTriangle}
          variant={extraTotal > 0 ? "warning" : "default"}
        />
      </div>

      <div className="flex gap-2">
        <Link href={showLink("all")} className={pill(show !== "loss")}>All</Link>
        <Link href={showLink("loss")} className={pill(show === "loss")}>Cost more than charged</Link>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50 text-left text-gray-600">
              <th className="px-4 py-3 font-semibold">Order</th>
              <th className="px-4 py-3 font-semibold">Courier (quoted → shipped)</th>
              <th className="px-4 py-3 font-semibold">Weight (quoted → sent)</th>
              <th className="px-4 py-3 text-right font-semibold">Customer paid</th>
              <th className="px-4 py-3 text-right font-semibold">Shiprocket</th>
              <th className="px-4 py-3 text-right font-semibold">Extra later</th>
              <th className="px-4 py-3 text-right font-semibold">Difference</th>
            </tr>
          </thead>
          <tbody>
            {list.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-gray-400">No shipments</td></tr>
            )}
            {list.map((r) => (
              <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                <td className="px-4 py-3">
                  <Link href={`/admin/orders/${r.id}`} className="font-mono font-semibold text-gray-800 hover:text-brand-600">
                    {r.order_number}
                  </Link>
                  <p className="text-xs text-gray-400">
                    {formatDate(r.placed_at)} · {r.payment_method === "cod" ? "COD" : "Prepaid"}
                  </p>
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {r.quoted_courier_name && r.quoted_courier_name !== r.courier_name ? (
                    <><span className="text-gray-400">{r.quoted_courier_name} →</span> {r.courier_name ?? "—"}</>
                  ) : (r.courier_name ?? "—")}
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {r.quoted_weight_kg != null ? `${r.quoted_weight_kg} → ` : ""}
                  {r.shipped_weight_kg != null ? `${r.shipped_weight_kg} kg` : "—"}
                </td>
                <td className="px-4 py-3 text-right">{formatPrice(r.charge)}</td>
                <td className="px-4 py-3 text-right">{r.cost != null ? formatPrice(r.cost) : "—"}</td>
                <td className="px-4 py-3 text-right">{r.extra ? formatPrice(r.extra) : "—"}</td>
                <td className={cn(
                  "px-4 py-3 text-right font-semibold",
                  r.net == null ? "text-gray-400" : r.net >= 0 ? "text-green-600" : "text-red-600"
                )}>
                  {r.net == null ? "—" : r.net >= 0 ? `+${formatPrice(r.net)}` : `−${formatPrice(-r.net)}`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
