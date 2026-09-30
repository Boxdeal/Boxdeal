import ExcelJS from "exceljs";
import type { MonthlyStatement } from "./monthly";
import { SELLER } from "@/lib/invoice/seller";

/**
 * The statement as a formatted Excel workbook.
 *
 * Unlike the CSV, each shape of data gets its own sheet — Summary, Invoice
 * Register, HSN Summary, State-wise and Top Products — with styled headers,
 * real number formats, frozen header rows, filters and a totals row, so an
 * accountant can open it and work straight away.
 */

// Same palette as the PDF statement.
const BRAND = "FFF97316";
const BRAND_TINT = "FFFFF3E8";
const INK = "FF1A1A1A";
const MUTED = "FF666666";
const RULE = "FFD9D9D9";
const ZEBRA = "FFFAFAFA";
const WHITE = "FFFFFFFF";

const MONEY = '#,##0.00;[Red]-#,##0.00';
const COUNT = "#,##0";

const fill = (argb: string): ExcelJS.Fill => ({ type: "pattern", pattern: "solid", fgColor: { argb } });
const thin: Partial<ExcelJS.Border> = { style: "thin", color: { argb: RULE } };
const boxed: Partial<ExcelJS.Borders> = { top: thin, left: thin, bottom: thin, right: thin };

type Col = { header: string; width: number; fmt?: string; align?: "left" | "right" | "center" };

/** Big title, seller line and month line across the top of a sheet. */
function banner(ws: ExcelJS.Worksheet, span: number, title: string, subtitle: string) {
  ws.mergeCells(1, 1, 1, span);
  const t = ws.getCell(1, 1);
  t.value = title;
  t.font = { name: "Calibri", size: 16, bold: true, color: { argb: WHITE } };
  t.fill = fill(BRAND);
  t.alignment = { vertical: "middle", indent: 1 };
  ws.getRow(1).height = 30;

  ws.mergeCells(2, 1, 2, span);
  const s = ws.getCell(2, 1);
  s.value = subtitle;
  s.font = { size: 10, italic: true, color: { argb: MUTED } };
  s.alignment = { indent: 1 };
  ws.getRow(2).height = 18;
}

function styleHeader(row: ExcelJS.Row, cols: Col[]) {
  row.height = 22;
  cols.forEach((c, i) => {
    const cell = row.getCell(i + 1);
    cell.font = { bold: true, color: { argb: INK } };
    cell.fill = fill(BRAND_TINT);
    cell.border = { ...boxed, bottom: { style: "medium", color: { argb: BRAND } } };
    cell.alignment = { vertical: "middle", horizontal: c.align ?? (c.fmt ? "right" : "left"), wrapText: true };
  });
}

/**
 * A sheet holding one table: banner, header row, zebra-striped data and a
 * SUM totals row. `totals` names which columns get summed.
 */
function tableSheet(
  wb: ExcelJS.Workbook,
  name: string,
  title: string,
  subtitle: string,
  cols: Col[],
  rows: Array<Array<string | number>>,
  opts: { totals?: number[]; empty: string }
) {
  const ws = wb.addWorksheet(name, {
    views: [{ state: "frozen", ySplit: 4 }],
    pageSetup: { orientation: "landscape", fitToPage: true, fitToWidth: 1, fitToHeight: 0 },
  });
  ws.columns = cols.map((c) => ({ width: c.width }));
  banner(ws, cols.length, title, subtitle);

  const HEADER = 4;
  styleHeader(ws.getRow(HEADER), cols);
  cols.forEach((c, i) => (ws.getCell(HEADER, i + 1).value = c.header));

  if (rows.length === 0) {
    ws.mergeCells(HEADER + 1, 1, HEADER + 1, cols.length);
    const cell = ws.getCell(HEADER + 1, 1);
    cell.value = opts.empty;
    cell.font = { italic: true, color: { argb: MUTED } };
    cell.alignment = { horizontal: "center" };
    return ws;
  }

  rows.forEach((values, r) => {
    const row = ws.getRow(HEADER + 1 + r);
    values.forEach((v, i) => {
      const cell = row.getCell(i + 1);
      cell.value = v;
      cell.border = boxed;
      if (cols[i].fmt) cell.numFmt = cols[i].fmt!;
      cell.alignment = { horizontal: cols[i].align ?? (cols[i].fmt ? "right" : "left") };
      if (r % 2 === 1) cell.fill = fill(ZEBRA);
    });
  });

  const first = HEADER + 1;
  const last = HEADER + rows.length;
  ws.autoFilter = { from: { row: HEADER, column: 1 }, to: { row: last, column: cols.length } };

  if (opts.totals?.length) {
    const total = ws.getRow(last + 1);
    total.height = 20;
    cols.forEach((c, i) => {
      const cell = total.getCell(i + 1);
      cell.font = { bold: true };
      cell.fill = fill(BRAND_TINT);
      cell.border = { ...boxed, top: { style: "medium", color: { argb: BRAND } } };
      cell.alignment = { horizontal: c.fmt ? "right" : "left" };
      if (c.fmt) cell.numFmt = c.fmt;
    });
    total.getCell(1).value = "TOTAL";
    for (const i of opts.totals) {
      const letter = ws.getColumn(i + 1).letter;
      const sum = rows.reduce((acc, r) => acc + (Number(r[i]) || 0), 0);
      total.getCell(i + 1).value = {
        formula: `SUM(${letter}${first}:${letter}${last})`,
        result: Math.round(sum * 100) / 100,
      };
    }
  }
  return ws;
}

