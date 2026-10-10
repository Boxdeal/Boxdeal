-- ============================================================
-- BoxDeal Database — single schema file
-- PostgreSQL via Supabase
--
-- Mirrors the LIVE database as checked on 2026-10-10.
--
-- PART 1 (tables, columns, types, defaults, NOT NULL, primary and
-- foreign keys) and the list of callable functions in PART 2 were read
-- straight from the live Supabase API, so they are what is really there.
--
-- The API cannot show CHECK / UNIQUE constraints, indexes, triggers,
-- RLS policies or function bodies. Those parts come from the June 2026
-- introspection plus the migrations run since, and are marked
-- "not visible through the API" below. Confirm them in the Supabase
-- dashboard before relying on them for a migration.
--
-- One-time data work (seed/product data, HSN codes, backfills, invoice
-- renumbering) is not kept here; it is in git history.
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================
-- PART 1: TABLES  (15 tables — verified against the live DB)
--
-- Every status-like column is plain TEXT with a CHECK, not an enum.
-- The CHECK and UNIQUE clauses are not visible through the API.
-- ============================================================

CREATE TABLE public.categories (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        text NOT NULL,
  slug        text NOT NULL UNIQUE,
  image_url   text,
  description text,
  is_active   boolean DEFAULT true,
  sort_order  integer DEFAULT 0,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

CREATE TABLE public.subcategories (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id uuid NOT NULL REFERENCES public.categories (id),
  name        text NOT NULL,
  slug        text NOT NULL UNIQUE,
  image_url   text,
  is_active   boolean DEFAULT true,
  sort_order  integer DEFAULT 0,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

CREATE TABLE public.brands (
  id         uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       text NOT NULL,
  slug       text NOT NULL UNIQUE,
  logo_url   text,
  is_active  boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE public.products (
  id                  uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name                text NOT NULL,
  slug                text NOT NULL UNIQUE,
  description         text,
  short_description   text,
  sku                 text NOT NULL UNIQUE,
  category_id         uuid NOT NULL REFERENCES public.categories (id),
  subcategory_id      uuid REFERENCES public.subcategories (id),
  brand_id            uuid REFERENCES public.brands (id),
  mrp                 numeric NOT NULL CHECK (mrp > 0),
  selling_price       numeric NOT NULL,
  -- A plain column, NOT generated: product inserts must supply it.
  discount_percent    numeric DEFAULT 0,
  stock_quantity      integer DEFAULT 0 CHECK (stock_quantity >= 0),
  low_stock_threshold integer DEFAULT 5,
  -- Shipping (dead) weight and box size: product + retail box + padding.
  weight_grams        integer DEFAULT 0,
  is_active           boolean DEFAULT true,
  is_featured         boolean DEFAULT false,
  is_deal_of_day      boolean DEFAULT false,
  rating              numeric DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  review_count        integer DEFAULT 0,
  sold_count          integer DEFAULT 0,
  meta_title          text,
  meta_description    text,
  created_at          timestamptz DEFAULT now(),
  updated_at          timestamptz DEFAULT now(),
  length_cm           numeric DEFAULT 0,
  breadth_cm          numeric DEFAULT 0,
  height_cm           numeric DEFAULT 0,
  -- Follows stock_quantity > 0 on all 224 live rows, so it looks generated;
  -- the exact definition is not visible through the API. Never insert it.
  in_stock            boolean GENERATED ALWAYS AS (stock_quantity > 0) STORED,
  -- Printed on the GST invoice line.
  hsn_code            text
);

CREATE TABLE public.product_images (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id    uuid NOT NULL REFERENCES public.products (id),
  image_url     text NOT NULL,
  thumbnail_url text,
  is_primary    boolean DEFAULT false,
  sort_order    integer DEFAULT 0,
  created_at    timestamptz DEFAULT now()
);

CREATE TABLE public.product_specifications (
  id         uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id uuid NOT NULL REFERENCES public.products (id),
  spec_group text NOT NULL,
  spec_name  text NOT NULL,
  spec_value text NOT NULL,
  sort_order integer DEFAULT 0
);

CREATE TABLE public.user_profiles (
  id            uuid PRIMARY KEY REFERENCES auth.users (id),
  full_name     text,
  phone         text,
  avatar_url    text,
  date_of_birth date,
  gender        text CHECK (gender IN ('male', 'female', 'other')),
  is_admin      boolean DEFAULT false,
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

CREATE TABLE public.addresses (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       uuid NOT NULL REFERENCES auth.users (id),
  full_name     text NOT NULL,
  phone         text NOT NULL,
  address_line1 text NOT NULL,
  address_line2 text,
  city          text NOT NULL,
  state         text NOT NULL,
  pincode       text NOT NULL CHECK (pincode ~ '^\d{6}$'),
  is_default    boolean DEFAULT false,
  address_type  text DEFAULT 'home' CHECK (address_type IN ('home', 'work', 'other')),
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

CREATE TABLE public.orders (
  id                     uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number           text NOT NULL UNIQUE,
  user_id                uuid NOT NULL REFERENCES auth.users (id),
  shipping_full_name     text NOT NULL,
  shipping_phone         text NOT NULL,
  shipping_address1      text NOT NULL,
  shipping_address2      text,
  shipping_city          text NOT NULL,
  shipping_state         text NOT NULL,
  shipping_pincode       text NOT NULL,
  subtotal               numeric NOT NULL,
  discount_amount        numeric DEFAULT 0,
  shipping_charge        numeric DEFAULT 0,
  total_amount           numeric NOT NULL,
  coupon_code            text,
  payment_method         text DEFAULT 'razorpay'
                           CHECK (payment_method IN ('razorpay', 'upi', 'card', 'cod')),
  -- 'partial' is a leftover of the removed partial-COD feature; 4 cancelled
  -- orders still carry it, so the constraint has to keep allowing it.
  payment_status         text DEFAULT 'pending'
                           CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded', 'partial')),
  razorpay_order_id      text,
  razorpay_payment_id    text,
  razorpay_signature     text,
  -- Value list taken from the statuses present in live orders.
  status                 text DEFAULT 'placed'
                           CHECK (status IN ('placed', 'confirmed', 'packed', 'shipped',
                                             'out_for_delivery', 'delivered', 'cancelled', 'returned')),
  courier_name           text,
  tracking_number        text,
  tracking_url           text,
  shiprocket_order_id    text,
  notes                  text,
  placed_at              timestamptz DEFAULT now(),
  confirmed_at           timestamptz,
  packed_at              timestamptz,
  shipped_at             timestamptz,
  delivered_at           timestamptz,
  cancelled_at           timestamptz,
  pack_deadline          timestamptz,
  created_at             timestamptz DEFAULT now(),
  updated_at             timestamptz DEFAULT now(),
  shiprocket_shipment_id text,
  -- How many times the order has been pushed to Shiprocket. The first push
  -- uses the plain order_number; each later push appends "-R<n>", because
  -- Shiprocket dedupes by channel order_id and would otherwise hand back the
  -- old, cancelled shipment.
  shiprocket_attempt     integer NOT NULL DEFAULT 0,
  -- Extra discount applied by an admin on top of any coupon; folded into the
  -- Shiprocket total_discount at pack time.
  admin_discount         numeric NOT NULL DEFAULT 0,
  -- GST invoice identity. NULL until issued; see PART 3.
  invoice_number         text,
  invoice_date           timestamptz
);

CREATE TABLE public.order_items (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id      uuid NOT NULL REFERENCES public.orders (id),
  product_id    uuid NOT NULL REFERENCES public.products (id),
  product_name  text NOT NULL,
  product_image text,
  product_sku   text NOT NULL,
  quantity      integer NOT NULL CHECK (quantity > 0),
  mrp           numeric NOT NULL,
  selling_price numeric NOT NULL,
  total_price   numeric DEFAULT 0,
  -- Snapshot of the product's HSN at order time, so a later catalog edit
  -- cannot rewrite an invoice that was already issued.
  hsn_code      text
);

CREATE TABLE public.order_status_history (
  id         uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id   uuid NOT NULL REFERENCES public.orders (id),
  status     text NOT NULL,
  note       text,
  updated_by uuid REFERENCES auth.users (id),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.wishlists (
  user_id    uuid NOT NULL REFERENCES auth.users (id),
  product_id uuid NOT NULL REFERENCES public.products (id),
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, product_id)
);

CREATE TABLE public.reviews (
  id                   uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id           uuid NOT NULL REFERENCES public.products (id),
  user_id              uuid NOT NULL REFERENCES auth.users (id),
  order_id             uuid REFERENCES public.orders (id),
  rating               smallint NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title                text,
  body                 text,
  is_verified_purchase boolean DEFAULT false,
  is_approved          boolean DEFAULT false,
  created_at           timestamptz DEFAULT now(),
  updated_at           timestamptz DEFAULT now()
);

CREATE TABLE public.coupons (
  id               uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  code             text NOT NULL UNIQUE,
  discount_type    text NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value   numeric NOT NULL CHECK (discount_value > 0),
  min_order_amount numeric DEFAULT 0,
  max_discount     numeric,
  usage_limit      integer,
  used_count       integer DEFAULT 0,
  expires_at       timestamptz,
  is_active        boolean DEFAULT true,
  created_at       timestamptz DEFAULT now(),
  -- 'all' = anyone; 'first_order' = only customers with no paid order yet.
  eligibility      text NOT NULL DEFAULT 'all' CHECK (eligibility IN ('all', 'first_order'))
);

CREATE TABLE public.banners (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  badge       text,
  title       text NOT NULL,
  subtitle    text,
  cta_text    text DEFAULT 'Shop Now',
  cta_link    text DEFAULT '/products',
  image_url   text NOT NULL,
  text_theme  text DEFAULT 'dark' CHECK (text_theme IN ('dark', 'light')),
  sort_order  integer DEFAULT 0,
  is_active   boolean DEFAULT true,
  starts_at   timestamptz,
  ends_at     timestamptz,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now(),
  mid_heading text,
  banner_type text DEFAULT 'hero' CHECK (banner_type IN ('hero', 'promo', 'featured', 'deal_of_day'))
);

-- ============================================================
-- PART 2: FUNCTIONS THE APP CALLS
--
-- These five exist in the live DB and are the only ones the code calls
-- (.rpc). Bodies are from the repo — not visible through the API.
-- The older dashboard/coupon helpers (get_dashboard_stats,
-- get_revenue_chart, get_top_products, validate_coupon,
-- recalculate_product_rating, is_admin) do NOT exist in the live DB.
-- ============================================================

CREATE SEQUENCE IF NOT EXISTS order_seq START 1000;

-- BD20260616-1000 style order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT LANGUAGE plpgsql AS $$
DECLARE
  v_date TEXT;
  v_seq  TEXT;
BEGIN
  v_date := TO_CHAR(NOW(), 'YYYYMMDD');
  v_seq  := LPAD(nextval('order_seq')::TEXT, 4, '0');
  RETURN 'BD' || v_date || '-' || v_seq;
END;
$$;

-- Decrement stock atomically after a payment is confirmed
CREATE OR REPLACE FUNCTION decrement_stock(
  p_product_id UUID,
  p_quantity   INTEGER
)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE products
  SET
    stock_quantity = stock_quantity - p_quantity,
    sold_count     = sold_count + p_quantity
  WHERE id = p_product_id
    AND stock_quantity >= p_quantity;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Insufficient stock for product %', p_product_id;
  END IF;
END;
$$;

-- Restore stock if an order is cancelled/refunded later
CREATE OR REPLACE FUNCTION restore_stock(
  p_product_id UUID,
  p_quantity   INTEGER
)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE products
  SET
    stock_quantity = stock_quantity + p_quantity,
    sold_count     = GREATEST(sold_count - p_quantity, 0)
  WHERE id = p_product_id;
END;
$$;

-- Atomically consume one use of a coupon, but only while it is still under its
-- usage limit. Returns TRUE if a use was counted, FALSE if the coupon is
-- missing or already maxed out.
CREATE OR REPLACE FUNCTION increment_coupon_usage(p_code TEXT)
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_updated INTEGER;
BEGIN
  UPDATE coupons
  SET used_count = used_count + 1
  WHERE UPPER(code) = UPPER(p_code)
    AND (usage_limit IS NULL OR used_count < usage_limit);

  GET DIAGNOSTICS v_updated = ROW_COUNT;
  RETURN v_updated > 0;
END;
$$;

-- ============================================================
-- PART 3: GST TAX INVOICE
--
-- The PDF is rendered on demand from the order; only the invoice NUMBER is
-- stored (orders.invoice_number / invoice_date), because a GST invoice number
-- is issued once and never changes. It is issued at delivery by trigger.
-- Prepaid invoices are dated on the order day, COD on the delivery day.
-- Checked live: all 222 delivered orders carry an invoice number.
-- ============================================================

-- One number, one order. Partial index so the many NULLs don't collide.
CREATE UNIQUE INDEX IF NOT EXISTS orders_invoice_number_key
  ON orders (invoice_number)
  WHERE invoice_number IS NOT NULL;

-- INV00001 upwards. The old Shiprocket "Retail…" numbers are a separate,
-- closed series.
CREATE SEQUENCE IF NOT EXISTS invoice_seq START 1;

-- BEFORE trigger: edits the row on its way into the table, so every route to
-- "delivered" (admin panel, Shiprocket webhook, manual SQL) issues a number.
-- The IS NULL guard keeps a number that was already issued.
CREATE OR REPLACE FUNCTION issue_invoice_on_delivery()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'delivered' AND NEW.invoice_number IS NULL THEN
    NEW.invoice_number := 'INV' || LPAD(nextval('invoice_seq')::TEXT, 5, '0');
    NEW.invoice_date := CASE
      WHEN NEW.payment_method <> 'cod' THEN NEW.placed_at
      ELSE COALESCE(NEW.delivered_at, NOW())
    END;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS orders_issue_invoice ON orders;
CREATE TRIGGER orders_issue_invoice
BEFORE INSERT OR UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION issue_invoice_on_delivery();

-- Early issue (admin download from "packed"). Atomic and idempotent: the
-- UPDATE only matches while invoice_number IS NULL, so two concurrent
-- downloads can never mint two numbers for one order.
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
        invoice_date   = CASE WHEN o.payment_method <> 'cod' THEN o.placed_at ELSE NOW() END
    WHERE o.id = p_order_id
      AND o.invoice_number IS NULL;
  END IF;

  RETURN QUERY
    SELECT o.invoice_number, o.invoice_date FROM orders o WHERE o.id = p_order_id;
END;
$$;

-- ============================================================
-- PART 4: TRIGGERS AND INDEXES  (not visible through the API)
--
-- Taken from the repo. Evidence they are live: every one of the 826 orders
-- has pack_deadline set although the app never writes it, and all 1,693
-- signed-up users have a profile row.
-- ============================================================

-- pack_deadline = placed_at + 24h
CREATE OR REPLACE FUNCTION set_pack_deadline()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.pack_deadline := NEW.placed_at + INTERVAL '24 hours';
  RETURN NEW;
END;
$$;

CREATE TRIGGER trig_orders_pack_deadline
  BEFORE INSERT ON orders
  FOR EACH ROW EXECUTE FUNCTION set_pack_deadline();

-- Keep updated_at current
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trig_banners_updated_at       BEFORE UPDATE ON banners       FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trig_categories_updated_at    BEFORE UPDATE ON categories    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trig_subcategories_updated_at BEFORE UPDATE ON subcategories FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trig_brands_updated_at        BEFORE UPDATE ON brands        FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trig_products_updated_at      BEFORE UPDATE ON products      FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trig_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trig_addresses_updated_at     BEFORE UPDATE ON addresses     FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trig_orders_updated_at        BEFORE UPDATE ON orders        FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trig_reviews_updated_at       BEFORE UPDATE ON reviews       FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Auto-create a user_profiles row for every new auth user (email, phone OTP
-- and Google signups alike).
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, full_name, avatar_url, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
    NEW.phone
  )
  ON CONFLICT (id) DO NOTHING;  -- never block signup if a row already exists
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trig_on_auth_user_created ON auth.users;
CREATE TRIGGER trig_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Lookup indexes
CREATE INDEX IF NOT EXISTS idx_categories_active      ON categories (is_active, sort_order);
CREATE INDEX IF NOT EXISTS idx_subcategories_category ON subcategories (category_id);
CREATE INDEX IF NOT EXISTS idx_products_category      ON products (category_id);
CREATE INDEX IF NOT EXISTS idx_products_subcategory   ON products (subcategory_id);
CREATE INDEX IF NOT EXISTS idx_products_brand         ON products (brand_id);
CREATE INDEX IF NOT EXISTS idx_products_active        ON products (is_active);
CREATE INDEX IF NOT EXISTS idx_products_featured      ON products (is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_products_deal          ON products (is_deal_of_day) WHERE is_deal_of_day = true;
CREATE INDEX IF NOT EXISTS idx_products_price         ON products (selling_price);
CREATE INDEX IF NOT EXISTS idx_products_rating        ON products (rating DESC);
CREATE INDEX IF NOT EXISTS idx_product_images_product ON product_images (product_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_product_specs_product  ON product_specifications (product_id);
CREATE INDEX IF NOT EXISTS idx_addresses_user         ON addresses (user_id);
CREATE INDEX IF NOT EXISTS idx_orders_user            ON orders (user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status          ON orders (status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status  ON orders (payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_placed_at       ON orders (placed_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order      ON order_items (order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product    ON order_items (product_id);
CREATE INDEX IF NOT EXISTS idx_status_history_order   ON order_status_history (order_id, created_at);
CREATE INDEX IF NOT EXISTS idx_reviews_product        ON reviews (product_id, is_approved);
CREATE INDEX IF NOT EXISTS idx_banners_active         ON banners (is_active, sort_order);

-- Trigram GIN indexes for search and the header autocomplete, which match
-- with ILIKE '%term%' (a B-tree index cannot serve a leading wildcard).
CREATE INDEX IF NOT EXISTS idx_products_name_trgm      ON products      USING GIN (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_products_slug_trgm      ON products      USING GIN (slug gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_products_sdesc_trgm     ON products      USING GIN (short_description gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_categories_name_trgm    ON categories    USING GIN (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_subcategories_name_trgm ON subcategories USING GIN (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_brands_name_trgm        ON brands        USING GIN (name gin_trgm_ops);

-- ============================================================
-- PART 5: ROW LEVEL SECURITY  (policy text not visible through the API)
--
-- What was observed live with the public (anon) key on 2026-10-10:
--   readable : categories, subcategories, brands, products,
--              product_images, product_specifications, banners
--   no rows  : orders, order_items, order_status_history, addresses,
--              user_profiles, wishlists, reviews, coupons
-- The policies below reproduce that behaviour. There is no is_admin()
-- function in the live DB — the admin panel uses the service role key,
-- which bypasses RLS — so no admin policies are listed.
-- ============================================================

ALTER TABLE banners                ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories             ENABLE ROW LEVEL SECURITY;
ALTER TABLE subcategories          ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE products               ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images         ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_specifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses              ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items            ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_history   ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlists              ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews                ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons                ENABLE ROW LEVEL SECURITY;

-- Public catalogue
CREATE POLICY "Public read active banners"   ON banners                FOR SELECT USING (is_active = true);
CREATE POLICY "Public read categories"       ON categories             FOR SELECT USING (is_active = true);
CREATE POLICY "Public read subcategories"    ON subcategories          FOR SELECT USING (is_active = true);
CREATE POLICY "Public read brands"           ON brands                 FOR SELECT USING (is_active = true);
CREATE POLICY "Public read products"         ON products               FOR SELECT USING (is_active = true);
CREATE POLICY "Public read product_images"   ON product_images         FOR SELECT USING (true);
CREATE POLICY "Public read specifications"   ON product_specifications FOR SELECT USING (true);
CREATE POLICY "Public read approved reviews" ON reviews                FOR SELECT USING (is_approved = true);

-- A signed-in customer's own data
CREATE POLICY "User own profile"       ON user_profiles        FOR ALL    USING (id = auth.uid());
CREATE POLICY "User own addresses"     ON addresses            FOR ALL    USING (user_id = auth.uid());
CREATE POLICY "User own orders"        ON orders               FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "User place order"       ON orders               FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "User own order_items"   ON order_items          FOR SELECT USING (
  order_id IN (SELECT id FROM orders WHERE user_id = auth.uid())
);
CREATE POLICY "User own order_history" ON order_status_history FOR SELECT USING (
  order_id IN (SELECT id FROM orders WHERE user_id = auth.uid())
);
CREATE POLICY "User own wishlist"      ON wishlists            FOR ALL    USING (user_id = auth.uid());
CREATE POLICY "User own reviews"       ON reviews              FOR ALL    USING (user_id = auth.uid());

-- ============================================================
-- PART 6: DATA API GRANTS
--
-- From 2026-10-30 Supabase no longer auto-grants API access to new public
-- tables: every NEW table needs an explicit GRANT or supabase-js gets
-- "permission denied". RLS above still decides which rows are visible.
-- ============================================================
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES    IN SCHEMA public TO anon, authenticated, service_role;
GRANT USAGE, SELECT                  ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT EXECUTE                        ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated, service_role;

-- issue_invoice_number() is SECURITY DEFINER, so it must not be reachable from
-- the browser. Kept AFTER the blanket function grant above, which would
-- otherwise re-open it to anon/authenticated.
REVOKE ALL ON FUNCTION issue_invoice_number(UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION issue_invoice_number(UUID) TO service_role;
