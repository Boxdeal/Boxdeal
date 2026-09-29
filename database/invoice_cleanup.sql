-- ============================================================
-- Invoice series cleanup + HSN snapshot backfill.
-- Run once in the Supabase SQL editor. Safe to re-run.
-- ============================================================

-- ── 1. Repair the one out-of-sequence invoice number ────────
--
-- Order BD20260920-1790 was invoiced at 11:04 on 27 Sep, while the counter
-- was still sitting at 648 from the very first draft of the migration. It
-- came out as INV00648; every invoice issued after the counter was reset
-- runs INV00001…INV00004. That leaves the series reading 1, 2, 3, 4, 648 —
-- 643 numbers that were never issued, and the earliest invoice carrying the
-- highest number. Rule 46 wants a consecutive serial, so it is renumbered
-- into the slot it should have had.
--
-- Wrapped in a transaction with the setval below: between the two statements
-- the counter would hand INV00005 to the next download and collide.
BEGIN;

UPDATE orders
SET invoice_number = 'INV00005'
WHERE invoice_number = 'INV00648'
  AND NOT EXISTS (SELECT 1 FROM orders o2 WHERE o2.invoice_number = 'INV00005');

-- Park the counter just past the highest number actually in use, derived from
-- the table rather than hard-coded, so this is correct however many invoices
-- exist by the time it runs.
SELECT setval('invoice_seq', GREATEST(
  (SELECT COALESCE(MAX(SUBSTRING(invoice_number FROM 4)::INT), 0)
     FROM orders
    WHERE invoice_number ~ '^INV[0-9]+$'),
  1
), true);

COMMIT;

-- ── 2. Freeze HSN onto already-placed order items ───────────
--
-- order_items.hsn_code only fills in for orders placed after the column was
-- added, so every existing order has NULL there. The invoice still prints the
-- right code today because it falls back to the product's current HSN — but
-- that means correcting a product's HSN tomorrow would silently rewrite an
-- invoice that was already issued. Copying the code down now pins each past
-- order to what it was actually billed at.
UPDATE order_items oi
SET hsn_code = p.hsn_code
FROM products p
WHERE p.id = oi.product_id
  AND oi.hsn_code IS NULL
  AND p.hsn_code IS NOT NULL;
