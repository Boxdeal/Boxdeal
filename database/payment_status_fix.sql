-- ============================================================
-- Align orders.payment_status with the application code.
--
-- The live DB only allowed ('pending', 'success', 'failed'), but the
-- app (and all dashboard functions) write/read 'paid'. That made the
-- payment-verify UPDATE silently fail, so paid orders never confirmed.
--
-- Run this once in the Supabase SQL editor.
-- ============================================================

-- 1. Migrate any rows that used the old 'success' value.
UPDATE orders SET payment_status = 'paid' WHERE payment_status = 'success';

-- 2. Replace the CHECK constraint with the values the app actually uses.
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_payment_status_check;
ALTER TABLE orders
  ADD CONSTRAINT orders_payment_status_check
  CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded'));
