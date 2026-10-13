import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSupabaseServerClient, getSupabaseAdminClient } from "@/lib/supabase/server";
import { MERCH, type MerchFlag } from "@/lib/merchandising";

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

// POST: save the homepage order of a section. `ids` is the full list, first = top.
export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const b = await req.json();
  const flag = b.flag as MerchFlag;
  const ids = b.ids as unknown;
  if (!(flag in MERCH) || !Array.isArray(ids) || ids.some((id) => typeof id !== "string")) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const column = MERCH[flag].position;
  const admin = getSupabaseAdminClient();
  const results = await Promise.all(
    (ids as string[]).map((id, i) =>
      admin.from("products").update({ [column]: i + 1 }).eq("id", id)
    )
  );

  const failed = results.find((r) => r.error)?.error;
  if (failed) {
    const missingColumn = failed.code === "42703" || failed.code === "PGRST204";
    return NextResponse.json(
      {
        error: missingColumn
          ? "Ordering is not set up yet — run FEATURED_ORDER_RUN_IN_SUPABASE.sql in Supabase first."
          : failed.message,
      },
      { status: 400 }
    );
  }

  // The homepage is statically cached; rebuild it so the new order shows now.
  revalidatePath("/");
  return NextResponse.json({ data: { success: true } });
}
