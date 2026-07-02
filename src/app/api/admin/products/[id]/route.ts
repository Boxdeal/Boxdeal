import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient, getSupabaseAdminClient } from "@/lib/supabase/server";

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

interface ImageInput {
  image_url: string;
  thumbnail_url: string | null;
}

interface SpecInput {
  spec_group: string;
  spec_name: string;
  spec_value: string;
}

// PATCH: update product fields and (optionally) replace its image set.
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await requireAdmin();
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const b = await req.json();
  const admin = getSupabaseAdminClient();

  // Build the update payload only from fields that were sent.
  const fields: Record<string, unknown> = {};
  const passthrough = [
    "name", "sku", "description", "short_description", "category_id",
    "subcategory_id", "brand_id", "stock_quantity", "low_stock_threshold",
    "weight_grams", "length_cm", "breadth_cm", "height_cm",
    "is_active", "is_featured", "is_deal_of_day",
    "meta_title", "meta_description",
  ];
  for (const k of passthrough) {
    if (k in b) fields[k] = b[k] === "" ? null : b[k];
  }
  if (b.mrp != null && b.selling_price != null) {
    const mrp = Number(b.mrp);
    const selling = Number(b.selling_price);
    if (selling > mrp) {
      return NextResponse.json({ error: "Selling price cannot be more than MRP" }, { status: 400 });
    }
    fields.mrp = mrp;
    fields.selling_price = selling;
    fields.discount_percent = mrp > 0 ? Math.round(((mrp - selling) / mrp) * 100) : 0;
  }
  fields.updated_at = new Date().toISOString();

  if (Object.keys(fields).length > 0) {
    const { error } = await admin.from("products").update(fields).eq("id", id);
    if (error) {
      const msg = error.code === "23505" && error.message.includes("sku")
        ? "A product with this SKU already exists"
        : error.message;
      return NextResponse.json({ error: msg }, { status: 400 });
    }
  }

  // If an images array was provided, replace the product's images entirely.
  if (Array.isArray(b.images)) {
    await admin.from("product_images").delete().eq("product_id", id);
    const rows = (b.images as ImageInput[]).map((img, i) => ({
      product_id:    id,
      image_url:     img.image_url,
      thumbnail_url: img.thumbnail_url ?? img.image_url,
      is_primary:    i === 0,
      sort_order:    i,
    }));
    if (rows.length > 0) {
      const { error } = await admin.from("product_images").insert(rows);
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    }
  }

  // If a specs array was provided, replace the product's specifications entirely.
  if (Array.isArray(b.specs)) {
    await admin.from("product_specifications").delete().eq("product_id", id);
    const rows = (b.specs as SpecInput[])
      .filter((s) => s.spec_name && s.spec_value)
      .map((s, i) => ({
        product_id: id,
        spec_group: s.spec_group || "General",
        spec_name:  s.spec_name,
        spec_value: s.spec_value,
        sort_order: i,
      }));
    if (rows.length > 0) {
      const { error } = await admin.from("product_specifications").insert(rows);
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    }
  }

  return NextResponse.json({ data: { success: true } });
}

// DELETE: remove a product. Blocked by FK if it already appears in orders.
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await requireAdmin();
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const admin = getSupabaseAdminClient();
  await admin.from("product_images").delete().eq("product_id", id);
  const { error } = await admin.from("products").delete().eq("id", id);

  if (error) {
    const msg = error.code === "23503"
      ? "This product is part of existing orders — hide it instead of deleting."
      : error.message;
    return NextResponse.json({ error: msg }, { status: 400 });
  }
  return NextResponse.json({ data: { success: true } });
}
