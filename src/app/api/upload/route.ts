import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import { processProductImage, getStoragePath } from "@/lib/image/optimize";

export async function POST(req: NextRequest) {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();
  if (!profile?.is_admin)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const formData = await req.formData();
  const file      = formData.get("file") as File;
  const productId = formData.get("product_id") as string;

  if (!file || !productId)
    return NextResponse.json({ error: "File and product_id required" }, { status: 400 });

  const buffer = Buffer.from(await file.arrayBuffer());
  const { buffer: mainBuffer, thumbnailBuffer } = await processProductImage(buffer);

  const filename   = `${Date.now()}`;
  const mainPath   = getStoragePath(productId, filename, "main");
  const thumbPath  = getStoragePath(productId, filename, "thumb");

  const admin = getSupabaseAdminClient();

  const [mainUpload, thumbUpload] = await Promise.all([
    admin.storage.from("product-images").upload(mainPath, mainBuffer, {
      contentType: "image/webp",
      upsert: true,
    }),
    admin.storage.from("product-images").upload(thumbPath, thumbnailBuffer, {
      contentType: "image/webp",
      upsert: true,
    }),
  ]);

  if (mainUpload.error)  return NextResponse.json({ error: mainUpload.error.message }, { status: 500 });
  if (thumbUpload.error) return NextResponse.json({ error: thumbUpload.error.message }, { status: 500 });

  const { data: { publicUrl: mainUrl } } = admin.storage
    .from("product-images")
    .getPublicUrl(mainPath);
  const { data: { publicUrl: thumbUrl } } = admin.storage
    .from("product-images")
    .getPublicUrl(thumbPath);

  return NextResponse.json({ data: { url: mainUrl, thumbnail_url: thumbUrl } });
}
