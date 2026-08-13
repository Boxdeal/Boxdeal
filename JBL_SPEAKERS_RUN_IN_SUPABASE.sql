-- ============================================================================
-- BoxDeal — JBL Portable Speakers
--   1. JBL Flip 7            (NEW insert)
--   2. JBL Charge 5 Wi-Fi    (NEW insert)
--   3. JBL Go 3              (ALREADY EXISTS — updated, not inserted)
--
-- Category    : Speaker           91b8a207-2b75-4fac-bcbb-bfe47474acec
-- Subcategory : Portable Speaker  1a90e2b7-e458-43d8-8c7a-245de19cbed8
-- Brand       : JBL               1d23018a-ab97-45e6-b29f-54d47d64504c
--
-- ---------------------------------------------------------------------------
-- IMAGE UPLOAD — Supabase Dashboard → Storage → bucket `product-images`
-- Create these folders EXACTLY (folder name = product slug) and drop in
-- 1.jpg, 2.jpg, 3.jpg, 4.jpg, 5.jpg (1.jpg becomes the primary image):
--
--   1. JBL Flip 7          →  jbl-flip-7-portable-speaker-black-orange/
--   2. JBL Charge 5 Wi-Fi  →  jbl-charge-5-wifi-portable-speaker-black/
--   3. JBL Go 3            →  jbl-go-3-portable-speaker-black/   (already has
--                             5 images — only re-upload if you want to replace)
--
-- Full path pattern:
--   product-images/<slug>/1.jpg
-- Public URL pattern:
--   https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/<slug>/1.jpg
-- ============================================================================

BEGIN;

-- ===== 1. JBL FLIP 7 (Black & Orange) =====
INSERT INTO products (id, name, slug, description, short_description, sku, category_id, subcategory_id, brand_id, mrp, selling_price, discount_percent, stock_quantity, low_stock_threshold, weight_grams, length_cm, breadth_cm, height_cm, is_active, is_featured, is_deal_of_day, rating, review_count, sold_count, meta_title, meta_description) VALUES (
  '923f2d38-175f-4eb7-b38a-7a8f5dc14463',
  'JBL Flip 7 Wireless Portable Bluetooth Speaker Black and Orange',
  'jbl-flip-7-portable-speaker-black-orange',
  'JBL Flip 7 Wireless Portable Bluetooth Speaker with Bold JBL Pro Sound and AI Sound Boost, 16 Hours of playtime, IP68 Water and Dustproof build, Auracast multi-speaker connection and the new PushLock interchangeable accessory system.

KEY FEATURES:
- Bold JBL Pro Sound with AI Sound Boost — real-time analysis for maximum acoustic performance with less distortion
- New tweeter dome design — powerful, clearer bass even at max volume with crisp highs
- Up to 16 Hours playtime — 14 hours on a single charge + 2 extra hours with Playtime Boost
- Auracast multi-speaker connection — stereo pair two Flip 7 speakers or link multiple Auracast JBL speakers
- IP68 Waterproof and Dustproof — also drop-proof for life on the move
- PushLock system — interchangeable loop and carabiner accessories included in the box
- 35W maximum output power
- Bluetooth + USB connectivity, Stereo output
- JBL Portable personalization app with custom EQ
- 4800 mAh battery, 2.5 Hours charge time
- 1 Year warranty provided by the manufacturer',
  '35W | AI Sound Boost | 16Hr Playtime | IP68 Water & Dustproof | Auracast | PushLock | App Control',
  'JBL-FLIP7-BLKO',
  '91b8a207-2b75-4fac-bcbb-bfe47474acec',
  '1a90e2b7-e458-43d8-8c7a-245de19cbed8',
  '1d23018a-ab97-45e6-b29f-54d47d64504c',
  14999, 7999, 46.67,
  1, 1,
  600, 21, 11, 9,
  true, false, false,
  4.3, 3775, 0,
  'JBL Flip 7 Portable Bluetooth Speaker Black & Orange at ₹7999 | BoxDeal',
  'Buy JBL Flip 7 Wireless Portable Bluetooth Speaker at ₹7999 (MRP ₹14999). 35W AI Sound Boost, 16Hr playtime, IP68 waterproof, Auracast. Free shipping on BoxDeal.'
);

