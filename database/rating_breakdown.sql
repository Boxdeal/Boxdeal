-- Star-wise counts for offline reviews, shown in the product page review bars.
-- Format: {"5": 8, "4": 0, "3": 2, "2": 0, "1": 0}. NULL = not set.
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS rating_breakdown jsonb;

-- Big Diamond speaker: 10 offline reviews (8 x 5 star, 2 x 3 star) = 4.6 average
UPDATE public.products
SET rating = 4.6,
    review_count = 10,
    rating_breakdown = '{"5": 8, "4": 0, "3": 2, "2": 0, "1": 0}'::jsonb
WHERE slug = 'baystore-big-diamond-smart-led-bluetooth-speaker';
