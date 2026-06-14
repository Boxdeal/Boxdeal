import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import { createRazorpayOrder } from "@/lib/razorpay/index";
import { sendOrderConfirmation } from "@/lib/resend/index";
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
    shipping_charge,
    total_amount,
  }: {
    items:           CartItem[];
    address:         Address;
    coupon_code:     string | null;
    subtotal:        number;
    discount:        number;
    shipping_charge: number;
    total_amount:    number;
  } = body;

  if (!items?.length) return NextResponse.json({ error: "Cart is empty" }, { status: 400 });

  const admin = getSupabaseAdminClient();

  // Generate order number
  const { data: orderNum } = await admin.rpc("generate_order_number");

  // Create Razorpay order
  const rzpOrder = await createRazorpayOrder(
    Math.round(total_amount * 100),
    orderNum
  );

  // Create DB order
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

  // Batch fetch ALL product details first (parallel, not sequential)
  const itemProductIds = items.map(i => i.product_id);
  const { data: products } = await admin
    .from("products")
    .select("id, name, sku, product_images(image_url, is_primary)")
    .in("id", itemProductIds);

  const productMap = new Map(products?.map(p => [p.id, p]) ?? []);

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

  // Batch insert all order items + batch decrement stock (parallel)
  await Promise.all([
    ...(orderItemsToInsert.length > 0 ? [admin.from("order_items").insert(orderItemsToInsert)] : []),
    ...items.map(item =>
      admin.rpc("decrement_stock", {
        p_product_id: item.product_id,
        p_quantity:   item.quantity,
      })
    ),
  ]);
  // Initial status history
  await admin.from("order_status_history").insert({
    order_id: dbOrder.id,
    status:   "placed",
  });

  // Increment coupon usage
  if (coupon_code) {
    const couponCode = coupon_code.toUpperCase();
    const { data: coupon } = await admin
      .from("coupons")
      .select("id, used_count, max_uses")
      .eq("code", couponCode)
      .single();

    if (coupon && coupon.used_count < coupon.max_uses) {
      await admin
        .from("coupons")
        .update({ used_count: coupon.used_count + 1 })
        .eq("code", couponCode);
    }
  }

  return NextResponse.json({
    data: {
      db_order_id:      dbOrder.id,
      order_number:     orderNum,
      razorpay_order_id: rzpOrder.id,
      razorpay_amount:  rzpOrder.amount,
    },
  });
}
