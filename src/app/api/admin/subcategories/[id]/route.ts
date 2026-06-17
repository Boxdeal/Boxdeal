import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/supabase/admin-guard";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await requireAdmin();
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const admin = getSupabaseAdminClient();
  const { error } = await admin.from("subcategories").delete().eq("id", id);
  if (error) {
    const msg = error.code === "23503"
      ? "This subcategory has products — reassign or remove them first."
      : error.message;
    return NextResponse.json({ error: msg }, { status: 400 });
  }
  return NextResponse.json({ data: { success: true } });
}
