-- ============================================================
-- Hero banners — set up 5 new banners linked to their products
-- Run in Supabase SQL editor.
-- Images uploaded to Supabase Storage bucket: banners/banner1.jpg ... banner5.jpg
-- ?v=2 = cache-bust so the CDN/browser fetch the NEW image (same filename).
--        Replaced an image again later? Bump to ?v=3, ?v=4, ...
-- ============================================================

BEGIN;

-- Clear out the old hero banners so we start clean
DELETE FROM public.banners WHERE banner_type = 'hero';

INSERT INTO public.banners
  (badge, title, mid_heading, subtitle, cta_text, cta_link, image_url, text_theme, banner_type, sort_order, is_active)
VALUES
  -- 1. Backet Club 320 Party Speaker  (MRP 29999 -> 8999, 70% off)
  ('PARTY SPEAKER',
   'BACKET CLUB 320',
   'Dual 6" Woofer + 2 Wireless Mics',
   'TWS • Bluetooth • FM • RGB Lights • Karaoke Ready',
   'Shop Now',
   '/product/backet-club-320-party-speaker',
   'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/banners/banner1.jpg?v=2',
   'dark', 'hero', 1, true),

  -- 2. Motorola AmphisoundX 350W 5.1 Soundbar  (MRP 24999 -> 5250, 79% off)
  ('5.1 SOUNDBAR',
   'MOTOROLA 350W',
   '5.1 Channel Cinematic Surround Sound',
   'Subwoofer + 2 Satellites • HDMI ARC • Bluetooth 5.3',
   'Shop Now',
   '/product/motorola-amphisoundx-350w-soundbar-black',
   'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/banners/banner2.jpg?v=2',
   'dark', 'hero', 2, true),

  -- 3. SHKOD AirLits7 Pro True Wireless Earbuds  (MRP 6999 -> 850, 88% off)
  ('TRUE WIRELESS',
   'SHKOD AIRLITS7 PRO',
   '35dB ANC • 55Hr Total Playtime',
   'Bluetooth 5.4 • 40ms Low Latency • Quick Charge',
   'Shop Now',
   '/product/shkod-airlits7-pro-earbuds',
   'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/banners/banner3.jpg?v=2',
   'dark', 'hero', 3, true),

  -- 4. Noise Pulse 2 Pro Bluetooth Calling Smart Watch  (MRP 6999 -> 850, 88% off)
  ('SMART WATCH',
   'NOISE PULSE 2 PRO',
   '1.81" HD Display • Bluetooth Calling',
   '7-Day Battery • 100 Sports Modes • IP67',
   'Shop Now',
   '/product/noise-pulse-2-pro-smartwatch-black',
   'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/banners/banner4.jpg?v=2',
   'dark', 'hero', 4, true),

  -- 5. Beetel X70 Cordless Landline Phone  (MRP 3299 -> 1490, 55% off)
  ('CORDLESS PHONE',
   'BEETEL X70',
   '2.4GHz Cordless Landline',
   '2-Way Speakerphone • 50 Phonebook • 5Hr Talk Time',
   'Shop Now',
   '/product/beetel-x70-cordless-landline-black',
   'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/banners/banner5.jpg?v=2',
   'dark', 'hero', 5, true);

COMMIT;

-- Verify
SELECT sort_order, title, cta_link, image_url, text_theme
FROM public.banners
WHERE banner_type = 'hero'
ORDER BY sort_order;
