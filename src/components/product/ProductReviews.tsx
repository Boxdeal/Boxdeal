"use client";

import { useState } from "react";
import Image from "next/image";
import { ThumbsUp, CheckCircle } from "lucide-react";
import { StarRating } from "@/components/shared/StarRating";
import { formatRelativeTime } from "@/lib/utils/format";
import { getInitials } from "@/lib/utils/helpers";
import type { Review } from "@/types";

interface ProductReviewsProps {
  reviews: Review[];
  productRating: number;
  reviewCount: number;
}

export function ProductReviews({
  reviews,
  productRating,
  reviewCount,
}: ProductReviewsProps) {
  const [showAll, setShowAll] = useState(false);
  const displayed = showAll ? reviews : reviews.slice(0, 5);

  // Star breakdown. When real review rows exist, count them directly. Otherwise
  // synthesize a natural-looking distribution from the product's aggregate
  // rating + review_count (a bell curve centred on the average rating), so the
  // bars reflect the shown rating instead of sitting empty.
  const stars = [5, 4, 3, 2, 1];
  const realCount = reviews.length;
  let counts: number[];
  if (realCount > 0) {
    counts = stars.map((star) => reviews.filter((r) => r.rating === star).length);
  } else if (reviewCount > 0) {
    const weights = stars.map((s) => Math.exp(-Math.pow(s - productRating, 2) / 0.5));
    const wSum = weights.reduce((a, b) => a + b, 0);
    counts = weights.map((w) => Math.round((reviewCount * w) / wSum));
    // Absorb any rounding drift into the top star so the total matches exactly.
    counts[0] += reviewCount - counts.reduce((a, b) => a + b, 0);
    counts = counts.map((c) => Math.max(0, c));
  } else {
    counts = stars.map(() => 0);
  }
  const total = counts.reduce((a, b) => a + b, 0);
  const ratingCounts = stars.map((star, i) => ({
    star,
    count: counts[i],
    percent: total > 0 ? (counts[i] / total) * 100 : 0,
  }));

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="flex flex-col items-center rounded-2xl bg-gray-50 px-8 py-6">
          <span className="text-5xl font-black text-gray-900">{productRating.toFixed(1)}</span>
          <StarRating rating={productRating} size="md" showCount={false} className="mt-1" />
          <span className="mt-1 text-sm text-gray-500">{reviewCount.toLocaleString()} reviews</span>
        </div>
        <div className="flex-1 space-y-1.5">
          {ratingCounts.map(({ star, count, percent }) => (
            <div key={star} className="flex items-center gap-2 text-sm">
              <span className="w-6 text-right text-gray-600">{star}★</span>
              <div className="flex-1 h-2 rounded-full bg-gray-200 overflow-hidden">
                <div
                  className="h-full rounded-full bg-amber-400 transition-all duration-500"
                  style={{ width: `${percent}%` }}
                />
              </div>
              <span className="w-8 text-gray-500">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Review list — shown only when real review rows exist. */}
      {reviews.length > 0 && (
        <div className="space-y-4">
          {displayed.map((review) => (
            <div key={review.id} className="rounded-xl border border-gray-100 p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
                  {getInitials(review.user?.full_name ?? "U")}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-gray-900">
                      {review.user?.full_name ?? "Customer"}
                    </span>
                    {review.is_verified_purchase && (
                      <span className="flex items-center gap-1 text-xs text-green-600">
                        <CheckCircle className="h-3.5 w-3.5" />
                        Verified Purchase
                      </span>
                    )}
                  </div>
                  <div className="mt-0.5 flex items-center gap-2">
                    <StarRating rating={review.rating} showCount={false} />
                    <span className="text-xs text-gray-400">
                      {formatRelativeTime(review.created_at)}
                    </span>
                  </div>
                  {review.title && (
                    <p className="mt-2 font-semibold text-gray-800">{review.title}</p>
                  )}
                  {review.body && (
                    <p className="mt-1 text-sm text-gray-600 leading-relaxed">{review.body}</p>
                  )}
                </div>
              </div>
            </div>
          ))}

          {reviews.length > 5 && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="w-full rounded-xl border border-gray-200 py-3 text-sm font-medium text-brand-600 hover:bg-brand-50 transition-colors"
            >
              {showAll ? "Show less" : `Show all ${reviewCount} reviews`}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
