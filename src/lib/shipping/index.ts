import type { SupabaseClient } from "@supabase/supabase-js";
import { getDeliveryRate } from "@/lib/shiprocket/index";
import { DELIVERY_CHARGE_CAP } from "@/constants";
import { computePackage, type WeighableItem } from "./package";
import type { CartItem } from "@/types";

/**
 * Apply BoxDeal's delivery-charge cap. The customer pays the live courier rate
 * rounded up to the next rupee, but never more than DELIVERY_CHARGE_CAP (₹499).
 */
export function applyDeliveryCap(rate: number): number {
  return Math.min(Math.ceil(rate), DELIVERY_CHARGE_CAP);
}

export { computePackage, type WeighableItem, type ParcelPackage } from "./package";

export type DeliveryQuote =
  | { serviceable: true;  delivery_charge: number; courier_name: string | null }
  | { serviceable: false; delivery_charge: null;   courier_name: null };

/**
 * Compute the delivery charge for a cart shipping to `pincode`.
 *
 * Weight is the CHARGEABLE weight from `computePackage` — the same function
 * Shiprocket order creation and AWB courier selection use — built from each
 * product's `weight_grams` and dimensions (fetched live from the DB, since cart
 * items don't carry them). So the rate quoted here is the rate Shiprocket bills
 * for the parcel it receives. The customer's charge is that rate capped at ₹499.
 *
 * Returns `serviceable: false` when no courier covers the destination —
 * callers should block the order in that case. Pass `cod: true` to get the
 * cash-on-delivery rate (some pincodes have COD couriers only, or none).
 */
export async function getCartDeliveryQuote(
  admin: SupabaseClient,
  items: CartItem[],
  pincode: string,
  cod = false
): Promise<DeliveryQuote> {
  const ids = items.map((i) => i.product_id);
  const { data: products } = await admin
    .from("products")
    .select("id, weight_grams, length_cm, breadth_cm, height_cm")
    .in("id", ids);

  const dimMap = new Map(
    (products ?? []).map((p) => [p.id as string, p])
  );

  const weighable: WeighableItem[] = items.map((item) => {
    const p = dimMap.get(item.product_id);
    return {
      quantity:     item.quantity,
      weight_grams: p?.weight_grams,
      length_cm:    p?.length_cm,
      breadth_cm:   p?.breadth_cm,
      height_cm:    p?.height_cm,
    };
  });

  const { chargeableKg } = computePackage(weighable);

  const result = await getDeliveryRate(pincode, chargeableKg, cod);
  if (!result.serviceable) {
    return { serviceable: false, delivery_charge: null, courier_name: null };
  }

  return {
    serviceable:     true,
    delivery_charge: applyDeliveryCap(result.rate),
    courier_name:    result.courierName,
  };
}
