import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  renderToBuffer,
} from "@react-pdf/renderer";
import { SELLER } from "@/lib/invoice/seller";
import type { MonthlyStatement } from "./monthly";

/**
 * The monthly statement as a PDF, built to read like the tax invoice so the
 * two obviously come from the same books.
 *
 * Money is printed as "Rs." for the same reason as the invoice: the built-in
 * PDF fonts carry no glyph for the rupee sign.
 */

const BRAND = "#f97316";
const INK = "#1a1a1a";
const MUTED = "#555555";
const RULE = "#cccccc";
const ZEBRA = "#fafafa";

const styles = StyleSheet.create({
  page: {
    paddingTop: 34,
    paddingBottom: 46,
    paddingHorizontal: 34,
    fontSize: 8,
    fontFamily: "Helvetica",
    color: INK,
    lineHeight: 1.4,
  },

  logoRow: { alignItems: "center", marginBottom: 16 },
  logoText: { fontSize: 24, fontFamily: "Helvetica-Bold", color: BRAND, letterSpacing: 1.5 },
  rule: { borderTopWidth: 1, borderTopColor: RULE },
  title: { fontSize: 17, textAlign: "center", paddingVertical: 10 },
  period: { fontSize: 10, textAlign: "center", color: MUTED, paddingBottom: 10 },

  meta: { flexDirection: "row", justifyContent: "space-between", marginTop: 14, marginBottom: 20 },
  metaCol: { width: "48%" },
  metaColRight: { width: "48%", alignItems: "flex-end" },
  metaLine: { color: MUTED },
  strong: { fontFamily: "Helvetica-Bold", color: INK },

  section: { marginTop: 16 },
  sectionHead: { fontSize: 9, fontFamily: "Helvetica-Bold", letterSpacing: 0.4, marginBottom: 2 },
  sectionNote: { fontSize: 7, color: MUTED, marginBottom: 6 },

  th: { fontSize: 6.5, fontFamily: "Helvetica-Bold", letterSpacing: 0.2, paddingLeft: 4 },
  headRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: RULE, paddingBottom: 5 },
  tr: { flexDirection: "row", paddingVertical: 4 },
  trAlt: { flexDirection: "row", paddingVertical: 4, backgroundColor: ZEBRA },
  td: { fontSize: 7.5, paddingLeft: 4 },
  tdMuted: { fontSize: 7.5, paddingLeft: 4, color: MUTED },

  totalRow: {
    flexDirection: "row",
    paddingVertical: 5,
    borderTopWidth: 1,
    borderTopColor: RULE,
    marginTop: 2,
  },
  tdTotal: { fontSize: 7.5, fontFamily: "Helvetica-Bold", paddingLeft: 4 },

  kpiRow: { flexDirection: "row", flexWrap: "wrap", marginTop: 2 },
  kpi: {
    width: "25%",
    paddingVertical: 6,
    paddingRight: 8,
  },
  kpiLabel: { fontSize: 6.5, color: MUTED, letterSpacing: 0.2 },
  kpiValue: { fontSize: 12, fontFamily: "Helvetica-Bold", marginTop: 2 },

  // A repeating footer has to be an absolutely-positioned `fixed` Text — react-pdf
  // does not repeat a fixed View wrapping them, so the pair sit on top of each
  // other at full content width and split by text alignment. `left/right: 0` is
  // the content box, which the page padding has already inset.
  footerLeft: {
    position: "absolute",
    bottom: 26,
    left: 0,
    width: "65%",
    fontSize: 6.5,
    color: MUTED,
  },
  footerRight: {
    position: "absolute",
    bottom: 26,
    right: 0,
    width: "35%",
    fontSize: 6.5,
    color: MUTED,
    textAlign: "right",
  },
});

const money = (n: number) => n.toFixed(2);
const right = { textAlign: "right" as const };
const w = (pct: number) => ({ width: `${pct}%` as const });

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.kpi}>
      <Text style={styles.kpiLabel}>{label}</Text>
      <Text style={styles.kpiValue}>{value}</Text>
    </View>
  );
}

/**
 * The repeating footer.
 *
 * It names the page rather than numbering it. react-pdf's `render` prop — the
 * only way to get a live page number — silently produces nothing inside this
 * document, and a name is the more useful label anyway: it survives the
 * invoice register spilling onto extra sheets, where a hardcoded number
 * could not.
 */
function Footer({ page }: { page: string }) {
  return (
    <>
      <Text style={styles.footerLeft} fixed>
        {SELLER.name} · GSTIN {SELLER.gstin}
      </Text>
      <Text style={styles.footerRight} fixed>
        {page}
      </Text>
    </>
  );
}

