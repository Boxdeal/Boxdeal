import { formatDistanceToNow } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import { enIN } from "date-fns/locale";

// All order/date display is pinned to IST so timestamps render correctly
// regardless of server timezone (production runs in UTC).
const IST = "Asia/Kolkata";

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  return formatInTimeZone(new Date(date), IST, "dd MMM yyyy", { locale: enIN });
}

export function formatDateTime(date: string | Date): string {
  return formatInTimeZone(new Date(date), IST, "dd MMM yyyy, hh:mm a", { locale: enIN });
}

export function formatRelativeTime(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: enIN });
}

export function formatCompactNumber(n: number): string {
  if (n >= 10_000_000) return `${(n / 10_000_000).toFixed(1)}Cr`;
  if (n >= 100_000)    return `${(n / 100_000).toFixed(1)}L`;
  if (n >= 1_000)      return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export function formatDiscount(percent: number): string {
  return `${Math.round(percent)}% off`;
}
