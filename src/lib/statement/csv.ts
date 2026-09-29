import type { MonthlyStatement } from "./monthly";
import { SELLER } from "@/lib/invoice/seller";

/**
 * The statement as CSV, written in labelled blocks rather than one flat table.
 *
 * A month has four shapes of data — a summary, an invoice register, an HSN
 * roll-up and a state roll-up — and they have different columns. Flattening
 * them into a single header would lose most of it, so each block gets its own
 * header row with a blank line between; Excel and Sheets both read that fine
 * and an accountant can select any block and sort it on its own.
 */

/** Quote a CSV field only when it needs it, and never let it break the row. */
function cell(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "";
  const s = String(value);
  // A leading =, +, - or @ makes Excel evaluate the cell as a formula. Order
  // numbers and HSN codes are text, so prefix those with a quote to disarm it.
  const safe = /^[=+\-@]/.test(s) ? `'${s}` : s;
  return /[",\n\r]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
}

const row = (...cells: Array<string | number | null | undefined>) =>
  cells.map(cell).join(",");

const money = (n: number) => n.toFixed(2);

export function statementToCsv(s: MonthlyStatement): string {
  const out: string[] = [];
  const blank = () => out.push("");

  out.push(row("BoxDeal — Monthly Statement"));
  out.push(row("Seller", SELLER.name));
  out.push(row("GSTIN", SELLER.gstin));
  out.push(row("Month", s.label));
  out.push(row("Generated", s.generatedAt));
  out.push(row("All amounts in INR. Prices are GST-inclusive."));

  blank();
  out.push(row("ORDER ACTIVITY", "(orders placed this month, and how they ended)"));
  out.push(row("Metric", "Orders"));
  out.push(row("Placed", s.activity.placed));
  out.push(row("Delivered", s.activity.delivered));
  out.push(row("Still in transit", s.activity.inTransit));
  out.push(row("Cancelled", s.activity.cancelled));
  out.push(row("Returned / RTO", s.activity.returned));
  out.push(row("Failed / never paid", s.activity.failed));

  blank();
  out.push(row("MONEY EARNED", "(orders delivered this month)"));
  out.push(row("Metric", "Orders", "Amount"));
  out.push(row("Delivered orders", s.realised.orders, money(s.realised.net)));
  out.push(row("  Product value", "", money(s.realised.gross)));
  out.push(row("  Discounts given", "", `-${money(s.realised.discount)}`));
  out.push(row("  Delivery charges", "", money(s.realised.delivery)));
  out.push(row("COD collected", s.realised.cod.orders, money(s.realised.cod.amount)));
  out.push(row("Prepaid", s.realised.prepaid.orders, money(s.realised.prepaid.amount)));

  blank();
  out.push(row("RETURNS", "(recorded this month)"));
  out.push(row("Type", "Orders", "Value"));
  out.push(row("RTO — never delivered", s.returns.rto.orders, money(s.returns.rto.amount)));
  out.push(row("Customer return", s.returns.customer.orders, money(s.returns.customer.amount)));

  blank();
  out.push(row("TOP PRODUCTS", "(by value, delivered this month)"));
  out.push(row("#", "SKU", "Product", "Qty", "Value"));
  s.topProducts.forEach((p, i) =>
    out.push(row(i + 1, p.sku, p.name, p.qty, money(p.amount)))
  );
  if (s.topProducts.length === 0) out.push(row("", "No deliveries this month"));

  blank();
  out.push(row("GST SUMMARY", "(invoices raised this month)"));
  out.push(row("Metric", "Amount"));
  out.push(row("Invoices raised", s.gst.invoices.length));
  out.push(row("Taxable value", money(s.gst.totals.taxable)));
  out.push(row("CGST", money(s.gst.totals.cgst)));
  out.push(row("SGST", money(s.gst.totals.sgst)));
  out.push(row("IGST", money(s.gst.totals.igst)));
  out.push(row("Total GST", money(s.gst.totals.tax)));
  out.push(row("Invoice value (incl. GST)", money(s.gst.totals.net)));

  blank();
  out.push(row("INVOICE REGISTER"));
  out.push(row("Invoice No", "Invoice Date", "Order No", "State", "State Code",
    "Payment", "Taxable", "CGST", "SGST", "IGST", "Invoice Total"));
  for (const i of s.gst.invoices) {
    out.push(row(i.invoiceNumber, i.invoiceDate, i.orderNumber, i.state, i.stateCode,
      i.paymentMethod, money(i.taxable), money(i.cgst), money(i.sgst), money(i.igst), money(i.total)));
  }
  if (s.gst.invoices.length === 0) out.push(row("No invoices raised this month"));

  blank();
  out.push(row("HSN SUMMARY", "(GSTR-1 Table 12 — product lines only, delivery excluded)"));
  out.push(row("HSN", "Qty", "Taxable", "CGST", "SGST", "IGST", "Total"));
  for (const h of s.gst.hsn) {
    out.push(row(h.hsn, h.qty, money(h.taxable), money(h.cgst), money(h.sgst), money(h.igst), money(h.net)));
  }

  blank();
  out.push(row("STATE-WISE SUMMARY", "(GSTR-1 Table 7 — B2C, by place of supply)"));
  out.push(row("State", "State Code", "Invoices", "Taxable", "CGST", "SGST", "IGST", "Total"));
  for (const st of s.gst.states) {
    out.push(row(st.state, st.stateCode, st.invoices, money(st.taxable),
      money(st.cgst), money(st.sgst), money(st.igst), money(st.net)));
  }

  // A BOM so Excel on Windows opens the file as UTF-8 rather than mangling it.
  return "﻿" + out.join("\r\n") + "\r\n";
}
