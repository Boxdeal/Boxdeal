-- WARNING: This schema is for context only and is not meant to be run.
-- It mirrors the live Supabase database (introspected).
-- NOTE: orders.payment_status reflects payment_status_fix.sql ('paid', not 'success').

CREATE TABLE public.categories (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  image_url text,
  description text,
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT categories_pkey PRIMARY KEY (id)
);
CREATE TABLE public.subcategories (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  category_id uuid NOT NULL,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  image_url text,
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT subcategories_pkey PRIMARY KEY (id),
  CONSTRAINT subcategories_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id)
);
CREATE TABLE public.brands (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  logo_url text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT brands_pkey PRIMARY KEY (id)
);
CREATE TABLE public.products (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  short_description text,
  sku text NOT NULL UNIQUE,
  category_id uuid NOT NULL,
  subcategory_id uuid,
  brand_id uuid,
  mrp numeric NOT NULL CHECK (mrp > 0::numeric),
  selling_price numeric NOT NULL,
  discount_percent numeric DEFAULT 0,
  stock_quantity integer DEFAULT 0 CHECK (stock_quantity >= 0),
  low_stock_threshold integer DEFAULT 5,
  weight_grams integer DEFAULT 0,
  is_active boolean DEFAULT true,
  is_featured boolean DEFAULT false,
  is_deal_of_day boolean DEFAULT false,
  rating numeric DEFAULT 0 CHECK (rating >= 0::numeric AND rating <= 5::numeric),
  review_count integer DEFAULT 0,
  sold_count integer DEFAULT 0,
  meta_title text,
  meta_description text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT products_pkey PRIMARY KEY (id),
  CONSTRAINT products_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id),
  CONSTRAINT products_subcategory_id_fkey FOREIGN KEY (subcategory_id) REFERENCES public.subcategories(id),
  CONSTRAINT products_brand_id_fkey FOREIGN KEY (brand_id) REFERENCES public.brands(id)
);
CREATE TABLE public.product_images (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  product_id uuid NOT NULL,
  image_url text NOT NULL,
  thumbnail_url text,
  is_primary boolean DEFAULT false,
  sort_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT product_images_pkey PRIMARY KEY (id),
  CONSTRAINT product_images_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id)
);
CREATE TABLE public.product_specifications (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  product_id uuid NOT NULL,
  spec_group text NOT NULL,
  spec_name text NOT NULL,
  spec_value text NOT NULL,
  sort_order integer DEFAULT 0,
  CONSTRAINT product_specifications_pkey PRIMARY KEY (id),
  CONSTRAINT product_specifications_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id)
);
CREATE TABLE public.user_profiles (
  id uuid NOT NULL,
  full_name text,
  phone text,
  avatar_url text,
  date_of_birth date,
  gender text CHECK (gender = ANY (ARRAY['male'::text, 'female'::text, 'other'::text])),
  is_admin boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_profiles_pkey PRIMARY KEY (id),
  CONSTRAINT user_profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.addresses (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  full_name text NOT NULL,
  phone text NOT NULL,
  address_line1 text NOT NULL,
  address_line2 text,
  city text NOT NULL,
  state text NOT NULL,
  pincode text NOT NULL CHECK (pincode ~ '^\d{6}$'::text),
  is_default boolean DEFAULT false,
  address_type text DEFAULT 'home'::text CHECK (address_type = ANY (ARRAY['home'::text, 'work'::text, 'other'::text])),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT addresses_pkey PRIMARY KEY (id),
  CONSTRAINT addresses_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.orders (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  order_number text NOT NULL UNIQUE,
  user_id uuid NOT NULL,
  shipping_full_name text NOT NULL,
  shipping_phone text NOT NULL,
  shipping_address1 text NOT NULL,
  shipping_address2 text,
  shipping_city text NOT NULL,
  shipping_state text NOT NULL,
  shipping_pincode text NOT NULL,
  subtotal numeric NOT NULL,
  discount_amount numeric DEFAULT 0,
  shipping_charge numeric DEFAULT 0,
  total_amount numeric NOT NULL,
  coupon_code text,
  payment_method text DEFAULT 'razorpay'::text CHECK (payment_method = ANY (ARRAY['razorpay'::text, 'upi'::text, 'card'::text, 'cod'::text])),
  payment_status text DEFAULT 'pending'::text CHECK (payment_status = ANY (ARRAY['pending'::text, 'paid'::text, 'failed'::text, 'refunded'::text])),
  razorpay_order_id text,
  razorpay_payment_id text,
  razorpay_signature text,
  status text DEFAULT 'placed'::text CHECK (status = ANY (ARRAY['placed'::text, 'confirmed'::text, 'packed'::text, 'shipped'::text, 'delivered'::text, 'cancelled'::text])),
  courier_name text,
  tracking_number text,
  tracking_url text,
  shiprocket_order_id text,
  notes text,
  placed_at timestamp with time zone DEFAULT now(),
  confirmed_at timestamp with time zone,
  packed_at timestamp with time zone,
  shipped_at timestamp with time zone,
  delivered_at timestamp with time zone,
  cancelled_at timestamp with time zone,
  pack_deadline timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT orders_pkey PRIMARY KEY (id),
  CONSTRAINT orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.order_items (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  order_id uuid NOT NULL,
  product_id uuid NOT NULL,
  product_name text NOT NULL,
  product_image text,
  product_sku text NOT NULL,
  quantity integer NOT NULL CHECK (quantity > 0),
  mrp numeric NOT NULL,
  selling_price numeric NOT NULL,
  total_price numeric DEFAULT 0,
  CONSTRAINT order_items_pkey PRIMARY KEY (id),
  CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id),
  CONSTRAINT order_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id)
);
CREATE TABLE public.order_status_history (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  order_id uuid NOT NULL,
  status text NOT NULL,
  note text,
  updated_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT order_status_history_pkey PRIMARY KEY (id),
  CONSTRAINT order_status_history_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id),
  CONSTRAINT order_status_history_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES auth.users(id)
);
CREATE TABLE public.wishlists (
  user_id uuid NOT NULL,
  product_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT wishlists_pkey PRIMARY KEY (user_id, product_id),
  CONSTRAINT wishlists_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT wishlists_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id)
);
CREATE TABLE public.reviews (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  product_id uuid NOT NULL,
  user_id uuid NOT NULL,
  order_id uuid,
  rating smallint NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title text,
  body text,
  is_verified_purchase boolean DEFAULT false,
  is_approved boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT reviews_pkey PRIMARY KEY (id),
  CONSTRAINT reviews_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id),
  CONSTRAINT reviews_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT reviews_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id)
);
CREATE TABLE public.coupons (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  code text NOT NULL UNIQUE,
  discount_type text NOT NULL CHECK (discount_type = ANY (ARRAY['percentage'::text, 'fixed'::text])),
  discount_value numeric NOT NULL CHECK (discount_value > 0::numeric),
  min_order_amount numeric DEFAULT 0,
  max_discount numeric,
  usage_limit integer,
  used_count integer DEFAULT 0,
  expires_at timestamp with time zone,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT coupons_pkey PRIMARY KEY (id)
);
CREATE TABLE public.banners (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  badge text,
  title text NOT NULL,
  subtitle text,
  cta_text text DEFAULT 'Shop Now'::text,
  cta_link text DEFAULT '/products'::text,
  image_url text NOT NULL,
  text_theme text DEFAULT 'dark'::text CHECK (text_theme = ANY (ARRAY['dark'::text, 'light'::text])),
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  starts_at timestamp with time zone,
  ends_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  mid_heading text,
  banner_type text DEFAULT 'hero'::text CHECK (banner_type = ANY (ARRAY['hero'::text, 'promo'::text, 'featured'::text, 'deal_of_day'::text])),
  CONSTRAINT banners_pkey PRIMARY KEY (id)
);
