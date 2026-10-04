import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient, getSupabaseAdminClient } from "@/lib/supabase/server";
import { renderInvoicePdf } from "@/lib/invoice/pdf";
import { buildInvoiceInput, INVOICE_ORDER_SELECT, type InvoiceOrderRow } from "@/lib/invoice/build";
import { canInvoice, invoiceFileName } from "@/lib/invoice/availability";
import type { OrderStatus } from "@/types";

// PDF generation needs the Node runtime (the renderer is not edge-compatible),
// and the response must never be cached: the invoice number is minted on the
// first successful request.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = getSupabaseAdminClient();

  const { data: order } = await admin
    .from("orders")
    .select(INVOICE_ORDER_SELECT)
    .eq("id", id)
    .single<InvoiceOrderRow>();

  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  // An admin may pull any order's invoice; everyone else only their own.
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();
  const isAdmin = Boolean(profile?.is_admin);

  if (!isAdmin && order.user_id !== user.id) {
    // Don't confirm the order exists to someone who doesn't own it.
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  if (!canInvoice(order.status as OrderStatus)) {
    return NextResponse.json(
      {
        error: isAdmin
          ? "The invoice is issued once the order is delivered."
          : "Your invoice will be available once the order is delivered.",
      },
      { status: 409 }
    );
  }

  // Mint the invoice number on first access and reuse it forever after. A GST
  // invoice number must be stable, so this is the one thing we persist.
  const { data: issued, error: issueError } = await admin
    .rpc("issue_invoice_number", { p_order_id: id })
    .single<{ out_number: string; out_date: string }>();

  if (issueError || !issued?.out_number) {
    return NextResponse.json(
      { error: "Could not issue an invoice number. Please try again." },
      { status: 500 }
    );
  }

  if ((order.items ?? []).length === 0) {
    return NextResponse.json({ error: "This order has no items to invoice" }, { status: 409 });
  }

  const input = buildInvoiceInput(order, { number: issued.out_number, date: issued.out_date });
  const pdf = await renderInvoicePdf(input);

  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${invoiceFileName(issued.out_number)}"`,
      "Content-Length": String(pdf.length),
      "Cache-Control": "no-store",
    },
  });
}
