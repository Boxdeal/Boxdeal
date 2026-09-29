import {
  Document,
  Font,
  Page,
  Text,
  View,
  StyleSheet,
  renderToBuffer,
} from "@react-pdf/renderer";
import { SELLER } from "./seller";
import { computeInvoice, stateCode, type InvoiceComputation } from "./gst";

/**
 * The tax invoice PDF.
 *
 * Rendered on demand and streamed straight to the caller — no file is ever
 * written to disk or to object storage, so an invoice costs nothing to keep.
 * The only persisted part is the invoice number, which the caller passes in.
 *
 * Money is printed as "Rs." rather than the ₹ symbol on purpose: the built-in
 * PDF fonts have no glyph for U+20B9, and embedding a font that does would add
 * a few hundred KB to every render for one character.
 */

// The renderer hyphenates long words by default, which turns tight table
// headers into "TAXABLE VAL-UE". An invoice has no prose to hyphenate, so
// words are kept whole and simply wrap to the next line instead.
Font.registerHyphenationCallback((word) => [word]);

const BRAND = "#f97316";
const INK = "#1a1a1a";
const MUTED = "#555555";
const RULE = "#cccccc";

const styles = StyleSheet.create({
  page: {
    paddingTop: 34,
    paddingBottom: 44,
    paddingHorizontal: 34,
    fontSize: 8,
    fontFamily: "Helvetica",
    color: INK,
    lineHeight: 1.4,
  },

  // ── Masthead ──────────────────────────────────────────────
  logoRow: { alignItems: "center", marginBottom: 20 },
  logoText: { fontSize: 26, fontFamily: "Helvetica-Bold", color: BRAND, letterSpacing: 1.5 },
  titleRule: { borderTopWidth: 1, borderTopColor: RULE },
  title: { fontSize: 19, textAlign: "center", paddingVertical: 12, color: INK },

  // ── Party / invoice details ───────────────────────────────
  parties: { flexDirection: "row", marginTop: 20, marginBottom: 26 },
  colShip: { width: "30%", paddingRight: 10 },
  colSold: {
    width: "34%",
    paddingHorizontal: 10,
    borderLeftWidth: 1,
    borderLeftColor: RULE,
    borderLeftStyle: "dashed",
    borderRightWidth: 1,
    borderRightColor: RULE,
    borderRightStyle: "dashed",
  },
  colMeta: { width: "36%", paddingLeft: 12 },
  blockHead: { fontSize: 8, fontFamily: "Helvetica-Bold", marginBottom: 7 },
  soldLine: { textAlign: "right", color: MUTED },
  shipLine: { color: MUTED },

  metaRow: { flexDirection: "row", marginBottom: 2.5 },
  metaLabel: { width: "44%", fontFamily: "Helvetica-Bold", fontSize: 7.5 },
  metaValue: { width: "56%", color: MUTED },

  // ── Line-item table ───────────────────────────────────────
  tableHead: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: RULE,
    paddingBottom: 6,
  },
  th: { fontSize: 6, fontFamily: "Helvetica-Bold", letterSpacing: 0.2, paddingLeft: 4 },
  row: { flexDirection: "row", paddingTop: 10, paddingBottom: 6 },
  td: { fontSize: 7.5, color: INK, paddingLeft: 4 },
  itemName: { fontSize: 7.5, fontFamily: "Helvetica-Bold", lineHeight: 1.45 },
  itemSku: { fontSize: 6.5, color: MUTED, marginTop: 3 },

  extrasRow: { flexDirection: "row", paddingVertical: 5 },
  totalRule: { borderTopWidth: 1, borderTopColor: RULE, marginTop: 8 },

  netRow: { flexDirection: "row", justifyContent: "flex-end", marginTop: 14 },
  netLabel: { fontSize: 11, fontFamily: "Helvetica-Bold" },
  netValue: { fontSize: 11, fontFamily: "Helvetica-Bold", width: 110, textAlign: "right" },

  // ── Footer ────────────────────────────────────────────────
  footer: { flexDirection: "row", marginTop: 26, alignItems: "flex-start" },
  signBox: { width: 130 },
  signPad: { height: 52, borderWidth: 1, borderColor: RULE },
  signName: { fontSize: 8, fontFamily: "Helvetica-Bold", marginTop: 8 },
  reverseCharge: { flex: 1, textAlign: "right", color: MUTED, paddingTop: 4 },
});

/** Column widths, in percent, for each supply type. Each set sums to 100. */
const COLS = {
  inter: { sno: 4, name: 28, hsn: 8, qty: 4, unit: 11, disc: 11, taxable: 11, tax1: 12, tax2: 0, total: 11 },
  intra: { sno: 3.5, name: 22.5, hsn: 7, qty: 3.5, unit: 10, disc: 10, taxable: 10, tax1: 11.5, tax2: 11.5, total: 10.5 },
} as const;

