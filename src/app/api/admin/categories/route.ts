import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import { requireAdmin, slugify } from "@/lib/supabase/admin-guard";

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const b = await req.json();
  if (!b.name?.trim()) return NextResponse.json({ error: "Name is required" }, { status: 400 });

  const admin = getSupabaseAdminClient();
  const baseSlug = slugify(b.name) || `category-${Date.now().toString(36)}`;
  const payload = {
    name:        b.name.trim(),
    description: b.description?.trim() || null,
    image_url:   b.image_url || null,
    sort_order:  Number(b.sort_order) || 0,
    is_active:   b.is_active ?? true,
  };

  let slug = baseSlug;
  let { data, error } = await admin.from("categories").insert({ ...payload, slug }).select().single();
  if (error?.code === "23505") {
    slug = `${baseSlug}-${Date.now().toString(36).slice(-4)}`;
    ({ data, error } = await admin.from("categories").insert({ ...payload, slug }).select().single());
  }
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ data });
}
