-- Lets an admin apply an EXTRA discount on an order's total from the admin panel
-- (on top of any coupon discount). The amount is folded into the Shiprocket
-- total_discount at pack time, so the courier collects less (COD) and the
-- Shiprocket invoice shows the discount.
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS admin_discount NUMERIC NOT NULL DEFAULT 0;
