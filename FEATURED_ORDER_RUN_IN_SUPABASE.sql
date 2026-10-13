-- Admin-controlled order for the homepage "Featured Products" and "Deal of the Day"
-- sections (set from /admin/featured). 1 = shown first; NULL = not ordered yet,
-- falls back to best sellers (featured) / newest (deals).
ALTER TABLE products ADD COLUMN IF NOT EXISTS featured_position integer;
ALTER TABLE products ADD COLUMN IF NOT EXISTS deal_position integer;
