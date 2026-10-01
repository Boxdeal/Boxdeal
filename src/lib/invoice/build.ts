import { computeOrderInvoice, INVOICE_ITEM_SELECT, type InvoiceItemRow } from "./order";
import { formatInvoiceDate } from "./format";
import type { InvoiceInput } from "./pdf";

/**
 * Stored order → everything the invoice PDF needs. Shared by the single
 * invoice download and the monthly bundle so the two can never print an order
 * differently.
 */

/** The `select` an order needs to be printed as an invoice. */
export const INVOICE_ORDER_SELECT = `
  id, order_number, user_id, status, placed_at,
  shipping_full_name, shipping_address1, shipping_address2,
  shipping_city, shipping_state, shipping_pincode,
  discount_amount, admin_discount, shipping_charge,
  payment_method, courier_name, tracking_number, notes,
  invoice_number, invoice_date,
  items:order_items(${INVOICE_ITEM_SELECT})
`;

export interface InvoiceOrderRow {
  id: string;
  order_number: string;
  user_id: string | null;
  status: string;
  placed_at: string;
  shipping_full_name: string;
  shipping_address1: string;
  shipping_address2: string | null;
  shipping_city: string;
  shipping_state: string;
  shipping_pincode: string;
  discount_amount: number | string | null;
  admin_discount: number | string | null;
  shipping_charge: number | string | null;
  payment_method: string;
  courier_name: string | null;
  tracking_number: string | null;
  notes: string | null;
  invoice_number: string | null;
  invoice_date: string | null;
  items: InvoiceItemRow[] | null;
}

/**
 * Build the PDF input for one order. Pass the issued number and date for a
 * real invoice; leave them out for a draft of one not issued yet.
 */
export function buildInvoiceInput(
  order: InvoiceOrderRow,
  issued?: { number: string; date: string },
): InvoiceInput {
  return {
    calc: computeOrderInvoice({ ...order, items: order.items ?? [] }),
    buyer: {
      name: order.shipping_full_name,
      address1: order.shipping_address1,
      address2: order.shipping_address2,
      city: order.shipping_city,
      state: order.shipping_state,
      pincode: order.shipping_pincode,
    },
    meta: {
      invoiceNumber: issued?.number ?? "— (issued on delivery)",
      invoiceDate: issued ? formatInvoiceDate(issued.date) : "—",
      orderNumber: order.order_number,
      orderDate: formatInvoiceDate(order.placed_at),
      channel: "BOXDEAL",
      shippedBy: order.courier_name,
      awb: order.tracking_number,
      paymentMethod: order.payment_method === "cod" ? "cod" : "prepaid",
      remark: order.notes,
    },
    draft: !issued,
  };
}
