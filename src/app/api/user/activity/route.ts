import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient, getSupabaseAdminClient } from "@/lib/supabase/server";
import type { CartItem } from "@/types";

// The customer's account cart and wishlist — one copy shared by every device.
//   GET  → the saved cart (with today's product data) and wishlist ids
//   POST → replace the saved cart and/or wishlist with what the device sends
// The browser keeps a working copy; CustomerActivitySync keeps the two in step.

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_CART_ITEMS = 50;
const MAX_WISHLIST_IDS = 200;

interface StoredCartItem {
  product_id: string;
  quantity: number;
  price: number;
  name: string;
}

interface ProductRow {
  id: string;
  name: string;
  slug: string;
  mrp: number;
  selling_price: number;
  stock_quantity: number;
  is_active: boolean;
  product_images: { image_url: string; thumbnail_url: string | null; is_primary: boolean | null; sort_order: number | null }[] | null;
}

async function currentUser() {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

function cleanCart(raw: unknown): StoredCartItem[] | null {
  if (!Array.isArray(raw)) return null;
  const out: StoredCartItem[] = [];
  const seen = new Set<string>();
  for (const r of raw.slice(0, MAX_CART_ITEMS)) {
    if (!r || typeof r !== "object") continue;
    const i = r as Record<string, unknown>;
    const quantity = Number(i.quantity);
    const price = Number(i.price);
    if (typeof i.product_id !== "string" || !UUID.test(i.product_id)) continue;
    if (seen.has(i.product_id)) continue;
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 999) continue;
    seen.add(i.product_id);
    out.push({
      product_id: i.product_id,
      quantity,
      price: Number.isFinite(price) && price >= 0 ? price : 0,
      name: typeof i.name === "string" ? i.name.slice(0, 200) : "",
    });
  }
  return out;
}

function cleanIds(raw: unknown): string[] | null {
  if (!Array.isArray(raw)) return null;
  return [...new Set(raw.filter((x): x is string => typeof x === "string" && UUID.test(x)))]
    .slice(0, MAX_WISHLIST_IDS);
}

function thumbnail(p: ProductRow): string | null {
  const imgs = [...(p.product_images ?? [])].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
  const img = imgs.find((i) => i.is_primary) ?? imgs[0];
  return img ? img.thumbnail_url ?? img.image_url : null;
}

export async function GET() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const admin = getSupabaseAdminClient();
  const [{ data: cartRow }, { data: wishRows }] = await Promise.all([
    admin.from("user_carts").select("items, updated_at").eq("user_id", user.id).maybeSingle(),
    admin.from("wishlists").select("product_id").eq("user_id", user.id).order("created_at"),
  ]);

  const stored = (cartRow?.items ?? []) as StoredCartItem[];
  const wishIds = (wishRows ?? []).map((w) => w.product_id as string);

  // Fresh product data, so every device shows today's name, price and stock.
  const ids = [...new Set([...stored.map((i) => i.product_id), ...wishIds])];
  const products = new Map<string, ProductRow>();
  if (ids.length) {
    const { data } = await admin
      .from("products")
      .select("id, name, slug, mrp, selling_price, stock_quantity, is_active, product_images(image_url, thumbnail_url, is_primary, sort_order)")
      .in("id", ids);
    for (const p of (data ?? []) as ProductRow[]) products.set(p.id, p);
  }

  // Deleted or hidden products drop out of the cart and wishlist.
  const cart: CartItem[] = [];
  for (const i of stored) {
    const p = products.get(i.product_id);
    if (!p || !p.is_active) continue;
    cart.push({
      product_id:     p.id,
      name:           p.name,
      slug:           p.slug,
      image:          thumbnail(p),
      mrp:            Number(p.mrp),
      selling_price:  Number(p.selling_price),
      quantity:       i.quantity,
      stock_quantity: p.stock_quantity,
    });
  }
  const wishlist = wishIds.filter((id) => products.get(id)?.is_active);

  return NextResponse.json({ cart, wishlist, saved: !!cartRow });
}

export async function POST(request: NextRequest) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid body" }, { status: 400 });
  }

  const admin = getSupabaseAdminClient();
  let failed = false;

  if ("cart" in body) {
    const items = cleanCart(body.cart);
    if (items) {
      const { error } = await admin
        .from("user_carts")
        .upsert({ user_id: user.id, items, updated_at: new Date().toISOString() });
      if (error) { failed = true; console.error("[activity] cart save failed", error.message); }
    }
  }

  const wanted = cleanIds(body.wishlist);
  if (wanted) {
    // Only real products — one stale id would fail the whole insert (FK).
    const { data: existing } = wanted.length
      ? await admin.from("products").select("id").in("id", wanted)
      : { data: [] as { id: string }[] };
    const keep = (existing ?? []).map((p) => p.id);

    let del = admin.from("wishlists").delete().eq("user_id", user.id);
    if (keep.length) del = del.not("product_id", "in", `(${keep.join(",")})`);
    const { error: delError } = await del;
    if (delError) { failed = true; console.error("[activity] wishlist remove failed", delError.message); }

    if (keep.length) {
      const { error } = await admin
        .from("wishlists")
        .upsert(keep.map((product_id) => ({ user_id: user.id, product_id })),
          { onConflict: "user_id,product_id", ignoreDuplicates: true });
      if (error) { failed = true; console.error("[activity] wishlist add failed", error.message); }
    }
  }

  return NextResponse.json({ ok: !failed }, { status: failed ? 500 : 200 });
}
