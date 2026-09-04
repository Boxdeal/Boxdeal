-- Backfill: delivered COD orders that were never marked paid.
--
-- CAUSE (fixed in code, see src/lib/orders/fulfillment.ts → collectCodOnDelivery):
-- three paths marked an order "delivered" — the Shiprocket webhook, the "Sync
-- from Shiprocket" action, and an admin changing the status by hand — but only
-- the first two also flipped a COD order's payment_status to "paid". So every
-- order delivered BY HAND kept payment_status "pending" forever, and its cash
-- never appeared in Money Collected or in the courier's COD total.
--
-- Verified on 2026-09-04 against 99 delivered COD orders:
--   96 marked delivered by the webhook  → 0 unpaid
--    3 marked delivered by an admin     → 3 unpaid   (₹20,735)
--
-- ⚠ ONLY RUN THIS FOR ORDERS WHOSE CASH YOU ACTUALLY RECEIVED. Marking an order
-- paid asserts the courier collected and remitted the money. If the cash never
-- came in, the order is not "paid" — leave it, or reconcile it separately.

-- ── 1. Review first — this is the exact set the UPDATE will touch ───────────
SELECT order_number, total_amount, courier_name, tracking_number,
       payment_status, delivered_at
FROM   orders
WHERE  payment_method = 'cod'
  AND  status         = 'delivered'
  AND  payment_status <> 'paid'
ORDER  BY delivered_at;

-- Expected (as of 2026-09-04):
--   BD20260703-1174   ₹4,950    Delhivery Surface 20kg   AWB 4867524861066
--   BD20260806-1221   ₹15,198   Delhivery Surface 20kg   AWB 4867524978106
--   BD20260702-1163   ₹587      Xpressbees Surface       AWB 14112363458052

-- ── 2. Leave an audit trail BEFORE changing the money ──────────────────────
INSERT INTO order_status_history (order_id, status, note)
SELECT id, status,
       'COD marked paid by backfill — order was delivered by hand, before the '
       'manual status path collected COD (fixed in collectCodOnDelivery).'
FROM   orders
WHERE  payment_method = 'cod'
  AND  status         = 'delivered'
  AND  payment_status <> 'paid';

-- ── 3. Collect the cash ────────────────────────────────────────────────────
UPDATE orders
SET    payment_status = 'paid',
       updated_at     = now()
WHERE  payment_method = 'cod'
  AND  status         = 'delivered'
  AND  payment_status <> 'paid';

-- ── 4. Confirm nothing is left ─────────────────────────────────────────────
SELECT count(*) AS still_unpaid
FROM   orders
WHERE  payment_method = 'cod' AND status = 'delivered' AND payment_status <> 'paid';
-- expected: 0
