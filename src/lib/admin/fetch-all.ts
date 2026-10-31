import type { SupabaseClient, User } from "@supabase/supabase-js";

// PostgREST returns at most 1000 rows per request, and Supabase auth lists at
// most 1000 users per page. Anything that needs EVERY row (counts, totals,
// lookups) must page through, or it silently stops at 1000.

const PAGE = 1000;

/**
 * Every row of a query, paged past the 1000-row ceiling. `page(from, to)`
 * must return the query with a stable `.order(...)` and `.range(from, to)`.
 */
export async function fetchAllRows<T>(
  page: (from: number, to: number) => PromiseLike<{ data: unknown[] | null; error: { message: string } | null }>
): Promise<T[]> {
  const out: T[] = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await page(from, from + PAGE - 1);
    if (error) throw new Error(error.message);
    const rows = (data ?? []) as T[];
    out.push(...rows);
    if (rows.length < PAGE) break;
  }
  return out;
}

/** Every auth user, across all pages. */
export async function listAllAuthUsers(admin: SupabaseClient): Promise<User[]> {
  const out: User[] = [];
  for (let page = 1; ; page += 1) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: PAGE });
    if (error) throw new Error(error.message);
    const users = data?.users ?? [];
    out.push(...users);
    if (users.length < PAGE) break;
  }
  return out;
}

/**
 * Same as fetchAllRows, but keeps the usual `{ data, error }` shape for code
 * that already handles a query error itself.
 */
export async function fetchAllResult<T>(
  page: (from: number, to: number) => PromiseLike<{ data: unknown[] | null; error: { message: string } | null }>
): Promise<{ data: T[] | null; error: { message: string } | null }> {
  try {
    return { data: await fetchAllRows<T>(page), error: null };
  } catch (e) {
    return { data: null, error: { message: e instanceof Error ? e.message : String(e) } };
  }
}
