import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Ban, User, Building2, IndianRupee } from "lucide-react";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import { StatsCard } from "@/components/admin/StatsCard";
import { OrdersTable } from "@/components/admin/OrdersTable";
import { PeriodSelector } from "@/components/admin/PeriodSelector";
import { getISTPeriodRange } from "@/lib/admin/periods";
import {
  getCancelInfo, CANCEL_ACTOR_LABELS, CANCEL_ACTOR_COLORS, type CancelActor,
} from "@/lib/admin/order-buckets";
import { formatPrice } from "@/lib/utils/format";
import type { DashboardPeriod, Order, PaymentBucket } from "@/types";

export const metadata: Metadata = { title: "Cancelled Orders — Admin" };
export const dynamic = "force-dynamic";

const ACTORS: CancelActor[] = ["customer", "boxdeal", "system"];

interface Props {
  searchParams: Promise<{
    period?: DashboardPeriod; from?: string; to?: string; by?: CancelActor;
  }>;
}

export default async function CancelledOrdersPage({ searchParams }: Props) {
  const { period = "month", from, to, by } = await searchParams;
  const actor = by && ACTORS.includes(by) ? by : undefined;
  const range = getISTPeriodRange(period, { from, to });

  const admin = getSupabaseAdminClient();
  // Real cancellations only — a failed/abandoned payment is also written as
  // "cancelled", but it belongs in the Failed Orders tab, not here.
  const { data } = await admin
    .from("orders")
    .select("*")
    .eq("status", "cancelled")
    .neq("payment_status", "failed")
    .gte("placed_at", range.start.toISOString())
    .lte("placed_at", range.end.toISOString())
    .order("cancelled_at", { ascending: false, nullsFirst: false })
    .limit(500);

  const all = (data ?? []) as Order[];
  const info = await getCancelInfo(admin, all);

  const totals = { orders: all.length, amount: 0 };
  const byActor: Record<CancelActor, { orders: number; amount: number }> = {
    customer: { orders: 0, amount: 0 },
    boxdeal:  { orders: 0, amount: 0 },
    system:   { orders: 0, amount: 0 },
  };
  const byPay: Record<PaymentBucket, { orders: number; amount: number }> = {
    prepaid: { orders: 0, amount: 0 },
    cod:     { orders: 0, amount: 0 },
  };
  let refunded = 0;

  for (const o of all) {
    const amount = Number(o.total_amount) || 0;
    totals.amount += amount;
    const a = info.get(o.id)?.actor ?? "system";
    byActor[a].orders++;
    byActor[a].amount += amount;
    const b: PaymentBucket = o.payment_method === "cod" ? "cod" : "prepaid";
    byPay[b].orders++;
    byPay[b].amount += amount;
    if (o.payment_status === "refunded") refunded += amount;
  }

  const rows = actor ? all.filter((o) => (info.get(o.id)?.actor ?? "system") === actor) : all;

  const q = new URLSearchParams({ period });
  if (from) q.set("from", from);
  if (to) q.set("to", to);
  const actorLink = (a: CancelActor | null) => {
    const sp = new URLSearchParams(q.toString());
    if (a) sp.set("by", a);
    return `?${sp.toString()}`;
  };

  const cards = [
    {
      title: "Cancelled Orders", value: `${totals.orders}`,
      subtitle: `${formatPrice(totals.amount)} in order value`,
      icon: Ban, variant: "danger" as const,
    },
    {
      title: "Cancelled by Customer", value: `${byActor.customer.orders}`,
      subtitle: formatPrice(byActor.customer.amount),
      icon: User, variant: "warning" as const,
    },
    {
      title: "Cancelled by BoxDeal", value: `${byActor.boxdeal.orders + byActor.system.orders}`,
      subtitle: `${formatPrice(byActor.boxdeal.amount + byActor.system.amount)}${
        byActor.system.orders > 0 ? ` · incl. ${byActor.system.orders} auto/courier` : ""
      }`,
      icon: Building2, variant: "warning" as const,
    },
    {
      title: "Prepaid / COD", value: `${byPay.prepaid.orders} / ${byPay.cod.orders}`,
      subtitle: refunded > 0 ? `${formatPrice(refunded)} refunded` : "no refunds issued",
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
          <h1 className="text-2xl font-bold text-gray-900">Cancelled Orders · {range.label}</h1>
          <PeriodSelector defaultPeriod="month" />
        </div>
        <p className="mt-1 text-sm text-gray-500">
          Live orders that were cancelled, and who cancelled them — filtered by the date the order
          was placed. Failed / abandoned payments live in the{" "}
          <Link href={`/admin/dashboard/failed?${q.toString()}`} className="font-medium text-brand-600 hover:text-brand-700">
            Failed Orders
          </Link>{" "}
          tab instead.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => <StatsCard key={c.title} {...c} />)}
      </div>

      <div className="flex flex-wrap gap-2">
        <Link href={actorLink(null)} className={pill(!actor)}>All ({totals.orders})</Link>
        {ACTORS.map((a) => (
          <Link key={a} href={actorLink(a)} className={pill(actor === a)}>
            {CANCEL_ACTOR_LABELS[a]} ({byActor[a].orders})
          </Link>
        ))}
      </div>

      <OrdersTable
        orders={rows}
        extraColumn={{
          header: "Cancelled by",
          render: (o) => {
            const ci = info.get(o.id);
            const a = ci?.actor ?? "system";
            return (
              <div className="flex flex-col gap-0.5">
                <span className={`w-fit rounded-full px-2.5 py-0.5 text-xs font-semibold ${CANCEL_ACTOR_COLORS[a]}`}>
                  {CANCEL_ACTOR_LABELS[a]}
                </span>
                {ci?.note && <span className="text-[11px] text-gray-400">{ci.note}</span>}
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
