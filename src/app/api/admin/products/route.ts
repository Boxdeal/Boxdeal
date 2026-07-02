import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient, getSupabaseAdminClient } from "@/lib/supabase/server";

// Verify the caller is a logged-in admin.
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

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const b = await req.json();
  if (!b.name || !b.sku || !b.category_id || b.mrp == null || b.selling_price == null) {
    return NextResponse.json(
      { error: "Name, SKU, category, MRP and selling price are required" },
      { status: 400 }
    );
  }

  const mrp = Number(b.mrp);
  const selling = Number(b.selling_price);
  if (selling > mrp) {
    return NextResponse.json({ error: "Selling price cannot be more than MRP" }, { status: 400 });
  }
  const discount_percent = mrp > 0 ? Math.round(((mrp - selling) / mrp) * 100) : 0;

  const payload = {
    name:                b.name,
    sku:                 b.sku,
    description:         b.description || null,
    short_description:   b.short_description || null,
    category_id:         b.category_id,
    subcategory_id:      b.subcategory_id || null,
    brand_id:            b.brand_id || null,
    mrp,
    selling_price:       selling,
    discount_percent,
    stock_quantity:      Number(b.stock_quantity ?? 0),
    low_stock_threshold: Number(b.low_stock_threshold ?? 5),
    weight_grams:        Number(b.weight_grams ?? 0),
    length_cm:           Number(b.length_cm ?? 0),
    breadth_cm:          Number(b.breadth_cm ?? 0),
    height_cm:           Number(b.height_cm ?? 0),
    is_active:           b.is_active ?? true,
    is_featured:         b.is_featured ?? false,
    is_deal_of_day:      b.is_deal_of_day ?? false,
    meta_title:          b.meta_title || null,
    meta_description:    b.meta_description || null,
  };

  const admin = getSupabaseAdminClient();
  const baseSlug = slugify(b.name) || `product-${Date.now().toString(36)}`;

  let slug = baseSlug;
  let { data, error } = await admin.from("products").insert({ ...payload, slug }).select("id").single();

  // Slug already taken → retry once with a short unique suffix.
  if (error?.code === "23505" && error.message.includes("slug")) {
    slug = `${baseSlug}-${Date.now().toString(36).slice(-4)}`;
    ({ data, error } = await admin.from("products").insert({ ...payload, slug }).select("id").single());
  }

  if (error) {
    const msg = error.code === "23505" && error.message.includes("sku")
      ? "A product with this SKU already exists"
      : error.message;
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  return NextResponse.json({ data: { id: data!.id } });
}