/** The Summary sheet: a label column and up to two value columns per section. */
function summarySheet(wb: ExcelJS.Workbook, s: MonthlyStatement) {
  const ws = wb.addWorksheet("Summary", {
    pageSetup: { orientation: "portrait", fitToPage: true, fitToWidth: 1, fitToHeight: 0 },
  });
  ws.columns = [{ width: 44 }, { width: 14 }, { width: 18 }];
  banner(ws, 3, `BoxDeal — Monthly Statement · ${s.label}`, "All amounts in INR. Prices are GST-inclusive.");

  let r = 4;
  const meta: Array<[string, string]> = [
    ["Seller", SELLER.name],
    ["GSTIN", SELLER.gstin],
    ["Month", s.label],
    ["Generated", s.generatedAt],
  ];
  for (const [k, v] of meta) {
    ws.getCell(r, 1).value = k;
    ws.getCell(r, 1).font = { bold: true, color: { argb: MUTED } };
    ws.mergeCells(r, 2, r, 3);
    ws.getCell(r, 2).value = v;
    r++;
  }

  const section = (title: string, note: string, headers: string[]) => {
    r++;
    ws.mergeCells(r, 1, r, 3);
    const t = ws.getCell(r, 1);
    t.value = title;
    t.font = { bold: true, size: 12, color: { argb: WHITE } };
    t.fill = fill(BRAND);
    t.alignment = { vertical: "middle", indent: 1 };
    ws.getRow(r).height = 22;
    r++;
    ws.mergeCells(r, 1, r, 3);
    const n = ws.getCell(r, 1);
    n.value = note;
    n.font = { italic: true, size: 9, color: { argb: MUTED } };
    n.alignment = { indent: 1 };
    r++;
    const header = ws.getRow(r);
    styleHeader(header, [{ header: "", width: 0 }, { header: "", width: 0, fmt: COUNT }, { header: "", width: 0, fmt: MONEY }]);
    headers.forEach((h, i) => (header.getCell(i + 1).value = h));
    r++;
  };

  /** One data row. `sub` indents it as a breakdown of the row above. */
  const line = (label: string, orders: number | null, amount: number | null, opts: { sub?: boolean; bold?: boolean } = {}) => {
    const row = ws.getRow(r++);
    row.getCell(1).value = label;
    row.getCell(1).alignment = { indent: opts.sub ? 2 : 0 };
    if (orders !== null) row.getCell(2).value = orders;
    if (amount !== null) row.getCell(3).value = amount;
    row.getCell(2).numFmt = COUNT;
    row.getCell(3).numFmt = MONEY;
    for (let c = 1; c <= 3; c++) {
      const cell = row.getCell(c);
      cell.border = boxed;
      cell.font = {
        bold: opts.bold,
        color: { argb: opts.sub ? MUTED : INK },
      };
      if (opts.bold) cell.fill = fill(ZEBRA);
    }
  };

  section("ORDER ACTIVITY", "Orders PLACED this month, and where each one ended up", ["Metric", "Orders", ""]);
  line("Orders placed", s.activity.placed, null, { bold: true });
  line("Delivered", s.activity.delivered, null, { sub: true });
  for (const m of s.activity.deliveredByMonth) {
    line(`  delivered in ${m.label}`, m.orders, m.amount, { sub: true });
  }
  line("Still in transit", s.activity.inTransit, null, { sub: true });
  line("Cancelled", s.activity.cancelled, null, { sub: true });
  line("Returned / RTO", s.activity.returned, null, { sub: true });
  line("Failed / never paid", s.activity.failed, null, { sub: true });

  section("MONEY EARNED", "Money that ARRIVED this month: online when paid, COD when delivered. Refunds excluded", ["Metric", "Orders", "Amount (₹)"]);
  line("Paid orders", s.realised.orders, s.realised.net, { bold: true });
  for (const m of s.realised.byOrderMonth) {
    line(`Ordered in ${m.label}`, m.orders, m.amount, { sub: true });
  }
  line("Product value", null, s.realised.gross, { sub: true });
  line("Discounts given", null, -s.realised.discount, { sub: true });
  line("Delivery charges", null, s.realised.delivery, { sub: true });
  line("COD collected", s.realised.cod.orders, s.realised.cod.amount);
  line("Prepaid", s.realised.prepaid.orders, s.realised.prepaid.amount);

  section("RETURNS", "Recorded this month", ["Type", "Orders", "Value (₹)"]);
  line("RTO — never delivered", s.returns.rto.orders, s.returns.rto.amount);
  line("Customer return", s.returns.customer.orders, s.returns.customer.amount);

  section("GST SUMMARY", "Invoices raised this month", ["Metric", "Count", "Amount (₹)"]);
  line("Invoices raised", s.gst.invoices.length, null);
  line("Taxable value", null, s.gst.totals.taxable);
  line("CGST", null, s.gst.totals.cgst, { sub: true });
  line("SGST", null, s.gst.totals.sgst, { sub: true });
  line("IGST", null, s.gst.totals.igst, { sub: true });
  line("Total GST", null, s.gst.totals.tax);
  line("Invoice value (incl. GST)", null, s.gst.totals.net, { bold: true });
}

