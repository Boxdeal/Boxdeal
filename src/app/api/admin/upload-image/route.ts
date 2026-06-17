import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/supabase/admin-guard";
import { processProductImage } from "@/lib/image/optimize";

// Generic admin image upload for non-product entities (categories, subcategories,
// brands…). Stores a single optimised webp under <folder>/ in the public bucket.
export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const rawFolder = (formData.get("folder") as string) || "misc";
  const folder = rawFolder.replace(/[^a-z0-9_-]/gi, "") || "misc";

  if (!file) return NextResponse.json({ error: "File is required" }, { status: 400 });

  const buffer = Buffer.from(await file.arrayBuffer());
  const { buffer: mainBuffer } = await processProductImage(buffer);

  const path = `${folder}/${Date.now()}.webp`;
  const admin = getSupabaseAdminClient();

  const { error } = await admin.storage.from("product-images").upload(path, mainBuffer, {
    contentType: "image/webp",
    upsert: true,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: { publicUrl } } = admin.storage.from("product-images").getPublicUrl(path);
  return NextResponse.json({ data: { url: publicUrl } });
}
