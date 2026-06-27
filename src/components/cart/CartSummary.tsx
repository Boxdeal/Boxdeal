import { formatPrice } from "@/lib/utils/format";

// Delivery charge state for the summary:
//  - a number   → the resolved (capped) charge; 0 renders as FREE
//  - "loading"  → a quote is being fetched (checkout, address just selected)
//  - "unserviceable" → no courier delivers to the selected pincode
//  - "error"    → couldn't fetch a rate (rate API/config problem, not the pincode)
//  - "pending"  → not known yet (e.g. cart drawer with no address)
export type ShippingState = number | "loading" | "unserviceable" | "error" | "pending";

interface CartSummaryProps {
  subtotal: number;
  discount: number;
  /** Reserved for compact layouts (e.g. cart drawer); kept for call-site compatibility. */
  compact?: boolean;
  /** Delivery charge state. Defaults to "pending" (shown before an address is chosen). */
  shipping?: ShippingState;
}

export function CartSummary({ subtotal, discount, shipping = "pending" }: CartSummaryProps) {
  const charge = typeof shipping === "number" ? shipping : 0;
  const total = subtotal - discount + charge;

  return (
    <div className="space-y-2 text-sm">
      <div className="flex justify-between text-gray-600">
        <span>Subtotal</span>
        <span>{formatPrice(subtotal)}</span>
      </div>
      {discount > 0 && (
        <div className="flex justify-between text-green-600">
          <span>Discount</span>
          <span>-{formatPrice(discount)}</span>
        </div>
      )}
      <div className="flex justify-between text-gray-600">
        <span>Delivery</span>
        <span>
          {typeof shipping === "number" ? (
            shipping === 0 ? (
              <span className="text-green-600 font-medium">FREE</span>
            ) : (
              formatPrice(shipping)
            )
          ) : shipping === "loading" ? (
            <span className="text-gray-400">Calculating…</span>
          ) : shipping === "unserviceable" ? (
            <span className="text-red-500 font-medium">Not available</span>
          ) : shipping === "error" ? (
            <span className="text-red-500 font-medium">Couldn&apos;t calculate</span>
          ) : (
            <span className="text-gray-400">Calculated at checkout</span>
          )}
        </span>
      </div>
      <div className="flex justify-between border-t border-gray-100 pt-2 font-bold text-base text-gray-900">
        <span>Total</span>
        <span>{typeof shipping === "number" ? formatPrice(total) : formatPrice(subtotal - discount)}</span>
      </div>
    </div>
  );
}
