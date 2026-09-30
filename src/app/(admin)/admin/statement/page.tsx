import type { Metadata } from "next";
import { Banknote, CreditCard, Package, Receipt, Undo2, Wallet } from "lucide-react";
import { StatsCard } from "@/components/admin/StatsCard";
import { StatementControls } from "./StatementControls";
import {
  getMonthlyStatement,
  getMonthRange,
  recentMonths,
  type MonthSplit,
} from "@/lib/statement/monthly";
import { formatPrice } from "@/lib/utils/format";

export const metadata: Metadata = { title: "Monthly Statement — Admin" };
export const dynamic = "force-dynamic";

/** GST figures are shown to the paisa; a rounded rupee won't reconcile. */
const rs = (n: number) => `₹${n.toFixed(2)}`;

const card = "rounded-2xl border border-gray-100 bg-white p-5";
const th = "px-3 py-2 text-left text-xs font-semibold text-gray-500";
const thR = "px-3 py-2 text-right text-xs font-semibold text-gray-500";
const td = "px-3 py-2 text-sm text-gray-900";
const tdR = "px-3 py-2 text-right text-sm text-gray-900 tabular-nums";

export default async function StatementPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const { month: raw } = await searchParams;
  const months = recentMonths(24);
  const month = raw && months.includes(raw) ? raw : months[0];

  const labels: Record<string, string> = {};
  for (const m of months) labels[m] = getMonthRange(m).label;

  const s = await getMonthlyStatement(month);
  const g = s.gst;

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Monthly Statement</h1>
          <p className="mt-1 text-sm text-gray-500">
            {s.label} · generated {s.generatedAt}
          </p>
        </div>
        <StatementControls month={month} months={months} labels={labels} />
      </div>

      {/* ── Money earned ── */}
      <section className="space-y-3">
        <div>
          <h2 className="font-semibold text-gray-900">Money Earned</h2>
          <p className="text-sm text-gray-500">
            Money that <strong>arrived</strong> in {s.label}. Online orders count in the month
            they were paid; COD orders count in the month they were delivered. Refunded,
            cancelled and returned orders are left out.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Paid orders" value={s.realised.orders} icon={Package}
            subtitle={
              s.realised.fromEarlierMonths > 0
                ? `${s.realised.fromEarlierMonths} of these were ordered in an earlier month`
                : "all ordered this month"
            }
          />
          <StatsCard
            title="Net sales" value={formatPrice(s.realised.net)} icon={Wallet}
            variant="success"
            subtitle={`${formatPrice(s.realised.gross)} goods − ${formatPrice(s.realised.discount)} discount + ${formatPrice(s.realised.delivery)} delivery`}
          />
          <StatsCard
            title="COD collected" value={formatPrice(s.realised.cod.amount)} icon={Banknote}
            subtitle={`${s.realised.cod.orders} orders`}
          />
          <StatsCard
            title="Prepaid" value={formatPrice(s.realised.prepaid.amount)} icon={CreditCard}
            subtitle={`${s.realised.prepaid.orders} orders`}
          />
        </div>
        {s.realised.orders > 0 && (
          <div className={card}>
            <p className="mb-2 text-sm font-medium text-gray-900">
              {s.realised.orders} paid orders in {s.label} — when were they ordered?
            </p>
            <MonthSplitTable
              rows={s.realised.byOrderMonth}
              rowLabel={(r) => `Ordered in ${r.label}`}
              current={s.month}
            />
          </div>
        )}
      </section>

      {/* ── Activity + returns ── */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className={card}>
          <h2 className="font-semibold text-gray-900">Order Activity</h2>
          <p className="mb-3 text-sm text-gray-500">
            Orders <strong>placed</strong> in {s.label}, and where each one ended up today.
            A parcel ordered this month but delivered next month counts as
            &ldquo;delivered&rdquo; here, and its money shows in next month&apos;s Money Earned.
          </p>
          <dl className="space-y-1.5 text-sm">
            <div className="flex justify-between border-b border-gray-100 pb-2">
              <dt className="font-medium text-gray-900">Orders placed</dt>
              <dd className="font-bold text-gray-900 tabular-nums">{s.activity.placed}</dd>
            </div>
            {[
              ["Delivered", s.activity.delivered],
              ["Still in transit", s.activity.inTransit],
              ["Cancelled", s.activity.cancelled],
              ["Returned / RTO", s.activity.returned],
              ["Failed / never paid", s.activity.failed],
            ].map(([label, value]) => (
              <div key={label as string} className="flex justify-between pl-4">
                <dt className="text-gray-500">↳ {label as string}</dt>
                <dd className="font-semibold text-gray-900 tabular-nums">{value as number}</dd>
              </div>
            ))}
          </dl>
          {s.activity.delivered > 0 && (
            <div className="mt-4 border-t border-gray-100 pt-3">
              <p className="mb-2 text-sm font-medium text-gray-900">
                {s.activity.delivered} delivered orders from {s.label} — which month was the money received?
              </p>
              <MonthSplitTable
                rows={s.activity.deliveredByMonth}
                rowLabel={(r) => `Paid in ${r.label}`}
                current={s.month}
              />
            </div>
          )}
        </div>

        <div className={card}>
          <div className="mb-3 flex items-center gap-2">
            <Undo2 className="h-4 w-4 text-gray-400" />
            <h2 className="font-semibold text-gray-900">Returns</h2>
          </div>
          <dl className="space-y-3 text-sm">
            <div className="flex items-start justify-between gap-4">
              <dt>
                <span className="text-gray-900">RTO — never delivered</span>
                <p className="text-xs text-gray-400">Courier brought it back before delivery</p>
              </dt>
              <dd className="whitespace-nowrap text-right">
                <span className="font-semibold text-gray-900">{formatPrice(s.returns.rto.amount)}</span>
                <p className="text-xs text-gray-400">{s.returns.rto.orders} orders</p>
              </dd>
            </div>
            <div className="flex items-start justify-between gap-4">
              <dt>
                <span className="text-gray-900">Customer return</span>
                <p className="text-xs text-gray-400">Came back after it was delivered</p>
              </dt>
              <dd className="whitespace-nowrap text-right">
                <span className="font-semibold text-gray-900">{formatPrice(s.returns.customer.amount)}</span>
                <p className="text-xs text-gray-400">{s.returns.customer.orders} orders</p>
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* ── GST ── */}
      <section className="space-y-3">
        <div>
          <h2 className="font-semibold text-gray-900">GST</h2>
          <p className="text-sm text-gray-500">
            Invoices <strong>raised</strong> this month. Tax is owed from the date the invoice
            is issued, which is why this counts different days to the sales above. Prices are
            GST-inclusive at {s.rate}%.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard title="Invoices raised" value={g.invoices.length} icon={Receipt} />
          <StatsCard title="Taxable value" value={rs(g.totals.taxable)} icon={Wallet} />
          <StatsCard
            title="Total GST" value={rs(g.totals.tax)} icon={Receipt} variant="warning"
            subtitle={`CGST ${rs(g.totals.cgst)} · SGST ${rs(g.totals.sgst)} · IGST ${rs(g.totals.igst)}`}
          />
          <StatsCard title="Invoice value" value={rs(g.totals.net)} icon={Banknote} variant="success" />
        </div>
      </section>

      {/* ── HSN + state summaries ── */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className={card}>
          <h2 className="font-semibold text-gray-900">HSN Summary</h2>
          <p className="mb-3 text-sm text-gray-500">
            GSTR-1 Table 12. Product lines only — the delivery charge rides with the goods and
            carries no HSN of its own.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[420px]">
              <thead className="border-b border-gray-100">
                <tr>
                  <th className={th}>HSN</th>
                  <th className={thR}>Qty</th>
                  <th className={thR}>Taxable</th>
                  <th className={thR}>GST</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {g.hsn.map((h) => (
                  <tr key={h.hsn}>
                    <td className={`${td} font-mono`}>{h.hsn}</td>
                    <td className={tdR}>{h.qty}</td>
                    <td className={tdR}>{h.taxable.toFixed(2)}</td>
                    <td className={tdR}>{h.tax.toFixed(2)}</td>
                  </tr>
                ))}
                {g.hsn.length === 0 && (
                  <tr><td className={`${td} text-gray-400`} colSpan={4}>No invoices this month</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className={card}>
          <h2 className="font-semibold text-gray-900">State-wise Summary</h2>
          <p className="mb-3 text-sm text-gray-500">
            GSTR-1 Table 7 — B2C, grouped by the customer&apos;s state (place of supply).
          </p>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[460px]">
              <thead className="border-b border-gray-100">
                <tr>
                  <th className={th}>State</th>
                  <th className={thR}>Code</th>
                  <th className={thR}>Taxable</th>
                  <th className={thR}>CGST+SGST</th>
                  <th className={thR}>IGST</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {g.states.map((st) => (
                  <tr key={st.state}>
                    <td className={td}>{st.state}</td>
                    <td className={`${tdR} font-mono text-gray-400`}>{st.stateCode}</td>
                    <td className={tdR}>{st.taxable.toFixed(2)}</td>
                    <td className={tdR}>{(st.cgst + st.sgst).toFixed(2)}</td>
                    <td className={tdR}>{st.igst.toFixed(2)}</td>
                  </tr>
                ))}
                {g.states.length === 0 && (
                  <tr><td className={`${td} text-gray-400`} colSpan={5}>No invoices this month</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── Invoice register ── */}
      <div className={card}>
        <h2 className="font-semibold text-gray-900">Invoice Register</h2>
        <p className="mb-3 text-sm text-gray-500">
          Every invoice raised in {s.label}, in series order.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px]">
            <thead className="border-b border-gray-100">
              <tr>
                <th className={th}>Invoice No</th>
                <th className={th}>Date</th>
                <th className={th}>Order No</th>
                <th className={th}>State</th>
                <th className={th}>Payment</th>
                <th className={thR}>Taxable</th>
                <th className={thR}>GST</th>
                <th className={thR}>Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {g.invoices.map((i) => (
                <tr key={i.invoiceNumber}>
                  <td className={`${td} font-mono font-semibold`}>{i.invoiceNumber}</td>
                  <td className={`${td} text-gray-500`}>{i.invoiceDate}</td>
                  <td className={`${td} font-mono text-gray-500`}>{i.orderNumber}</td>
                  <td className={`${td} text-gray-500`}>{i.state}</td>
                  <td className={`${td} text-gray-500`}>{i.paymentMethod}</td>
                  <td className={tdR}>{i.taxable.toFixed(2)}</td>
                  <td className={tdR}>{(i.cgst + i.sgst + i.igst).toFixed(2)}</td>
                  <td className={`${tdR} font-semibold`}>{i.total.toFixed(2)}</td>
                </tr>
              ))}
              {g.invoices.length === 0 && (
                <tr><td className={`${td} text-gray-400`} colSpan={8}>No invoices were raised in {s.label}</td></tr>
              )}
            </tbody>
            {g.invoices.length > 0 && (
              <tfoot className="border-t border-gray-200">
                <tr>
                  <td className={`${td} font-semibold`} colSpan={5}>Total</td>
                  <td className={`${tdR} font-semibold`}>{g.totals.taxable.toFixed(2)}</td>
                  <td className={`${tdR} font-semibold`}>{g.totals.tax.toFixed(2)}</td>
                  <td className={`${tdR} font-semibold`}>{g.totals.net.toFixed(2)}</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* ── Top products ── */}
      <div className={card}>
        <h2 className="font-semibold text-gray-900">Top Products</h2>
        <p className="mb-3 text-sm text-gray-500">By value, among orders delivered this month.</p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px]">
            <thead className="border-b border-gray-100">
              <tr>
                <th className={th}>#</th>
                <th className={th}>Product</th>
                <th className={th}>SKU</th>
                <th className={thR}>Qty</th>
                <th className={thR}>Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {s.topProducts.map((p, i) => (
                <tr key={p.sku}>
                  <td className={`${td} text-gray-400`}>{i + 1}</td>
                  <td className={td}>{p.name}</td>
                  <td className={`${td} font-mono text-xs text-gray-500`}>{p.sku}</td>
                  <td className={tdR}>{p.qty}</td>
                  <td className={`${tdR} font-semibold`}>{formatPrice(p.amount)}</td>
                </tr>
              ))}
              {s.topProducts.length === 0 && (
                <tr><td className={`${td} text-gray-400`} colSpan={5}>No deliveries this month</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/** One line per calendar month: count and money, current month highlighted. */
function MonthSplitTable({
  rows, rowLabel, current,
}: {
  rows: MonthSplit[];
  rowLabel: (r: MonthSplit) => string;
  current: string;
}) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr>
          <th className="py-1 text-left text-xs font-semibold text-gray-500">Month</th>
          <th className="py-1 text-right text-xs font-semibold text-gray-500">COD</th>
          <th className="py-1 text-right text-xs font-semibold text-gray-500">Online</th>
          <th className="py-1 text-right text-xs font-semibold text-gray-500">Orders</th>
          <th className="py-1 text-right text-xs font-semibold text-gray-500">Amount</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.month} className="border-t border-gray-50">
            <td className="py-1.5 text-gray-700">
              {rowLabel(r)}
              {r.month === current && <span className="ml-1 text-xs text-gray-400">(this month)</span>}
            </td>
            <td className="py-1.5 text-right text-gray-500 tabular-nums">{r.cod}</td>
            <td className="py-1.5 text-right text-gray-500 tabular-nums">{r.prepaid}</td>
            <td className="py-1.5 text-right font-semibold text-gray-900 tabular-nums">{r.orders}</td>
            <td className="py-1.5 text-right text-gray-700 tabular-nums">{formatPrice(r.amount)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
