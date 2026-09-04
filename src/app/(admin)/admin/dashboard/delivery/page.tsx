import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft, Truck, PackageCheck, PackageX, Timer, Boxes, Banknote,
} from "lucide-react";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import { StatsCard } from "@/components/admin/StatsCard";
import { OrdersTable } from "@/components/admin/OrdersTable";
import { PeriodSelector } from "@/components/admin/PeriodSelector";
import { CourierTable } from "@/components/admin/CourierTable";
import { getISTPeriodRange } from "@/lib/admin/periods";
import { getCourierStats, courierPartner } from "@/lib/admin/courier-stats";
import { returnKind, RETURN_KIND_LABELS } from "@/lib/admin/order-buckets";
import { formatPrice } from "@/lib/utils/format";
import type { CourierRow, DashboardPeriod, Order } from "@/types";

export const metadata: Metadata = { title: "Delivery & Couriers — Admin" };
export const dynamic = "force-dynamic";

const ROW_LIMIT = 500;

interface Props {
  searchParams: Promise<{
    period?: DashboardPeriod; from?: string; to?: string; courier?: string;
  }>;
}

export default async function DeliveryPage({ searchParams }: Props) {
  const { period = "all", from, to, courier } = await searchParams;
  const range = getISTPeriodRange(period, { from, to });
  const stats = await getCourierStats(period, { from, to });

  const q = new URLSearchParams({ period });
  if (from) q.set("from", from);
  if (to) q.set("to", to);
  const qs = `?${q.toString()}`;

  return courier
    ? <CourierDetail stats={stats} courier={courier} range={range} qs={qs} />
    : <CourierOverview stats={stats} range={range} qs={qs} />;
}

/* ── All partners ───────────────────────────────────────────────────────── */