export async function statementToXlsx(s: MonthlyStatement): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  wb.creator = SELLER.name;
  wb.created = new Date();

  summarySheet(wb, s);
  const sub = `${SELLER.name} · GSTIN ${SELLER.gstin} · ${s.label}`;

  tableSheet(
    wb,
    "Invoice Register",
    "Invoice Register",
    sub,
    [
      { header: "Invoice No", width: 18 },
      { header: "Invoice Date", width: 13, align: "center" },
      { header: "Order No", width: 20 },
      { header: "State", width: 20 },
      { header: "State Code", width: 10, align: "center" },
      { header: "Payment", width: 11, align: "center" },
      { header: "Taxable (₹)", width: 14, fmt: MONEY },
      { header: "CGST (₹)", width: 12, fmt: MONEY },
      { header: "SGST (₹)", width: 12, fmt: MONEY },
      { header: "IGST (₹)", width: 12, fmt: MONEY },
      { header: "Invoice Total (₹)", width: 16, fmt: MONEY },
    ],
    s.gst.invoices.map((i) => [
      i.invoiceNumber, i.invoiceDate, i.orderNumber, i.state, i.stateCode,
      i.paymentMethod, i.taxable, i.cgst, i.sgst, i.igst, i.total,
    ]),
    { totals: [6, 7, 8, 9, 10], empty: "No invoices raised this month" }
  );

  tableSheet(
    wb,
    "HSN Summary",
    "HSN Summary — GSTR-1 Table 12",
    `${sub} · Product lines only, delivery excluded`,
    [
      { header: "HSN", width: 14 },
      { header: "Qty", width: 9, fmt: COUNT },
      { header: "Taxable (₹)", width: 15, fmt: MONEY },
      { header: "CGST (₹)", width: 13, fmt: MONEY },
      { header: "SGST (₹)", width: 13, fmt: MONEY },
      { header: "IGST (₹)", width: 13, fmt: MONEY },
      { header: "Total (₹)", width: 15, fmt: MONEY },
    ],
    s.gst.hsn.map((h) => [h.hsn, h.qty, h.taxable, h.cgst, h.sgst, h.igst, h.net]),
    { totals: [1, 2, 3, 4, 5, 6], empty: "No invoices raised this month" }
  );

  tableSheet(
    wb,
    "State-wise",
    "State-wise Summary — GSTR-1 Table 7",
    `${sub} · B2C, by place of supply`,
    [
      { header: "State", width: 22 },
      { header: "State Code", width: 10, align: "center" },
      { header: "Invoices", width: 10, fmt: COUNT },
      { header: "Taxable (₹)", width: 15, fmt: MONEY },
      { header: "CGST (₹)", width: 13, fmt: MONEY },
      { header: "SGST (₹)", width: 13, fmt: MONEY },
      { header: "IGST (₹)", width: 13, fmt: MONEY },
      { header: "Total (₹)", width: 15, fmt: MONEY },
    ],
    s.gst.states.map((st) => [st.state, st.stateCode, st.invoices, st.taxable, st.cgst, st.sgst, st.igst, st.net]),
    { totals: [2, 3, 4, 5, 6, 7], empty: "No invoices raised this month" }
  );

  tableSheet(
    wb,
    "Top Products",
    "Top Products",
    `${sub} · By value, delivered this month`,
    [
      { header: "#", width: 6, align: "center" },
      { header: "SKU", width: 18 },
      { header: "Product", width: 48 },
      { header: "Qty", width: 9, fmt: COUNT },
      { header: "Value (₹)", width: 15, fmt: MONEY },
    ],
    s.topProducts.map((p, i) => [i + 1, p.sku, p.name, p.qty, p.amount]),
    { empty: "No deliveries this month" }
  );

  return Buffer.from(await wb.xlsx.writeBuffer());
}