INSERT INTO product_specifications (product_id, spec_group, spec_name, spec_value, sort_order) VALUES
  ('923f2d38-175f-4eb7-b38a-7a8f5dc14463', 'General', 'Brand', 'JBL', 1),
  ('923f2d38-175f-4eb7-b38a-7a8f5dc14463', 'General', 'Model Name', 'JBL Flip 7', 2),
  ('923f2d38-175f-4eb7-b38a-7a8f5dc14463', 'General', 'Model Number', 'JBLFLIP7BLKO', 3),
  ('923f2d38-175f-4eb7-b38a-7a8f5dc14463', 'General', 'Colour', 'Black and Orange', 4),
  ('923f2d38-175f-4eb7-b38a-7a8f5dc14463', 'General', 'Speaker Type', 'Portable Speaker', 5),
  ('923f2d38-175f-4eb7-b38a-7a8f5dc14463', 'General', 'Enclosure Material', 'Plastic', 6),
  ('923f2d38-175f-4eb7-b38a-7a8f5dc14463', 'General', 'Dimensions (D x W x H)', '2.8 x 7.2 x 2.7 cm', 7),
  ('923f2d38-175f-4eb7-b38a-7a8f5dc14463', 'General', 'Weight', '560 g', 8),
  ('923f2d38-175f-4eb7-b38a-7a8f5dc14463', 'General', 'Country of Origin', 'China', 9),
  ('923f2d38-175f-4eb7-b38a-7a8f5dc14463', 'General', 'Warranty', '1 Year Manufacturer Warranty', 10),
  ('923f2d38-175f-4eb7-b38a-7a8f5dc14463', 'Audio', 'Output Power', '35 Watts', 11),
  ('923f2d38-175f-4eb7-b38a-7a8f5dc14463', 'Audio', 'Audio Output Mode', 'Stereo', 12),
  ('923f2d38-175f-4eb7-b38a-7a8f5dc14463', 'Audio', 'Driver Type', 'Dynamic Driver', 13),
  ('923f2d38-175f-4eb7-b38a-7a8f5dc14463', 'Audio', 'Speaker Size', '6.95 cm', 14),
  ('923f2d38-175f-4eb7-b38a-7a8f5dc14463', 'Audio', 'AI Sound Boost', 'Yes — real-time audio optimisation', 15),
  ('923f2d38-175f-4eb7-b38a-7a8f5dc14463', 'Battery', 'Capacity', '4800 mAh', 16),
  ('923f2d38-175f-4eb7-b38a-7a8f5dc14463', 'Battery', 'Battery Life', '16 Hours (14 Hrs + 2 Hrs Playtime Boost)', 17),
  ('923f2d38-175f-4eb7-b38a-7a8f5dc14463', 'Battery', 'Charge Time', '2.5 Hours', 18),
  ('923f2d38-175f-4eb7-b38a-7a8f5dc14463', 'Battery', 'Battery Type', '1 x Lithium Polymer (included)', 19),
  ('923f2d38-175f-4eb7-b38a-7a8f5dc14463', 'Battery', 'Power Source', 'Battery Powered', 20),
  ('923f2d38-175f-4eb7-b38a-7a8f5dc14463', 'Connectivity', 'Technology', 'Bluetooth, USB', 21),
  ('923f2d38-175f-4eb7-b38a-7a8f5dc14463', 'Connectivity', 'Wireless Type', 'Bluetooth', 22),
  ('923f2d38-175f-4eb7-b38a-7a8f5dc14463', 'Connectivity', 'Multi-Speaker', 'Auracast — stereo pair or link multiple JBL speakers', 23),
  ('923f2d38-175f-4eb7-b38a-7a8f5dc14463', 'Connectivity', 'Compatible Devices', 'Smartphone, Tablet, Laptop, Desktop, Projector', 24),
  ('923f2d38-175f-4eb7-b38a-7a8f5dc14463', 'Features', 'Water & Dust Resistance', 'IP68 — Waterproof and Dustproof', 25),
  ('923f2d38-175f-4eb7-b38a-7a8f5dc14463', 'Features', 'Drop Proof', 'Yes', 26),
  ('923f2d38-175f-4eb7-b38a-7a8f5dc14463', 'Features', 'PushLock System', 'Yes — interchangeable loop and carabiner included', 27),
  ('923f2d38-175f-4eb7-b38a-7a8f5dc14463', 'Features', 'Control Method', 'Buttons + JBL Portable App', 28),
  ('923f2d38-175f-4eb7-b38a-7a8f5dc14463', 'Features', 'Best For', 'Party, Travel, Gaming, Outdoor', 29),
  ('923f2d38-175f-4eb7-b38a-7a8f5dc14463', 'In the Box', 'Contents', '1 x JBL Flip 7, Loop, Carabiner, Quick Start Guide, Safety Sheet, Warranty Card', 30);

