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

  const admin = getSupabaseAdminClient();

  // COD quote: if admin has turned COD off for any product in the cart, COD is
  // unavailable regardless of pincode — tell checkout which products cause it.
  if (cod) {
    const { data: blocked } = await admin
      .from("products")
      .select("name")
      .in("id", items.map((i) => i.product_id))
      .eq("cod_available", false);
    if (blocked?.length) {
      return NextResponse.json({
        data: { serviceable: false, cod_blocked: blocked.map((p) => p.name as string) },
      });
    }
  }

  try {
    // The client's coupon discount only trims the order value used for the
    // COD/coverage part of this display quote — order creation recomputes
    // everything server-side.
    const quote = await getCartDeliveryQuote(admin, items, pincode, cod ?? false, { discount });
    return NextResponse.json({ data: quote });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not fetch delivery rate" },
      { status: 502 }
    );
  }
}
