import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Undo2, PackageX, RotateCcw, IndianRupee } from "lucide-react";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import { StatsCard } from "@/components/admin/StatsCard";
import { OrdersTable } from "@/components/admin/OrdersTable";
import { PeriodSelector } from "@/components/admin/PeriodSelector";
import { getPeriodStats, getISTPeriodRange } from "@/lib/admin/periods";
import {
  returnKind, RETURN_KIND_LABELS, RETURN_KIND_COLORS, RETURN_KIND_HINTS, type ReturnKind,
} from "@/lib/admin/order-buckets";
import { formatPrice } from "@/lib/utils/format";
import type { DashboardPeriod, Order, PaymentBucket } from "@/types";

export const metadata: Metadata = { title: "RTO & Returns — Admin" };
export const dynamic = "force-dynamic";

const KINDS: ReturnKind[] = ["rto", "customer"];

interface Props {
  searchParams: Promise<{
    period?: DashboardPeriod; from?: string; to?: string; kind?: ReturnKind;
  }>;
}

export default async function RtoPage({ searchParams }: Props) {
  const { period = "month", from, to, kind: kindParam } = await searchParams;
  const kind = kindParam && KINDS.includes(kindParam) ? kindParam : undefined;
  const range = getISTPeriodRange(period, { from, to });

  const p = await getPeriodStats(period, { from, to });
  const admin = getSupabaseAdminClient();

  const { data } = await admin
    .from("orders")
    .select("*")
    .eq("status", "returned")
    .gte("placed_at", range.start.toISOString())
    .lte("placed_at", range.end.toISOString())
    .order("placed_at", { ascending: false })
    .limit(500);

  const all = (data ?? []) as Order[];

  const byKind: Record<ReturnKind, { orders: number; amount: number }> = {
    rto:      { orders: 0, amount: 0 },
    customer: { orders: 0, amount: 0 },
  };
  const byPay: Record<PaymentBucket, { orders: number; amount: number }> = {
    prepaid: { orders: 0, amount: 0 },
    cod:     { orders: 0, amount: 0 },
  };
  let total = 0;
  let refundable = 0;

  for (const o of all) {
    const amount = Number(o.total_amount) || 0;
    total += amount;
    const k = returnKind(o);
    byKind[k].orders++;
    byKind[k].amount += amount;
    const b: PaymentBucket = o.payment_method === "cod" ? "cod" : "prepaid";
    byPay[b].orders++;
    byPay[b].amount += amount;
    // Money that actually left the customer's pocket and has to go back.
    if (o.payment_status === "paid") refundable += amount;
  }

  const rows = kind ? all.filter((o) => returnKind(o) === kind) : all;

  const q = new URLSearchParams({ period });
  if (from) q.set("from", from);
  if (to) q.set("to", to);
  const kindLink = (k: ReturnKind | null) => {
    const sp = new URLSearchParams(q.toString());
    if (k) sp.set("kind", k);
    return `?${sp.toString()}`;
  };

  const cards = [
    {
      title: "RTO / Returned", value: `${all.length}`,
      subtitle: `− ${formatPrice(total)} off revenue`,
      icon: Undo2, variant: "danger" as const,
    },
    {
      title: RETURN_KIND_LABELS.rto, value: `${byKind.rto.orders}`,
      subtitle: `${formatPrice(byKind.rto.amount)} · ${RETURN_KIND_HINTS.rto.toLowerCase()}`,
      icon: PackageX, variant: "warning" as const,
    },
    {
      title: RETURN_KIND_LABELS.customer, value: `${byKind.customer.orders}`,
      subtitle: `${formatPrice(byKind.customer.amount)} · returned after delivery`,
      icon: RotateCcw, variant: "warning" as const,
    },
    {
      title: "Prepaid / COD", value: `${byPay.prepaid.orders} / ${byPay.cod.orders}`,
      subtitle: refundable > 0 ? `${formatPrice(refundable)} was collected` : "nothing was collected",
      icon: IndianRupee, variant: "default" as const,
    },
  ];

  const pill = (active: boolean) =>
    `rounded-full px-4 py-1.5 text-sm font-medium ${
      active ? "bg-brand-500 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
    }`;

  return (
    <div className="space-y-5 p-6">
      <div>
        <Link href="/admin" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-brand-600">
          <ArrowLeft className="h-4 w-4" /> Dashboard
        </Link>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold text-gray-900">RTO &amp; Returns · {range.label}</h1>
          <PeriodSelector defaultPeriod="month" />
        </div>
        <p className="mt-1 text-sm text-gray-500">
          Goods that came back — an RTO the courier never delivered, or a customer return after
          delivery. Their value is deducted from revenue, so none of it shows up in the estimate.
          Filtered by the date the order was placed.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => <StatsCard key={c.title} {...c} />)}
      </div>

      {/* The deduction, spelled out against the same period's revenue. */}
      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <p className="mb-2 text-sm font-semibold text-gray-700">Effect on revenue · {p.label}</p>
        <dl className="max-w-sm space-y-1 text-sm">
          <div className="flex justify-between">
            <dt className="text-gray-500">Shipped order value</dt>
            <dd className="text-gray-700">{formatPrice(p.revenue + p.returned.amount)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">− RTO / returned ({p.returned.orders})</dt>
            <dd className="font-semibold text-red-600">− {formatPrice(p.returned.amount)}</dd>
          </div>
          <div className="flex justify-between border-t border-gray-100 pt-1">
            <dt className="font-medium text-gray-700">Estimated revenue</dt>
            <dd className="font-black text-gray-900">{formatPrice(p.revenue)}</dd>
          </div>
        </dl>
        <Link
          href={`/admin/dashboard/revenue${`?${q.toString()}`}`}
          className="mt-2 inline-block text-xs font-medium text-brand-600 hover:text-brand-700"
        >
          Open the revenue breakdown →
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link href={kindLink(null)} className={pill(!kind)}>All ({all.length})</Link>
        {KINDS.map((k) => (
          <Link key={k} href={kindLink(k)} className={pill(kind === k)}>
            {RETURN_KIND_LABELS[k]} ({byKind[k].orders})
          </Link>
        ))}
      </div>

      <OrdersTable
        orders={rows}
        extraColumn={{
          header: "Return type",
          render: (o) => {
            const k = returnKind(o);
            return (
              <div className="flex flex-col gap-0.5">
                <span className={`w-fit rounded-full px-2.5 py-0.5 text-xs font-semibold ${RETURN_KIND_COLORS[k]}`}>
                  {RETURN_KIND_LABELS[k]}
                </span>
                <span className="text-[11px] text-gray-400">{RETURN_KIND_HINTS[k]}</span>
              </div>
            );
          },
        }}
      />
      {all.length === 500 && (
        <p className="text-center text-xs text-gray-400">Showing latest 500 — narrow the period to see more.</p>
      )}
    </div>
  );
}
