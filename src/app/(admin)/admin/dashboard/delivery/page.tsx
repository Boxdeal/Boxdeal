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
import { getCourierStats, courierPartner, PARCEL_STATE_FIELD } from "@/lib/admin/courier-stats";
import {
  parcelState, PARCEL_STATES, PARCEL_STATE_LABELS, PARCEL_STATE_COLORS, PARCEL_STATE_HINTS,
  SETTLED_STATUSES, type ParcelState,
} from "@/lib/admin/order-buckets";
import { formatPrice } from "@/lib/utils/format";
import type { CourierRow, DashboardPeriod, Order } from "@/types";

export const metadata: Metadata = { title: "Delivery & Couriers — Admin" };
export const dynamic = "force-dynamic";

const ROW_LIMIT = 500;

interface Props {
  searchParams: Promise<{
    period?: DashboardPeriod; from?: string; to?: string; courier?: string; state?: string;
  }>;
}

export default async function DeliveryPage({ searchParams }: Props) {
  const { period = "all", from, to, courier, state: stateParam } = await searchParams;
  // Ignore a junk ?state= rather than silently filtering everything away.
  const state = PARCEL_STATES.includes(stateParam as ParcelState)
    ? (stateParam as ParcelState)
    : undefined;
  const range = getISTPeriodRange(period, { from, to });
  const stats = await getCourierStats(period, { from, to });

  const q = new URLSearchParams({ period });
  if (from) q.set("from", from);
  if (to) q.set("to", to);
  const qs = `?${q.toString()}`;

  return courier
    ? <CourierDetail stats={stats} courier={courier} state={state} range={range} qs={qs} />
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
  const u = stats.unshipped;
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
      // If a returned order has no courier name it can't be blamed on a partner,
      // so this count sits below the RTO & Returns tab's. Say so on the card
      // instead of leaving the mismatch to be discovered.
      subtitle: u.offline.returned > 0
        ? `+${u.offline.returned} returned with no courier — ${t.rto + u.offline.returned} in RTO & Returns`
        : t.rtoRate === null
          ? "nothing settled yet"
          : `${t.rtoRate.toFixed(1)}% RTO rate · ${formatPrice(t.rtoValue)} lost`,
      icon: PackageX, variant: "danger" as const,
    },
    {
      title: "In transit", value: `${t.inTransit}`,
      subtitle: t.avgDeliveryDays === null
        ? `${u.awaiting.parcels} live order${u.awaiting.parcels === 1 ? "" : "s"} awaiting a courier`
        : `avg ${t.avgDeliveryDays.toFixed(1)} days to deliver · ${u.awaiting.parcels} awaiting a courier`,
      icon: Timer, variant: "warning" as const,
    },
  ];

  return (
    <div className="space-y-5 p-4 sm:p-6">
      <div>
        <Link href="/admin" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-brand-600">
          <ArrowLeft className="h-4 w-4" /> Dashboard
        </Link>
        <div className="mt-2 flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center lg:justify-between">
          <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
            Delivery &amp; Couriers <span className="text-gray-400">·</span> {range.label}
          </h1>
          <PeriodSelector defaultPeriod="all" />
        </div>
        <p className="mt-1 text-sm text-gray-500">
          Every Shiprocket courier that carried a BoxDeal parcel — how many parcels went with each
          partner, how many landed, how many came back as RTO and how fast they moved. A parcel is
          counted against the courier stamped on its AWB, filtered by the date the order was placed.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        {cards.map((c) => <StatsCard key={c.title} {...c} />)}
      </div>

      {(best || worst || u.awaiting.parcels > 0 || u.offline.parcels > 0) && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
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
          {u.awaiting.parcels > 0 && (
            <Note
              tone="amber"
              title="Waiting for a courier"
              body={`${u.awaiting.parcels} live order${u.awaiting.parcels === 1 ? "" : "s"} worth ${formatPrice(u.awaiting.value)} still have no AWB. Failed and cancelled checkouts are not in this number${u.neverShipped.parcels > 0 ? ` — ${u.neverShipped.parcels} of those were never going to ship` : ""}.`}
            />
          )}
          {u.offline.parcels > 0 && (
            <Note
              tone="amber"
              title="No courier name stored"
              body={
                `${u.offline.parcels} order${u.offline.parcels === 1 ? "" : "s"} worth ${formatPrice(u.offline.value)} ended with no courier name, so no partner gets the credit or the blame` +
                (u.offline.returned > 0
                  ? ` — including ${u.offline.returned} returned, which is why RTO here reads ${t.rto} and RTO & Returns reads ${t.rto + u.offline.returned}`
                  : "") +
                (u.offline.withAwb > 0
                  ? `. ${u.offline.withAwb} of them DO have an AWB, so a courier did carry them: open the order and hit “Sync from Shiprocket” to pull the name in.`
                  : ". None of them has an AWB — they were fulfilled outside Shiprocket.")
              }
            />
          )}
          {t.codPending > 0 && (
            <Note
              tone="amber"
              title="COD cash unconfirmed"
              body={`${t.codPendingParcels} delivered COD parcel${t.codPendingParcels === 1 ? "" : "s"} worth ${formatPrice(t.codPending)} were never marked paid, so that cash is missing from COD collected.`}
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
          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
            {stats.services.map((s) => (
              <Link
                key={s.name}
                href={`/admin/dashboard/delivery${qs}&courier=${encodeURIComponent(s.name)}`}
                className="flex-shrink-0 whitespace-nowrap rounded-full border border-gray-200 px-3 py-1 text-xs font-medium text-gray-700 hover:border-brand-300 hover:bg-brand-50"
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

function Note({ tone, title, body }: {
  tone: "green" | "red" | "amber" | "gray"; title: string; body: string;
}) {
  const map = {
    green: "border-green-100 bg-green-50 text-green-900",
    red:   "border-red-100 bg-red-50 text-red-900",
    amber: "border-amber-100 bg-amber-50 text-amber-900",
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

/**
 * Base query for one courier's parcels in a window. Also the source of the
 * builder type below — spelling that type out by hand goes stale the moment
 * supabase-js changes its generics.
 */
function courierOrdersQuery(couriers: string[], start: Date, end: Date) {
  return getSupabaseAdminClient()
    .from("orders")
    .select("*")
    .in("courier_name", couriers)
    .gte("placed_at", start.toISOString())
    .lte("placed_at", end.toISOString())
    .order("placed_at", { ascending: false })
    .limit(ROW_LIMIT);
}

type OrderQuery = ReturnType<typeof courierOrdersQuery>;

/**
 * The PostgREST mirror of `parcelState` — the same five states, expressed as a
 * filter so the narrowing happens in SQL. If a state is ever added to the union
 * this record stops compiling until its filter is written too, which is the
 * point: a pill must never count parcels its list can't return.
 */
const STATE_FILTER: Record<ParcelState, (q: OrderQuery) => OrderQuery> = {
  delivered: (q) => q.eq("status", "delivered"),
  cancelled: (q) => q.eq("status", "cancelled"),
  // An RTO never reached the customer, so it has no delivered_at; a customer
  // return does. Same separator the RTO tab uses.
  rto:       (q) => q.eq("status", "returned").is("delivered_at", null),
  returned:  (q) => q.eq("status", "returned").not("delivered_at", "is", null),
  transit:   (q) => q.not("status", "in", `(${SETTLED_STATUSES.join(",")})`),
};

async function CourierDetail({
  stats, courier, state, range, qs,
}: {
  stats: Awaited<ReturnType<typeof getCourierStats>>;
  courier: string;
  state?: ParcelState;
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

  // A service is one exact stored value; a partner is every service under it, so
  // match the stored names we already grouped rather than a LIKE guess.
  const couriers = isPartner ? partner!.services.map((s) => s.name) : [courier];

  // Filter in SQL, not after the fetch — otherwise ROW_LIMIT would apply to the
  // unfiltered set and a busy courier's "RTO" list could come back short.
  const base = courierOrdersQuery(couriers, range.start, range.end);
  const { data } = await (state ? STATE_FILTER[state](base) : base);
  const orders = (data ?? []) as Order[];

  // Switching courier keeps the state filter, and vice versa — so drilling from
  // "Delhivery RTO" into one of its services stays on RTO.
  const stateLink = (name: string, st: ParcelState | undefined) => {
    const base = `/admin/dashboard/delivery${qs}&courier=${encodeURIComponent(name)}`;
    return st ? `${base}&state=${st}` : base;
  };

  const pill = (active: boolean) =>
    `flex-shrink-0 whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-medium sm:px-4 sm:text-sm ${
      active ? "bg-brand-500 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
    }`;

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
    <div className="space-y-5 p-4 sm:p-6">
      <div>
        <Link
          href={`/admin/dashboard/delivery${qs}`}
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-brand-600"
        >
          <ArrowLeft className="h-4 w-4" /> All couriers
        </Link>
        <div className="mt-2 flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center lg:justify-between">
          <h1 className="min-w-0 break-words text-xl font-bold text-gray-900 sm:text-2xl">
            {courier} <span className="text-gray-400">·</span> {range.label}
          </h1>
          <PeriodSelector defaultPeriod="all" />
        </div>
        <p className="mt-1 text-sm text-gray-500">
          {isPartner
            ? `Every parcel that went with ${courier}, across its ${partner!.services.length} service${partner!.services.length === 1 ? "" : "s"}.`
            : `One Shiprocket service${row ? ` of ${courierPartner(courier)}` : ""} — the exact courier name printed on the AWB.`}
        </p>
      </div>

      {row ? (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
          {cards.map((c) => <StatsCard key={c.title} {...c} />)}
        </div>
      ) : (
        <div className="rounded-2xl border border-gray-100 bg-white p-6 text-sm text-gray-500 shadow-sm">
          No parcel went with “{courier}” in this period. Try a wider date range.
        </div>
      )}

      {isPartner && partner!.services.length > 1 && (
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
          {partner!.services.map((s) => (
            <Link
              key={s.name}
              href={stateLink(s.name, state)}
              className="flex-shrink-0 whitespace-nowrap rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
            >
              {s.name} ({s.parcels})
            </Link>
          ))}
        </div>
      )}

      {row && (
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
          <Link href={stateLink(courier, undefined)} className={pill(!state)}>
            All ({row.parcels})
          </Link>
          {PARCEL_STATES.map((st) => {
            const count = row[PARCEL_STATE_FIELD[st]];
            return (
              <Link
                key={st}
                href={stateLink(courier, st)}
                title={PARCEL_STATE_HINTS[st]}
                className={pill(state === st)}
              >
                {PARCEL_STATE_LABELS[st]} ({count})
              </Link>
            );
          })}
        </div>
      )}

      {state && (
        <p className="-mt-2 text-xs text-gray-400">
          {PARCEL_STATE_HINTS[state]} — showing {orders.length} of {row?.parcels ?? 0} parcels.
        </p>
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
              <span
                className={`w-fit rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                  PARCEL_STATE_COLORS[parcelState(o)]
                }`}
              >
                {PARCEL_STATE_LABELS[parcelState(o)]}
              </span>
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
