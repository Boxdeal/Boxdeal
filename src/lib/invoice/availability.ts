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
 * order that gets cancelled or comes back RTO.
 *
 * The test is `delivered_at`, not the status alone: an RTO also ends as
 * "returned", but was never delivered, so it must never get an invoice. A
 * customer return (delivered first, sent back later) keeps its own.
 * `issue_invoice_number` enforces the same rule in the database.
 */
export function canInvoice(order: { status: string; delivered_at: string | null }): boolean {
  return Boolean(order.delivered_at) && (order.status === "delivered" || order.status === "returned");
}

/** Downloaded file name, e.g. "INV00001.pdf". */
export function invoiceFileName(invoiceNumber: string): string {
  return `${invoiceNumber.replace(/[^A-Za-z0-9._-]/g, "")}.pdf`;
}
