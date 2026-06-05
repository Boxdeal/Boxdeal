import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import { sendOrderShipped, sendOrderDelivered } from "@/lib/resend/index";
import type { OrderStatus } from "@/types";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
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

  const body = await req.json();
  const { status, note, tracking_number, courier_name } = body as {
    status: OrderStatus;
    note?: string;
    tracking_number?: string;
    courier_name?: string;
  };

  const admin = getSupabaseAdminClient();

  const updateData: Record<string, unknown> = { status };
  if (status === "confirmed")        updateData.confirmed_at = new Date().toISOString();
  if (status === "packed")           updateData.packed_at    = new Date().toISOString();
  if (status === "shipped") {
    updateData.shipped_at      = new Date().toISOString();
    updateData.tracking_number = tracking_number ?? null;
    updateData.courier_name    = courier_name    ?? null;
  }
  if (status === "delivered")        updateData.delivered_at = new Date().toISOString();
  if (status === "cancelled")        updateData.cancelled_at = new Date().toISOString();

  const { data: order, error } = await admin
    .from("orders")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await admin.from("order_status_history").insert({
    order_id:   id,
    status,
    note:       note ?? null,
    updated_by: user.id,
  });

  // Send emails
  const { data: authUser } = await admin.auth.admin.getUserById(order.user_id);
  const email = authUser?.user?.email;
  if (email) {
    if (status === "shipped")   await sendOrderShipped(order as never, email).catch(console.error);
    if (status === "delivered") await sendOrderDelivered(order as never, email).catch(console.error);
  }

  return NextResponse.json({ data: order });
}
