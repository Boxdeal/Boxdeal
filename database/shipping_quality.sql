-- Shipping cost tracking + per-order parcel override.
-- Run once in the Supabase SQL editor. Safe to re-run.
-- Existing table, so no new GRANTs are needed.
--
-- Until this runs the site keeps working: every write to these columns is
-- best-effort and checkout / packing never depend on them.

ALTER TABLE public.orders
  -- What checkout quoted (the courier the customer's delivery charge came from).
  ADD COLUMN IF NOT EXISTS quoted_courier_id    integer,
  ADD COLUMN IF NOT EXISTS quoted_courier_name  text,
  ADD COLUMN IF NOT EXISTS quoted_rate          numeric,   -- Shiprocket cost before the ₹499 cap
  ADD COLUMN IF NOT EXISTS quoted_weight_kg     numeric,

  -- Admin override of the box, set before packing. NULL = use the computed box.
  ADD COLUMN IF NOT EXISTS parcel_length_cm     numeric,
  ADD COLUMN IF NOT EXISTS parcel_breadth_cm    numeric,
  ADD COLUMN IF NOT EXISTS parcel_height_cm     numeric,
  ADD COLUMN IF NOT EXISTS parcel_weight_kg     numeric,

  -- What actually shipped: weight sent to Shiprocket and its cost for the
  -- courier that got the AWB (freight + COD charge + coverage).
  ADD COLUMN IF NOT EXISTS shipped_weight_kg    numeric,
  ADD COLUMN IF NOT EXISTS shipping_cost        numeric,
  -- Charged later by Shiprocket (weight discrepancy etc.), entered by an admin.
  ADD COLUMN IF NOT EXISTS shipping_cost_extra  numeric NOT NULL DEFAULT 0;
