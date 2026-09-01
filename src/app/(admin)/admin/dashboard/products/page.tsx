import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Package, TrendingDown } from "lucide-react";
import { PeriodSelector } from "@/components/admin/PeriodSelector";
import { ProductSalesTable } from "@/components/admin/ProductSalesTable";
import { ProductStatusFilter } from "@/components/admin/ProductStatusFilter";
import { RevenueChart } from "@/components/admin/RevenueChart";
import { OrdersTable } from "@/components/admin/OrdersTable";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import { getISTPeriodRange, prettyDay } from "@/lib/admin/periods";
import { getProductSales, getProductDaily } from "@/lib/admin/product-sales";
import { formatPrice } from "@/lib/utils/format";
import { ORDER_STATUS_LABELS } from "@/constants";
import type { DashboardPeriod, Order, OrderStatus } from "@/types";

export const metadata: Metadata = { title: "Product Sales — Admin" };
export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{
    period?: DashboardPeriod; from?: string; to?: string; product?: string; status?: string;
  }>;
}

export default async function ProductSalesPage({ searchParams }: Props) {
  const { period = "today", from, to, product, status } = await searchParams;

  // Only accept a status we actually know — a junk ?status= must not silently
  // filter everything away.
  const statusFilter = (status && status in ORDER_STATUS_LABELS ? status : undefined) as
    | OrderStatus
    | undefined;

  const range = getISTPeriodRange(period, { from, to });
  const q = new URLSearchParams({ period });
  if (from) q.set("from", from);
  if (to) q.set("to", to);
  const qs = `?${q.toString()}`;

  return product
    ? <ProductDetail productId={product} period={period} from={from} to={to} label={range.label} qs={qs} status={statusFilter} />
    : <ProductList period={period} from={from} to={to} label={range.label} qs={qs} />;
}

/* ── Product-wise list ──────────────────────────────────────────────────── */

async function ProductList({
  period, from, to, label, qs,
}: { period: DashboardPeriod; from?: string; to?: string; label: string; qs: string }) {
  const rows = await getProductSales(period, { from, to });

  return (
    <div className="space-y-5 p-6">
      <div>
        <Link href="/admin" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-brand-600">
          <ArrowLeft className="h-4 w-4" /> Dashboard
        </Link>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold text-gray-900">Product Sales · {label}</h1>
          <PeriodSelector defaultPeriod="today" />
        </div>
      </div>

      <ProductSalesTable rows={rows} qs={qs} />

      <p className="text-xs text-gray-400">
        Units count every order placed in the period. Collected is money already in
        (COD counts on delivery); est. incoming is what is still expected. Line value is
        quantity × selling price — order-level coupon and admin discounts are not deducted.
      </p>
    </div>
  );
}

/* ── One product, day by day ────────────────────────────────────────────── */

