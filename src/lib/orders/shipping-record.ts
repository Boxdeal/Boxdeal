import type { SupabaseClient } from "@supabase/supabase-js";
import type { DeliveryQuote } from "@/lib/shipping/index";

// The shipping-cost columns (database/shipping_quality.sql) are written in a
// separate, best-effort update — never as part of the order insert or the
// status update. If the migration hasn't run yet, the write fails quietly and
// checkout / packing carry on exactly as before.

/** Remember which courier and cost the customer's delivery charge came from. */
export async function saveQuote(admin: SupabaseClient, orderId: string, quote: DeliveryQuote) {
  if (!quote.serviceable) return;
  const { error } = await admin
    .from("orders")
    .update({
      quoted_courier_id:   quote.courier_id,
      quoted_courier_name: quote.courier_name,
      quoted_rate:         quote.rate,
      quoted_weight_kg:    quote.weight_kg,
    })
    .eq("id", orderId);
  if (error) console.warn(`Quote not saved on order ${orderId} (run database/shipping_quality.sql?):`, error.message);
}

/** Record what the shipment actually cost once the AWB is assigned. */
export async function saveShipmentCost(
  admin: SupabaseClient,
  orderId: string,
  fields: { shipped_weight_kg: number; shipping_cost: number | null }
) {
  const { error } = await admin.from("orders").update(fields).eq("id", orderId);
  if (error) console.warn(`Shipment cost not saved on order ${orderId} (run database/shipping_quality.sql?):`, error.message);
}
