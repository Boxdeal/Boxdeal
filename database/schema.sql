-- ============================================================
-- BoxDeal Database Schema
-- PostgreSQL via Supabase
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";   -- for fast full-text search

-- ────────────────────────────────────────────────────────────
-- ENUMS
-- ────────────────────────────────────────────────────────────

CREATE TYPE order_status AS ENUM (
  'placed', 'confirmed', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'returned'
);

CREATE TYPE payment_status AS ENUM (
  'pending', 'paid', 'failed', 'refunded', 'partially_refunded'
);

CREATE TYPE payment_method AS ENUM (
  'razorpay', 'cod'
);

CREATE TYPE discount_type AS ENUM (
  'percentage', 'flat'
);

CREATE TYPE address_type AS ENUM (
  'home', 'work', 'other'
);

-- ────────────────────────────────────────────────────────────
-- TABLE 1: categories
-- ────────────────────────────────────────────────────────────
CREATE TABLE categories (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  image_url   TEXT,
  description TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_categories_slug ON categories (slug);
CREATE INDEX idx_categories_active ON categories (is_active, sort_order);

-- ────────────────────────────────────────────────────────────
-- TABLE 2: subcategories
-- ────────────────────────────────────────────────────────────
CREATE TABLE subcategories (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID NOT NULL REFERENCES categories (id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  image_url   TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_subcategories_category ON subcategories (category_id);
CREATE INDEX idx_subcategories_slug ON subcategories (slug);

-- ────────────────────────────────────────────────────────────
-- TABLE 3: brands
-- ────────────────────────────────────────────────────────────
CREATE TABLE brands (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       TEXT NOT NULL,
  slug       TEXT NOT NULL UNIQUE,
  logo_url   TEXT,
  is_active  BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_brands_slug ON brands (slug);

-- ────────────────────────────────────────────────────────────
-- TABLE 4: products
-- ────────────────────────────────────────────────────────────
CREATE TABLE products (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name                TEXT NOT NULL,
  slug                TEXT NOT NULL UNIQUE,
  description         TEXT,
  short_description   TEXT,
  sku                 TEXT NOT NULL UNIQUE,
  category_id         UUID NOT NULL REFERENCES categories (id),
  subcategory_id      UUID REFERENCES subcategories (id),
  brand_id            UUID REFERENCES brands (id),
  mrp                 NUMERIC(10, 2) NOT NULL CHECK (mrp > 0),
  selling_price       NUMERIC(10, 2) NOT NULL CHECK (selling_price > 0 AND selling_price <= mrp),
  discount_percent    NUMERIC(5, 2) GENERATED ALWAYS AS (
                        ROUND(((mrp - selling_price) / mrp) * 100, 2)
                      ) STORED,
  stock_quantity      INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  low_stock_threshold INTEGER NOT NULL DEFAULT 5,
  weight_grams        INTEGER DEFAULT 0,
  is_active           BOOLEAN NOT NULL DEFAULT true,
  is_featured         BOOLEAN NOT NULL DEFAULT false,
  is_deal_of_day      BOOLEAN NOT NULL DEFAULT false,
  rating              NUMERIC(3, 2) NOT NULL DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  review_count        INTEGER NOT NULL DEFAULT 0,
  sold_count          INTEGER NOT NULL DEFAULT 0,
  meta_title          TEXT,
  meta_description    TEXT,
  search_vector       TSVECTOR,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_products_slug ON products (slug);
CREATE INDEX idx_products_category ON products (category_id);
CREATE INDEX idx_products_subcategory ON products (subcategory_id);
CREATE INDEX idx_products_brand ON products (brand_id);
CREATE INDEX idx_products_active ON products (is_active);
CREATE INDEX idx_products_featured ON products (is_featured) WHERE is_featured = true;
CREATE INDEX idx_products_deal ON products (is_deal_of_day) WHERE is_deal_of_day = true;
CREATE INDEX idx_products_price ON products (selling_price);
CREATE INDEX idx_products_rating ON products (rating DESC);
CREATE INDEX idx_products_search ON products USING GIN (search_vector);

-- Auto-update search_vector on insert/update
CREATE OR REPLACE FUNCTION update_product_search_vector()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.short_description, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'C');
  RETURN NEW;
END;
$$;

CREATE TRIGGER trig_product_search_vector
  BEFORE INSERT OR UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_product_search_vector();

-- ────────────────────────────────────────────────────────────
-- TABLE 5: product_images
-- ────────────────────────────────────────────────────────────
CREATE TABLE product_images (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id  UUID NOT NULL REFERENCES products (id) ON DELETE CASCADE,
  image_url   TEXT NOT NULL,
  thumbnail_url TEXT,
  is_primary  BOOLEAN NOT NULL DEFAULT false,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_product_images_product ON product_images (product_id, sort_order);
CREATE UNIQUE INDEX idx_product_images_primary ON product_images (product_id) WHERE is_primary = true;

-- ────────────────────────────────────────────────────────────
-- TABLE 6: product_specifications
-- ────────────────────────────────────────────────────────────
CREATE TABLE product_specifications (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products (id) ON DELETE CASCADE,
  spec_group TEXT NOT NULL,
  spec_name  TEXT NOT NULL,
  spec_value TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX idx_product_specs_product ON product_specifications (product_id);

-- ────────────────────────────────────────────────────────────
-- TABLE 7: user_profiles
-- ────────────────────────────────────────────────────────────
CREATE TABLE user_profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  full_name     TEXT,
  phone         TEXT,
  avatar_url    TEXT,
  date_of_birth DATE,
  gender        TEXT CHECK (gender IN ('male', 'female', 'other')),
  is_admin      BOOLEAN NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────────
-- TABLE 8: addresses
-- ────────────────────────────────────────────────────────────
CREATE TABLE addresses (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  full_name     TEXT NOT NULL,
  phone         TEXT NOT NULL,
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city          TEXT NOT NULL,
  state         TEXT NOT NULL,
  pincode       TEXT NOT NULL CHECK (pincode ~ '^\d{6}$'),
  is_default    BOOLEAN NOT NULL DEFAULT false,
  address_type  address_type NOT NULL DEFAULT 'home',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_addresses_user ON addresses (user_id);
CREATE UNIQUE INDEX idx_addresses_default ON addresses (user_id) WHERE is_default = true;

-- ────────────────────────────────────────────────────────────
-- TABLE 9: orders
-- ────────────────────────────────────────────────────────────
CREATE TABLE orders (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number         TEXT NOT NULL UNIQUE,
  user_id              UUID NOT NULL REFERENCES auth.users (id),
  shipping_full_name   TEXT NOT NULL,
  shipping_phone       TEXT NOT NULL,
  shipping_address1    TEXT NOT NULL,
  shipping_address2    TEXT,
  shipping_city        TEXT NOT NULL,
  shipping_state       TEXT NOT NULL,
  shipping_pincode     TEXT NOT NULL,
  subtotal             NUMERIC(10, 2) NOT NULL,
  discount_amount      NUMERIC(10, 2) NOT NULL DEFAULT 0,
  shipping_charge      NUMERIC(10, 2) NOT NULL DEFAULT 0,
  total_amount         NUMERIC(10, 2) NOT NULL,
  coupon_code          TEXT,
  payment_method       payment_method NOT NULL DEFAULT 'razorpay',
  payment_status       payment_status NOT NULL DEFAULT 'pending',
  razorpay_order_id    TEXT,
  razorpay_payment_id  TEXT,
  razorpay_signature   TEXT,
  status               order_status NOT NULL DEFAULT 'placed',
  courier_name         TEXT,
  tracking_number      TEXT,
  tracking_url         TEXT,
  shiprocket_order_id  TEXT,
  notes                TEXT,
  placed_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  confirmed_at         TIMESTAMPTZ,
  packed_at            TIMESTAMPTZ,
  shipped_at           TIMESTAMPTZ,
  delivered_at         TIMESTAMPTZ,
  cancelled_at         TIMESTAMPTZ,
  pack_deadline        TIMESTAMPTZ,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_orders_user ON orders (user_id);
CREATE INDEX idx_orders_status ON orders (status);
CREATE INDEX idx_orders_payment_status ON orders (payment_status);
CREATE INDEX idx_orders_placed_at ON orders (placed_at DESC);
CREATE INDEX idx_orders_number ON orders (order_number);
CREATE INDEX idx_orders_pack_deadline ON orders (pack_deadline) WHERE status = 'placed';

-- Set pack_deadline = placed_at + 24h on insert (generated columns don't support TIMESTAMPTZ arithmetic)
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

-- ────────────────────────────────────────────────────────────
-- TABLE 10: order_items
-- ────────────────────────────────────────────────────────────
CREATE TABLE order_items (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id      UUID NOT NULL REFERENCES orders (id) ON DELETE CASCADE,
  product_id    UUID NOT NULL REFERENCES products (id),
  product_name  TEXT NOT NULL,
  product_image TEXT,
  product_sku   TEXT NOT NULL,
  quantity      INTEGER NOT NULL CHECK (quantity > 0),
  mrp           NUMERIC(10, 2) NOT NULL,
  selling_price NUMERIC(10, 2) NOT NULL,
  total_price   NUMERIC(10, 2) GENERATED ALWAYS AS (quantity * selling_price) STORED
);

CREATE INDEX idx_order_items_order ON order_items (order_id);
CREATE INDEX idx_order_items_product ON order_items (product_id);

-- ────────────────────────────────────────────────────────────
-- TABLE 11: order_status_history
-- ────────────────────────────────────────────────────────────
CREATE TABLE order_status_history (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id   UUID NOT NULL REFERENCES orders (id) ON DELETE CASCADE,
  status     order_status NOT NULL,
  note       TEXT,
  updated_by UUID REFERENCES auth.users (id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_status_history_order ON order_status_history (order_id, created_at);

-- ────────────────────────────────────────────────────────────
-- TABLE 12: wishlists
-- ────────────────────────────────────────────────────────────
CREATE TABLE wishlists (
  user_id    UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, product_id)
);

CREATE INDEX idx_wishlists_user ON wishlists (user_id);

-- ────────────────────────────────────────────────────────────
-- TABLE 13: reviews
-- ────────────────────────────────────────────────────────────
CREATE TABLE reviews (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id           UUID NOT NULL REFERENCES products (id) ON DELETE CASCADE,
  user_id              UUID NOT NULL REFERENCES auth.users (id),
  order_id             UUID REFERENCES orders (id),
  rating               SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title                TEXT,
  body                 TEXT,
  is_verified_purchase BOOLEAN NOT NULL DEFAULT false,
  is_approved          BOOLEAN NOT NULL DEFAULT false,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (product_id, user_id)
);

CREATE INDEX idx_reviews_product ON reviews (product_id, is_approved);
CREATE INDEX idx_reviews_user ON reviews (user_id);

-- ────────────────────────────────────────────────────────────
-- TABLE 14: coupons
-- ────────────────────────────────────────────────────────────
CREATE TABLE coupons (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code             TEXT NOT NULL UNIQUE,
  discount_type    discount_type NOT NULL,
  discount_value   NUMERIC(10, 2) NOT NULL CHECK (discount_value > 0),
  min_order_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
  max_discount     NUMERIC(10, 2),
  usage_limit      INTEGER,
  used_count       INTEGER NOT NULL DEFAULT 0,
  expires_at       TIMESTAMPTZ,
  is_active        BOOLEAN NOT NULL DEFAULT true,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_coupons_code ON coupons (code);
CREATE INDEX idx_coupons_active ON coupons (is_active, expires_at);

-- ────────────────────────────────────────────────────────────
-- TABLE 15: analytics_events
-- ────────────────────────────────────────────────────────────
CREATE TABLE analytics_events (
  id         UUID NOT NULL DEFAULT uuid_generate_v4(),
  user_id    UUID REFERENCES auth.users (id),
  session_id TEXT,
  event_name TEXT NOT NULL,
  page_url   TEXT,
  properties JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);

-- Create monthly partitions (extend as needed)
CREATE TABLE analytics_events_2026_05 PARTITION OF analytics_events
  FOR VALUES FROM ('2026-05-01') TO ('2026-06-01');
CREATE TABLE analytics_events_2026_06 PARTITION OF analytics_events
  FOR VALUES FROM ('2026-06-01') TO ('2026-07-01');
CREATE TABLE analytics_events_2026_07 PARTITION OF analytics_events
  FOR VALUES FROM ('2026-07-01') TO ('2026-08-01');
CREATE TABLE analytics_events_2026_08 PARTITION OF analytics_events
  FOR VALUES FROM ('2026-08-01') TO ('2026-09-01');
CREATE TABLE analytics_events_2026_09 PARTITION OF analytics_events
  FOR VALUES FROM ('2026-09-01') TO ('2026-10-01');
CREATE TABLE analytics_events_2026_10 PARTITION OF analytics_events
  FOR VALUES FROM ('2026-10-01') TO ('2026-11-01');
CREATE TABLE analytics_events_2026_11 PARTITION OF analytics_events
  FOR VALUES FROM ('2026-11-01') TO ('2026-12-01');
CREATE TABLE analytics_events_2026_12 PARTITION OF analytics_events
  FOR VALUES FROM ('2026-12-01') TO ('2027-01-01');

CREATE INDEX idx_analytics_event_name ON analytics_events (event_name, created_at DESC);
CREATE INDEX idx_analytics_user ON analytics_events (user_id, created_at DESC);

-- ────────────────────────────────────────────────────────────
-- TABLE 16: banners
-- ────────────────────────────────────────────────────────────
CREATE TABLE banners (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  badge       TEXT,
  title       TEXT NOT NULL,
  mid_heading TEXT,
  subtitle    TEXT,
  cta_text   TEXT NOT NULL DEFAULT 'Shop Now',
  cta_link   TEXT NOT NULL DEFAULT '/products',
  image_url  TEXT NOT NULL,
  text_theme TEXT NOT NULL DEFAULT 'dark' CHECK (text_theme IN ('dark', 'light')),
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active  BOOLEAN NOT NULL DEFAULT true,
  starts_at  TIMESTAMPTZ,
  ends_at    TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_banners_active ON banners (is_active, sort_order);

-- ────────────────────────────────────────────────────────────
-- AUTO-UPDATE updated_at TRIGGER
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trig_banners_updated_at       BEFORE UPDATE ON banners       FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trig_categories_updated_at   BEFORE UPDATE ON categories   FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trig_subcategories_updated_at BEFORE UPDATE ON subcategories FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trig_brands_updated_at        BEFORE UPDATE ON brands        FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trig_products_updated_at      BEFORE UPDATE ON products      FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trig_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trig_addresses_updated_at     BEFORE UPDATE ON addresses     FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trig_orders_updated_at        BEFORE UPDATE ON orders        FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trig_reviews_updated_at       BEFORE UPDATE ON reviews       FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Auto-create user profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO user_profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER trig_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ────────────────────────────────────────────────────────────

ALTER TABLE banners                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories              ENABLE ROW LEVEL SECURITY;
ALTER TABLE subcategories           ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE products                ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images          ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_specifications  ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles           ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses               ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items             ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_history    ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlists               ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events        ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events_2026_05 ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events_2026_06 ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events_2026_07 ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events_2026_08 ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events_2026_09 ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events_2026_10 ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events_2026_11 ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events_2026_12 ENABLE ROW LEVEL SECURITY;

-- Helper: is current user an admin?
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER AS $$
  SELECT COALESCE(
    (SELECT is_admin FROM user_profiles WHERE id = auth.uid()),
    false
  );
$$;

-- Public read policies
CREATE POLICY "Public read active banners"
  ON banners FOR SELECT
  USING (
    is_active = true
    AND (starts_at IS NULL OR starts_at <= NOW())
    AND (ends_at   IS NULL OR ends_at   >  NOW())
  );
CREATE POLICY "Admin all banners" ON banners FOR ALL USING (is_admin());

CREATE POLICY "Public read categories"       ON categories             FOR SELECT USING (is_active = true);
CREATE POLICY "Public read subcategories"    ON subcategories          FOR SELECT USING (is_active = true);
CREATE POLICY "Public read brands"           ON brands                 FOR SELECT USING (is_active = true);
CREATE POLICY "Public read products"         ON products               FOR SELECT USING (is_active = true);
CREATE POLICY "Public read product_images"   ON product_images         FOR SELECT USING (true);
CREATE POLICY "Public read specifications"   ON product_specifications FOR SELECT USING (true);
CREATE POLICY "Public read approved reviews" ON reviews                FOR SELECT USING (is_approved = true);

-- Admin full access policies
CREATE POLICY "Admin all categories"      ON categories             FOR ALL USING (is_admin());
CREATE POLICY "Admin all subcategories"   ON subcategories          FOR ALL USING (is_admin());
CREATE POLICY "Admin all brands"          ON brands                 FOR ALL USING (is_admin());
CREATE POLICY "Admin all products"        ON products               FOR ALL USING (is_admin());
CREATE POLICY "Admin all images"          ON product_images         FOR ALL USING (is_admin());
CREATE POLICY "Admin all specs"           ON product_specifications FOR ALL USING (is_admin());
CREATE POLICY "Admin all orders"          ON orders                 FOR ALL USING (is_admin());
CREATE POLICY "Admin all order_items"     ON order_items            FOR ALL USING (is_admin());
CREATE POLICY "Admin all order_history"   ON order_status_history   FOR ALL USING (is_admin());
CREATE POLICY "Admin all reviews"         ON reviews                FOR ALL USING (is_admin());
CREATE POLICY "Admin all coupons"         ON coupons                FOR ALL USING (is_admin());
CREATE POLICY "Admin all profiles"        ON user_profiles          FOR ALL USING (is_admin());
CREATE POLICY "Admin all analytics"       ON analytics_events       FOR ALL USING (is_admin());

-- User own data policies
CREATE POLICY "User own profile"          ON user_profiles        FOR ALL  USING (id = auth.uid());
CREATE POLICY "User own addresses"        ON addresses            FOR ALL  USING (user_id = auth.uid());
CREATE POLICY "User own orders"           ON orders               FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "User place order"          ON orders               FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "User own order_items"      ON order_items          FOR SELECT USING (
  order_id IN (SELECT id FROM orders WHERE user_id = auth.uid())
);
CREATE POLICY "User own order_history"    ON order_status_history FOR SELECT USING (
  order_id IN (SELECT id FROM orders WHERE user_id = auth.uid())
);
CREATE POLICY "User own wishlist"         ON wishlists            FOR ALL  USING (user_id = auth.uid());
CREATE POLICY "User own reviews"          ON reviews              FOR ALL  USING (user_id = auth.uid());
CREATE POLICY "Public read active coupons" ON coupons             FOR SELECT USING (
  is_active = true AND (expires_at IS NULL OR expires_at > NOW())
);
CREATE POLICY "User log events"           ON analytics_events     FOR INSERT WITH CHECK (true);
