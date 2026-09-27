import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient, getSupabaseAdminClient } from "@/lib/supabase/server";
import { computeInvoice } from "@/lib/invoice/gst";
import { renderInvoicePdf, type InvoiceBuyer, type InvoiceMeta } from "@/lib/invoice/pdf";
import {
  canAdminInvoice,
  canCustomerInvoice,
  invoiceFileName,
} from "@/lib/invoice/availability";
import { formatInvoiceDate } from "@/lib/invoice/format";
import type { OrderStatus } from "@/types";

// PDF generation needs the Node runtime (the renderer is not edge-compatible),
// and the response must never be cached: the invoice number is minted on the
// first successful request.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface InvoiceItemRow {
  product_name: string;
  product_sku: string | null;
  quantity: number;
  selling_price: number;
  hsn_code: string | null;
  product: { hsn_code: string | null } | { hsn_code: string | null }[] | null;
}

/** HSN snapshotted on the order item, falling back to the product's current one. */
function itemHsn(item: InvoiceItemRow): string | null {
  if (item.hsn_code?.trim()) return item.hsn_code.trim();
  // PostgREST returns an embedded to-one relation as an object, but older
  // generated types can widen it to an array — handle both shapes.
  const product = Array.isArray(item.product) ? item.product[0] : item.product;
  return product?.hsn_code?.trim() || null;
}

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
    .select(`
      id, order_number, user_id, status, placed_at,
      shipping_full_name, shipping_address1, shipping_address2,
      shipping_city, shipping_state, shipping_pincode,
      discount_amount, admin_discount, shipping_charge,
      payment_method, courier_name, tracking_number, notes,
      items:order_items(
        product_name, product_sku, quantity, selling_price, hsn_code,
        product:products(hsn_code)
      )
    `)
    .eq("id", id)
    .single();

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

  const status = order.status as OrderStatus;
  const allowed = isAdmin ? canAdminInvoice(status) : canCustomerInvoice(status);
  if (!allowed) {
    return NextResponse.json(
      {
        error: isAdmin
          ? "The invoice is issued once the order is packed for dispatch."
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

  const items = (order.items ?? []) as InvoiceItemRow[];
  if (items.length === 0) {
    return NextResponse.json({ error: "This order has no items to invoice" }, { status: 409 });
  }

  const calc = computeInvoice({
    items: items.map((i) => ({
      product_name: i.product_name,
      product_sku: i.product_sku ?? "",
      hsn_code: itemHsn(i),
      quantity: i.quantity,
      selling_price: Number(i.selling_price),
    })),
    discountAmount: Number(order.discount_amount ?? 0),
    adminDiscount: Number(order.admin_discount ?? 0),
    shippingCharge: Number(order.shipping_charge ?? 0),
    buyerState: order.shipping_state ?? "",
  });

  const buyer: InvoiceBuyer = {
    name: order.shipping_full_name,
    address1: order.shipping_address1,
    address2: order.shipping_address2,
    city: order.shipping_city,
    state: order.shipping_state,
    pincode: order.shipping_pincode,
  };

  const meta: InvoiceMeta = {
    invoiceNumber: issued.out_number,
    invoiceDate: formatInvoiceDate(issued.out_date),
    orderNumber: order.order_number,
    orderDate: formatInvoiceDate(order.placed_at),
    channel: "BOXDEAL",
    shippedBy: order.courier_name,
    awb: order.tracking_number,
    paymentMethod: order.payment_method === "cod" ? "cod" : "prepaid",
    remark: order.notes,
  };

  const pdf = await renderInvoicePdf({ calc, buyer, meta });

  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${invoiceFileName(issued.out_number)}"`,
      "Content-Length": String(pdf.length),
      "Cache-Control": "no-store",
    },
  });
}
