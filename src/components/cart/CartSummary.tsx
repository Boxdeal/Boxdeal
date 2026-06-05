import { formatPrice } from "@/lib/utils/format";
import { calculateShipping } from "@/lib/utils/helpers";
import { FREE_SHIPPING_THRESHOLD } from "@/constants";

interface CartSummaryProps {
  subtotal: number;
  discount: number;
  compact?: boolean;
}

export function CartSummary({ subtotal, discount, compact }: CartSummaryProps) {
  const shipping = calculateShipping(subtotal - discount);
  const total = subtotal - discount + shipping;

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
          {shipping === 0 ? (
            <span className="text-green-600 font-medium">FREE</span>
          ) : (
            formatPrice(shipping)
          )}
        </span>
      </div>
      {shipping > 0 && !compact && (
        <p className="text-xs text-gray-400">
          Add {formatPrice(FREE_SHIPPING_THRESHOLD - (subtotal - discount))} more for free delivery
        </p>
      )}
      <div className="flex justify-between border-t border-gray-100 pt-2 font-bold text-base text-gray-900">
        <span>Total</span>
        <span>{formatPrice(total)}</span>
      </div>
    </div>
  );
}
