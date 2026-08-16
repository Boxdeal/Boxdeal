import { getSupabaseAdminClient } from "@/lib/supabase/server";

// Free-text search for the admin orders list. One box has to cover everything
// support gets asked about — order number, AWB, courier, customer name/phone/
// email, address, coupon, payment ids, even a product inside the order — so the
// query is turned into a single PostgREST `or=(...)` filter over the orders
// table, plus id lists gathered from the related tables (order_items, profiles,
// auth users) that can't be reached from an `orders` filter directly.

/** Text columns on `orders` worth matching directly. */
const ORDER_TEXT_COLUMNS = [
  "order_number",
  "shipping_full_name",
  "shipping_phone",
  "shipping_address1",
  "shipping_address2",
  "shipping_city",
  "shipping_state",
  "shipping_pincode",
  "tracking_number",
  "courier_name",
  "coupon_code",
  "razorpay_order_id",
  "razorpay_payment_id",
  "shiprocket_order_id",
  "shiprocket_shipment_id",
  "notes",
] as const;

/** Keeps the or-filter from blowing past PostgREST's URL limits. */
const MAX_RELATED_IDS = 300;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * PostgREST splits an `or=(...)` list on commas and treats parentheses as
 * grouping, so those characters can never reach the filter as data. Everything
 * else (spaces, dots, @, hyphens) is safe inside an ilike pattern.
 */
function sanitize(raw: string): string {
  return raw.replace(/[,()*"\\]/g, " ").replace(/\s+/g, " ").trim();
}

/**
 * Builds the `or(...)` filter string for a search term, or null when the term
 * is too short / can't match anything. Runs the related-table lookups itself.
 */
export async function buildOrderSearchFilter(rawQuery: string): Promise<string | null> {
  const q = sanitize(rawQuery);
  if (q.length < 2) return null;

  const admin = getSupabaseAdminClient();
  const pattern = `%${q}%`;
  const clauses = ORDER_TEXT_COLUMNS.map((c) => `${c}.ilike.${pattern}`);

  // A pasted order id from a URL or a Supabase row.
  if (UUID_RE.test(q)) clauses.push(`id.eq.${q}`);

  // Phone numbers get typed with spaces, +91 or a leading 0 — match the bare
  // digits too so "+91 98765 43210" still finds "9876543210".
  const digits = q.replace(/\D/g, "");
  if (digits.length >= 6) {
    const bare = digits.length > 10 ? digits.slice(-10) : digits;
    clauses.push(`shipping_phone.ilike.%${bare}%`, `tracking_number.ilike.%${digits}%`);
  }

  const [itemOrderIds, userIds] = await Promise.all([
    findOrderIdsByProduct(admin, pattern),
    findUserIds(admin, q, pattern),
  ]);

  if (itemOrderIds.length) clauses.push(`id.in.(${itemOrderIds.join(",")})`);
  if (userIds.length) clauses.push(`user_id.in.(${userIds.join(",")})`);

  return clauses.join(",");
}

type Admin = ReturnType<typeof getSupabaseAdminClient>;

/** Orders containing a product whose name or SKU matches. */
async function findOrderIdsByProduct(admin: Admin, pattern: string): Promise<string[]> {
  const { data } = await admin
    .from("order_items")
    .select("order_id")
    .or(`product_name.ilike.${pattern},product_sku.ilike.${pattern}`)
    .limit(MAX_RELATED_IDS * 4);

  return [...new Set((data ?? []).map((r) => r.order_id as string))].slice(0, MAX_RELATED_IDS);
}

/**
 * Customers matching by profile name/phone, or by auth email — the email lives
 * in auth.users, so it only gets fetched when the term actually looks like one.
 */
async function findUserIds(admin: Admin, q: string, pattern: string): Promise<string[]> {
  const ids = new Set<string>();

  const { data: profiles } = await admin
    .from("user_profiles")
    .select("id")
    .or(`full_name.ilike.${pattern},phone.ilike.${pattern}`)
    .limit(MAX_RELATED_IDS);

  for (const p of profiles ?? []) ids.add(p.id as string);

  if (q.includes("@")) {
    const { data } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    const needle = q.toLowerCase();
    for (const u of data?.users ?? []) {
      if (u.email?.toLowerCase().includes(needle)) ids.add(u.id);
    }
  }

  return [...ids].slice(0, MAX_RELATED_IDS);
}
