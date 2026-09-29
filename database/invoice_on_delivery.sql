-- ============================================================
-- Issue the invoice number at DELIVERY, and backfill past sales.
-- Run once in the Supabase SQL editor. Safe to re-run.
--
-- Until now a number was minted lazily, on the first download. Orders nobody
-- downloaded had no invoice at all — in September only 7 of 208 delivered
-- sales carried one — so the monthly statement under-reported GST by an order
-- of magnitude. GST is owed on every supply, downloaded or not.
--
-- The fix is a database trigger rather than code in the status-update route,
-- because an order can reach "delivered" from three directions: the admin
-- panel, the Shiprocket webhook, and a manual correction in SQL. A trigger
-- catches all three; a change in one route would quietly miss the others.
-- ============================================================

-- ── 1. Backfill, before the trigger exists ──────────────────
--
-- Deliberately ordered first: the trigger below re-mints a number the moment
-- invoice_number goes NULL on a delivered row, which would fight step 1a.
--
-- WHY RENUMBER EVERYTHING: the seven numbers issued so far were minted in
-- download order, and all seven are late-September deliveries. Backfilling
-- July and August sales after them would leave the series reading
-- INV00001 = 25 Sep, INV00008 = 2 Jul. Rule 46 wants a consecutive serial;
-- a book that jumps backwards three months is not one. These seven were test
-- downloads made over the last three days and were never sent to anyone, so
-- they are safe to re-cut in date order.
BEGIN;

-- 1a. Clear the slate so no two rows can momentarily hold the same number
--     while step 1b assigns the new ones.
UPDATE orders
SET invoice_number = NULL,
    invoice_date   = NULL
WHERE invoice_number IS NOT NULL;

-- 1b. One invoice per delivered sale, numbered in the order the goods
--     actually reached customers.
--
--     `delivered_at IS NOT NULL` is the test for "a supply happened", not the
--     status: a customer return WAS delivered first, so its invoice stands (a
--     credit note handles the return separately), while an RTO never reached
--     the customer at all — no supply, no invoice, no GST. That distinction
--     matters here: 97 of the returned orders are RTO.
WITH ordered AS (
  SELECT id,
         delivered_at,
         ROW_NUMBER() OVER (ORDER BY delivered_at, order_number) AS rn
    FROM orders
   WHERE delivered_at IS NOT NULL
     AND status IN ('delivered', 'returned')
)
UPDATE orders o
SET invoice_number = 'INV' || LPAD(ordered.rn::TEXT, 5, '0'),
    invoice_date   = ordered.delivered_at
FROM ordered
WHERE o.id = ordered.id;

-- 1c. Park the counter just past the highest number now in use, read back from
--     the table so this stays correct however many rows were backfilled.
SELECT setval('invoice_seq', GREATEST(
  (SELECT COALESCE(MAX(SUBSTRING(invoice_number FROM 4)::INT), 0)
     FROM orders
    WHERE invoice_number ~ '^INV[0-9]+$'),
  1
), true);

COMMIT;

-- ── 2. From now on, delivery issues the invoice ─────────────
--
-- BEFORE trigger on purpose: it edits the row on its way into the table, so
-- there is no second UPDATE and no risk of the trigger firing itself again.
-- The IS NULL guard makes it idempotent — an order that was already invoiced
-- at dispatch (an admin can pull the printed copy from "packed") keeps the
-- number it was given.
CREATE OR REPLACE FUNCTION issue_invoice_on_delivery()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'delivered' AND NEW.invoice_number IS NULL THEN
    NEW.invoice_number := 'INV' || LPAD(nextval('invoice_seq')::TEXT, 5, '0');
    -- delivered_at is set in the same statement by both the admin route and
    -- the Shiprocket webhook; NOW() is the belt-and-braces fallback so a
    -- missing timestamp can never leave a real sale uninvoiced.
    NEW.invoice_date := COALESCE(NEW.delivered_at, NOW());
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS orders_issue_invoice ON orders;
CREATE TRIGGER orders_issue_invoice
BEFORE INSERT OR UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION issue_invoice_on_delivery();
