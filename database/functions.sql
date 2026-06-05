-- ============================================================
-- BoxDeal Database Functions
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- Decrement stock atomically when order is placed
-- ────────────────────────────────────────────────────────────
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

-- ────────────────────────────────────────────────────────────
-- Restore stock when order is cancelled
-- ────────────────────────────────────────────────────────────
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

-- ────────────────────────────────────────────────────────────
-- Recalculate product rating after a review is approved/added
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION recalculate_product_rating(p_product_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_avg    NUMERIC(3, 2);
  v_count  INTEGER;
BEGIN
  SELECT
    COALESCE(ROUND(AVG(rating)::NUMERIC, 2), 0),
    COUNT(*)
  INTO v_avg, v_count
  FROM reviews
  WHERE product_id = p_product_id AND is_approved = true;

  UPDATE products
  SET rating = v_avg, review_count = v_count
  WHERE id = p_product_id;
END;
$$;

-- Trigger to recalculate rating when a review changes
CREATE OR REPLACE FUNCTION trig_review_rating_fn()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  PERFORM recalculate_product_rating(COALESCE(NEW.product_id, OLD.product_id));
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER trig_review_rating
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW EXECUTE FUNCTION trig_review_rating_fn();

-- ────────────────────────────────────────────────────────────
-- Generate human-readable order number
-- ────────────────────────────────────────────────────────────
CREATE SEQUENCE order_seq START 1000;

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

-- ────────────────────────────────────────────────────────────
-- Admin dashboard stats (called from API)
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS JSON LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_result JSON;
BEGIN
  SELECT json_build_object(
    'today_orders',       (SELECT COUNT(*) FROM orders WHERE placed_at::DATE = CURRENT_DATE),
    'today_revenue',      (SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE placed_at::DATE = CURRENT_DATE AND payment_status = 'paid'),
    'pending_orders',     (SELECT COUNT(*) FROM orders WHERE status IN ('placed', 'confirmed')),
    'overdue_packing',    (SELECT COUNT(*) FROM orders WHERE status = 'placed' AND pack_deadline < NOW()),
    'low_stock_products', (SELECT COUNT(*) FROM products WHERE stock_quantity <= low_stock_threshold AND is_active = true),
    'total_customers',    (SELECT COUNT(*) FROM user_profiles WHERE is_admin = false),
    'month_revenue',      (SELECT COALESCE(SUM(total_amount), 0) FROM orders
                            WHERE DATE_TRUNC('month', placed_at) = DATE_TRUNC('month', NOW())
                              AND payment_status = 'paid'),
    'month_orders',       (SELECT COUNT(*) FROM orders
                            WHERE DATE_TRUNC('month', placed_at) = DATE_TRUNC('month', NOW()))
  ) INTO v_result;

  RETURN v_result;
END;
$$;

-- ────────────────────────────────────────────────────────────
-- Revenue chart data (last 30 days)
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION get_revenue_chart(p_days INTEGER DEFAULT 30)
RETURNS TABLE (date DATE, revenue NUMERIC, orders BIGINT)
LANGUAGE sql SECURITY DEFINER AS $$
  SELECT
    d.date::DATE,
    COALESCE(SUM(o.total_amount), 0)   AS revenue,
    COALESCE(COUNT(o.id), 0)           AS orders
  FROM generate_series(
    CURRENT_DATE - (p_days - 1),
    CURRENT_DATE,
    '1 day'::INTERVAL
  ) AS d(date)
  LEFT JOIN orders o
    ON o.placed_at::DATE = d.date::DATE
    AND o.payment_status = 'paid'
  GROUP BY d.date
  ORDER BY d.date;
$$;

-- ────────────────────────────────────────────────────────────
-- Top selling products
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION get_top_products(p_limit INTEGER DEFAULT 10)
RETURNS TABLE (
  product_id   UUID,
  product_name TEXT,
  sold_count   INTEGER,
  revenue      NUMERIC,
  rating       NUMERIC
)
LANGUAGE sql SECURITY DEFINER AS $$
  SELECT
    p.id,
    p.name,
    p.sold_count,
    COALESCE(SUM(oi.total_price), 0) AS revenue,
    p.rating
  FROM products p
  LEFT JOIN order_items oi ON oi.product_id = p.id
  LEFT JOIN orders o ON o.id = oi.order_id AND o.payment_status = 'paid'
  GROUP BY p.id, p.name, p.sold_count, p.rating
  ORDER BY p.sold_count DESC
  LIMIT p_limit;
$$;

-- ────────────────────────────────────────────────────────────
-- Validate and apply coupon
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION validate_coupon(
  p_code        TEXT,
  p_order_total NUMERIC
)
RETURNS JSON LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_coupon  coupons%ROWTYPE;
  v_discount NUMERIC := 0;
BEGIN
  SELECT * INTO v_coupon FROM coupons
  WHERE code = UPPER(p_code)
    AND is_active = true
    AND (expires_at IS NULL OR expires_at > NOW())
    AND (usage_limit IS NULL OR used_count < usage_limit);

  IF NOT FOUND THEN
    RETURN json_build_object('valid', false, 'message', 'Invalid or expired coupon');
  END IF;

  IF p_order_total < v_coupon.min_order_amount THEN
    RETURN json_build_object(
      'valid', false,
      'message', 'Minimum order amount of ₹' || v_coupon.min_order_amount || ' required'
    );
  END IF;

  IF v_coupon.discount_type = 'percentage' THEN
    v_discount := ROUND((p_order_total * v_coupon.discount_value / 100), 2);
    IF v_coupon.max_discount IS NOT NULL THEN
      v_discount := LEAST(v_discount, v_coupon.max_discount);
    END IF;
  ELSE
    v_discount := v_coupon.discount_value;
  END IF;

  RETURN json_build_object(
    'valid',          true,
    'discount',       v_discount,
    'discount_type',  v_coupon.discount_type,
    'discount_value', v_coupon.discount_value,
    'coupon_id',      v_coupon.id
  );
END;
$$;
