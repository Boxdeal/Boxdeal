import { formatInTimeZone } from "date-fns-tz";

// Invoices are dated in IST regardless of where the server runs, and use the
// DD/MM/YYYY form that Indian tax documents are read in.
const IST = "Asia/Kolkata";

export function formatInvoiceDate(date: string | Date): string {
  return formatInTimeZone(new Date(date), IST, "dd/MM/yyyy");
}
