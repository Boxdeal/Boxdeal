import type { SupabaseClient } from "@supabase/supabase-js";
import { getDeliveryRate } from "@/lib/shiprocket/index";
import { DELIVERY_CHARGE_CAP, VOLUMETRIC_DIVISOR } from "@/constants";
import type { CartItem } from "@/types";

/**
 * Apply BoxDeal's delivery-charge cap. The customer pays the live courier rate
 * rounded up to the next rupee, but never more than DELIVERY_CHARGE_CAP (₹200).
 */
export function applyDeliveryCap(rate: number): number {
  return Math.min(Math.ceil(rate), DELIVERY_CHARGE_CAP);
}

// A cart line with the physical attributes needed to weigh it.
export interface WeighableItem {
  quantity:     number;
  weight_grams: number;
  length_cm:    number;
  breadth_cm:   number;
  height_cm:    number;
}

export interface WeightBreakdown {
  /** Summed actual weight (kg). */
  actualKg:     number;
  /** Summed volumetric weight (kg): Σ (L×B×H)/divisor × qty. */
  volumetricKg: number;
  /** What the courier bills on: max(actual, volumetric), floored at 0.1kg. */
  chargeableKg: number;
}

/**
 * Compute a cart's actual, volumetric and chargeable weight.
 *
 * Couriers bill on the GREATER of actual and volumetric weight.
 */
export function computeWeight(items: WeighableItem[]): WeightBreakdown {
  let actualGrams = 0;
  let volumetricKg = 0;
  for (const it of items) {
    const qty = Math.max(0, it.quantity || 0);
    actualGrams += (Number(it.weight_grams) || 0) * qty;
    const vol =
      (Number(it.length_cm) || 0) *
      (Number(it.breadth_cm) || 0) *
      (Number(it.height_cm) || 0);
    volumetricKg += (vol / VOLUMETRIC_DIVISOR) * qty;
  }
  const actualKg = actualGrams / 1000;
  const chargeableKg = Math.max(actualKg, volumetricKg, 0.1);
  return { actualKg, volumetricKg, chargeableKg };
}

export type DeliveryQuote =
  | { serviceable: true;  delivery_charge: number; courier_name: string | null }
  | { serviceable: false; delivery_charge: null;   courier_name: null };

/**
 * Compute the delivery charge for a cart shipping to `pincode`.
 *
 * Weight is the CHARGEABLE weight — max(actual, volumetric) — summed from each
 * product's `weight_grams` and dimensions (fetched live from the DB, since cart
 * items don't carry them), floored at 0.1kg to match what we send Shiprocket at
 * fulfillment. Sending the chargeable weight means the quoted rate matches what
 * the courier actually bills us for a bulky parcel. The live rate is capped at
 * ₹200.
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
      weight_grams: Number(p?.weight_grams) || 0,
      length_cm:    Number(p?.length_cm)    || 0,
      breadth_cm:   Number(p?.breadth_cm)   || 0,
      height_cm:    Number(p?.height_cm)    || 0,
    };
  });

  const { chargeableKg } = computeWeight(weighable);

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
