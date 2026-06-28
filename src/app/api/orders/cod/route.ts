import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient, getSupabaseAdminClient } from "@/lib/supabase/server";
import { getCartDeliveryQuote } from "@/lib/shipping/index";
import { sendOrderConfirmation } from "@/lib/resend/index";
import type { CartItem, Address } from "@/types";

/**
 * Place a Cash-on-Delivery order.
 *
 * Unlike the online flow (create → Razorpay → verify), COD has no payment step,
 * so this single endpoint both creates AND confirms the order: stock is taken
 * and the coupon is consumed right here (there is no later verify step to gate
 * them on). The customer pays the courier on delivery, so the order is left
 * `payment_status: "pending"` but `status: "confirmed"`.
 */
export async function POST(req: NextRequest) {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });

  const body = await req.json();
  const {
    items,
    address,
    coupon_code,
    subtotal,
    discount,
  }: {
    items:       CartItem[];
    address:     Address;
    coupon_code: string | null;
    subtotal:    number;
    discount:    number;
  } = body;

  if (!items?.length) return NextResponse.json({ error: "Cart is empty" }, { status: 400 });

  const admin = getSupabaseAdminClient();

  // Fetch product details + live stock for all items in one query
  const itemProductIds = items.map(i => i.product_id);
  const { data: products } = await admin
    .from("products")
    .select("id, name, sku, stock_quantity, product_images(image_url, is_primary)")
    .in("id", itemProductIds);

  const productMap = new Map(products?.map(p => [p.id, p]) ?? []);

  // Validate stock availability before placing the order.
  for (const item of items) {
    const product = productMap.get(item.product_id);
    if (!product) {
      return NextResponse.json({ error: "A product in your cart is no longer available" }, { status: 400 });
    }
    if (product.stock_quantity < item.quantity) {
      return NextResponse.json(
        { error: `Only ${product.stock_quantity} left of "${product.name}"` },
        { status: 409 }
      );
    }
  }

  // Recompute the COD delivery charge server-side (cod = true). A pincode with no
  // COD courier blocks the order — the customer should use online payment instead.
  let shipping_charge: number;
  try {
    const quote = await getCartDeliveryQuote(admin, items, address.pincode, true);
    if (!quote.serviceable) {
      return NextResponse.json(
        { error: "Cash on Delivery isn't available for this pincode. Please use online payment." },
        { status: 422 }
      );
    }
    shipping_charge = quote.delivery_charge;
  } catch {
    return NextResponse.json(
      { error: "Couldn't calculate delivery charge. Please try again." },
      { status: 502 }
    );
  }

  // Total is derived server-side so a tampered client value can't change it.
  const total_amount = subtotal - discount + shipping_charge;

  // Generate order number (DB sequence preferred, JS fallback for NOT NULL safety).
  const { data: rpcOrderNum } = await admin.rpc("generate_order_number");
  const orderNum: string =
    rpcOrderNum ??
    `BD${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Date.now().toString().slice(-6)}`;

  // Create the order already confirmed — COD has no payment to wait on.
  const { data: dbOrder, error } = await admin
    .from("orders")
    .insert({
      order_number:        orderNum,
      user_id:             user.id,
      shipping_full_name:  address.full_name,
      shipping_phone:      address.phone,
      shipping_address1:   address.address_line1,
      shipping_address2:   address.address_line2 ?? null,
      shipping_city:       address.city,
      shipping_state:      address.state,
      shipping_pincode:    address.pincode,
      subtotal,
      discount_amount:     discount,
      shipping_charge,
      total_amount,
      coupon_code:         coupon_code ?? null,
      payment_method:      "cod",
      payment_status:      "pending",
      status:              "confirmed",
      placed_at:           new Date().toISOString(),
      confirmed_at:        new Date().toISOString(),
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Build order items
  const orderItemsToInsert = items.map(item => {
    const product = productMap.get(item.product_id);
    const imgs = (product?.product_images as Array<{ image_url: string; is_primary: boolean }>) ?? [];
    const img = imgs.find((i) => i.is_primary) ?? imgs[0];

    return {
      order_id:      dbOrder.id,
      product_id:    item.product_id,
      product_name:  product?.name ?? item.name,
      product_image: img?.image_url ?? null,
      product_sku:   product?.sku ?? "",
      quantity:      item.quantity,
      mrp:           item.mrp,
      selling_price: item.selling_price,
    };
  });

  await Promise.all([
    orderItemsToInsert.length > 0
      ? admin.from("order_items").insert(orderItemsToInsert)
      : Promise.resolve(),
    admin.from("order_status_history").insert({
      order_id: dbOrder.id,
      status:   "confirmed",
      note:     "COD order placed",
    }),
  ]);

  // Decrement stock now — there is no later verify step for COD. Best-effort:
  // don't fail the placed order on a stock hiccup, log for reconciliation.
  const stockResults = await Promise.allSettled(
    items.map(item =>
      admin.rpc("decrement_stock", {
        p_product_id: item.product_id,
        p_quantity:   item.quantity,
      })
    )
  );
  stockResults.forEach((r, i) => {
    if (r.status === "rejected") {
      console.error(`Stock decrement failed for ${items[i].product_id} on COD order ${dbOrder.id}:`, r.reason);
    }
  });

  // Consume the coupon now.
  if (coupon_code) {
    const couponCode = String(coupon_code).toUpperCase();
    const { data: coupon } = await admin
      .from("coupons")
      .select("id, used_count, usage_limit")
      .eq("code", couponCode)
      .single();

    if (coupon && (coupon.usage_limit == null || coupon.used_count < coupon.usage_limit)) {
      await admin
        .from("coupons")
        .update({ used_count: coupon.used_count + 1 })
        .eq("code", couponCode);
    }
  }

  // Send confirmation email (best-effort).
  const { data: authUser } = await admin.auth.admin.getUserById(user.id);
  const email = authUser?.user?.email;
  if (email) {
    // Re-load with items so the email renders name/price, not just id/qty.
    const { data: fullOrder } = await admin
      .from("orders")
      .select("*, items:order_items(*)")
      .eq("id", dbOrder.id)
      .single();
    if (fullOrder) await sendOrderConfirmation(fullOrder as never, email).catch(console.error);
  }

  return NextResponse.json({
    data: {
      db_order_id:  dbOrder.id,
      order_number: orderNum,
    },
  });
}
