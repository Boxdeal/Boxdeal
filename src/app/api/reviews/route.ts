import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });

  const { product_id, order_id, rating, title, body } = await req.json();
  if (!product_id || !rating)
    return NextResponse.json({ error: "product_id and rating required" }, { status: 400 });

  const isVerified = !!order_id;

  const { data, error } = await supabase.from("reviews").upsert(
    {
      product_id,
      user_id:              user.id,
      order_id:             order_id ?? null,
      rating,
      title:                title ?? null,
      body:                 body ?? null,
      is_verified_purchase: isVerified,
      is_approved:          false,
    },
    { onConflict: "product_id,user_id" }
  ).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}
