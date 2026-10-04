import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient, getSupabaseAdminClient } from "@/lib/supabase/server";
import { getCartDeliveryQuote } from "@/lib/shipping/index";
import type { CartItem } from "@/types";

/**
 * Returns the live delivery charge for the given cart + destination pincode.
 * Called from the checkout page once an address is selected so the customer
 * sees the real (capped) charge before paying. The charge is recomputed
 * server-side again at order creation — this endpoint is for display only.
 */
export async function POST(req: NextRequest) {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });

  const { pincode, items, cod, discount }: { pincode: string; items: CartItem[]; cod?: boolean; discount?: number } = await req.json();

  if (!/^\d{6}$/.test(pincode ?? "")) {
    return NextResponse.json({ error: "Invalid pincode" }, { status: 400 });
  }
  if (!items?.length) {
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
  }

  try {
    // Order value (drives COD charge + coverage) is summed from DB prices; the
    // client's coupon discount is applied for display only — order creation
    // recomputes everything server-side.
    const admin = getSupabaseAdminClient();
    const { data: products } = await admin
      .from("products")
      .select("id, selling_price")
      .in("id", items.map((i) => i.product_id));
    const priceMap = new Map((products ?? []).map((p) => [p.id as string, Number(p.selling_price) || 0]));
    const goods = items.reduce((s, i) => s + (priceMap.get(i.product_id) ?? 0) * i.quantity, 0);
    const goodsValue = Math.max(0, goods - Math.max(0, Number(discount) || 0));

    const quote = await getCartDeliveryQuote(admin, items, pincode, cod ?? false, goodsValue);
    return NextResponse.json({ data: quote });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not fetch delivery rate" },
      { status: 502 }
    );
  }
}
