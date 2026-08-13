-- New brands (idempotent)
INSERT INTO brands (id, name, slug, is_active) SELECT gen_random_uuid(), 'Honeywell', 'honeywell', true WHERE NOT EXISTS (SELECT 1 FROM brands WHERE slug='honeywell');
INSERT INTO brands (id, name, slug, is_active) SELECT gen_random_uuid(), 'DJI', 'dji', true WHERE NOT EXISTS (SELECT 1 FROM brands WHERE slug='dji');
INSERT INTO brands (id, name, slug, is_active) SELECT gen_random_uuid(), 'Kalobee', 'kalobee', true WHERE NOT EXISTS (SELECT 1 FROM brands WHERE slug='kalobee');
-- New subcategories: Wired Connectivity (under Speaker) + Action Camera (under Camera Accessories)
INSERT INTO subcategories (id, category_id, name, slug) SELECT gen_random_uuid(), '91b8a207-2b75-4fac-bcbb-bfe47474acec', 'Wired Connectivity', 'wired-connectivity' WHERE NOT EXISTS (SELECT 1 FROM subcategories WHERE slug='wired-connectivity');
INSERT INTO subcategories (id, category_id, name, slug) SELECT gen_random_uuid(), '0e92eb22-430e-4db6-b54c-ce0f2b76bf4d', 'Action Camera', 'action-camera' WHERE NOT EXISTS (SELECT 1 FROM subcategories WHERE slug='action-camera');

