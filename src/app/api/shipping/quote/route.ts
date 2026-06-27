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

  const { pincode, items }: { pincode: string; items: CartItem[] } = await req.json();

  if (!/^\d{6}$/.test(pincode ?? "")) {
    return NextResponse.json({ error: "Invalid pincode" }, { status: 400 });
  }
  if (!items?.length) {
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
  }

  try {
    const quote = await getCartDeliveryQuote(getSupabaseAdminClient(), items, pincode);
    return NextResponse.json({ data: quote });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not fetch delivery rate" },
      { status: 502 }
    );
  }
}
