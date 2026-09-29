import { computeInvoice, type InvoiceComputation } from "./gst";

/**
 * Turning a stored order into invoice figures.
 *
 * Both the invoice PDF and the monthly statement run through here, so the
 * numbers on a customer's invoice and the numbers the statement reports for
 * that same invoice are computed once and can never drift apart.
 */

export interface InvoiceItemRow {
  product_name: string;
  product_sku: string | null;
  quantity: number;
  selling_price: number | string;
  hsn_code: string | null;
  /** Joined product, for the HSN fallback below. */
  product?: { hsn_code: string | null } | { hsn_code: string | null }[] | null;
}

export interface InvoiceableOrder {
  shipping_state: string | null;
  discount_amount: number | string | null;
  admin_discount: number | string | null;
  shipping_charge: number | string | null;
  items?: InvoiceItemRow[] | null;
}

/**
 * The HSN snapshotted onto the order item, falling back to the product's
 * current one for orders placed before the column existed.
 */
export function invoiceItemHsn(item: InvoiceItemRow): string | null {
  if (item.hsn_code?.trim()) return item.hsn_code.trim();
  // PostgREST returns an embedded to-one relation as an object, but older
  // generated types can widen it to an array — handle both shapes.
  const product = Array.isArray(item.product) ? item.product[0] : item.product;
  return product?.hsn_code?.trim() || null;
}

/** The `select` fragment every invoice-figure query needs. Keep callers in sync. */
export const INVOICE_ITEM_SELECT =
  "product_name, product_sku, quantity, selling_price, hsn_code, product:products(hsn_code)";

/** Compute an order's invoice lines, GST split and totals. */
export function computeOrderInvoice(order: InvoiceableOrder): InvoiceComputation {
  return computeInvoice({
    items: (order.items ?? []).map((i) => ({
      product_name: i.product_name,
      product_sku: i.product_sku ?? "",
      hsn_code: invoiceItemHsn(i),
      quantity: i.quantity,
      selling_price: Number(i.selling_price),
    })),
    discountAmount: Number(order.discount_amount ?? 0),
    adminDiscount: Number(order.admin_discount ?? 0),
    shippingCharge: Number(order.shipping_charge ?? 0),
    buyerState: order.shipping_state ?? "",
  });
}
