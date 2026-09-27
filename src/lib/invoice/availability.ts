import type { OrderStatus } from "@/types";

/**
 * Who can pull an invoice, and when.
 *
 * Kept free of server imports so both the API route and the client-side
 * download buttons can share one definition — the button must never offer a
 * download the route would refuse.
 */

/**
 * Customers get the invoice once the order is actually delivered. Issuing it
 * earlier risks handing out a tax document for an order that gets cancelled or
 * comes back RTO. A "returned" order still gets one, because a return means it
 * was delivered first and the invoice was already issued.
 */
export function canCustomerInvoice(status: OrderStatus): boolean {
  return status === "delivered" || status === "returned";
}

/**
 * Admins get it from the moment the parcel is packed — that's when the printed
 * copy goes into the box, which is also the point of supply for GST.
 */
export function canAdminInvoice(status: OrderStatus): boolean {
  return (
    status === "packed" ||
    status === "shipped" ||
    status === "out_for_delivery" ||
    status === "delivered" ||
    status === "returned"
  );
}

/** Downloaded file name, e.g. "INV00001.pdf". */
export function invoiceFileName(invoiceNumber: string): string {
  return `${invoiceNumber.replace(/[^A-Za-z0-9._-]/g, "")}.pdf`;
}