/** Two decimals, no thousands separators — matching the reference invoice. */
function money(n: number): string {
  return n.toFixed(2);
}

/** "1677.81 @ 18%" — the value and rate pair printed in each tax column. */
function taxCell(value: number, rate: number): string {
  return `${money(value)} @ ${rate}%`;
}

export interface InvoiceMeta {
  invoiceNumber: string;
  invoiceDate: string;
  orderNumber: string;
  orderDate: string;
  channel: string;
  shippedBy: string | null;
  awb: string | null;
  paymentMethod: string;
  remark: string | null;
}

export interface InvoiceBuyer {
  name: string;
  address1: string;
  address2: string | null;
  city: string;
  state: string;
  pincode: string;
}

function Masthead() {
  return (
    <>
      <View style={styles.logoRow}>
        <Text style={styles.logoText}>BOXDEAL</Text>
      </View>
      <View style={styles.titleRule} />
      <Text style={styles.title}>TAX INVOICE</Text>
      <View style={styles.titleRule} />
    </>
  );
}

function Parties({ buyer, meta }: { buyer: InvoiceBuyer; meta: InvoiceMeta }) {
  const buyerCode = stateCode(buyer.state);

  const metaRows: Array<[string, string]> = [
    ["INVOICE NO.", `: ${meta.invoiceNumber}`],
    ["INVOICE DATE", `: ${meta.invoiceDate}`],
    ["ORDER NO.", `: ${meta.orderNumber}`],
    ["ORDER DATE", `: ${meta.orderDate}`],
    ["CHANNEL", `: ${meta.channel}`],
  ];
  if (meta.shippedBy) metaRows.push(["SHIPPED BY", `: ${meta.shippedBy}`]);
  if (meta.awb) metaRows.push(["AWB NO.", `: ${meta.awb}`]);
  metaRows.push(["PAYMENT METHOD", `: ${meta.paymentMethod}`]);
  if (meta.remark) metaRows.push(["REMARK", `: ${meta.remark}`]);

  return (
    <View style={styles.parties}>
      <View style={styles.colShip}>
        <Text style={styles.blockHead}>SHIPPING ADDRESS:</Text>
        <Text style={styles.shipLine}>{buyer.name}</Text>
        <Text style={styles.shipLine}>{buyer.address1}</Text>
        {buyer.address2 ? <Text style={styles.shipLine}>{buyer.address2}</Text> : null}
        <Text style={styles.shipLine}>
          {buyer.city} {buyer.pincode}
        </Text>
        <Text style={styles.shipLine}>{buyer.state}</Text>
        <Text style={styles.shipLine}>India</Text>
        {buyerCode ? <Text style={styles.shipLine}>State Code : {buyerCode}</Text> : null}
      </View>

      <View style={styles.colSold}>
        <Text style={[styles.blockHead, { textAlign: "left" }]}>SOLD BY:</Text>
        <Text style={[styles.soldLine, { fontFamily: "Helvetica-Bold", color: INK }]}>
          {SELLER.name}
        </Text>
        <Text style={styles.soldLine}>{SELLER.address1}</Text>
        {SELLER.address2 ? <Text style={styles.soldLine}>{SELLER.address2}</Text> : null}
        <Text style={styles.soldLine}>{SELLER.city}</Text>
        <Text style={styles.soldLine}>{SELLER.state}</Text>
        <Text style={styles.soldLine}>{SELLER.country}</Text>
        <Text style={styles.soldLine}>State Code : {SELLER.stateCode}</Text>
        <Text style={styles.soldLine}>Ph: {SELLER.phone}</Text>
        <Text style={[styles.soldLine, { marginTop: 6 }]}>GSTIN No. {SELLER.gstin}</Text>
        <Text style={styles.soldLine}>CIN No: {SELLER.cin}</Text>
        <Text style={styles.soldLine}>Website: {SELLER.website}</Text>
        <Text style={styles.soldLine}>Email: {SELLER.email}</Text>
      </View>

      <View style={styles.colMeta}>
        <Text style={styles.blockHead}>INVOICE DETAILS:</Text>
        {metaRows.map(([label, value]) => (
          <View key={label} style={styles.metaRow}>
            <Text style={styles.metaLabel}>{label}</Text>
            <Text style={styles.metaValue}>{value}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function LineTable({ calc }: { calc: InvoiceComputation }) {
  const c = calc.intraState ? COLS.intra : COLS.inter;
  const half = calc.rate / 2;
  const w = (pct: number) => ({ width: `${pct}%` as const });
  const right = { textAlign: "right" as const };

  return (
    <View>
      <View style={styles.tableHead}>
        <Text style={[styles.th, w(c.sno)]}>S.NO.</Text>
        <Text style={[styles.th, w(c.name)]}>PRODUCT NAME</Text>
        <Text style={[styles.th, w(c.hsn), right]}>HSN</Text>
        <Text style={[styles.th, w(c.qty), right]}>QTY</Text>
        <Text style={[styles.th, w(c.unit), right]}>UNIT PRICE</Text>
        <Text style={[styles.th, w(c.disc), right]}>UNIT DISCOUNT</Text>
        <Text style={[styles.th, w(c.taxable), right]}>TAXABLE VALUE</Text>
        {calc.intraState ? (
          <>
            <Text style={[styles.th, w(c.tax1), right]}>CGST (Value @ Rate)</Text>
            <Text style={[styles.th, w(c.tax2), right]}>SGST (Value @ Rate)</Text>
          </>
        ) : (
          <Text style={[styles.th, w(c.tax1), right]}>IGST (Value @ Rate)</Text>
        )}
        <Text style={[styles.th, w(c.total), right]}>TOTAL (Including GST)</Text>
      </View>

      {calc.lines.map((line) => (
        <View key={line.serial} style={styles.row} wrap={false}>
          <Text style={[styles.td, w(c.sno)]}>{line.serial}</Text>
          <View style={w(c.name)}>
            <Text style={styles.itemName}>{line.name}</Text>
            {line.sku ? <Text style={styles.itemSku}>SKU : {line.sku}</Text> : null}
          </View>
          <Text style={[styles.td, w(c.hsn), right]}>{line.hsn || "-"}</Text>
          <Text style={[styles.td, w(c.qty), right]}>{line.qty}</Text>
          <Text style={[styles.td, w(c.unit), right]}>Rs. {money(line.unitPrice)}</Text>
          <Text style={[styles.td, w(c.disc), right]}>{money(line.unitDiscount)}</Text>
          <Text style={[styles.td, w(c.taxable), right]}>{money(line.taxable)}</Text>
          {calc.intraState ? (
            <>
              <Text style={[styles.td, w(c.tax1), right]}>{taxCell(line.cgst, half)}</Text>
              <Text style={[styles.td, w(c.tax2), right]}>{taxCell(line.sgst, half)}</Text>
            </>
          ) : (
            <Text style={[styles.td, w(c.tax1), right]}>{taxCell(line.igst, calc.rate)}</Text>
          )}
          <Text style={[styles.td, w(c.total), right]}>{money(line.total)}</Text>
        </View>
      ))}

      {calc.shipping ? (
        <View style={styles.extrasRow} wrap={false}>
          <Text style={[styles.td, w(c.sno + c.name + c.hsn + c.qty + c.unit + c.disc), right]}>
            Shipping Charges
          </Text>
          <Text style={[styles.td, w(c.taxable), right]}>{money(calc.shipping.taxable)}</Text>
          {calc.intraState ? (
            <>
              <Text style={[styles.td, w(c.tax1), right]}>{taxCell(calc.shipping.cgst, half)}</Text>
              <Text style={[styles.td, w(c.tax2), right]}>{taxCell(calc.shipping.sgst, half)}</Text>
            </>
          ) : (
            <Text style={[styles.td, w(c.tax1), right]}>{taxCell(calc.shipping.igst, calc.rate)}</Text>
          )}
          <Text style={[styles.td, w(c.total), right]}>{money(calc.shipping.total)}</Text>
        </View>
      ) : null}

      <View style={styles.totalRule} />
      <View style={styles.netRow}>
        <Text style={styles.netLabel}>NET TOTAL (In Value)</Text>
        <Text style={styles.netValue}>Rs. {money(calc.totals.net)}</Text>
      </View>
    </View>
  );
}

function Footer() {
  return (
    <View style={styles.footer}>
      <View style={styles.signBox}>
        <View style={styles.signPad} />
        <Text style={styles.signName}>Authorized Signature for</Text>
        <Text style={styles.signName}>{SELLER.name}</Text>
      </View>
      <Text style={styles.reverseCharge}>Whether tax is payable under reverse charge- No</Text>
    </View>
  );
}

export function InvoiceDocument({
  calc,
  buyer,
  meta,
}: {
  calc: InvoiceComputation;
  buyer: InvoiceBuyer;
  meta: InvoiceMeta;
}) {
  return (
    <Document
      title={`Tax Invoice ${meta.invoiceNumber}`}
      author={SELLER.name}
      subject={`Tax invoice for order ${meta.orderNumber}`}
    >
      <Page size="A4" style={styles.page}>
        <Masthead />
        <Parties buyer={buyer} meta={meta} />
        <LineTable calc={calc} />
        <Footer />
      </Page>
    </Document>
  );
}

export { computeInvoice };

/** Render the invoice to a PDF buffer, ready to stream as the HTTP response. */
export async function renderInvoicePdf(args: {
  calc: InvoiceComputation;
  buyer: InvoiceBuyer;
  meta: InvoiceMeta;
}): Promise<Buffer> {
  return renderToBuffer(
    <InvoiceDocument calc={args.calc} buyer={args.buyer} meta={args.meta} />
  );
}
