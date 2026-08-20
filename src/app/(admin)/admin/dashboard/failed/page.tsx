import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, XCircle, CreditCard, Clock, IndianRupee } from "lucide-react";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import { StatsCard } from "@/components/admin/StatsCard";
import { OrdersTable } from "@/components/admin/OrdersTable";
import { PeriodSelector } from "@/components/admin/PeriodSelector";
import { getISTPeriodRange } from "@/lib/admin/periods";
import { FAILED_OR_FILTER, failureReason } from "@/lib/admin/order-buckets";
import { formatPrice } from "@/lib/utils/format";
import type { DashboardPeriod, Order, PaymentBucket } from "@/types";

export const metadata: Metadata = { title: "Failed Orders — Admin" };
export const dynamic = "force-dynamic";

// Two ways an order never makes it to revenue at checkout:
//   payment  — Razorpay failed or the customer walked away from the popup
//   placed   — the order row exists but was never paid for / confirmed
type FailKind = "payment" | "placed";

const KIND_LABELS: Record<FailKind, string> = {
  payment: "Payment failed",
  placed:  "Order Placed (unpaid)",
};

const kindOf = (o: { payment_status: string }): FailKind =>
  o.payment_status === "failed" ? "payment" : "placed";

interface Props {
  searchParams: Promise<{
    period?: DashboardPeriod; from?: string; to?: string; kind?: FailKind;
  }>;
}

export default async function FailedOrdersPage({ searchParams }: Props) {
  const { period = "month", from, to, kind } = await searchParams;
  const range = getISTPeriodRange(period, { from, to });

  const admin = getSupabaseAdminClient();
  const { data } = await admin
    .from("orders")
    .select("*")
    .or(FAILED_OR_FILTER)
    .gte("placed_at", range.start.toISOString())
    .lte("placed_at", range.end.toISOString())
    .order("placed_at", { ascending: false })
    .limit(500);

  const all = (data ?? []) as Order[];

  const totals = { orders: all.length, amount: 0 };
  const byKind: Record<FailKind, { orders: number; amount: number }> = {
    payment: { orders: 0, amount: 0 },
    placed:  { orders: 0, amount: 0 },
  };
  const byPay: Record<PaymentBucket, { orders: number; amount: number }> = {
    prepaid: { orders: 0, amount: 0 },
    cod:     { orders: 0, amount: 0 },
  };

  for (const o of all) {
    const amount = Number(o.total_amount) || 0;
    totals.amount += amount;
    const k = kindOf(o);
    byKind[k].orders++;
    byKind[k].amount += amount;
    const b: PaymentBucket = o.payment_method === "cod" ? "cod" : "prepaid";
    byPay[b].orders++;
    byPay[b].amount += amount;
  }

  const rows = kind ? all.filter((o) => kindOf(o) === kind) : all;

  const q = new URLSearchParams({ period });
  if (from) q.set("from", from);
  if (to) q.set("to", to);
  const kindLink = (k: FailKind | null) => {
    const sp = new URLSearchParams(q.toString());
    if (k) sp.set("kind", k);
    return `?${sp.toString()}`;
  };

  const cards = [
    {
      title: "Failed Orders", value: `${totals.orders}`,
      subtitle: `${formatPrice(totals.amount)} never converted`,
      icon: XCircle, variant: "danger" as const,
    },
    {
      title: KIND_LABELS.payment, value: `${byKind.payment.orders}`,
      subtitle: formatPrice(byKind.payment.amount),
      icon: CreditCard, variant: "warning" as const,
    },
    {
      title: KIND_LABELS.placed, value: `${byKind.placed.orders}`,
      subtitle: formatPrice(byKind.placed.amount),
      icon: Clock, variant: "warning" as const,
    },
    {
      title: "Prepaid / COD", value: `${byPay.prepaid.orders} / ${byPay.cod.orders}`,
      subtitle: `${formatPrice(byPay.prepaid.amount)} / ${formatPrice(byPay.cod.amount)}`,
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
          <h1 className="text-2xl font-bold text-gray-900">Failed Orders · {range.label}</h1>
          <PeriodSelector defaultPeriod="month" />
        </div>
        <p className="mt-1 text-sm text-gray-500">
          Orders that never got confirmed — a failed or abandoned payment, or an order still sitting
          at &ldquo;Order Placed&rdquo;. None of these count toward revenue.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => <StatsCard key={c.title} {...c} />)}
      </div>

      <div className="flex flex-wrap gap-2">
        <Link href={kindLink(null)} className={pill(!kind)}>All ({totals.orders})</Link>
        {(Object.keys(KIND_LABELS) as FailKind[]).map((k) => (
          <Link key={k} href={kindLink(k)} className={pill(kind === k)}>
            {KIND_LABELS[k]} ({byKind[k].orders})
          </Link>
        ))}
      </div>

      <OrdersTable
        orders={rows}
        extraColumn={{
          header: "Reason",
          render: (o) => (
            <span className="text-xs text-gray-500">{failureReason(o)}</span>
          ),
        }}
      />
      {all.length === 500 && (
        <p className="text-center text-xs text-gray-400">Showing latest 500 — narrow the period to see more.</p>
      )}
    </div>
  );
}