INSERT INTO product_images (product_id, image_url, thumbnail_url, is_primary, sort_order) VALUES
  ('923f2d38-175f-4eb7-b38a-7a8f5dc14463', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/jbl-flip-7-portable-speaker-black-orange/1.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/jbl-flip-7-portable-speaker-black-orange/1.jpg', true, 0),
  ('923f2d38-175f-4eb7-b38a-7a8f5dc14463', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/jbl-flip-7-portable-speaker-black-orange/2.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/jbl-flip-7-portable-speaker-black-orange/2.jpg', false, 1),
  ('923f2d38-175f-4eb7-b38a-7a8f5dc14463', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/jbl-flip-7-portable-speaker-black-orange/3.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/jbl-flip-7-portable-speaker-black-orange/3.jpg', false, 2),
  ('923f2d38-175f-4eb7-b38a-7a8f5dc14463', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/jbl-flip-7-portable-speaker-black-orange/4.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/jbl-flip-7-portable-speaker-black-orange/4.jpg', false, 3),
  ('923f2d38-175f-4eb7-b38a-7a8f5dc14463', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/jbl-flip-7-portable-speaker-black-orange/5.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/jbl-flip-7-portable-speaker-black-orange/5.jpg', false, 4);


-- ===== 2. JBL CHARGE 5 Wi-Fi (Black) =====
INSERT INTO products (id, name, slug, description, short_description, sku, category_id, subcategory_id, brand_id, mrp, selling_price, discount_percent, stock_quantity, low_stock_threshold, weight_grams, length_cm, breadth_cm, height_cm, is_active, is_featured, is_deal_of_day, rating, review_count, sold_count, meta_title, meta_description) VALUES (
  '5754ca7f-1a03-4509-897f-e38dece3bf5e',
  'JBL Charge 5 Wi-Fi Wireless Portable Bluetooth Speaker Black',
  'jbl-charge-5-wifi-portable-speaker-black',
  'JBL Charge 5 Wi-Fi Wireless Portable Bluetooth Speaker with JBL Original Pro Sound and deep bass, 20 Hours playtime, built-in powerbank, Wi-Fi streaming with AirPlay and IP67 Water and Dustproof build.

KEY FEATURES:
- JBL Original Pro Sound with deep, powerful bass
- Wi-Fi + Bluetooth connectivity — stream over Wi-Fi while you keep using your phone
- Open streaming ecosystem — AirPlay, Alexa Multi-Room Music, Chromecast built-in and Spotify Connect
- Up to 20 Hours of battery life
- Built-in powerbank — charge your phone from the speaker
- IP67 Waterproof and Dustproof — poolside to seaside ready
- 40W maximum output power, 2.0 stereo channels
- Frequency response up to 20 KHz, SNR 80 dB
- 14100 mAh battery, 6 Hours charge time
- JBL One App for setup, EQ and multi-room control
- Made with eco-friendly recycled materials and packaging
- 1 Year warranty provided by the manufacturer',
  '40W | Wi-Fi + Bluetooth | AirPlay & Chromecast | 20Hr Playtime | IP67 | Built-in Powerbank | Deep Bass',
  'JBL-CHARGE5WIFI-BLK',
  '91b8a207-2b75-4fac-bcbb-bfe47474acec',
  '1a90e2b7-e458-43d8-8c7a-245de19cbed8',
  '1d23018a-ab97-45e6-b29f-54d47d64504c',
  26999, 9100, 66.30,
  1, 1,
  1000, 26, 13, 12,
  true, false, false,
  4.4, 1034, 0,
  'JBL Charge 5 Wi-Fi Portable Bluetooth Speaker Black at ₹9100 | BoxDeal',
  'Buy JBL Charge 5 Wi-Fi Wireless Portable Bluetooth Speaker at ₹9100 (MRP ₹26999). 40W Pro Sound, Wi-Fi + AirPlay, 20Hr battery, IP67, built-in powerbank. Free shipping on BoxDeal.'
);

INSERT INTO product_specifications (product_id, spec_group, spec_name, spec_value, sort_order) VALUES
  ('5754ca7f-1a03-4509-897f-e38dece3bf5e', 'General', 'Brand', 'JBL', 1),
  ('5754ca7f-1a03-4509-897f-e38dece3bf5e', 'General', 'Model Name', 'JBLCHARGE5WIFIBLK', 2),
  ('5754ca7f-1a03-4509-897f-e38dece3bf5e', 'General', 'Model Number', 'JBLCHARGE5PROBLK', 3),
  ('5754ca7f-1a03-4509-897f-e38dece3bf5e', 'General', 'Colour', 'Black', 4),
  ('5754ca7f-1a03-4509-897f-e38dece3bf5e', 'General', 'Speaker Type', 'Outdoor / Portable Speaker', 5),
  ('5754ca7f-1a03-4509-897f-e38dece3bf5e', 'General', 'Enclosure Material', 'Plastic, Rubber, Metal', 6),
  ('5754ca7f-1a03-4509-897f-e38dece3bf5e', 'General', 'Dimensions (D x W x H)', '9.7 x 22.3 x 9.4 cm', 7),
  ('5754ca7f-1a03-4509-897f-e38dece3bf5e', 'General', 'Weight', '1000 g', 8),
  ('5754ca7f-1a03-4509-897f-e38dece3bf5e', 'General', 'Country of Origin', 'China', 9),
  ('5754ca7f-1a03-4509-897f-e38dece3bf5e', 'General', 'Warranty', '1 Year Manufacturer Warranty', 10),
  ('5754ca7f-1a03-4509-897f-e38dece3bf5e', 'Audio', 'Output Power', '40 Watts', 11),
  ('5754ca7f-1a03-4509-897f-e38dece3bf5e', 'Audio', 'Audio Output Mode', 'Stereo', 12),
  ('5754ca7f-1a03-4509-897f-e38dece3bf5e', 'Audio', 'Audio Channels', '2.0', 13),
  ('5754ca7f-1a03-4509-897f-e38dece3bf5e', 'Audio', 'Frequency Response', 'Up to 20 KHz', 14),
  ('5754ca7f-1a03-4509-897f-e38dece3bf5e', 'Audio', 'Signal-to-Noise Ratio', '80 dB', 15),
  ('5754ca7f-1a03-4509-897f-e38dece3bf5e', 'Audio', 'Driver Type', 'Dynamic Driver', 16),
  ('5754ca7f-1a03-4509-897f-e38dece3bf5e', 'Audio', 'Driver Size', '5 Inches', 17),
  ('5754ca7f-1a03-4509-897f-e38dece3bf5e', 'Audio', 'Tweeter Diameter', '1 Inch', 18),
  ('5754ca7f-1a03-4509-897f-e38dece3bf5e', 'Battery', 'Capacity', '14100 mAh', 19),
  ('5754ca7f-1a03-4509-897f-e38dece3bf5e', 'Battery', 'Battery Life', '20 Hours', 20),
  ('5754ca7f-1a03-4509-897f-e38dece3bf5e', 'Battery', 'Charge Time', '6 Hours', 21),
  ('5754ca7f-1a03-4509-897f-e38dece3bf5e', 'Battery', 'Battery Type', '2 x Lithium Polymer', 22),
  ('5754ca7f-1a03-4509-897f-e38dece3bf5e', 'Battery', 'Built-in Powerbank', 'Yes — charge your devices from the speaker', 23),
  ('5754ca7f-1a03-4509-897f-e38dece3bf5e', 'Connectivity', 'Technology', 'Wi-Fi + Bluetooth', 24),
  ('5754ca7f-1a03-4509-897f-e38dece3bf5e', 'Connectivity', 'Streaming Services', 'AirPlay, Alexa Multi-Room Music, Chromecast built-in, Spotify Connect', 25),
  ('5754ca7f-1a03-4509-897f-e38dece3bf5e', 'Connectivity', 'Bluetooth Range', '10 Metres', 26),
  ('5754ca7f-1a03-4509-897f-e38dece3bf5e', 'Connectivity', 'USB Ports', '1 x USB (Type-C charging)', 27),
  ('5754ca7f-1a03-4509-897f-e38dece3bf5e', 'Connectivity', 'Compatible Devices', 'iPhone, Android Phones, Tablet, Laptop, Television', 28),
  ('5754ca7f-1a03-4509-897f-e38dece3bf5e', 'Features', 'Water & Dust Resistance', 'IP67 — Waterproof and Dustproof', 29),
  ('5754ca7f-1a03-4509-897f-e38dece3bf5e', 'Features', 'Control Method', 'Button Control + JBL One App', 30),
  ('5754ca7f-1a03-4509-897f-e38dece3bf5e', 'Features', 'Mounting Type', 'Tabletop', 31),
  ('5754ca7f-1a03-4509-897f-e38dece3bf5e', 'Features', 'Eco-Friendly', 'Recycled materials and packaging', 32),
  ('5754ca7f-1a03-4509-897f-e38dece3bf5e', 'Features', 'Best For', 'Party, Travel, Outdoor', 33),
  ('5754ca7f-1a03-4509-897f-e38dece3bf5e', 'In the Box', 'Contents', '1 x JBL Charge 5 Wi-Fi, 1 x Type-C USB Cable, 1 x Quick Start Guide', 34);

INSERT INTO product_images (product_id, image_url, thumbnail_url, is_primary, sort_order) VALUES
  ('5754ca7f-1a03-4509-897f-e38dece3bf5e', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/jbl-charge-5-wifi-portable-speaker-black/1.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/jbl-charge-5-wifi-portable-speaker-black/1.jpg', true, 0),
  ('5754ca7f-1a03-4509-897f-e38dece3bf5e', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/jbl-charge-5-wifi-portable-speaker-black/2.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/jbl-charge-5-wifi-portable-speaker-black/2.jpg', false, 1),
  ('5754ca7f-1a03-4509-897f-e38dece3bf5e', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/jbl-charge-5-wifi-portable-speaker-black/3.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/jbl-charge-5-wifi-portable-speaker-black/3.jpg', false, 2),
  ('5754ca7f-1a03-4509-897f-e38dece3bf5e', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/jbl-charge-5-wifi-portable-speaker-black/4.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/jbl-charge-5-wifi-portable-speaker-black/4.jpg', false, 3),
  ('5754ca7f-1a03-4509-897f-e38dece3bf5e', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/jbl-charge-5-wifi-portable-speaker-black/5.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/jbl-charge-5-wifi-portable-speaker-black/5.jpg', false, 4);


-- ===== 3. JBL GO 3 — ALREADY IN DB (id 18f8702c-3f03-434b-8c43-9fe48c05024f) =====
-- Existing row: MRP 3999, selling 1749, stock 0, weight 320g, dims 11x10x6.
-- Updating price / stock / weight / dimensions to your new values.
UPDATE products SET
  mrp                 = 3999,
  selling_price       = 2100,
  discount_percent    = 47.49,
  stock_quantity      = 1,
  low_stock_threshold = 1,
  weight_grams        = 300,
  length_cm           = 13,
  breadth_cm          = 8,
  height_cm           = 4,
  is_active           = true,
  meta_title          = 'JBL Go 3 Portable Bluetooth Speaker Black at ₹2100 | BoxDeal',
  meta_description    = 'Buy JBL Go 3 Wireless Portable Bluetooth Mini Speaker at ₹2100 (MRP ₹3999). IP67 waterproof, Bluetooth 5.1, 5Hr battery, JBL Pro Sound. Free shipping on BoxDeal.',
  updated_at          = now()
WHERE id = '18f8702c-3f03-434b-8c43-9fe48c05024f';

-- Refresh the Go 3 spec sheet with the full Amazon spec list.
DELETE FROM product_specifications WHERE product_id = '18f8702c-3f03-434b-8c43-9fe48c05024f';
INSERT INTO product_specifications (product_id, spec_group, spec_name, spec_value, sort_order) VALUES
  ('18f8702c-3f03-434b-8c43-9fe48c05024f', 'General', 'Brand', 'JBL', 1),
  ('18f8702c-3f03-434b-8c43-9fe48c05024f', 'General', 'Model Name', 'GO 3', 2),
  ('18f8702c-3f03-434b-8c43-9fe48c05024f', 'General', 'Model Number', 'JBLG03BLK', 3),
  ('18f8702c-3f03-434b-8c43-9fe48c05024f', 'General', 'Colour', 'Black', 4),
  ('18f8702c-3f03-434b-8c43-9fe48c05024f', 'General', 'Speaker Type', 'Portable Speaker', 5),
  ('18f8702c-3f03-434b-8c43-9fe48c05024f', 'General', 'Enclosure Material', 'Fabric', 6),
  ('18f8702c-3f03-434b-8c43-9fe48c05024f', 'General', 'Dimensions (D x W x H)', '6.9 x 8.6 x 4 cm', 7),
  ('18f8702c-3f03-434b-8c43-9fe48c05024f', 'General', 'Weight', '209 g', 8),
  ('18f8702c-3f03-434b-8c43-9fe48c05024f', 'General', 'Country of Origin', 'China', 9),
  ('18f8702c-3f03-434b-8c43-9fe48c05024f', 'General', 'Warranty', '1 Year Manufacturer Warranty', 10),
  ('18f8702c-3f03-434b-8c43-9fe48c05024f', 'Audio', 'Output Power', '4.2 Watts', 11),
  ('18f8702c-3f03-434b-8c43-9fe48c05024f', 'Audio', 'Audio Output Mode', 'Stereo', 12),
  ('18f8702c-3f03-434b-8c43-9fe48c05024f', 'Audio', 'Audio Channels', '1', 13),
  ('18f8702c-3f03-434b-8c43-9fe48c05024f', 'Audio', 'Frequency Response', 'Up to 20000 Hz', 14),
  ('18f8702c-3f03-434b-8c43-9fe48c05024f', 'Audio', 'Signal-to-Noise Ratio', '85 dB', 15),
  ('18f8702c-3f03-434b-8c43-9fe48c05024f', 'Audio', 'Driver Type', 'Dynamic Driver', 16),
  ('18f8702c-3f03-434b-8c43-9fe48c05024f', 'Audio', 'Speaker Size', '8.7 cm', 17),
  ('18f8702c-3f03-434b-8c43-9fe48c05024f', 'Audio', 'Tweeter Diameter', '12 mm', 18),
  ('18f8702c-3f03-434b-8c43-9fe48c05024f', 'Battery', 'Battery Life', '5 Hours', 19),
  ('18f8702c-3f03-434b-8c43-9fe48c05024f', 'Battery', 'Charge Time', '5 Hours', 20),
  ('18f8702c-3f03-434b-8c43-9fe48c05024f', 'Battery', 'Power Source', 'Battery Powered — USB Type-C charging', 21),
  ('18f8702c-3f03-434b-8c43-9fe48c05024f', 'Connectivity', 'Technology', 'Bluetooth 5.1', 22),
  ('18f8702c-3f03-434b-8c43-9fe48c05024f', 'Connectivity', 'Bluetooth Range', '10 Metres', 23),
  ('18f8702c-3f03-434b-8c43-9fe48c05024f', 'Connectivity', 'Interface', 'USB Type-C', 24),
  ('18f8702c-3f03-434b-8c43-9fe48c05024f', 'Connectivity', 'Compatible Devices', 'Smartphone, Tablet, Laptop', 25),
  ('18f8702c-3f03-434b-8c43-9fe48c05024f', 'Features', 'Water & Dust Resistance', 'IP67 — Waterproof and Dustproof', 26),
  ('18f8702c-3f03-434b-8c43-9fe48c05024f', 'Features', 'Control Method', 'Button / Touch Control', 27),
  ('18f8702c-3f03-434b-8c43-9fe48c05024f', 'Features', 'Mounting Type', 'Tabletop', 28),
  ('18f8702c-3f03-434b-8c43-9fe48c05024f', 'Features', 'Microphone', 'No', 29),
  ('18f8702c-3f03-434b-8c43-9fe48c05024f', 'Features', 'Best For', 'Travel, Outdoor', 30),
  ('18f8702c-3f03-434b-8c43-9fe48c05024f', 'In the Box', 'Contents', '1 x JBL GO 3, 1 x Type-C USB Cable, 1 x Quick Start Guide, 1 x Warranty Card, 1 x Safety Sheet', 31);

COMMIT;


-- ============================================================================
-- VERIFY
-- ============================================================================
-- SELECT p.name, p.sku, p.mrp, p.selling_price, p.discount_percent, p.stock_quantity,
--        p.weight_grams, p.length_cm, p.breadth_cm, p.height_cm,
--        (SELECT count(*) FROM product_specifications s WHERE s.product_id = p.id) AS specs,
--        (SELECT count(*) FROM product_images i WHERE i.product_id = p.id) AS images
-- FROM products p
-- WHERE p.sku IN ('JBL-FLIP7-BLKO', 'JBL-CHARGE5WIFI-BLK', 'JBL-GO3-BLK');
