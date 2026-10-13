import type { SupabaseClient } from "@supabase/supabase-js";

// Homepage merchandising sections. `position` is the admin-chosen order
// (1 = first); products without one fall back to the section's default sort.
export const MERCH = {
  is_featured:    { position: "featured_position", fallback: "sold_count" },
  is_deal_of_day: { position: "deal_position",     fallback: "created_at" },
} as const;

export type MerchFlag = keyof typeof MERCH;

export async function fetchMerchProducts<T>(
  supabase: SupabaseClient,
  flag: MerchFlag,
  select: string,
  opts: { activeOnly?: boolean; limit?: number } = {}
) {
  const run = (manual: boolean) => {
    let q = supabase.from("products").select(select).eq(flag, true);
    if (opts.activeOnly) q = q.eq("is_active", true);
    if (manual) q = q.order(MERCH[flag].position, { ascending: true, nullsFirst: false });
    q = q.order(MERCH[flag].fallback, { ascending: false });
    if (opts.limit) q = q.limit(opts.limit);
    return q;
  };

  // The position columns come from FEATURED_ORDER_RUN_IN_SUPABASE.sql; until
  // that has been run, keep serving the default ordering instead of nothing.
  let res = await run(true);
  if (res.error) res = await run(false);
  return { data: res.data as T[] | null, error: res.error };
}
