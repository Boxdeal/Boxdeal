import type { SupabaseClient } from "@supabase/supabase-js";
import { getDeliveryRate } from "@/lib/shiprocket/index";
import { DELIVERY_CHARGE_CAP } from "@/constants";
import type { CartItem } from "@/types";

/**
 * Apply BoxDeal's delivery-charge cap. The customer pays the live courier rate
 * rounded up to the next rupee, but never more than DELIVERY_CHARGE_CAP (₹200).
 */
export function applyDeliveryCap(rate: number): number {
  return Math.min(Math.ceil(rate), DELIVERY_CHARGE_CAP);
}

export type DeliveryQuote =
  | { serviceable: true; delivery_charge: number; courier_name: string | null }
  | { serviceable: false; delivery_charge: null; courier_name: null };

/**
 * Compute the delivery charge for a cart shipping to `pincode`.
 *
 * Weight is summed from each product's `weight_grams` (fetched live from the DB,
 * since cart items don't carry weight), floored at 0.1kg to match what we send
 * Shiprocket at fulfillment. The live courier rate is then capped at ₹200.
 *
 * Returns `serviceable: false` when no courier covers the destination — callers
 * should block the order in that case.
 */
export async function getCartDeliveryQuote(
  admin: SupabaseClient,
  items: CartItem[],
  pincode: string
): Promise<DeliveryQuote> {
  const ids = items.map((i) => i.product_id);
  const { data: products } = await admin
    .from("products")
    .select("id, weight_grams")
    .in("id", ids);

  const weightMap = new Map(
    (products ?? []).map((p) => [p.id as string, Number(p.weight_grams) || 0])
  );

  const totalGrams = items.reduce(
    (sum, item) => sum + (weightMap.get(item.product_id) ?? 0) * item.quantity,
    0
  );
  const weightKg = Math.max(totalGrams / 1000, 0.1);

  const result = await getDeliveryRate(pincode, weightKg);
  if (!result.serviceable) {
    return { serviceable: false, delivery_charge: null, courier_name: null };
  }

  return {
    serviceable:     true,
    delivery_charge: applyDeliveryCap(result.rate),
    courier_name:    result.courierName,
  };
}
