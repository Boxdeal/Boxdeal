import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import { createRazorpayOrder } from "@/lib/razorpay/index";
import { getCartDeliveryQuote } from "@/lib/shipping/index";
import { computeOrderPricing } from "@/lib/orders/pricing";
import type { CartItem, Address } from "@/types";

export async function POST(req: NextRequest) {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });

  const body = await req.json();
  const {
    items,
    address,
    coupon_code,
  }: {
    items:       CartItem[];
    address:     Address;
    coupon_code: string | null;
  } = body;

  if (!items?.length) return NextResponse.json({ error: "Cart is empty" }, { status: 400 });

  const admin = getSupabaseAdminClient();

  // Price the cart ENTIRELY server-side: real product prices → subtotal, and
  // the discount is recomputed by re-validating the coupon. The client's
  // subtotal/discount/prices are never trusted (they could be tampered to pay
  // ₹1). This also validates stock availability. Stock itself is only
  // decremented once payment succeeds (see verify route).
  const pricing = await computeOrderPricing(admin, items, coupon_code, user.id);
  if (!pricing.ok) return NextResponse.json({ error: pricing.error }, { status: pricing.status });
  const { subtotal, discount } = pricing;

  // Recompute the delivery charge server-side from the destination pincode +
  // cart weight (live Shiprocket rate, capped at ₹200). Never trust the charge
  // sent by the client. A non-serviceable pincode blocks the order entirely.
  let shipping_charge: number;
  try {
    const quote = await getCartDeliveryQuote(admin, items, address.pincode);
    if (!quote.serviceable) {
      return NextResponse.json(
        { error: "Delivery isn't available to this pincode" },
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

  // Total is derived server-side so a tampered client value can't change what
  // the customer is actually charged.
  const total_amount = subtotal - discount + shipping_charge;

  // Generate order number. Prefer the DB sequence function; if it's missing
  // (returns null / errors), fall back to a unique JS-generated number so the
  // order_number NOT NULL constraint is never violated.
  const { data: rpcOrderNum } = await admin.rpc("generate_order_number");
  const orderNum: string =
    rpcOrderNum ??
    `BD${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Date.now().toString().slice(-6)}`;

  // Create Razorpay order
  const rzpOrder = await createRazorpayOrder(
    Math.round(total_amount * 100),
    orderNum
  );

  // Create DB order (payment still pending — no stock taken yet)
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
      coupon_code:         pricing.coupon_code,
      payment_method:      "razorpay",
      payment_status:      "pending",
      razorpay_order_id:   rzpOrder.id,
      status:              "placed",
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Build batch insert for order items — from server-priced line items, so the
  // stored mrp/selling_price are the real DB prices, not whatever the client sent.
  const orderItemsToInsert = pricing.items.map(item => ({
    order_id:      dbOrder.id,
    product_id:    item.product_id,
    product_name:  item.product_name,
    product_image: item.product_image,
    product_sku:   item.product_sku,
    quantity:      item.quantity,
    mrp:           item.mrp,
    selling_price: item.selling_price,
  }));

  // Insert order items + initial status history.
  // NOTE: stock is NOT decremented here and the coupon is NOT consumed —
  // both happen only once payment is verified, so abandoned checkouts
  // never reduce inventory or burn a coupon use.
  await Promise.all([
    orderItemsToInsert.length > 0
      ? admin.from("order_items").insert(orderItemsToInsert)
      : Promise.resolve(),
    admin.from("order_status_history").insert({
      order_id: dbOrder.id,
      status:   "placed",
    }),
  ]);

  return NextResponse.json({
    data: {
      db_order_id:      dbOrder.id,
      order_number:     orderNum,
      razorpay_order_id: rzpOrder.id,
      razorpay_amount:  rzpOrder.amount,
    },
  });
}
