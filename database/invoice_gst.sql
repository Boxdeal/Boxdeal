-- ============================================================
-- GST tax invoice support.
-- Safe to run multiple times (idempotent). Run once in the Supabase SQL editor.
--
-- Invoices are NEVER stored as files: the PDF is rendered on demand from the
-- order. The only thing that must be persisted is the invoice NUMBER, because
-- a GST invoice number is issued once and can never change or repeat — so it
-- lives on the order itself (two columns, no extra table).
-- ============================================================

-- HSN code per product. Printed on the invoice line; required on a GST invoice.
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS hsn_code TEXT;

-- Snapshot of the product's HSN at order time. A later catalog edit must not
-- rewrite the HSN on an invoice that was already issued.
ALTER TABLE order_items
  ADD COLUMN IF NOT EXISTS hsn_code TEXT;

-- The issued invoice identity. NULL until the invoice is first generated.
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS invoice_number TEXT,
  ADD COLUMN IF NOT EXISTS invoice_date   TIMESTAMPTZ;

-- One number, one order. A partial index so the many NULLs don't collide.
CREATE UNIQUE INDEX IF NOT EXISTS orders_invoice_number_key
  ON orders (invoice_number)
  WHERE invoice_number IS NOT NULL;

-- A fresh series for invoices raised by this system: INV00001 upwards. The old
-- Shiprocket-generated "Retail…" numbers are a separate, closed series — the
-- different prefix keeps the two from ever being confused in the books.
CREATE SEQUENCE IF NOT EXISTS invoice_seq START 1;

-- ── Re-run safety ───────────────────────────────────────────
-- An earlier draft of this file issued "Retail…" numbers from a sequence that
-- started at 647. If that version was already applied, the three statements
-- below bring the database onto the final scheme; on a first run they are all
-- harmless no-ops.
--
-- 1. The old function returned columns named invoice_number/invoice_date.
--    CREATE OR REPLACE cannot change a function's return type, so the old one
--    has to go before the new one can be created.
DROP FUNCTION IF EXISTS issue_invoice_number(UUID);

-- 2. CREATE SEQUENCE above is a no-op if the sequence already exists, so an
--    already-advanced counter would carry on from 648 instead of restarting.
--    Wind it back so the first invoice really is INV00001.
SELECT setval('invoice_seq', 1, false);

-- 3. Clear the "Retail…" numbers minted while testing. Every value in this
--    column was created by that earlier draft — the column itself is new, and
--    the genuine historical Shiprocket invoices never lived here — so these
--    are test rows only, and clearing them lets those orders take a proper INV
--    number the next time someone downloads them. Rows whose number already
--    starts with INV are left untouched.
UPDATE orders
SET invoice_number = NULL,
    invoice_date   = NULL
WHERE invoice_number LIKE 'Retail%';

-- Issue (or return the already-issued) invoice number for an order.
--
-- Atomic and idempotent: the UPDATE only matches while invoice_number IS NULL,
-- so two concurrent downloads can never mint two numbers for one order — the
-- loser's UPDATE matches no row and it reads back the winner's number. The
-- sequence may skip a value in that race, which is fine (gaps are allowed;
-- duplicates are not).
--
-- The OUT parameters are deliberately NOT named invoice_number/invoice_date:
-- identically-named plpgsql variables would shadow the orders columns inside
-- the function body.
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
        invoice_date   = NOW()
    WHERE o.id = p_order_id
      AND o.invoice_number IS NULL;
  END IF;

  RETURN QUERY
    SELECT o.invoice_number, o.invoice_date FROM orders o WHERE o.id = p_order_id;
END;
$$;

-- SECURITY DEFINER means this runs as the owner, so it must not be reachable
-- from the browser: a logged-in customer could otherwise mint invoice numbers
-- against other people's orders. Only the server (service_role) may call it —
-- the invoice API already authorises the caller before it does.
REVOKE ALL ON FUNCTION issue_invoice_number(UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION issue_invoice_number(UUID) TO service_role;
