-- Re-shipping a cancelled order fails because Shiprocket dedupes ad-hoc orders by
-- their channel `order_id` (which we set to our order_number). Once an order has
-- been pushed and then cancelled on Shiprocket, pushing the same order_number
-- again just returns the OLD, cancelled shipment — so AWB generation fails with
-- "AWB is already assigned … status CANCELLED".
--
-- Fix: track how many times an order has been pushed to Shiprocket. The first
-- push uses the plain order_number; every push after that appends "-R<n>", giving
-- Shiprocket a fresh, unique channel id so it creates a brand-new shipment.

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS shiprocket_attempt INTEGER NOT NULL DEFAULT 0;

-- Backfill: any order that already has a Shiprocket order has consumed its plain
-- order_number, so its next push must start at "-R1".
UPDATE orders
SET    shiprocket_attempt = 1
WHERE  shiprocket_order_id IS NOT NULL
  AND  shiprocket_attempt = 0;
