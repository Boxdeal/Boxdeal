import { NextResponse } from "next/server";
import { revalidateTag, revalidatePath } from "next/cache";
import { getSupabaseServerClient } from "@/lib/supabase/server";

async function requireAdmin() {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized", status: 401 as const };
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();
  if (!profile?.is_admin) return { error: "Forbidden", status: 403 as const };
  return { ok: true as const };
}

/**
 * Admin-only cache buster. Call this after adding categories, subcategories,
 * brands or products directly via SQL so the catalog filter list (cached for
 * 1 hour under the `catalog-filters` tag in /products) refreshes immediately
 * instead of showing stale filters / dropping a new subcategory from the URL.
 */
export async function POST() {
  const auth = await requireAdmin();
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  revalidateTag("catalog-filters");
  revalidatePath("/products");
  revalidatePath("/");

  return NextResponse.json({ data: { revalidated: true, at: new Date().toISOString() } });
}
