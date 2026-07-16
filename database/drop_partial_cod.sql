-- Drops the partial-COD (volumetric-weight split-payment) columns now that the
-- feature has been removed from the app. Checkout is back to plain COD / Prepaid.
--
-- Before running this, the historical online_paid_amount/cod_amount values for
-- every order that used partial-COD were archived into that order's `notes`
-- field (done via the Supabase REST API). Verify with:
--
--   select order_number, notes from orders where notes like '%partial-COD%';
--
-- NOTE: payment_status's CHECK constraint still allows 'partial' — 4 cancelled
-- orders (BD20260702-1168/1170/1171/1172) still carry that value and were left
-- untouched on purpose (their online payment refund status wasn't resolved).
-- Tightening the constraint to drop 'partial' would fail against those rows;
-- leaving the unused value allowed is harmless.

ALTER TABLE public.orders DROP COLUMN IF EXISTS is_partial_cod;
ALTER TABLE public.orders DROP COLUMN IF EXISTS online_paid_amount;
ALTER TABLE public.orders DROP COLUMN IF EXISTS cod_amount;