async function ProductDetail({
  productId, period, from, to, label, qs, status,
}: {
  productId: string; period: DashboardPeriod; from?: string; to?: string;
  label: string; qs: string; status?: OrderStatus;
}) {
  const [{ days, totals, statusCounts }, orders] = await Promise.all([
    getProductDaily(productId, period, { from, to, status }),
    fetchProductOrders(productId, period, from, to, status),
  ]);

  const backHref = `/admin/dashboard/products${qs}`;
  const statusLabel = status ? ORDER_STATUS_LABELS[status] : null;

  if (!totals) {
    return (
      <div className="space-y-5 p-6">
        <Link href={backHref} className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-brand-600">
          <ArrowLeft className="h-4 w-4" /> All products
        </Link>
        <PeriodSelector defaultPeriod="today" />
        <div className="rounded-2xl border border-gray-100 bg-white p-10 text-center text-sm text-gray-400 shadow-sm">
          This product had no orders in {label}.
        </div>
      </div>
    );
  }

  const chart = days.map((d) => ({
    date: d.date,
    revenue: d.revenue,
    orders: d.orders,
    prepaidRevenue: d.prepaidRevenue,
    codRevenue: d.codRevenue,
  }));

  return (
    <div className="space-y-5 p-6">
      <div>
        <Link href={backHref} className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-brand-600">
          <ArrowLeft className="h-4 w-4" /> All products
        </Link>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {totals.product_image ? (
              <Image
                src={totals.product_image}
                alt=""
                width={44}
                height={44}
                className="h-11 w-11 rounded-xl object-cover"
              />
            ) : (
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100">
                <Package className="h-5 w-5 text-gray-400" />
              </div>
            )}
            <div>
              <h1 className="text-xl font-bold text-gray-900">{totals.product_name}</h1>
              <p className="font-mono text-xs text-gray-400">
                {totals.product_sku} · {label}
                {statusLabel && <span className="ml-1 font-sans font-semibold text-brand-600">· {statusLabel} only</span>}
              </p>
            </div>
          </div>
          <PeriodSelector defaultPeriod="today" />
        </div>
      </div>

      <ProductStatusFilter counts={statusCounts} active={status} />

      {/* Every number below — cards, chart, day table, orders — respects the
          selected status, so the view reads as one consistent slice. */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card title="Orders" value={String(totals.orders)} />
        <Card title="Units" value={String(totals.units)} sub={`${totals.prepaidUnits} prepaid · ${totals.codUnits} COD`} />
        <Card title="Collected" value={formatPrice(totals.revenue)} />
        <Card title="Estimated incoming" value={formatPrice(totals.pendingRevenue)} amber />
      </div>

      {totals.cancelledUnits > 0 && (
        <div className="flex items-center gap-2 rounded-2xl border border-red-100 bg-red-50/50 px-4 py-3 text-sm">
          <TrendingDown className="h-4 w-4 flex-shrink-0 text-red-500" />
          <span className="text-gray-600">
            <strong className="text-red-600">{totals.cancelledUnits} unit
            {totals.cancelledUnits === 1 ? "" : "s"}</strong> in cancelled / returned / failed orders — not counted
            in collected or the estimate.
          </span>
        </div>
      )}

      {days.length === 0 ? (
        <div className="rounded-2xl border border-gray-100 bg-white p-10 text-center text-sm text-gray-400 shadow-sm">
          No {statusLabel ? `${statusLabel.toLowerCase()} ` : ""}orders for this product in {label}.
        </div>
      ) : (
        <>
        <RevenueChart split data={chart} title="Daily revenue — prepaid vs COD" />

        <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Day</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-600">Orders</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-600">Units</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-600">Collected</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-600">Est. incoming</th>
              </tr>
            </thead>
            <tbody>
              {[...days].reverse().map((d) => (
                <tr key={d.date} className="border-b border-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-700">{prettyDay(d.date)}</td>
                  <td className="px-4 py-3 text-right text-gray-600">{d.orders}</td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-900">{d.units}</td>
                  <td className="px-4 py-3 text-right text-gray-900">{formatPrice(d.revenue)}</td>
                  <td className="px-4 py-3 text-right text-amber-700">
                    {d.pendingRevenue > 0 ? formatPrice(d.pendingRevenue) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </>
      )}

      <section>
        <h2 className="mb-3 text-lg font-semibold text-gray-700">
          {statusLabel ? `${statusLabel} orders with this product` : "Orders containing this product"}
          {orders.length === 100 && <span className="ml-1 text-xs font-normal text-gray-400">(latest 100)</span>}
        </h2>
        {orders.length === 0 ? (
          <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center text-sm text-gray-400 shadow-sm">
            No matching orders.
          </div>
        ) : (
          <OrdersTable orders={orders} />
        )}
      </section>
    </div>
  );
}

/** The orders in this period that contain the product, newest first. */
async function fetchProductOrders(
  productId: string,
  period: DashboardPeriod,
  from?: string,
  to?: string,
  status?: OrderStatus
): Promise<Order[]> {
  const admin = getSupabaseAdminClient();
  const range = getISTPeriodRange(period, { from, to });

  let q = admin
    .from("orders")
    .select("*, order_items!inner(product_id)")
    .eq("order_items.product_id", productId)
    .gte("placed_at", range.start.toISOString())
    .lte("placed_at", range.end.toISOString());

  if (status) q = q.eq("status", status);

  const { data } = await q.order("placed_at", { ascending: false }).limit(100);

  return (data ?? []) as Order[];
}

function Card({ title, value, sub, amber }: { title: string; value: string; sub?: string; amber?: boolean }) {
  return (
    <div
      className={`rounded-2xl border p-5 shadow-sm ${
        amber ? "border-amber-100 bg-amber-50/50" : "border-gray-100 bg-white"
      }`}
    >
      <p className={`text-sm ${amber ? "text-amber-700" : "text-gray-500"}`}>{title}</p>
      <p className={`mt-1 text-2xl font-black ${amber ? "text-amber-900" : "text-gray-900"}`}>{value}</p>
      {sub && <p className="mt-1 text-xs text-gray-400">{sub}</p>}
    </div>
  );
}
