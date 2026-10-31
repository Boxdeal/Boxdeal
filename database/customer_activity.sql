-- Customer cart on the server, so the admin Customers page can show it.
-- The storefront keeps the cart in the browser (Redux + localStorage); a small
-- sync component copies a logged-in customer's cart here. The wishlist uses the
-- existing public.wishlists table.
--
-- Run once in the Supabase SQL editor before deploying.

CREATE TABLE IF NOT EXISTS public.user_carts (
  user_id    uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  -- [{ product_id, quantity, price, name }] — price is what the customer saw
  -- when they added the item, so the admin can spot a later price change.
  items      jsonb NOT NULL DEFAULT '[]'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Only the server (service role) reads or writes this table.
ALTER TABLE public.user_carts ENABLE ROW LEVEL SECURITY;

-- New tables are not exposed to the Data API without explicit grants.
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_carts TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.wishlists  TO service_role;
