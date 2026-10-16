-- Per-product Cash-on-Delivery switch.
-- Admin can turn COD off for individual products; if ANY product in the cart
-- has cod_available = false, checkout hides COD and /api/orders/cod rejects it.
-- Run once in the Supabase SQL editor (existing table → no new GRANTs needed).

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS cod_available boolean NOT NULL DEFAULT true;
