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
 * items don't carry them).
 *
 * The rate is Shiprocket's full debit (freight + COD charge + coverage). COD
 * charge and coverage scale with the order value Shiprocket sees, which is
 * goods + this delivery charge — so the rate is re-fetched on goods + charge
 * until it settles. The customer's charge is the result capped at ₹499.
 *
 * `goodsValue` is subtotal − discount; order-creation routes pass the server-
 * priced value. When omitted (display quote), it's summed from DB prices.
 *
 * Returns `serviceable: false` when no courier covers the destination —
 * callers should block the order in that case. Pass `cod: true` to get the
 * cash-on-delivery rate (some pincodes have COD couriers only, or none).
 */
export async function getCartDeliveryQuote(
  admin: SupabaseClient,
  items: CartItem[],
  pincode: string,
  cod = false,
  goodsValue?: number
): Promise<DeliveryQuote> {
  const ids = items.map((i) => i.product_id);
  const { data: products } = await admin
    .from("products")
    .select("id, selling_price, weight_grams, length_cm, breadth_cm, height_cm")
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

  const goods = goodsValue ?? items.reduce(
    (sum, item) => sum + (Number(dimMap.get(item.product_id)?.selling_price) || 0) * item.quantity,
    0
  );

  // The charge feeds back into the order value Shiprocket prices on, and
  // coverage jumps in slabs (₹0 → ₹49 → ₹99…), so re-quote on goods + charge
  // until the charge stops moving. Converges in 2–3 calls.
  let final = await getDeliveryRate(pincode, chargeableKg, cod, goods);
  if (!final.serviceable) {
    return { serviceable: false, delivery_charge: null, courier_name: null };
  }
  for (let i = 0; i < 4; i++) {
    const charge = applyDeliveryCap(final.rate);
    if (charge >= DELIVERY_CHARGE_CAP) break;
    const next = await getDeliveryRate(pincode, chargeableKg, cod, goods + charge);
    if (!next.serviceable) break;
    final = next;
    if (applyDeliveryCap(next.rate) === charge) break;
  }

  return {
    serviceable:     true,
    delivery_charge: applyDeliveryCap(final.rate),
    courier_name:    final.courierName,
  };
}
