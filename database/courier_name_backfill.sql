-- Backfill: orders that shipped with a real courier but stored no courier_name.
--
-- SYMPTOM: the Delivery & Couriers tab showed 50 RTO while RTO & Returns showed
-- 51. The Delivery tab can only attribute a parcel to a partner if courier_name
-- is set; one returned order had none, so it was counted by RTO & Returns and
-- not by Delivery.
--
-- CAUSE (fixed in code): generateAWB() in src/lib/shiprocket/index.ts throws
-- when Shiprocket's AWB response has no awb_code, but happily returns
-- courier_name = null. fulfillShiprocket() then wrote that null straight to the
-- order, so the parcel shipped, delivered/RTO'd and settled while belonging to
-- no courier. A fallback lookup now fills the name from /orders/show when the
-- AWB response omits it, so this cannot recur.
--
-- The two names below are NOT guessed from the AWB prefix — they were read back
-- from Shiprocket's own /orders/show endpoint on 2026-09-04, and the AWB stored
-- here matched Shiprocket's exactly in both cases:
--   BD20260724-1203  sr_order 1474230894  AWB 14112364072343  → Xpressbees Surface       (RTO DELIVERED)
--   BD20260814-1407  sr_order 1517085378  AWB 14326580275520  → Xpressbees Surface 10kg  (DELIVERED)
--
-- NOTE: you do not strictly need this SQL. Opening either order in the admin
-- panel and pressing "Sync from Shiprocket" does the same thing, from the same
-- source. This file is here for the record and for bulk use.

-- ── 1. Review — every order with an AWB but no courier name ────────────────
SELECT order_number, status, tracking_number, shiprocket_order_id, total_amount
FROM   orders
WHERE  courier_name IS NULL
  AND  tracking_number IS NOT NULL
ORDER  BY placed_at;

-- ── 2. Audit trail before changing anything ───────────────────────────────
INSERT INTO order_status_history (order_id, status, note)
SELECT id, status,
       'Courier name backfilled to ' ||
       CASE order_number
         WHEN 'BD20260724-1203' THEN 'Xpressbees Surface'
         WHEN 'BD20260814-1407' THEN 'Xpressbees Surface 10kg'
       END ||
       ' from Shiprocket /orders/show — AWB was assigned without a courier name.'
FROM   orders
WHERE  order_number IN ('BD20260724-1203', 'BD20260814-1407')
  AND  courier_name IS NULL;

-- ── 3. Set the names ──────────────────────────────────────────────────────
UPDATE orders SET courier_name = 'Xpressbees Surface',      updated_at = now()
WHERE  order_number = 'BD20260724-1203' AND courier_name IS NULL;

UPDATE orders SET courier_name = 'Xpressbees Surface 10kg', updated_at = now()
WHERE  order_number = 'BD20260814-1407' AND courier_name IS NULL;

-- ── 4. Confirm ────────────────────────────────────────────────────────────
SELECT count(*) AS awb_without_courier
FROM   orders
WHERE  courier_name IS NULL AND tracking_number IS NOT NULL;
-- expected: 0
--
-- After this, Delivery & Couriers RTO === RTO & Returns count (51 = 51).
