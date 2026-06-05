import { cn } from "@/lib/utils/helpers";
import { formatPrice, formatDiscount } from "@/lib/utils/format";

interface PriceDisplayProps {
  sellingPrice: number;
  mrp: number;
  discountPercent: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: { price: "text-base font-bold", mrp: "text-xs", badge: "text-xs px-1.5 py-0.5" },
  md: { price: "text-xl font-bold",   mrp: "text-sm", badge: "text-xs px-2 py-0.5" },
  lg: { price: "text-3xl font-bold",  mrp: "text-base", badge: "text-sm px-2 py-1" },
};

export function PriceDisplay({
  sellingPrice,
  mrp,
  discountPercent,
  size = "md",
  className,
}: PriceDisplayProps) {
  const s = sizeMap[size];
  const hasDiscount = discountPercent > 0;

  return (
    <div className={cn("flex flex-wrap items-baseline gap-2", className)}>
      <span className={cn(s.price, "text-gray-900")}>
        {formatPrice(sellingPrice)}
      </span>
      {hasDiscount && (
        <>
          <span className={cn(s.mrp, "text-gray-400 line-through")}>
            {formatPrice(mrp)}
          </span>
          <span
            className={cn(
              s.badge,
              "rounded font-semibold bg-green-100 text-green-700"
            )}
          >
            {formatDiscount(discountPercent)}
          </span>
        </>
      )}
    </div>
  );
}
