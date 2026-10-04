import type { OrderStatus } from "@/types";

/**
 * Who can pull an invoice, and when.
 *
 * Kept free of server imports so both the API route and the client-side
 * download buttons can share one definition — the button must never offer a
 * download the route would refuse.
 */

/**
 * The invoice exists only once the order is actually delivered — for customers
 * and admins alike. Issuing it earlier risks minting a tax document for an
 * order that gets cancelled or comes back RTO. A "returned" order still gets
 * one, because a return means it was delivered first and the invoice was
 * already issued.
 */
export function canInvoice(status: OrderStatus): boolean {
  return status === "delivered" || status === "returned";
}

/** Downloaded file name, e.g. "INV00001.pdf". */
export function invoiceFileName(invoiceNumber: string): string {
  return `${invoiceNumber.replace(/[^A-Za-z0-9._-]/g, "")}.pdf`;
}
