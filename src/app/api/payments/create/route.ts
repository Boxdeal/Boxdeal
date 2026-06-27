import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import { createRazorpayOrder } from "@/lib/razorpay/index";
import { getCartDeliveryQuote } from "@/lib/shipping/index";
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

  // Validate stock availability BEFORE creating any order or charging.
  // Stock is only decremented after payment succeeds (see verify route),
  // so here we just confirm the requested quantities are still in stock.
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
      coupon_code:         coupon_code ?? null,
      payment_method:      "razorpay",
      payment_status:      "pending",
      razorpay_order_id:   rzpOrder.id,
      status:              "placed",
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Build batch insert for order items
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
