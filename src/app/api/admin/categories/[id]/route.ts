import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/supabase/admin-guard";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await requireAdmin();
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const b = await req.json();
  const fields: Record<string, unknown> = {};
  if (typeof b.name === "string") fields.name = b.name.trim();
  if ("description" in b) fields.description = b.description?.trim() || null;
  if ("image_url" in b) fields.image_url = b.image_url || null;
  if ("sort_order" in b) fields.sort_order = Number(b.sort_order) || 0;
  if ("is_active" in b) fields.is_active = b.is_active;
  fields.updated_at = new Date().toISOString();

  const admin = getSupabaseAdminClient();
  const { error } = await admin.from("categories").update(fields).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ data: { success: true } });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await requireAdmin();
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const admin = getSupabaseAdminClient();
  const { error } = await admin.from("categories").delete().eq("id", id);
  if (error) {
    const msg = error.code === "23503"
      ? "This category has products or subcategories — remove those first."
      : error.message;
    return NextResponse.json({ error: msg }, { status: 400 });
  }
  return NextResponse.json({ data: { success: true } });
}