async function CourierOverview({
  stats, range, qs,
}: {
  stats: Awaited<ReturnType<typeof getCourierStats>>;
  range: ReturnType<typeof getISTPeriodRange>;
  qs: string;
}) {
  const t = stats.totals;
  const best = [...stats.partners]
    .filter((p) => p.deliveryRate !== null && p.delivered + p.rto >= 3)
    .sort((a, b) => (b.deliveryRate ?? 0) - (a.deliveryRate ?? 0))[0];
  const worst = [...stats.partners]
    .filter((p) => p.rtoRate !== null && p.delivered + p.rto >= 3)
    .sort((a, b) => (b.rtoRate ?? 0) - (a.rtoRate ?? 0))[0];

  const cards = [
    {
      title: "Parcels shipped", value: `${t.parcels}`,
      subtitle: `${stats.partners.length} partner${stats.partners.length === 1 ? "" : "s"} · ${stats.services.length} service${stats.services.length === 1 ? "" : "s"} · ${formatPrice(t.value)}`,
      icon: Truck, variant: "default" as const,
    },
    {
      title: "Delivered", value: `${t.delivered}`,
      subtitle: t.deliveryRate === null
        ? "no attempt settled yet"
        : `${t.deliveryRate.toFixed(1)}% delivery rate · ${formatPrice(t.deliveredValue)}`,
      icon: PackageCheck, variant: "success" as const,
    },
    {
      title: "RTO — came back", value: `${t.rto}`,
      subtitle: t.rtoRate === null
        ? "nothing settled yet"
        : `${t.rtoRate.toFixed(1)}% RTO rate · ${formatPrice(t.rtoValue)} lost`,
      icon: PackageX, variant: "danger" as const,
    },
    {
      title: "In transit", value: `${t.inTransit}`,
      subtitle: t.avgDeliveryDays === null
        ? `${stats.awaiting.parcels} still awaiting a courier`
        : `avg ${t.avgDeliveryDays.toFixed(1)} days to deliver`,
      icon: Timer, variant: "warning" as const,
    },
  ];

  return (
    <div className="space-y-5 p-6">
      <div>
        <Link href="/admin" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-brand-600">
          <ArrowLeft className="h-4 w-4" /> Dashboard
        </Link>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold text-gray-900">Delivery &amp; Couriers · {range.label}</h1>
          <PeriodSelector defaultPeriod="all" />
        </div>
        <p className="mt-1 text-sm text-gray-500">
          Every Shiprocket courier that carried a BoxDeal parcel — how many parcels went with each
          partner, how many landed, how many came back as RTO and how fast they moved. A parcel is
          counted against the courier stamped on its AWB, filtered by the date the order was placed.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => <StatsCard key={c.title} {...c} />)}
      </div>

      {(best || worst || stats.awaiting.parcels > 0) && (
        <div className="grid gap-4 sm:grid-cols-3">
          {best && (
            <Note
              tone="green"
              title="Best delivery rate"
              body={`${best.name} — ${best.deliveryRate!.toFixed(1)}% of ${best.delivered + best.rto} settled parcels reached the customer.`}
            />
          )}
          {worst && worst.rto > 0 && (
            <Note
              tone="red"
              title="Highest RTO"
              body={`${worst.name} — ${worst.rtoRate!.toFixed(1)}% came back (${worst.rto} parcel${worst.rto === 1 ? "" : "s"}, ${formatPrice(worst.rtoValue)}).`}
            />
          )}
          {stats.awaiting.parcels > 0 && (
            <Note
              tone="gray"
              title="Not handed over yet"
              body={`${stats.awaiting.parcels} order${stats.awaiting.parcels === 1 ? "" : "s"} worth ${formatPrice(stats.awaiting.value)} have no courier — not packed, or never shipped.`}
            />
          )}
        </div>
      )}

      <CourierTable rows={stats.partners} totalParcels={t.parcels} qs={qs} />

      {stats.services.length > 0 && (
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-gray-700">
            Every service used ({stats.services.length})
          </p>
          <p className="mb-3 mt-0.5 text-xs text-gray-400">
            The exact courier name Shiprocket printed on the AWB. One partner usually runs several —
            air vs surface, and a service per weight slab.
          </p>
          <div className="flex flex-wrap gap-2">
            {stats.services.map((s) => (
              <Link
                key={s.name}
                href={`/admin/dashboard/delivery${qs}&courier=${encodeURIComponent(s.name)}`}
                className="rounded-full border border-gray-200 px-3 py-1 text-xs font-medium text-gray-700 hover:border-brand-300 hover:bg-brand-50"
              >
                {s.name}
                <span className="ml-1.5 text-gray-400">{s.parcels}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      <p className="text-xs text-gray-400">
        Delivery rate = (delivered + customer returns) ÷ (delivered + customer returns + RTO). A
        customer return means the courier did deliver, so it never counts against the partner —
        only an RTO does. Parcels still in transit and orders cancelled before the delivery attempt
        are left out of both rates. Avg days runs from handover (shipped) to delivery.
      </p>
    </div>
  );
}

function Note({ tone, title, body }: { tone: "green" | "red" | "gray"; title: string; body: string }) {
  const map = {
    green: "border-green-100 bg-green-50 text-green-900",
    red:   "border-red-100 bg-red-50 text-red-900",
    gray:  "border-gray-100 bg-gray-50 text-gray-700",
  };
  return (
    <div className={`rounded-2xl border p-4 ${map[tone]}`}>
      <p className="text-xs font-semibold uppercase tracking-wide opacity-70">{title}</p>
      <p className="mt-1 text-sm">{body}</p>
    </div>
  );
}

/* ── One courier, parcel by parcel ──────────────────────────────────────── */

async function CourierDetail({
  stats, courier, range, qs,
}: {
  stats: Awaited<ReturnType<typeof getCourierStats>>;
  courier: string;
  range: ReturnType<typeof getISTPeriodRange>;
  qs: string;
}) {
  // ?courier= may name either a partner ("Delhivery") or one exact Shiprocket
  // service ("Delhivery Surface 10 Kg"). Look for a service first — an exact
  // AWB name is the more specific of the two.
  const service = stats.services.find((s) => s.name === courier);
  const partner = stats.partners.find((p) => p.name === courier);
  const row: CourierRow | undefined = service ?? partner;
  const isPartner = !service && !!partner;

  const admin = getSupabaseAdminClient();
  let query = admin
    .from("orders")
    .select("*")
    .not("courier_name", "is", null)
    .gte("placed_at", range.start.toISOString())
    .lte("placed_at", range.end.toISOString())
    .order("placed_at", { ascending: false })
    .limit(ROW_LIMIT);

  // A service is one exact stored value; a partner is every service under it,
  // so match the stored names we already grouped rather than a LIKE guess.
  query = isPartner
    ? query.in("courier_name", partner!.services.map((s) => s.name))
    : query.eq("courier_name", courier);

  const { data } = await query;
  const orders = (data ?? []) as Order[];

  const cards = row
    ? [
        {
          title: "Parcels", value: `${row.parcels}`,
          subtitle: `${formatPrice(row.value)} handed over`,
          icon: Boxes, variant: "default" as const,
        },
        {
          title: "Delivered", value: `${row.delivered}`,
          subtitle: row.deliveryRate === null
            ? "nothing settled yet"
            : `${row.deliveryRate.toFixed(1)}% delivery rate`,
          icon: PackageCheck, variant: "success" as const,
        },
        {
          title: "RTO / returned", value: `${row.rto} / ${row.customerReturn}`,
          subtitle: `${formatPrice(row.rtoValue)} lost to RTO`,
          icon: PackageX, variant: "danger" as const,
        },
        {
          title: "COD collected", value: formatPrice(row.codCollected),
          subtitle: `${row.codParcels} COD · ${row.prepaidParcels} prepaid`,
          icon: Banknote, variant: "warning" as const,
        },
      ]
    : [];

  return (
    <div className="space-y-5 p-6">
      <div>
        <Link
          href={`/admin/dashboard/delivery${qs}`}
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-brand-600"
        >
          <ArrowLeft className="h-4 w-4" /> All couriers
        </Link>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold text-gray-900">{courier} · {range.label}</h1>
          <PeriodSelector defaultPeriod="all" />
        </div>
        <p className="mt-1 text-sm text-gray-500">
          {isPartner
            ? `Every parcel that went with ${courier}, across its ${partner!.services.length} service${partner!.services.length === 1 ? "" : "s"}.`
            : `One Shiprocket service${row ? ` of ${courierPartner(courier)}` : ""} — the exact courier name printed on the AWB.`}
        </p>
      </div>

      {row ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((c) => <StatsCard key={c.title} {...c} />)}
        </div>
      ) : (
        <div className="rounded-2xl border border-gray-100 bg-white p-6 text-sm text-gray-500 shadow-sm">
          No parcel went with “{courier}” in this period. Try a wider date range.
        </div>
      )}

      {isPartner && partner!.services.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {partner!.services.map((s) => (
            <Link
              key={s.name}
              href={`/admin/dashboard/delivery${qs}&courier=${encodeURIComponent(s.name)}`}
              className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
            >
              {s.name} ({s.parcels})
            </Link>
          ))}
        </div>
      )}

      <OrdersTable
        orders={orders}
        extraColumn={{
          header: "Shipment",
          render: (o) => (
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-medium text-gray-700">{o.courier_name ?? "—"}</span>
              {o.tracking_number && (
                o.tracking_url ? (
                  <a
                    href={o.tracking_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-[11px] text-brand-600 hover:text-brand-700"
                  >
                    {o.tracking_number}
                  </a>
                ) : (
                  <span className="font-mono text-[11px] text-gray-400">{o.tracking_number}</span>
                )
              )}
              {o.status === "returned" && (
                <span className="text-[11px] text-red-500">
                  {RETURN_KIND_LABELS[returnKind(o)]}
                </span>
              )}
            </div>
          ),
        }}
      />
      {orders.length === ROW_LIMIT && (
        <p className="text-center text-xs text-gray-400">
          Showing latest {ROW_LIMIT} — narrow the period to see more.
        </p>
      )}
    </div>
  );
}
