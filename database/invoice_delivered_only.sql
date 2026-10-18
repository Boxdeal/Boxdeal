-- ============================================================
-- No delivery, no invoice. Run once in the Supabase SQL editor, BEFORE
-- deploying the matching code (the statement reads voided_invoices).
-- Safe to re-run.
--
-- Two invoices were minted for parcels that never reached the customer:
--   INV00213 — BD20260928-1835, cancelled. Minted 1 Oct by an admin download
--              while "packed" (the old packed-onwards rule, removed 4 Oct).
--   INV00215 — BD20260913-1721, RTO. Minted 5 Oct: the download check allowed
--              status "returned", and RTOs carry that status too.
--
-- A GST invoice number that was issued can't just vanish, so each void is
-- kept in voided_invoices (the GSTR-1 "documents issued — cancelled" count),
-- and the order's own invoice_number is cleared. That keeps
-- orders.invoice_number meaning exactly one thing — a live invoice — and lets
-- the order get a fresh number if it is ever re-shipped and delivered.
-- ============================================================

-- ── 1. Register of voided invoice numbers ───────────────────
CREATE TABLE IF NOT EXISTS voided_invoices (
  invoice_number TEXT PRIMARY KEY,
  order_id       UUID NOT NULL REFERENCES orders(id),
  order_number   TEXT NOT NULL,
  invoice_date   TIMESTAMPTZ NOT NULL,
  voided_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reason         TEXT NOT NULL
);

ALTER TABLE voided_invoices ENABLE ROW LEVEL SECURITY;
-- Server-only: no policies, so anon/authenticated see nothing.
GRANT SELECT, INSERT, UPDATE, DELETE ON voided_invoices TO service_role;

-- ── 2. Void every invoice on an order that was never delivered ──
BEGIN;

INSERT INTO voided_invoices (invoice_number, order_id, order_number, invoice_date, reason)
SELECT o.invoice_number, o.id, o.order_number, o.invoice_date,
       CASE WHEN o.status = 'cancelled'
            THEN 'Order cancelled before delivery'
            ELSE 'RTO — parcel never delivered' END
  FROM orders o
 WHERE o.invoice_number IS NOT NULL
   AND o.delivered_at IS NULL
ON CONFLICT (invoice_number) DO NOTHING;

UPDATE orders
   SET invoice_number = NULL, invoice_date = NULL
 WHERE invoice_number IS NOT NULL
   AND delivered_at IS NULL;

COMMIT;

-- ── 3. Download route: refuse anything not delivered ────────
CREATE OR REPLACE FUNCTION issue_invoice_number(p_order_id UUID)
RETURNS TABLE (out_number TEXT, out_date TIMESTAMPTZ)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_existing     TEXT;
  v_delivered_at TIMESTAMPTZ;
BEGIN
  SELECT o.invoice_number, o.delivered_at INTO v_existing, v_delivered_at
    FROM orders o WHERE o.id = p_order_id;

  -- The UI and the route check this too; this is the last line of defence.
  IF v_delivered_at IS NULL THEN
    RAISE EXCEPTION 'Order % has not been delivered — no invoice', p_order_id;
  END IF;

  IF v_existing IS NULL THEN
    UPDATE orders o
    SET invoice_number = 'INV' || LPAD(nextval('invoice_seq')::TEXT, 5, '0'),
        invoice_date   = CASE WHEN o.payment_method <> 'cod' THEN o.placed_at ELSE o.delivered_at END
    WHERE o.id = p_order_id
      AND o.invoice_number IS NULL;
  END IF;

  RETURN QUERY
    SELECT o.invoice_number, o.invoice_date FROM orders o WHERE o.id = p_order_id;
END;
$$;

REVOKE ALL ON FUNCTION issue_invoice_number(UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION issue_invoice_number(UUID) TO service_role;

-- ── 4. Delivery trigger: also stamp delivered_at ────────────
-- Everything above keys on delivered_at, so a delivery that arrives without
-- one (a manual SQL fix, say) must still get it, or its invoice would be
-- un-downloadable.
CREATE OR REPLACE FUNCTION issue_invoice_on_delivery()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'delivered' THEN
    NEW.delivered_at := COALESCE(NEW.delivered_at, NOW());
    IF NEW.invoice_number IS NULL THEN
      NEW.invoice_number := 'INV' || LPAD(nextval('invoice_seq')::TEXT, 5, '0');
      NEW.invoice_date := CASE
        WHEN NEW.payment_method <> 'cod' THEN NEW.placed_at
        ELSE NEW.delivered_at
      END;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- ── Check ───────────────────────────────────────────────────
-- Expect INV00213 and INV00215, and zero rows from the second query.
SELECT * FROM voided_invoices ORDER BY invoice_number;
SELECT order_number, status FROM orders WHERE invoice_number IS NOT NULL AND delivered_at IS NULL;


