-- ─────────────────────────────────────────────────────────────────
-- Trigram GIN indexes for the advanced header autocomplete.
--
-- The /api/search/suggest endpoint matches with ILIKE '%term%'
-- (substring, leading wildcard). B-tree indexes can't serve that, so
-- without these every keystroke triggers a sequential scan. pg_trgm
-- (already enabled in schema.sql) lets a GIN trigram index satisfy
-- ILIKE substring matches.
--
-- Idempotent: safe to run multiple times.
-- Runs as-is in the Supabase SQL Editor (which wraps statements in a
-- transaction). On a large live DB you can instead add CONCURRENTLY to
-- each CREATE INDEX and run them one at a time outside a transaction to
-- avoid locking writes — but then it cannot run in the SQL Editor.
-- ─────────────────────────────────────────────────────────────────

CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Products: searched on name, slug and short_description
CREATE INDEX IF NOT EXISTS idx_products_name_trgm
  ON products USING GIN (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_products_slug_trgm
  ON products USING GIN (slug gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_products_sdesc_trgm
  ON products USING GIN (short_description gin_trgm_ops);

-- Categories / Subcategories / Brands: searched on name
CREATE INDEX IF NOT EXISTS idx_categories_name_trgm
  ON categories USING GIN (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_subcategories_name_trgm
  ON subcategories USING GIN (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_brands_name_trgm
  ON brands USING GIN (name gin_trgm_ops);
