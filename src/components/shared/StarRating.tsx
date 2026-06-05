import { Star } from "lucide-react";
import { cn } from "@/lib/utils/helpers";

interface StarRatingProps {
  rating: number;
  reviewCount?: number;
  size?: "sm" | "md" | "lg";
  showCount?: boolean;
  className?: string;
}

const sizeMap = {
  sm: "w-3 h-3",
  md: "w-4 h-4",
  lg: "w-5 h-5",
};

export function StarRating({
  rating,
  reviewCount,
  size = "sm",
  showCount = true,
  className,
}: StarRatingProps) {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => {
          const filled = i < Math.floor(rating);
          const partial = !filled && i < rating;
          return (
            <span key={i} className="relative inline-flex">
              <Star
                className={cn(sizeMap[size], "text-gray-200 fill-gray-200")}
              />
              {(filled || partial) && (
                <span
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: partial ? `${(rating % 1) * 100}%` : "100%" }}
                >
                  <Star
                    className={cn(sizeMap[size], "text-amber-400 fill-amber-400")}
                  />
                </span>
              )}
            </span>
          );
        })}
      </div>
      {showCount && (
        <span className="text-xs text-gray-500">
          {rating.toFixed(1)}
          {reviewCount !== undefined && (
            <span className="ml-1">({reviewCount.toLocaleString()})</span>
          )}
        </span>
      )}
    </div>
  );
}