-- ===== 1. HONEYWELL-AVIATOR-DGRY =====
INSERT INTO products (id, name, slug, description, short_description, sku, category_id, subcategory_id, brand_id, mrp, selling_price, discount_percent, stock_quantity, low_stock_threshold, weight_grams, length_cm, breadth_cm, height_cm, is_active, is_featured, is_deal_of_day, rating, review_count, sold_count, meta_title, meta_description) VALUES (
  '08e44d8c-2a0e-43a0-be97-d7aa62b98b66', 'Honeywell Aviator Hi-Fi Speaker 240W THX Certified Bluetooth Speaker Dark Grey', 'honeywell-aviator-hifi-speaker-dark-grey', 'Honeywell Aviator Hi-Fi Speaker 240W THX Certified Bluetooth Speaker Dark Grey.

KEY FEATURES:
- THX Certified true-lossless 1MBPS+ audio codec
- 240W power output with dynamic deep bass
- 5 channels of amplification + 3 independent sound cavities
- Bluetooth 5.3 with up to 30m range
- Lossless Booster Dongle (Type-C + Lightning)
- Multi-mode audio: Bluetooth, AUX, Dongle
- Ambient lighting for immersive ambience
- All-digital processing for 5 drivers
- 2-year manufacturer warranty', '240W | THX Certified | 1MBPS+ Lossless Codec | 5 Channels | 3 Sound Cavities | BT 5.3 (30m) | Ambient Light | Type-C & Lightning Dongle', 'HONEYWELL-AVIATOR-DGRY', '91b8a207-2b75-4fac-bcbb-bfe47474acec', (SELECT id FROM subcategories WHERE slug='wired-connectivity'), (SELECT id FROM brands WHERE slug='honeywell'), 99000, 10999, 88.89, 3, 1, 9000, 33, 35, 55, true, false, false, 4.6, 11, 0, 'Honeywell Aviator Hi-Fi Speaker 240W THX Certified Bluetooth Speaker Dark Grey at ₹10999 | BoxDeal', 'Buy Honeywell Aviator Hi-Fi Speaker 240W THX Certified Bluetooth Speaker Dark Grey at ₹10999 (MRP ₹99000). 240W | THX Certified | 1MBPS+ Lossless Codec | 5 Channels | 3 Sound Cavities | BT 5.3 (30m) | Ambient Light | Type-C & Lightning Dongle');
INSERT INTO product_specifications (product_id, spec_group, spec_name, spec_value, sort_order) VALUES
  ('08e44d8c-2a0e-43a0-be97-d7aa62b98b66', 'General', 'Brand', 'Honeywell', 1),
  ('08e44d8c-2a0e-43a0-be97-d7aa62b98b66', 'General', 'Model', 'Aviator Hi-Fi Speaker', 2),
  ('08e44d8c-2a0e-43a0-be97-d7aa62b98b66', 'General', 'Colour', 'Dark Grey', 3),
  ('08e44d8c-2a0e-43a0-be97-d7aa62b98b66', 'General', 'Type', 'Hi-Fi Speaker', 4),
  ('08e44d8c-2a0e-43a0-be97-d7aa62b98b66', 'General', 'Weight', '5.6 kg', 5),
  ('08e44d8c-2a0e-43a0-be97-d7aa62b98b66', 'Audio', 'Output Power', '240W', 6),
  ('08e44d8c-2a0e-43a0-be97-d7aa62b98b66', 'Audio', 'Channels', '5.0', 7),
  ('08e44d8c-2a0e-43a0-be97-d7aa62b98b66', 'Audio', 'Codec', '1MBPS+ True-Lossless (THX Certified)', 8),
  ('08e44d8c-2a0e-43a0-be97-d7aa62b98b66', 'Audio', 'Sound Cavities', '3 Independent', 9),
  ('08e44d8c-2a0e-43a0-be97-d7aa62b98b66', 'Technical', 'Bluetooth', '5.3 (up to 30m)', 10),
  ('08e44d8c-2a0e-43a0-be97-d7aa62b98b66', 'Technical', 'Inputs', 'Bluetooth, AUX, Type-C/Lightning Dongle', 11),
  ('08e44d8c-2a0e-43a0-be97-d7aa62b98b66', 'Technical', 'Controls', 'Touch', 12),
  ('08e44d8c-2a0e-43a0-be97-d7aa62b98b66', 'Technical', 'Lighting', 'Ambient Light', 13),
  ('08e44d8c-2a0e-43a0-be97-d7aa62b98b66', 'General', 'Warranty', '2 Years Manufacturer', 14),
  ('08e44d8c-2a0e-43a0-be97-d7aa62b98b66', 'In the Box', 'Contents', 'Speaker, Lossless Booster Dongle, Power Cable, Warranty Card', 15);
INSERT INTO product_images (product_id, image_url, thumbnail_url, is_primary, sort_order) VALUES
  ('08e44d8c-2a0e-43a0-be97-d7aa62b98b66', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/honeywell-aviator-hifi-speaker-dark-grey/1.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/honeywell-aviator-hifi-speaker-dark-grey/1.jpg', true, 0),
  ('08e44d8c-2a0e-43a0-be97-d7aa62b98b66', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/honeywell-aviator-hifi-speaker-dark-grey/2.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/honeywell-aviator-hifi-speaker-dark-grey/2.jpg', false, 1),
  ('08e44d8c-2a0e-43a0-be97-d7aa62b98b66', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/honeywell-aviator-hifi-speaker-dark-grey/3.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/honeywell-aviator-hifi-speaker-dark-grey/3.jpg', false, 2),
  ('08e44d8c-2a0e-43a0-be97-d7aa62b98b66', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/honeywell-aviator-hifi-speaker-dark-grey/4.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/honeywell-aviator-hifi-speaker-dark-grey/4.jpg', false, 3),
  ('08e44d8c-2a0e-43a0-be97-d7aa62b98b66', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/honeywell-aviator-hifi-speaker-dark-grey/5.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/honeywell-aviator-hifi-speaker-dark-grey/5.jpg', false, 4);

-- ===== 2. DJI-MICMINI2-BLK =====
INSERT INTO products (id, name, slug, description, short_description, sku, category_id, subcategory_id, brand_id, mrp, selling_price, discount_percent, stock_quantity, low_stock_threshold, weight_grams, length_cm, breadth_cm, height_cm, is_active, is_featured, is_deal_of_day, rating, review_count, sold_count, meta_title, meta_description) VALUES (
  'd3f4e793-7661-486b-92cb-f3d0c1f082b6', 'DJI Mic Mini 2 Wireless Lavalier Microphone (2 TX + 1 RX + Charging Case) Black', 'dji-mic-mini-2-wireless-microphone-black', 'DJI Mic Mini 2 Wireless Lavalier Microphone (2 TX + 1 RX + Charging Case) Black.

KEY FEATURES:
- Ultralight 11g wireless tie-clip microphone
- 2 transmitters + 1 receiver + charging case
- 48kHz / 24-bit high-quality sound resolution
- Intelligent noise cancellation
- Automatic gain control (AGC) limiter
- USB-C & 3.5mm TRS connectivity
- Works with smartphones, cameras & DJI devices
- DJI Mimo app support', 'Wireless Lavalier Mic | 2 TX + 1 RX + Charging Case | Ultralight 11g | 48kHz/24-bit | Noise Cancellation | USB-C & 3.5mm TRS', 'DJI-MICMINI2-BLK', 'b6404196-92a1-4de0-8609-c0ef62d51afe', 'ea388af8-84ee-4c7e-83c3-4cb0c8178a31', (SELECT id FROM brands WHERE slug='dji'), 28990, 9999, 65.51, 2, 1, 500, 16, 7, 11, true, false, false, 4.7, 850, 0, 'DJI Mic Mini 2 Wireless Lavalier Microphone (2 TX + 1 RX + Charging Case) Black at ₹9999 | BoxDeal', 'Buy DJI Mic Mini 2 Wireless Lavalier Microphone (2 TX + 1 RX + Charging Case) Black at ₹9999 (MRP ₹28990). Wireless Lavalier Mic | 2 TX + 1 RX + Charging Case | Ultralight 11g | 48kHz/24-bit | Noise Cancellation | USB-C & 3.5mm TRS');
INSERT INTO product_specifications (product_id, spec_group, spec_name, spec_value, sort_order) VALUES
  ('d3f4e793-7661-486b-92cb-f3d0c1f082b6', 'General', 'Brand', 'DJI', 1),
  ('d3f4e793-7661-486b-92cb-f3d0c1f082b6', 'General', 'Model', 'Mic Mini 2', 2),
  ('d3f4e793-7661-486b-92cb-f3d0c1f082b6', 'General', 'Colour', 'Black', 3),
  ('d3f4e793-7661-486b-92cb-f3d0c1f082b6', 'General', 'Type', 'Wireless Lavalier Microphone', 4),
  ('d3f4e793-7661-486b-92cb-f3d0c1f082b6', 'General', 'Set', '2 TX + 1 RX + Charging Case', 5),
  ('d3f4e793-7661-486b-92cb-f3d0c1f082b6', 'Audio', 'Sound Resolution', '48 kHz / 24-bit', 6),
  ('d3f4e793-7661-486b-92cb-f3d0c1f082b6', 'Audio', 'Impedance', '32 Ohm', 7),
  ('d3f4e793-7661-486b-92cb-f3d0c1f082b6', 'Audio', 'Polar Pattern', 'Omnidirectional', 8),
  ('d3f4e793-7661-486b-92cb-f3d0c1f082b6', 'Audio', 'Noise Cancellation', 'Yes (AGC Limiter)', 9),
  ('d3f4e793-7661-486b-92cb-f3d0c1f082b6', 'Technical', 'Connectivity', 'Bluetooth, USB-C, 3.5mm TRS', 10),
  ('d3f4e793-7661-486b-92cb-f3d0c1f082b6', 'Technical', 'RF Range', '2483.5 MHz', 11),
  ('d3f4e793-7661-486b-92cb-f3d0c1f082b6', 'Technical', 'TX Weight', '11 g', 12),
  ('d3f4e793-7661-486b-92cb-f3d0c1f082b6', 'Technical', 'RX Weight', '17.8 g', 13),
  ('d3f4e793-7661-486b-92cb-f3d0c1f082b6', 'Technical', 'Software', 'DJI Mimo', 14),
  ('d3f4e793-7661-486b-92cb-f3d0c1f082b6', 'In the Box', 'Contents', '2 Transmitters, 1 Receiver, Charging Case, Cables', 15);
INSERT INTO product_images (product_id, image_url, thumbnail_url, is_primary, sort_order) VALUES
  ('d3f4e793-7661-486b-92cb-f3d0c1f082b6', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/dji-mic-mini-2-wireless-microphone-black/1.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/dji-mic-mini-2-wireless-microphone-black/1.jpg', true, 0),
  ('d3f4e793-7661-486b-92cb-f3d0c1f082b6', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/dji-mic-mini-2-wireless-microphone-black/2.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/dji-mic-mini-2-wireless-microphone-black/2.jpg', false, 1),
  ('d3f4e793-7661-486b-92cb-f3d0c1f082b6', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/dji-mic-mini-2-wireless-microphone-black/3.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/dji-mic-mini-2-wireless-microphone-black/3.jpg', false, 2),
  ('d3f4e793-7661-486b-92cb-f3d0c1f082b6', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/dji-mic-mini-2-wireless-microphone-black/4.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/dji-mic-mini-2-wireless-microphone-black/4.jpg', false, 3),
  ('d3f4e793-7661-486b-92cb-f3d0c1f082b6', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/dji-mic-mini-2-wireless-microphone-black/5.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/dji-mic-mini-2-wireless-microphone-black/5.jpg', false, 4);

-- ===== 3. KALOBEE-POCKET4 =====
INSERT INTO products (id, name, slug, description, short_description, sku, category_id, subcategory_id, brand_id, mrp, selling_price, discount_percent, stock_quantity, low_stock_threshold, weight_grams, length_cm, breadth_cm, height_cm, is_active, is_featured, is_deal_of_day, rating, review_count, sold_count, meta_title, meta_description) VALUES (
  'a403663a-986c-4809-84c7-aba781d1dff1', 'Kalobee Pocket4 Handheld Outdoor Action Camera HD 1.44" Screen', 'kalobee-pocket4-action-camera', 'Kalobee Pocket4 Handheld Outdoor Action Camera HD 1.44" Screen.

KEY FEATURES:
- HD video recording for crystal-clear visuals
- 1.44 inch (3.66cm) screen
- TF (MicroSD) card storage
- Compact pocket-size design
- Long battery life
- Weatherproof - survives rain & harsh conditions
- User-friendly control buttons', 'HD Action Camera | 1.44" Screen | TF Card Recording | Compact | Long Battery | Weatherproof | Easy Controls', 'KALOBEE-POCKET4', '0e92eb22-430e-4db6-b54c-ce0f2b76bf4d', (SELECT id FROM subcategories WHERE slug='action-camera'), (SELECT id FROM brands WHERE slug='kalobee'), 4999, 2499, 50.01, 2, 1, 500, 16, 9, 5, true, false, false, 4.3, 320, 0, 'Kalobee Pocket4 Handheld Outdoor Action Camera HD 1.44" Screen at ₹2499 | BoxDeal', 'Buy Kalobee Pocket4 Handheld Outdoor Action Camera HD 1.44" Screen at ₹2499 (MRP ₹4999). HD Action Camera | 1.44" Screen | TF Card Recording | Compact | Long Battery | Weatherproof | Easy Controls');
INSERT INTO product_specifications (product_id, spec_group, spec_name, spec_value, sort_order) VALUES
  ('a403663a-986c-4809-84c7-aba781d1dff1', 'General', 'Brand', 'Kalobee', 1),
  ('a403663a-986c-4809-84c7-aba781d1dff1', 'General', 'Model', 'Pocket4', 2),
  ('a403663a-986c-4809-84c7-aba781d1dff1', 'General', 'Type', 'Action Camera', 3),
  ('a403663a-986c-4809-84c7-aba781d1dff1', 'General', 'Country of Origin', 'China', 4),
  ('a403663a-986c-4809-84c7-aba781d1dff1', 'Video', 'Resolution', 'HD', 5),
  ('a403663a-986c-4809-84c7-aba781d1dff1', 'Video', 'Function', 'Recording', 6),
  ('a403663a-986c-4809-84c7-aba781d1dff1', 'Display', 'Screen Size', '1.44 inch (3.66 cm)', 7),
  ('a403663a-986c-4809-84c7-aba781d1dff1', 'Storage', 'Media', 'TF Card (MicroSD)', 8),
  ('a403663a-986c-4809-84c7-aba781d1dff1', 'General', 'Water Resistance', 'Weatherproof', 9),
  ('a403663a-986c-4809-84c7-aba781d1dff1', 'In the Box', 'Contents', 'Action Camera, USB Cable, User Manual', 10);
INSERT INTO product_images (product_id, image_url, thumbnail_url, is_primary, sort_order) VALUES
  ('a403663a-986c-4809-84c7-aba781d1dff1', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/kalobee-pocket4-action-camera/1.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/kalobee-pocket4-action-camera/1.jpg', true, 0),
  ('a403663a-986c-4809-84c7-aba781d1dff1', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/kalobee-pocket4-action-camera/2.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/kalobee-pocket4-action-camera/2.jpg', false, 1),
  ('a403663a-986c-4809-84c7-aba781d1dff1', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/kalobee-pocket4-action-camera/3.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/kalobee-pocket4-action-camera/3.jpg', false, 2),
  ('a403663a-986c-4809-84c7-aba781d1dff1', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/kalobee-pocket4-action-camera/4.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/kalobee-pocket4-action-camera/4.jpg', false, 3),
  ('a403663a-986c-4809-84c7-aba781d1dff1', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/kalobee-pocket4-action-camera/5.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/kalobee-pocket4-action-camera/5.jpg', false, 4);
