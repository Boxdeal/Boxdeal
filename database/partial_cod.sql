-- Partial-COD (volumetric-weight) payment support.
--
-- When a COD parcel is billed on its VOLUMETRIC weight (i.e. volumetric weight
-- exceeds actual weight — a bulky but light box), we collect part of the order
-- online up front (Razorpay) and leave the rest as cash-on-delivery. These
-- orders keep payment_method = 'cod' (the courier still collects cash) but are
-- flagged with is_partial_cod and carry the online/COD split.

-- 1. Product dimensions (cm). Present in the live DB already; declared here with
--    IF NOT EXISTS so the schema is reproducible. Volumetric weight is computed
--    from these: (length_cm * breadth_cm * height_cm) / 5000 = kg.
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS length_cm  numeric DEFAULT 0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS breadth_cm numeric DEFAULT 0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS height_cm  numeric DEFAULT 0;

-- 2. Partial-COD columns on orders.
--    online_paid_amount → the part paid online via Razorpay (prepaid up front)
--    cod_amount         → the part the courier collects on delivery
--    For non-partial orders these stay 0 and is_partial_cod stays false.
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS is_partial_cod     boolean DEFAULT false;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS online_paid_amount numeric DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS cod_amount         numeric DEFAULT 0;

-- 3. Allow payment_status = 'partial' — online portion received, COD portion
--    still outstanding. Distinct from 'paid' (fully collected) and 'pending'.
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_payment_status_check;
ALTER TABLE public.orders ADD CONSTRAINT orders_payment_status_check
  CHECK (payment_status = ANY (ARRAY[
    'pending'::text, 'paid'::text, 'partial'::text, 'failed'::text, 'refunded'::text
  ]));
