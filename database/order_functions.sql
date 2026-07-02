-- ============================================================
-- Order/stock helper functions used by the checkout APIs.
-- Safe to run multiple times (idempotent). Run once in Supabase SQL editor.
--
-- Why: the live DB was missing generate_order_number(), so orders.order_number
-- came back NULL and inserts failed. decrement_stock()/restore_stock() are used
-- by the payment verify/cancel flow, so create them here too.
-- ============================================================

-- Sequence for human-readable order numbers (only if it doesn't exist yet)
CREATE SEQUENCE IF NOT EXISTS order_seq START 1000;

-- BD20260616-1000 style order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT LANGUAGE plpgsql AS $$
DECLARE
  v_date TEXT;
  v_seq  TEXT;
BEGIN
  v_date := TO_CHAR(NOW(), 'YYYYMMDD');
  v_seq  := LPAD(nextval('order_seq')::TEXT, 4, '0');
  RETURN 'BD' || v_date || '-' || v_seq;
END;
$$;

-- Decrement stock atomically after a payment is confirmed
CREATE OR REPLACE FUNCTION decrement_stock(
  p_product_id UUID,
  p_quantity   INTEGER
)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE products
  SET
    stock_quantity = stock_quantity - p_quantity,
    sold_count     = sold_count + p_quantity
  WHERE id = p_product_id
    AND stock_quantity >= p_quantity;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Insufficient stock for product %', p_product_id;
  END IF;
END;
$$;

-- Atomically consume one use of a coupon, but ONLY while it is still under its
-- usage limit. A single UPDATE statement holds a row lock for the duration of
-- the check + increment, so two concurrent orders can never both slip past the
-- limit (which the old read-then-write in JS allowed). Returns TRUE if a use
-- was actually counted, FALSE if the coupon is missing or already maxed out.
CREATE OR REPLACE FUNCTION increment_coupon_usage(p_code TEXT)
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_updated INTEGER;
BEGIN
  UPDATE coupons
  SET used_count = used_count + 1
  WHERE UPPER(code) = UPPER(p_code)
    AND (usage_limit IS NULL OR used_count < usage_limit);

  GET DIAGNOSTICS v_updated = ROW_COUNT;
  RETURN v_updated > 0;
END;
$$;

-- Restore stock if an order is cancelled/refunded later
CREATE OR REPLACE FUNCTION restore_stock(
  p_product_id UUID,
  p_quantity   INTEGER
)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE products
  SET
    stock_quantity = stock_quantity + p_quantity,
    sold_count     = GREATEST(sold_count - p_quantity, 0)
  WHERE id = p_product_id;
END;
$$;