function Section({
  title,
  note,
  children,
}: {
  title: string;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionHead}>{title}</Text>
      {note ? <Text style={styles.sectionNote}>{note}</Text> : null}
      {children}
    </View>
  );
}

export function StatementDocument({ s }: { s: MonthlyStatement }) {
  const r = s.realised;
  const g = s.gst;

  return (
    <Document
      title={`BoxDeal Statement ${s.label}`}
      author={SELLER.name}
      subject={`Monthly statement for ${s.label}`}
    >
      {/* ── Page 1: the summary ── */}
      <Page size="A4" style={styles.page}>
        <View style={styles.logoRow}>
          <Text style={styles.logoText}>BOXDEAL</Text>
        </View>
        <View style={styles.rule} />
        <Text style={styles.title}>MONTHLY STATEMENT</Text>
        <Text style={styles.period}>{s.label}</Text>
        <View style={styles.rule} />

        <View style={styles.meta}>
          <View style={styles.metaCol}>
            <Text style={styles.strong}>{SELLER.name}</Text>
            <Text style={styles.metaLine}>{SELLER.address1}</Text>
            <Text style={styles.metaLine}>{SELLER.city}, {SELLER.state}</Text>
            <Text style={styles.metaLine}>GSTIN {SELLER.gstin}</Text>
          </View>
          <View style={styles.metaColRight}>
            <Text style={styles.metaLine}>Generated : {s.generatedAt}</Text>
            <Text style={styles.metaLine}>GST rate : {s.rate}% (prices inclusive)</Text>
            <Text style={styles.metaLine}>All amounts in INR</Text>
          </View>
        </View>

        <Section
          title="MONEY EARNED"
          note={`Money that arrived in ${s.label}: online orders when paid, COD when delivered. Refunded, cancelled and returned orders are left out.`}
        >
          <View style={styles.kpiRow}>
            <Kpi label="PAID ORDERS" value={String(r.orders)} />
            <Kpi label="NET SALES" value={`Rs. ${money(r.net)}`} />
            <Kpi label="COD COLLECTED" value={`Rs. ${money(r.cod.amount)}`} />
            <Kpi label="PREPAID" value={`Rs. ${money(r.prepaid.amount)}`} />
          </View>

          <View style={[styles.headRow, { marginTop: 8 }]}>
            <Text style={[styles.th, w(55)]}>BREAKDOWN</Text>
            <Text style={[styles.th, w(20), right]}>ORDERS</Text>
            <Text style={[styles.th, w(25), right]}>AMOUNT</Text>
          </View>
          {[
            ["Product value (before discount)", "", money(r.gross)],
            ["Discounts given", "", `-${money(r.discount)}`],
            ["Delivery charges", "", money(r.delivery)],
            ["COD collected", String(r.cod.orders), money(r.cod.amount)],
            ["Prepaid", String(r.prepaid.orders), money(r.prepaid.amount)],
            ...r.byOrderMonth.map((m) => [`Ordered in ${m.label}`, String(m.orders), money(m.amount)]),
          ].map(([label, orders, amount], i) => (
            <View key={label} style={i % 2 ? styles.trAlt : styles.tr}>
              <Text style={[styles.td, w(55)]}>{label}</Text>
              <Text style={[styles.tdMuted, w(20), right]}>{orders}</Text>
              <Text style={[styles.td, w(25), right]}>{amount}</Text>
            </View>
          ))}
          <View style={styles.totalRow}>
            <Text style={[styles.tdTotal, w(55)]}>NET SALES</Text>
            <Text style={[styles.tdTotal, w(20), right]}>{r.orders}</Text>
            <Text style={[styles.tdTotal, w(25), right]}>Rs. {money(r.net)}</Text>
          </View>
        </Section>

        <Section title="ORDER ACTIVITY" note="Orders PLACED this month, and where each one ended up. Every figure below is a slice of the placed total.">
          <View style={styles.kpiRow}>
            <Kpi label="ORDERS PLACED" value={String(s.activity.placed)} />
            <Kpi label="DELIVERED" value={String(s.activity.delivered)} />
            <Kpi label="IN TRANSIT" value={String(s.activity.inTransit)} />
            <Kpi label="CANCELLED" value={String(s.activity.cancelled)} />
            <Kpi label="RETURNED / RTO" value={String(s.activity.returned)} />
            <Kpi label="FAILED / UNPAID" value={String(s.activity.failed)} />
          </View>
          {s.activity.paidByMonth.length > 0 && (
            <>
              <View style={[styles.headRow, { marginTop: 8 }]}>
                <Text style={[styles.th, w(55)]}>PAID ORDERS — WHICH MONTH PAID</Text>
                <Text style={[styles.th, w(20), right]}>ORDERS</Text>
                <Text style={[styles.th, w(25), right]}>AMOUNT</Text>
              </View>
              {s.activity.paidByMonth.map((m, i) => (
                <View key={m.month} style={i % 2 ? styles.trAlt : styles.tr}>
                  <Text style={[styles.td, w(55)]}>Paid in {m.label}</Text>
                  <Text style={[styles.tdMuted, w(20), right]}>{m.orders}</Text>
                  <Text style={[styles.td, w(25), right]}>{money(m.amount)}</Text>
                </View>
              ))}
            </>
          )}
        </Section>

        <Section title="RETURNS" note="Recorded this month. RTO never reached the customer; a customer return came back after delivery.">
          <View style={styles.headRow}>
            <Text style={[styles.th, w(55)]}>TYPE</Text>
            <Text style={[styles.th, w(20), right]}>ORDERS</Text>
            <Text style={[styles.th, w(25), right]}>VALUE</Text>
          </View>
          {[
            ["RTO — never delivered", s.returns.rto],
            ["Customer return", s.returns.customer],
          ].map(([label, v], i) => {
            const b = v as { orders: number; amount: number };
            return (
              <View key={label as string} style={i % 2 ? styles.trAlt : styles.tr}>
                <Text style={[styles.td, w(55)]}>{label as string}</Text>
                <Text style={[styles.td, w(20), right]}>{b.orders}</Text>
                <Text style={[styles.td, w(25), right]}>{money(b.amount)}</Text>
              </View>
            );
          })}
        </Section>

        <Footer page="Summary" />
      </Page>

      {/* ── Page 2+: the registers a CA works from ── */}
      <Page size="A4" style={styles.page}>
        <Section title="GST SUMMARY" note="Invoices raised this month. Tax is owed from the date the invoice is issued, which is why this section counts different days to the sales above.">
          <View style={styles.kpiRow}>
            <Kpi label="INVOICES" value={String(g.invoices.length)} />
            <Kpi label="TAXABLE VALUE" value={`Rs. ${money(g.totals.taxable)}`} />
            <Kpi label="TOTAL GST" value={`Rs. ${money(g.totals.tax)}`} />
            <Kpi label="INVOICE VALUE" value={`Rs. ${money(g.totals.net)}`} />
          </View>
          <View style={[styles.headRow, { marginTop: 8 }]}>
            <Text style={[styles.th, w(40)]}>COMPONENT</Text>
            <Text style={[styles.th, w(60), right]}>AMOUNT</Text>
          </View>
          {[
            ["CGST", g.totals.cgst],
            ["SGST", g.totals.sgst],
            ["IGST", g.totals.igst],
          ].map(([label, v], i) => (
            <View key={label as string} style={i % 2 ? styles.trAlt : styles.tr}>
              <Text style={[styles.td, w(40)]}>{label as string}</Text>
              <Text style={[styles.td, w(60), right]}>{money(v as number)}</Text>
            </View>
          ))}
          <View style={styles.totalRow}>
            <Text style={[styles.tdTotal, w(40)]}>TOTAL GST</Text>
            <Text style={[styles.tdTotal, w(60), right]}>Rs. {money(g.totals.tax)}</Text>
          </View>
        </Section>

        <Section title={`HSN SUMMARY — ${s.label}`} note="GSTR-1 Table 12. Product lines only: the delivery charge rides with the goods as a composite supply and carries no HSN of its own.">
          <View style={styles.headRow} fixed>
            <Text style={[styles.th, w(20)]}>HSN</Text>
            <Text style={[styles.th, w(10), right]}>QTY</Text>
            <Text style={[styles.th, w(16), right]}>TAXABLE</Text>
            <Text style={[styles.th, w(13), right]}>CGST</Text>
            <Text style={[styles.th, w(13), right]}>SGST</Text>
            <Text style={[styles.th, w(13), right]}>IGST</Text>
            <Text style={[styles.th, w(15), right]}>TOTAL</Text>
          </View>
          {g.hsn.map((h, i) => (
            <View key={h.hsn} style={i % 2 ? styles.trAlt : styles.tr} wrap={false}>
              <Text style={[styles.td, w(20)]}>{h.hsn}</Text>
              <Text style={[styles.td, w(10), right]}>{h.qty}</Text>
              <Text style={[styles.td, w(16), right]}>{money(h.taxable)}</Text>
              <Text style={[styles.td, w(13), right]}>{money(h.cgst)}</Text>
              <Text style={[styles.td, w(13), right]}>{money(h.sgst)}</Text>
              <Text style={[styles.td, w(13), right]}>{money(h.igst)}</Text>
              <Text style={[styles.td, w(15), right]}>{money(h.net)}</Text>
            </View>
          ))}
        </Section>

        <Section title="STATE-WISE SUMMARY" note="GSTR-1 Table 7 — B2C, grouped by the customer's state (place of supply).">
          <View style={styles.headRow} fixed>
            <Text style={[styles.th, w(26)]}>STATE</Text>
            <Text style={[styles.th, w(9), right]}>CODE</Text>
            <Text style={[styles.th, w(11), right]}>INVOICES</Text>
            <Text style={[styles.th, w(16), right]}>TAXABLE</Text>
            <Text style={[styles.th, w(12), right]}>CGST</Text>
            <Text style={[styles.th, w(12), right]}>SGST</Text>
            <Text style={[styles.th, w(14), right]}>IGST</Text>
          </View>
          {g.states.map((st, i) => (
            <View key={st.state} style={i % 2 ? styles.trAlt : styles.tr} wrap={false}>
              <Text style={[styles.td, w(26)]}>{st.state}</Text>
              <Text style={[styles.td, w(9), right]}>{st.stateCode}</Text>
              <Text style={[styles.td, w(11), right]}>{st.invoices}</Text>
              <Text style={[styles.td, w(16), right]}>{money(st.taxable)}</Text>
              <Text style={[styles.td, w(12), right]}>{money(st.cgst)}</Text>
              <Text style={[styles.td, w(12), right]}>{money(st.sgst)}</Text>
              <Text style={[styles.td, w(14), right]}>{money(st.igst)}</Text>
            </View>
          ))}
        </Section>

        <Footer page="GST Summary" />
      </Page>

      {/* ── Page 3: the register, which can run to several sheets ── */}
      <Page size="A4" style={styles.page}>
        <Section title="INVOICE REGISTER" note={`${g.invoices.length} invoice${g.invoices.length === 1 ? "" : "s"} raised in ${s.label}.`}>
          <View style={styles.headRow} fixed>
            <Text style={[styles.th, w(13)]}>INVOICE NO</Text>
            <Text style={[styles.th, w(12)]}>DATE</Text>
            <Text style={[styles.th, w(19)]}>ORDER NO</Text>
            <Text style={[styles.th, w(14)]}>STATE</Text>
            <Text style={[styles.th, w(9)]}>PAY</Text>
            <Text style={[styles.th, w(12), right]}>TAXABLE</Text>
            <Text style={[styles.th, w(10), right]}>GST</Text>
            <Text style={[styles.th, w(11), right]}>TOTAL</Text>
          </View>
          {g.invoices.map((inv, i) => (
            <View key={inv.invoiceNumber} style={i % 2 ? styles.trAlt : styles.tr} wrap={false}>
              <Text style={[styles.td, w(13)]}>{inv.invoiceNumber}</Text>
              <Text style={[styles.td, w(12)]}>{inv.invoiceDate}</Text>
              <Text style={[styles.td, w(19)]}>{inv.orderNumber}</Text>
              <Text style={[styles.tdMuted, w(14)]}>{inv.state}</Text>
              <Text style={[styles.tdMuted, w(9)]}>{inv.paymentMethod}</Text>
              <Text style={[styles.td, w(12), right]}>{money(inv.taxable)}</Text>
              <Text style={[styles.td, w(10), right]}>
                {money(inv.cgst + inv.sgst + inv.igst)}
              </Text>
              <Text style={[styles.td, w(11), right]}>{money(inv.total)}</Text>
            </View>
          ))}
          {g.invoices.length === 0 ? (
            <Text style={[styles.tdMuted, { paddingTop: 8 }]}>
              No invoices were raised in {s.label}.
            </Text>
          ) : (
            <View style={styles.totalRow}>
              <Text style={[styles.tdTotal, w(53)]}>TOTAL</Text>
              <Text style={[styles.tdTotal, w(12), right]}>{money(g.totals.taxable)}</Text>
              <Text style={[styles.tdTotal, w(10), right]}>{money(g.totals.tax)}</Text>
              <Text style={[styles.tdTotal, w(11), right]}>{money(g.totals.net)}</Text>
            </View>
          )}
        </Section>

        <Footer page="Invoice Register" />
      </Page>
    </Document>
  );
}

/** Render the statement to a PDF buffer, ready to stream as the response. */
export async function renderStatementPdf(s: MonthlyStatement): Promise<Buffer> {
  return renderToBuffer(<StatementDocument s={s} />);
}
