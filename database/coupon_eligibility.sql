-- ============================================================
-- Add audience targeting to coupons.
--   'all'         → anyone can use the coupon
--   'first_order' → only customers who have not placed a paid order yet
-- Run once in the Supabase SQL editor.
-- ============================================================

ALTER TABLE public.coupons
  ADD COLUMN IF NOT EXISTS eligibility text NOT NULL DEFAULT 'all';

ALTER TABLE public.coupons DROP CONSTRAINT IF EXISTS coupons_eligibility_check;
ALTER TABLE public.coupons
  ADD CONSTRAINT coupons_eligibility_check
  CHECK (eligibility IN ('all', 'first_order'));
