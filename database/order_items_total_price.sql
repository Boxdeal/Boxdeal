-- ============================================================
-- Backfill order_items.total_price. Run once in the Supabase SQL editor.
-- Safe to re-run.
--
-- Neither checkout route (COD, online) ever wrote total_price, so every line
-- sat on the column default of 0 — the admin order page, the customer's order
-- page and the order e-mails all showed ₹0 per line. Invoices and the monthly
-- statement were unaffected: they compute selling_price × quantity.
-- The routes now write it; this fills in the past.
-- ============================================================

UPDATE order_items
   SET total_price = selling_price * quantity
 WHERE total_price IS NULL OR total_price = 0;

-- Check: expect 0.
SELECT COUNT(*) AS still_zero FROM order_items WHERE total_price IS NULL OR total_price = 0;
