import type { SupabaseClient } from "@supabase/supabase-js";
import type { CartItem } from "@/types";
import { validateCoupon } from "@/lib/coupons/server";

/** A cart line item priced entirely from server-side (DB) values. */
export interface PricedLineItem {
  product_id:    string;
  product_name:  string;
  product_sku:   string;
  product_image: string | null;
  quantity:      number;
  mrp:           number;
  selling_price: number;
}

export type OrderPricing =
  | { ok: false; status: number; error: string }
  | {
      ok:          true;
      items:       PricedLineItem[];
      subtotal:    number;
      discount:    number;
      /** The coupon code that actually applied (uppercased), or null. */
      coupon_code: string | null;
    };

/**
 * Compute an order's line items, subtotal and discount ENTIRELY server-side.
 *
 * Never trust the client for money: prices (mrp/selling_price) are read from
 * the products table, the subtotal is summed from those, and the discount is
 * recomputed by re-validating the coupon server-side. The client only tells us
 * WHICH products and quantities it wants (and which coupon it typed) — every
 * rupee is derived here. Also validates stock availability along the way.
 */
export async function computeOrderPricing(
  admin: SupabaseClient,
  items: CartItem[],
  couponCode: string | null,
  userId: string
): Promise<OrderPricing> {
  const ids = items.map((i) => i.product_id);
  const { data: products } = await admin
    .from("products")
    .select("id, name, sku, mrp, selling_price, stock_quantity, product_images(image_url, is_primary)")
    .in("id", ids);

  const productMap = new Map(products?.map((p) => [p.id, p]) ?? []);

  const priced: PricedLineItem[] = [];
  let subtotal = 0;

  for (const item of items) {
    const product = productMap.get(item.product_id);
    if (!product) {
      return { ok: false, status: 400, error: "A product in your cart is no longer available" };
    }

    // Guard against a tampered/garbage quantity too.
    const quantity = Math.max(1, Math.floor(Number(item.quantity) || 0));
    if (product.stock_quantity < quantity) {
      return { ok: false, status: 409, error: `Only ${product.stock_quantity} left of "${product.name}"` };
    }

    const sellingPrice = Number(product.selling_price);
    subtotal += sellingPrice * quantity;

    const imgs = (product.product_images as Array<{ image_url: string; is_primary: boolean }>) ?? [];
    const img = imgs.find((i) => i.is_primary) ?? imgs[0];

    priced.push({
      product_id:    product.id,
      product_name:  product.name,
      product_sku:   product.sku ?? "",
      product_image: img?.image_url ?? null,
      quantity,
      mrp:           Number(product.mrp),
      selling_price: sellingPrice,
    });
  }

  // Re-validate the coupon against the SERVER subtotal. An invalid/expired/
  // over-limit coupon simply yields no discount (the order still goes through);
  // it is never allowed to set an arbitrary client-supplied discount.
  let discount = 0;
  let appliedCoupon: string | null = null;
  if (couponCode) {
    const res = await validateCoupon(admin, couponCode, subtotal, userId);
    if (res.valid && res.discount > 0) {
      discount = res.discount;
      appliedCoupon = String(couponCode).toUpperCase();
    }
  }

  return { ok: true, items: priced, subtotal, discount, coupon_code: appliedCoupon };
}
