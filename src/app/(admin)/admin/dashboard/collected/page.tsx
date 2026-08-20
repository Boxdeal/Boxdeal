import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft, Wallet, CreditCard, Banknote, Hourglass, Undo2, Users, Landmark,
} from "lucide-react";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import { StatsCard } from "@/components/admin/StatsCard";
import { OrdersTable } from "@/components/admin/OrdersTable";
import { PeriodSelector } from "@/components/admin/PeriodSelector";
import { getPeriodStats, getISTPeriodRange } from "@/lib/admin/periods";
import { REVENUE_STATUSES } from "@/lib/admin/order-buckets";
import { formatPrice, formatDateTime } from "@/lib/utils/format";
import { PAYMENT_BUCKET_LABELS, PAYMENT_BUCKET_METHODS } from "@/constants";
import type { DashboardPeriod, Order, PaymentBucket } from "@/types";

export const metadata: Metadata = { title: "Money Collected — Admin" };
export const dynamic = "force-dynamic";

const PAY_BUCKETS: PaymentBucket[] = ["prepaid", "cod"];
const ROW_LIMIT = 500;

// Where each rupee physically came from, and where it ends up. There is no
// settlement table — this is the fixed route money takes for each method, so
// the panel explains it rather than inventing amounts.
const SOURCE_INFO: Record<PaymentBucket, { from: string; when: string; lands: string }> = {
  prepaid: {
    from:  "Customer paid online through Razorpay (UPI / card / netbanking)",
    when:  "At checkout, before the order is confirmed",
    lands: "Razorpay settles it to the BoxDeal bank account on its payout cycle, minus the gateway fee",
  },
  cod: {
    from:  "Courier collected cash from the customer at the doorstep",
    when:  "On delivery — the shipment webhook marks it paid",
    lands: "Shiprocket holds the cash and remits it to the bank account on its COD remittance cycle, minus shipping / COD charges",
  },
};

/** When the money actually landed: prepaid at checkout, COD on delivery. */
function collectedAt(o: Order): string {
  return (o.payment_method === "cod" ? o.delivered_at : o.placed_at) ?? o.updated_at;
}

/** The reference that proves the payment — a Razorpay id or the courier + AWB. */
function paymentRef(o: Order): string {
  if (o.payment_method === "cod") {
    return [o.courier_name, o.tracking_number].filter(Boolean).join(" · ") || "Cash on delivery";
  }
  return o.razorpay_payment_id ?? "Razorpay — no payment id";
}

interface Props {
  searchParams: Promise<{
    period?: DashboardPeriod; from?: string; to?: string; pay?: PaymentBucket;
  }>;
}

