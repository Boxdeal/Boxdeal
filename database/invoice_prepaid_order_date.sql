-- ============================================================
-- Online (prepaid) invoices are dated the day the ORDER was placed.
-- Run once in the Supabase SQL editor, after invoice_on_delivery.sql.
-- Safe to re-run.
--
-- A prepaid order's money arrives at checkout, so the business counts that
-- sale in the month it was paid — the monthly statement already does. Until
-- now its invoice was dated on delivery, so an order paid on 30 Aug and
-- delivered on 3 Sep landed in August's sales but September's GST. Dating the
-- invoice on the order day puts both in the same month.
--
-- COD is unchanged: the cash only exists once the parcel lands, so its invoice
-- stays dated on delivery. The number is still issued at delivery for both —
-- a prepaid order that is cancelled or comes back as RTO never gets one.
-- ============================================================

-- ── 1. Re-date and renumber past invoices ───────────────────
--
-- Re-dating alone would leave the series out of order (INV00126 dated 14 Aug
-- sitting between September invoices), so every number is re-cut in
-- invoice-date order, exactly as invoice_on_delivery.sql did on 29 Sep.
--
-- Numbers are parked on a TMP prefix rather than cleared: the delivery trigger
-- re-mints any delivered row whose invoice_number goes NULL, which would fight
-- the renumbering.
BEGIN;

UPDATE orders
SET invoice_date = placed_at
WHERE invoice_number IS NOT NULL
  AND payment_method <> 'cod';

UPDATE orders
SET invoice_number = 'TMP' || invoice_number
WHERE invoice_number ~ '^INV[0-9]+$';

WITH ordered AS (
  SELECT id,
         ROW_NUMBER() OVER (ORDER BY invoice_date, order_number) AS rn
    FROM orders
   WHERE invoice_number LIKE 'TMPINV%'
)
UPDATE orders o
SET invoice_number = 'INV' || LPAD(ordered.rn::TEXT, 5, '0')
FROM ordered
WHERE o.id = ordered.id;

SELECT setval('invoice_seq', GREATEST(
  (SELECT COALESCE(MAX(SUBSTRING(invoice_number FROM 4)::INT), 0)
     FROM orders
    WHERE invoice_number ~ '^INV[0-9]+$'),
  1
), true);

COMMIT;

-- ── 2. Delivery trigger: prepaid dated on the order day ─────
CREATE OR REPLACE FUNCTION issue_invoice_on_delivery()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'delivered' AND NEW.invoice_number IS NULL THEN
    NEW.invoice_number := 'INV' || LPAD(nextval('invoice_seq')::TEXT, 5, '0');
    NEW.invoice_date := CASE
      WHEN NEW.payment_method <> 'cod' THEN NEW.placed_at
      ELSE COALESCE(NEW.delivered_at, NOW())
    END;
  END IF;
  RETURN NEW;
END;
$$;

-- ── 3. Early issue (admin download from "packed"): same dating rule ──
CREATE OR REPLACE FUNCTION issue_invoice_number(p_order_id UUID)
RETURNS TABLE (out_number TEXT, out_date TIMESTAMPTZ)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_existing TEXT;
BEGIN
  SELECT o.invoice_number INTO v_existing FROM orders o WHERE o.id = p_order_id;

  IF v_existing IS NULL THEN
    UPDATE orders o
    SET invoice_number = 'INV' || LPAD(nextval('invoice_seq')::TEXT, 5, '0'),
        invoice_date   = CASE WHEN o.payment_method <> 'cod' THEN o.placed_at ELSE NOW() END
    WHERE o.id = p_order_id
      AND o.invoice_number IS NULL;
  END IF;

  RETURN QUERY
    SELECT o.invoice_number, o.invoice_date FROM orders o WHERE o.id = p_order_id;
END;
$$;

REVOKE ALL ON FUNCTION issue_invoice_number(UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION issue_invoice_number(UUID) TO service_role;
