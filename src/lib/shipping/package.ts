import { VOLUMETRIC_DIVISOR } from "@/constants";

// A line with the physical attributes needed to weigh it (one product × qty).
export interface WeighableItem {
  quantity:     number;
  weight_grams?: number | null;
  length_cm?:    number | null;
  breadth_cm?:   number | null;
  height_cm?:    number | null;
}

export interface ParcelPackage {
  /** Summed actual weight of every unit (kg). */
  actualKg:     number;
  /** Volumetric weight of the combined box (kg): L×B×H / divisor. */
  volumetricKg: number;
  /** What the courier bills on: max(actual, volumetric), floored at 0.1kg. */
  chargeableKg: number;
  /** Combined box dimensions (whole cm) sent to Shiprocket. */
  length:  number;
  breadth: number;
  height:  number;
}

// Box used when no item in the order has dimensions set.
const DEFAULT_BOX = { length: 10, breadth: 10, height: 5 };

// Packing allowance added to each side of the computed box (cm).
const PACKING_PADDING_CM = 1;

/**
 * The ONE place an order's parcel is sized. Checkout quote, Shiprocket order
 * creation and AWB courier selection all call this, so the customer is charged
 * for exactly the weight Shiprocket sees and prints on the label.
 *
 * Every unit counts: earbuds ×2 + power bank ×3 = 5 units of weight and volume.
 * The box takes the largest length and breadth across items, and its height is
 * stretched until the box volume covers the summed volume of all units — so
 * Shiprocket's own L×B×H/5000 equals our volumetric weight instead of seeing
 * a single item's box. Each side then gets PACKING_PADDING_CM extra for
 * packing material (5×10×26 → 6×11×27).
 */
export function computePackage(items: WeighableItem[]): ParcelPackage {
  let actualGrams = 0;
  let totalVolume = 0;
  let maxLength = 0;
  let maxBreadth = 0;

  for (const it of items) {
    const qty = Math.max(0, Number(it.quantity) || 0);
    if (!qty) continue;
    const l = Number(it.length_cm)  || 0;
    const b = Number(it.breadth_cm) || 0;
    const h = Number(it.height_cm)  || 0;
    actualGrams += (Number(it.weight_grams) || 0) * qty;
    totalVolume += l * b * h * qty;
    maxLength  = Math.max(maxLength, l);
    maxBreadth = Math.max(maxBreadth, b);
  }

  let { length, breadth, height } = DEFAULT_BOX;
  if (totalVolume > 0) {
    length  = Math.ceil(maxLength);
    breadth = Math.ceil(maxBreadth);
    height  = Math.max(1, Math.ceil(totalVolume / (length * breadth)));
    length  += PACKING_PADDING_CM;
    breadth += PACKING_PADDING_CM;
    height  += PACKING_PADDING_CM;
  }

  const actualKg     = actualGrams / 1000;
  const volumetricKg = (length * breadth * height) / VOLUMETRIC_DIVISOR;
  // Rounded up to 10g so the number we quote and the number we send match.
  const chargeableKg = Math.ceil(Math.max(actualKg, volumetricKg, 0.1) * 100) / 100;

  return { actualKg, volumetricKg, chargeableKg, length, breadth, height };
}