export default async function CollectedMoneyPage({ searchParams }: Props) {
  const { period = "month", from, to, pay: payParam } = await searchParams;
  const pay = payParam && PAY_BUCKETS.includes(payParam) ? payParam : undefined;

  const p = await getPeriodStats(period, { from, to });
  const range = getISTPeriodRange(period, { from, to });
  const admin = getSupabaseAdminClient();

  // Exactly the orders behind `collectedRevenue`: revenue-bucket orders whose
  // money is already in hand.
  let ordersQuery = admin
    .from("orders")
    .select("*")
    .in("status", REVENUE_STATUSES)
    .eq("payment_status", "paid")
    .gte("placed_at", range.start.toISOString())
    .lte("placed_at", range.end.toISOString())
    .order("placed_at", { ascending: false })
    .limit(ROW_LIMIT);
  if (pay) ordersQuery = ordersQuery.in("payment_method", PAYMENT_BUCKET_METHODS[pay]);

  // Money that came in and then left again — refunds, plus cash sitting with us
  // on orders that came back and still owe the customer a refund.
  const outQuery = admin
    .from("orders")
    .select("total_amount, payment_status, status")
    .or("payment_status.in.(refunded,partially_refunded),and(status.eq.returned,payment_status.eq.paid)")
    .gte("placed_at", range.start.toISOString())
    .lte("placed_at", range.end.toISOString());

  const [{ data: orderRows }, { data: outRows }] = await Promise.all([ordersQuery, outQuery]);
  const orders = (orderRows ?? []) as Order[];

  const refunded = { orders: 0, amount: 0 };
  const refundDue = { orders: 0, amount: 0 };
  for (const o of (outRows ?? []) as Array<{ total_amount: number | string; payment_status: string; status: string }>) {
    const amount = Number(o.total_amount) || 0;
    if (o.payment_status === "refunded" || o.payment_status === "partially_refunded") {
      refunded.orders++;
      refunded.amount += amount;
    } else {
      refundDue.orders++;
      refundDue.amount += amount;
    }
  }

  // Headline numbers come from the period aggregate (exact, no row limit); the
  // customer breakdown below comes from the fetched rows.
  const scope = pay ? p.byPayment[pay] : null;
  const shown = scope
    ? { collected: scope.collectedRevenue, count: scope.collectedOrders, pending: scope.pendingRevenue }
    : { collected: p.collectedRevenue, count: p.collectedOrders, pending: p.pendingRevenue };

  const q = new URLSearchParams({ period });
  if (from) q.set("from", from);
  if (to) q.set("to", to);
  const qs = `?${q.toString()}`;
  const payLink = (b: PaymentBucket | null) => {
    const sp = new URLSearchParams(q.toString());
    if (b) sp.set("pay", b);
    return `?${sp.toString()}`;
  };

  const cards = [
    {
      title: pay ? `${PAYMENT_BUCKET_LABELS[pay]} Collected` : "Already Collected",
      value: formatPrice(shown.collected),
      subtitle: `${shown.count} order${shown.count === 1 ? "" : "s"} paid · money in hand`,
      icon: Wallet, variant: "success" as const,
    },
    {
      title: "Paid online", value: formatPrice(p.byPayment.prepaid.collectedRevenue),
      subtitle: `${p.byPayment.prepaid.collectedOrders} order${p.byPayment.prepaid.collectedOrders === 1 ? "" : "s"} · Razorpay at checkout`,
      icon: CreditCard, variant: "default" as const, href: payLink("prepaid"),
    },
    {
      title: "Cash on delivery", value: formatPrice(p.byPayment.cod.collectedRevenue),
      subtitle: `${p.byPayment.cod.collectedOrders} order${p.byPayment.cod.collectedOrders === 1 ? "" : "s"} · collected by the courier`,
      icon: Banknote, variant: "default" as const, href: payLink("cod"),
    },
    {
      title: "Yet to Collect", value: formatPrice(shown.pending),
      subtitle: "live orders, mostly COD in transit",
      icon: Hourglass, variant: "warning" as const, href: `/admin/dashboard/revenue${qs}${pay ? `&pay=${pay}` : ""}`,
    },
  ];

  // Who the money came from — grouped by customer, biggest payer first.
  const byCustomer = new Map<
    string,
    { name: string; phone: string; orders: number; amount: number; prepaid: number; cod: number }
  >();
  for (const o of orders) {
    const key = o.user_id || o.shipping_phone;
    const row = byCustomer.get(key) ?? {
      name: o.shipping_full_name, phone: o.shipping_phone,
      orders: 0, amount: 0, prepaid: 0, cod: 0,
    };
    const amount = Number(o.total_amount) || 0;
    row.orders++;
    row.amount += amount;
    if (o.payment_method === "cod") row.cod += amount;
    else row.prepaid += amount;
    byCustomer.set(key, row);
  }
  const topCustomers = Array.from(byCustomer.values())
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 10);

  const pill = (active: boolean) =>
    `rounded-full px-4 py-1.5 text-sm font-medium ${
      active ? "bg-gray-800 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
    }`;

  return (
    <div className="space-y-5 p-6">
      <div>
        <Link href={`/admin/dashboard/revenue${qs}`} className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-brand-600">
          <ArrowLeft className="h-4 w-4" /> Revenue
        </Link>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold text-gray-900">
            Money Collected{pay ? ` · ${PAYMENT_BUCKET_LABELS[pay]}` : ""} · {p.label}
          </h1>
          <PeriodSelector defaultPeriod="month" />
        </div>
        <p className="mt-1 text-sm text-gray-500">
          Every rupee already in hand for this period — where it came from, who paid it and where it
          lands. Only orders marked paid count here; the rest of the estimate is still to collect.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => <StatsCard key={c.title} {...c} />)}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-gray-500">Source:</span>
        <Link href={payLink(null)} className={pill(!pay)}>
          All ({formatPrice(p.collectedRevenue)})
        </Link>
        {PAY_BUCKETS.map((b) => (
          <Link key={b} href={payLink(b)} className={pill(pay === b)}>
            {PAYMENT_BUCKET_LABELS[b]} ({formatPrice(p.byPayment[b].collectedRevenue)})
          </Link>
        ))}
      </div>

      {/* Where it came from → where it goes */}
      <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700">
          <Landmark className="h-4 w-4 text-gray-400" /> Where the money came from — and where it goes
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          {PAY_BUCKETS.map((b) => {
            const s = p.byPayment[b];
            const info = SOURCE_INFO[b];
            return (
              <div key={b} className="rounded-xl border border-gray-100 bg-gray-50/50 p-4">
                <div className="flex items-baseline justify-between gap-2">
                  <Link href={payLink(b)} className="text-sm font-semibold text-gray-800 hover:text-brand-600">
                    {PAYMENT_BUCKET_LABELS[b]}
                  </Link>
                  <span className="text-lg font-black text-gray-900">{formatPrice(s.collectedRevenue)}</span>
                </div>
                <p className="text-xs text-gray-400">
                  {s.collectedOrders} order{s.collectedOrders === 1 ? "" : "s"} paid
                  {s.pendingRevenue > 0 && ` · ${formatPrice(s.pendingRevenue)} still to come`}
                </p>
                <dl className="mt-3 space-y-2 text-xs">
                  <div>
                    <dt className="font-medium text-gray-500">Came from</dt>
                    <dd className="text-gray-700">{info.from}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-gray-500">Collected when</dt>
                    <dd className="text-gray-700">{info.when}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-gray-500">Ends up</dt>
                    <dd className="text-gray-700">{info.lands}</dd>
                  </div>
                </dl>
              </div>
            );
          })}
        </div>

        {(refunded.orders > 0 || refundDue.orders > 0) && (
          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 border-t border-gray-100 pt-3 text-xs text-gray-500">
            <span className="flex items-center gap-1.5">
              <Undo2 className="h-3.5 w-3.5 text-red-400" />
              Went back out — refunded:{" "}
              <strong className="text-red-600">{formatPrice(refunded.amount)}</strong> ({refunded.orders})
            </span>
            {refundDue.orders > 0 && (
              <Link href={`/admin/dashboard/rto${qs}`} className="hover:text-brand-600">
                Collected but came back (refund due):{" "}
                <strong className="text-orange-600">{formatPrice(refundDue.amount)}</strong> ({refundDue.orders}) →
              </Link>
            )}
            <span className="text-gray-400">Neither is part of the collected total above.</span>
          </div>
        )}
      </section>

      {/* Who paid */}
      <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700">
          <Users className="h-4 w-4 text-gray-400" /> Who it came from
          <span className="font-normal text-xs text-gray-400">top 10 customers in this period</span>
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-400">
                <th className="pb-2 text-left font-medium">Customer</th>
                <th className="pb-2 text-right font-medium">Orders</th>
                <th className="pb-2 text-right font-medium">Online</th>
                <th className="pb-2 text-right font-medium">COD</th>
                <th className="pb-2 text-right font-medium">Paid us</th>
              </tr>
            </thead>
            <tbody>
              {topCustomers.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-gray-400">
                    Nothing collected in this period.
                  </td>
                </tr>
              )}
              {topCustomers.map((c) => (
                <tr key={c.phone + c.name} className="border-t border-gray-50">
                  <td className="py-2">
                    <Link
                      href={`/admin/orders?q=${encodeURIComponent(c.phone)}`}
                      className="font-medium text-gray-700 hover:text-brand-600"
                    >
                      {c.name}
                    </Link>
                    <span className="ml-2 font-mono text-xs text-gray-400">{c.phone}</span>
                  </td>
                  <td className="py-2 text-right text-gray-500">{c.orders}</td>
                  <td className="py-2 text-right text-gray-600">{c.prepaid > 0 ? formatPrice(c.prepaid) : "—"}</td>
                  <td className="py-2 text-right text-gray-600">{c.cod > 0 ? formatPrice(c.cod) : "—"}</td>
                  <td className="py-2 text-right font-semibold text-gray-900">{formatPrice(c.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-lg font-semibold text-gray-700">
            Every payment received{" "}
            {orders.length === ROW_LIMIT && (
              <span className="text-xs font-normal text-gray-400">(latest {ROW_LIMIT})</span>
            )}
          </h2>
          <Link
            href={`/admin/dashboard/revenue${qs}${pay ? `&pay=${pay}` : ""}`}
            className="text-sm font-medium text-brand-600 hover:text-brand-700"
          >
            Full revenue breakdown →
          </Link>
        </div>
        <OrdersTable
          orders={orders}
          extraColumn={{
            header: "Paid via",
            render: (o) => (
              <div className="flex flex-col gap-0.5">
                <span
                  className={`w-fit rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    o.payment_method === "cod"
                      ? "bg-indigo-100 text-indigo-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {o.payment_method === "cod" ? "Cash at doorstep" : "Razorpay online"}
                </span>
                <span className="font-mono text-[11px] text-gray-400">{paymentRef(o)}</span>
                <span className="text-[11px] text-gray-400">
                  Received {formatDateTime(collectedAt(o))}
                </span>
              </div>
            ),
          }}
        />
        {orders.length === ROW_LIMIT && (
          <p className="mt-2 text-center text-xs text-gray-400">
            Showing latest {ROW_LIMIT} — narrow the period to see more.
          </p>
        )}
      </section>
    </div>
  );
}
