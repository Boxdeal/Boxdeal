import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import { createRazorpayOrder } from "@/lib/razorpay/index";
import { getCartDeliveryQuote } from "@/lib/shipping/index";
import { computeOrderPricing } from "@/lib/orders/pricing";
import { splitPartialCod } from "@/constants";
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
    mode,
  }: {
    items:       CartItem[];
    address:     Address;
    coupon_code: string | null;
    // "partial_cod" → a bulky/volumetric COD order: only a slice is paid online
    // now (Razorpay), the rest is collected on delivery. Default is a normal
    // fully-online (prepaid) order.
    mode?:       "online" | "partial_cod";
  } = body;

  const isPartial = mode === "partial_cod";

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
  // A partial-COD order is a cash-on-delivery order, so quote the COD rate and
  // require the pincode to actually support COD.
  let shipping_charge: number;
  let is_volumetric = false;
  try {
    const quote = await getCartDeliveryQuote(admin, items, address.pincode, isPartial);
    if (!quote.serviceable) {
      return NextResponse.json(
        { error: isPartial
            ? "Cash on Delivery isn't available for this pincode. Please use online payment."
            : "Delivery isn't available to this pincode" },
        { status: 422 }
      );
    }
    shipping_charge = quote.delivery_charge;
    is_volumetric   = quote.is_volumetric;
  } catch {
    return NextResponse.json(
      { error: "Couldn't calculate delivery charge. Please try again." },
      { status: 502 }
    );
  }

  // Partial-COD is only offered for parcels billed on their volumetric weight.
  // If the server doesn't agree it's volumetric (e.g. stale client state), block
  // it — the client should retry as a normal COD/online order.
  if (isPartial && !is_volumetric) {
    return NextResponse.json(
      { error: "This order isn't eligible for partial payment. Please refresh and try again." },
      { status: 409 }
    );
  }

  // Total is derived server-side so a tampered client value can't change what
  // the customer is actually charged. For partial-COD, only `online` is paid now
  // via Razorpay; `cod` is collected on delivery.
  const total_amount = subtotal - discount + shipping_charge;
  const { online: online_paid_amount, cod: cod_amount } = isPartial
    ? splitPartialCod(total_amount)
    : { online: total_amount, cod: 0 };

  // Amount actually charged through Razorpay now (paise).
  const razorpay_charge = isPartial ? online_paid_amount : total_amount;

  // Generate order number. Prefer the DB sequence function; if it's missing
  // (returns null / errors), fall back to a unique JS-generated number so the
  // order_number NOT NULL constraint is never violated.
  const { data: rpcOrderNum } = await admin.rpc("generate_order_number");
  const orderNum: string =
    rpcOrderNum ??
    `BD${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Date.now().toString().slice(-6)}`;

  // Create Razorpay order for whatever is collected online now (full total for a
  // normal order, only the online slice for partial-COD).
  const rzpOrder = await createRazorpayOrder(
    Math.round(razorpay_charge * 100),
    orderNum
  );

  // Create DB order (payment still pending — no stock taken yet). A partial-COD
  // order is stored with payment_method "cod" (the courier still collects cash)
  // but flagged is_partial_cod with the online/COD split recorded.
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
      payment_method:      isPartial ? "cod" : "razorpay",
      payment_status:      "pending",
      is_partial_cod:      isPartial,
      online_paid_amount:  isPartial ? online_paid_amount : 0,
      cod_amount:          isPartial ? cod_amount : 0,
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
      db_order_id:        dbOrder.id,
      order_number:       orderNum,
      razorpay_order_id:  rzpOrder.id,
      razorpay_amount:    rzpOrder.amount,
      is_partial_cod:     isPartial,
      online_paid_amount: isPartial ? online_paid_amount : total_amount,
      cod_amount:         isPartial ? cod_amount : 0,
      total_amount,
    },
  });
}
