-- ============================================================
-- Allow Cash-on-Delivery (cod) as an orders.payment_method.
--
-- The live DB CHECK constraint only allowed ('razorpay', 'upi', 'card'),
-- so the COD checkout flow (which inserts payment_method = 'cod') failed
-- with: new row for relation "orders" violates check constraint
-- "orders_payment_method_check".
--
-- Run this once in the Supabase SQL editor.
-- ============================================================

ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_payment_method_check;
ALTER TABLE orders
  ADD CONSTRAINT orders_payment_method_check
  CHECK (payment_method IN ('razorpay', 'upi', 'card', 'cod'));
