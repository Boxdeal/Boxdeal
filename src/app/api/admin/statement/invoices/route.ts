import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/supabase/admin-guard";
import { getMonthRange } from "@/lib/statement/monthly";
import { REVENUE_STATUSES } from "@/lib/admin/order-buckets";
import { renderInvoiceBundlePdf } from "@/lib/invoice/pdf";
import { buildInvoiceInput, INVOICE_ORDER_SELECT, type InvoiceOrderRow } from "@/lib/invoice/build";

/**
 * Every invoice of a month in one PDF, one per page.
 *
 *   kind=issued  — the invoices dated this month: exactly the statement's
 *                  invoice register, in number order.
 *   kind=pending — online orders paid this month but not delivered yet, so not
 *                  invoiced. Printed as DRAFTS with no number: the real number
 *                  is issued on delivery, and minting one here would leave an
 *                  invoice behind if the parcel is then cancelled or RTO'd.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin();
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const month = req.nextUrl.searchParams.get("month") ?? "";
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) {
    return NextResponse.json({ error: "Pass a month as YYYY-MM, e.g. ?month=2026-09" }, { status: 400 });
  }
  const kind = req.nextUrl.searchParams.get("kind");
  if (kind !== "issued" && kind !== "pending") {
    return NextResponse.json({ error: "Pass kind=issued or kind=pending" }, { status: 400 });
  }

  const range = getMonthRange(month);
  const from = range.start.toISOString();
  const to = range.end.toISOString();
  const admin = getSupabaseAdminClient();

  const { data, error } = kind === "issued"
    ? await admin.from("orders").select(INVOICE_ORDER_SELECT)
        .not("invoice_number", "is", null)
        .gte("invoice_date", from).lt("invoice_date", to)
        .order("invoice_number", { ascending: true })
        .limit(10000)
    : await admin.from("orders").select(INVOICE_ORDER_SELECT)
        .neq("payment_method", "cod").in("status", REVENUE_STATUSES).eq("payment_status", "paid")
        .is("invoice_number", null)
        .gte("placed_at", from).lt("placed_at", to)
        .order("placed_at", { ascending: true })
        .limit(10000);

  if (error) return NextResponse.json({ error: "Could not load the invoices." }, { status: 500 });

  const orders = ((data ?? []) as unknown as InvoiceOrderRow[]).filter((o) => (o.items ?? []).length > 0);
  if (orders.length === 0) {
    return NextResponse.json(
      { error: kind === "issued" ? `No invoices in ${range.label}.` : `No pending invoices for ${range.label}.` },
      { status: 404 },
    );
  }

  const inputs = orders.map((o) =>
    kind === "issued" && o.invoice_number && o.invoice_date
      ? buildInvoiceInput(o, { number: o.invoice_number, date: o.invoice_date })
      : buildInvoiceInput(o),
  );

  const title = kind === "issued"
    ? `BoxDeal Invoices ${range.label}`
    : `BoxDeal Draft Invoices ${range.label}`;
  const pdf = await renderInvoiceBundlePdf(inputs, title);
  const fileName = kind === "issued"
    ? `BoxDeal-Invoices-${month}.pdf`
    : `BoxDeal-Draft-Invoices-${month}.pdf`;

  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Content-Length": String(pdf.length),
      "Cache-Control": "no-store",
    },
  });
}
