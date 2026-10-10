-- New brands (idempotent)
INSERT INTO brands (id, name, slug, is_active) SELECT gen_random_uuid(), 'WINGS', 'wings', true WHERE NOT EXISTS (SELECT 1 FROM brands WHERE slug='wings');
INSERT INTO brands (id, name, slug, is_active) SELECT gen_random_uuid(), 'HP', 'hp', true WHERE NOT EXISTS (SELECT 1 FROM brands WHERE slug='hp');

-- ===== 1. BOAT-67WGAN-GRY =====
INSERT INTO products (id, name, slug, description, short_description, sku, category_id, subcategory_id, brand_id, mrp, selling_price, discount_percent, stock_quantity, low_stock_threshold, weight_grams, length_cm, breadth_cm, height_cm, is_active, is_featured, is_deal_of_day, rating, review_count, sold_count, meta_title, meta_description) VALUES (
  '681829ff-d948-4cbe-a1da-b9983f6a39b7', 'boAt 67W GaN Laptop Charger Triple Port Fast Charging Ash Grey', 'boat-67w-gan-laptop-charger-ash-grey', 'boAt 67W GaN Laptop Charger Triple Port Fast Charging Ash Grey.

KEY FEATURES:
- 67W fast charging with PD, PPS & QC 3.0
- 3 output ports: USB-A (30W QC) + dual Type-C (67W PD/PPS)
- 45W + 7.5W + 7.5W (max) across 3 ports
- GaN chip - minimal heat, maximum efficiency
- 12-layer Smart IC protection
- Compact, lightweight, corrosion & scratch resistant
- Compatible with MacBook, iPhone, iPad, Android, laptops', '67W GaN | Triple Port | PD + PPS + QC 3.0 | USB-A + Dual USB-C | 12-Layer Protection | Compact', 'BOAT-67WGAN-GRY', '08094555-b1b6-409a-af97-afa9fdffe03a', 'a357a43e-038e-4642-a7b1-37170e4d0485', (SELECT id FROM brands WHERE slug='boat'), 3499, 1149, 67.16, 10, 2, 150, 12, 9, 5, true, false, false, 4.2, 329, 0, 'boAt 67W GaN Laptop Charger Triple Port Fast Charging Ash Grey at ₹1149 | BoxDeal', 'Buy boAt 67W GaN Laptop Charger Triple Port Fast Charging Ash Grey at ₹1149 (MRP ₹3499). 67W GaN | Triple Port | PD + PPS + QC 3.0 | USB-A + Dual USB-C | 12-Layer Protection | Compact');
INSERT INTO product_specifications (product_id, spec_group, spec_name, spec_value, sort_order) VALUES
  ('681829ff-d948-4cbe-a1da-b9983f6a39b7', 'General', 'Brand', 'boAt', 1),
  ('681829ff-d948-4cbe-a1da-b9983f6a39b7', 'General', 'Model', '67W GaN Charger', 2),
  ('681829ff-d948-4cbe-a1da-b9983f6a39b7', 'General', 'Colour', 'Ash Grey', 3),
  ('681829ff-d948-4cbe-a1da-b9983f6a39b7', 'General', 'Country of Origin', 'India', 4),
  ('681829ff-d948-4cbe-a1da-b9983f6a39b7', 'General', 'Weight', '200 g', 5),
  ('681829ff-d948-4cbe-a1da-b9983f6a39b7', 'Technical', 'Output', '67W', 6),
  ('681829ff-d948-4cbe-a1da-b9983f6a39b7', 'Technical', 'Ports', 'USB-A + 2x USB-C', 7),
  ('681829ff-d948-4cbe-a1da-b9983f6a39b7', 'Technical', 'Fast Charging', 'PD, PPS, QC 3.0', 8),
  ('681829ff-d948-4cbe-a1da-b9983f6a39b7', 'Technical', 'Protection', '12-Layer Smart IC', 9),
  ('681829ff-d948-4cbe-a1da-b9983f6a39b7', 'Technical', 'Technology', 'GaN', 10),
  ('681829ff-d948-4cbe-a1da-b9983f6a39b7', 'In the Box', 'Contents', '67W GaN Charger, User Manual', 11);
INSERT INTO product_images (product_id, image_url, thumbnail_url, is_primary, sort_order) VALUES
  ('681829ff-d948-4cbe-a1da-b9983f6a39b7', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/boat-67w-gan-laptop-charger-ash-grey/1.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/boat-67w-gan-laptop-charger-ash-grey/1.jpg', true, 0),
  ('681829ff-d948-4cbe-a1da-b9983f6a39b7', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/boat-67w-gan-laptop-charger-ash-grey/2.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/boat-67w-gan-laptop-charger-ash-grey/2.jpg', false, 1),
  ('681829ff-d948-4cbe-a1da-b9983f6a39b7', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/boat-67w-gan-laptop-charger-ash-grey/3.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/boat-67w-gan-laptop-charger-ash-grey/3.jpg', false, 2),
  ('681829ff-d948-4cbe-a1da-b9983f6a39b7', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/boat-67w-gan-laptop-charger-ash-grey/4.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/boat-67w-gan-laptop-charger-ash-grey/4.jpg', false, 3),
  ('681829ff-d948-4cbe-a1da-b9983f6a39b7', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/boat-67w-gan-laptop-charger-ash-grey/5.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/boat-67w-gan-laptop-charger-ash-grey/5.jpg', false, 4);

-- ===== 2. BOAT-AD121PROPLUS-BLK =====
INSERT INTO products (id, name, slug, description, short_description, sku, category_id, subcategory_id, brand_id, mrp, selling_price, discount_percent, stock_quantity, low_stock_threshold, weight_grams, length_cm, breadth_cm, height_cm, is_active, is_featured, is_deal_of_day, rating, review_count, sold_count, meta_title, meta_description) VALUES (
  '97707032-0e8e-43e7-8226-85adaff9d4e5', 'boAt Airdopes 121 Pro Plus True Wireless Earbuds Black', 'boat-airdopes-121-pro-plus-earbuds-black', 'boAt Airdopes 121 Pro Plus True Wireless Earbuds Black.

KEY FEATURES:
- Up to 100 hours total playback
- 4 mics with ENx tech for clear calls
- BEAST Mode - 50ms low latency gaming
- Insta Wake N Pair (IWP)
- boAt Signature Sound with 10mm drivers
- LED display + app support
- Bluetooth 5.3, water resistant', 'TWS | 100Hr Playback | 4 Mics ENx | 50ms Low Latency BEAST Mode | 10mm Drivers | LED Display | IWP | BT 5.3', 'BOAT-AD121PROPLUS-BLK', 'b1832a09-4562-484f-8fd3-ad0c885d154a', '4ef6e248-5eef-4898-bcb3-e4f64c9d6dae', (SELECT id FROM brands WHERE slug='boat'), 4990, 899, 81.98, 100, 2, 110, 12, 10, 5, true, false, false, 4.1, 29211, 0, 'boAt Airdopes 121 Pro Plus True Wireless Earbuds Black at ₹899 | BoxDeal', 'Buy boAt Airdopes 121 Pro Plus True Wireless Earbuds Black at ₹899 (MRP ₹4990). TWS | 100Hr Playback | 4 Mics ENx | 50ms Low Latency BEAST Mode | 10mm Drivers | LED Display | IWP | BT 5.3');
INSERT INTO product_specifications (product_id, spec_group, spec_name, spec_value, sort_order) VALUES
  ('97707032-0e8e-43e7-8226-85adaff9d4e5', 'General', 'Brand', 'boAt', 1),
  ('97707032-0e8e-43e7-8226-85adaff9d4e5', 'General', 'Model', 'Airdopes 121 Pro Plus', 2),
  ('97707032-0e8e-43e7-8226-85adaff9d4e5', 'General', 'Colour', 'Black', 3),
  ('97707032-0e8e-43e7-8226-85adaff9d4e5', 'General', 'Form Factor', 'In Ear (True Wireless)', 4),
  ('97707032-0e8e-43e7-8226-85adaff9d4e5', 'General', 'Country of Origin', 'China', 5),
  ('97707032-0e8e-43e7-8226-85adaff9d4e5', 'General', 'Weight', '70 g', 6),
  ('97707032-0e8e-43e7-8226-85adaff9d4e5', 'Audio', 'Driver', '10mm Dynamic', 7),
  ('97707032-0e8e-43e7-8226-85adaff9d4e5', 'Audio', 'Impedance', '17 Ohms', 8),
  ('97707032-0e8e-43e7-8226-85adaff9d4e5', 'Audio', 'Latency', '50 ms (BEAST Mode)', 9),
  ('97707032-0e8e-43e7-8226-85adaff9d4e5', 'Technical', 'Bluetooth', '5.3', 10),
  ('97707032-0e8e-43e7-8226-85adaff9d4e5', 'Technical', 'Mics', '4 (ENx)', 11),
  ('97707032-0e8e-43e7-8226-85adaff9d4e5', 'Battery', 'Playback', 'Up to 100 hours', 12),
  ('97707032-0e8e-43e7-8226-85adaff9d4e5', 'Battery', 'Charge Time', '1.5 hours', 13),
  ('97707032-0e8e-43e7-8226-85adaff9d4e5', 'In the Box', 'Contents', 'Earbuds, Charging Cable, Extra Ear Tips, User Manual', 14);
INSERT INTO product_images (product_id, image_url, thumbnail_url, is_primary, sort_order) VALUES
  ('97707032-0e8e-43e7-8226-85adaff9d4e5', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/boat-airdopes-121-pro-plus-earbuds-black/1.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/boat-airdopes-121-pro-plus-earbuds-black/1.jpg', true, 0),
  ('97707032-0e8e-43e7-8226-85adaff9d4e5', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/boat-airdopes-121-pro-plus-earbuds-black/2.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/boat-airdopes-121-pro-plus-earbuds-black/2.jpg', false, 1),
  ('97707032-0e8e-43e7-8226-85adaff9d4e5', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/boat-airdopes-121-pro-plus-earbuds-black/3.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/boat-airdopes-121-pro-plus-earbuds-black/3.jpg', false, 2),
  ('97707032-0e8e-43e7-8226-85adaff9d4e5', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/boat-airdopes-121-pro-plus-earbuds-black/4.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/boat-airdopes-121-pro-plus-earbuds-black/4.jpg', false, 3),
  ('97707032-0e8e-43e7-8226-85adaff9d4e5', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/boat-airdopes-121-pro-plus-earbuds-black/5.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/boat-airdopes-121-pro-plus-earbuds-black/5.jpg', false, 4);

-- ===== 3. BOAT-AD163-BLK =====
INSERT INTO products (id, name, slug, description, short_description, sku, category_id, subcategory_id, brand_id, mrp, selling_price, discount_percent, stock_quantity, low_stock_threshold, weight_grams, length_cm, breadth_cm, height_cm, is_active, is_featured, is_deal_of_day, rating, review_count, sold_count, meta_title, meta_description) VALUES (
  '431d664c-701c-43bf-a10a-f005e8b345a0', 'boAt Airdopes 163 True Wireless Earbuds Active Black', 'boat-airdopes-163-earbuds-active-black', 'boAt Airdopes 163 True Wireless Earbuds Active Black.

KEY FEATURES:
- Up to 40 hours total playback
- ASAP Charge - 5 min = 90 min playback
- 13mm drivers with boAt Signature Sound
- IPX5 water resistant
- Quick touch response controls
- Bluetooth 5.1
- Lightweight design', 'TWS | 40Hr Playback | ASAP Charge | 13mm Drivers | IPX5 | Quick Touch Controls | BT 5.1', 'BOAT-AD163-BLK', 'b1832a09-4562-484f-8fd3-ad0c885d154a', '4ef6e248-5eef-4898-bcb3-e4f64c9d6dae', (SELECT id FROM brands WHERE slug='boat'), 2490, 749, 69.92, 100, 2, 120, 10, 12, 5, true, false, false, 4, 2418, 0, 'boAt Airdopes 163 True Wireless Earbuds Active Black at ₹749 | BoxDeal', 'Buy boAt Airdopes 163 True Wireless Earbuds Active Black at ₹749 (MRP ₹2490). TWS | 40Hr Playback | ASAP Charge | 13mm Drivers | IPX5 | Quick Touch Controls | BT 5.1');
INSERT INTO product_specifications (product_id, spec_group, spec_name, spec_value, sort_order) VALUES
  ('431d664c-701c-43bf-a10a-f005e8b345a0', 'General', 'Brand', 'boAt', 1),
  ('431d664c-701c-43bf-a10a-f005e8b345a0', 'General', 'Model', 'Airdopes 163', 2),
  ('431d664c-701c-43bf-a10a-f005e8b345a0', 'General', 'Colour', 'Active Black', 3),
  ('431d664c-701c-43bf-a10a-f005e8b345a0', 'General', 'Form Factor', 'In Ear (True Wireless)', 4),
  ('431d664c-701c-43bf-a10a-f005e8b345a0', 'General', 'Weight', '45 g', 5),
  ('431d664c-701c-43bf-a10a-f005e8b345a0', 'Audio', 'Driver', '13mm Dynamic', 6),
  ('431d664c-701c-43bf-a10a-f005e8b345a0', 'Technical', 'Bluetooth', '5.1', 7),
  ('431d664c-701c-43bf-a10a-f005e8b345a0', 'Technical', 'Water Resistance', 'IPX5', 8),
  ('431d664c-701c-43bf-a10a-f005e8b345a0', 'Technical', 'Controls', 'Quick Touch', 9),
  ('431d664c-701c-43bf-a10a-f005e8b345a0', 'Battery', 'Playback', 'Up to 40 hours', 10),
  ('431d664c-701c-43bf-a10a-f005e8b345a0', 'Battery', 'Fast Charge', '5 min = 90 min', 11),
  ('431d664c-701c-43bf-a10a-f005e8b345a0', 'In the Box', 'Contents', 'Earbuds, Charging Cable, User Manual, Warranty Card', 12);
INSERT INTO product_images (product_id, image_url, thumbnail_url, is_primary, sort_order) VALUES
  ('431d664c-701c-43bf-a10a-f005e8b345a0', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/boat-airdopes-163-earbuds-active-black/1.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/boat-airdopes-163-earbuds-active-black/1.jpg', true, 0),
  ('431d664c-701c-43bf-a10a-f005e8b345a0', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/boat-airdopes-163-earbuds-active-black/2.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/boat-airdopes-163-earbuds-active-black/2.jpg', false, 1),
  ('431d664c-701c-43bf-a10a-f005e8b345a0', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/boat-airdopes-163-earbuds-active-black/3.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/boat-airdopes-163-earbuds-active-black/3.jpg', false, 2),
  ('431d664c-701c-43bf-a10a-f005e8b345a0', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/boat-airdopes-163-earbuds-active-black/4.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/boat-airdopes-163-earbuds-active-black/4.jpg', false, 3),
  ('431d664c-701c-43bf-a10a-f005e8b345a0', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/boat-airdopes-163-earbuds-active-black/5.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/boat-airdopes-163-earbuds-active-black/5.jpg', false, 4);

-- ===== 4. ZEB-150HB-BLK =====
INSERT INTO products (id, name, slug, description, short_description, sku, category_id, subcategory_id, brand_id, mrp, selling_price, discount_percent, stock_quantity, low_stock_threshold, weight_grams, length_cm, breadth_cm, height_cm, is_active, is_featured, is_deal_of_day, rating, review_count, sold_count, meta_title, meta_description) VALUES (
  '8023536f-93fc-48f7-81a5-42b72a709676', 'ZEBRONICS 150HB 4-Port USB Hub with On/Off Switch & LED Black', 'zebronics-150hb-4-port-usb-hub-black', 'ZEBRONICS 150HB 4-Port USB Hub with On/Off Switch & LED Black.

KEY FEATURES:
- 4 USB 2.0 ports
- Dedicated on/off switch per port with LED indicators
- 45cm cable length
- Optional power input port for external HDDs
- Plug & play - no driver needed
- Up to 480 Mbps data transfer
- Works with PC & laptops', '4-Port USB 2.0 Hub | Individual On/Off Switch | LED Indicators | 45cm Cable | Optional Power Input | Plug & Play', 'ZEB-150HB-BLK', 'e28382bd-5edc-4042-acfb-4624e017e3d9', '5850eff3-ddfa-400d-a162-3997e9c572bd', (SELECT id FROM brands WHERE slug='zebronics'), 699, 130, 81.4, 3, 2, 80, 23, 11, 4, true, false, false, 4, 1655, 0, 'ZEBRONICS 150HB 4-Port USB Hub with On/Off Switch & LED Black at ₹130 | BoxDeal', 'Buy ZEBRONICS 150HB 4-Port USB Hub with On/Off Switch & LED Black at ₹130 (MRP ₹699). 4-Port USB 2.0 Hub | Individual On/Off Switch | LED Indicators | 45cm Cable | Optional Power Input | Plug & Play');
INSERT INTO product_specifications (product_id, spec_group, spec_name, spec_value, sort_order) VALUES
  ('8023536f-93fc-48f7-81a5-42b72a709676', 'General', 'Brand', 'ZEBRONICS', 1),
  ('8023536f-93fc-48f7-81a5-42b72a709676', 'General', 'Model', 'ZEB-150HB', 2),
  ('8023536f-93fc-48f7-81a5-42b72a709676', 'General', 'Colour', 'Black', 3),
  ('8023536f-93fc-48f7-81a5-42b72a709676', 'General', 'Country of Origin', 'China', 4),
  ('8023536f-93fc-48f7-81a5-42b72a709676', 'General', 'Weight', '100 g', 5),
  ('8023536f-93fc-48f7-81a5-42b72a709676', 'Technical', 'Ports', '4x USB 2.0', 6),
  ('8023536f-93fc-48f7-81a5-42b72a709676', 'Technical', 'Data Rate', '480 Mbps', 7),
  ('8023536f-93fc-48f7-81a5-42b72a709676', 'Technical', 'Cable Length', '45 cm', 8),
  ('8023536f-93fc-48f7-81a5-42b72a709676', 'Technical', 'Switches', 'Individual On/Off + LED', 9),
  ('8023536f-93fc-48f7-81a5-42b72a709676', 'Technical', 'Power Input', 'Optional (for external HDD)', 10),
  ('8023536f-93fc-48f7-81a5-42b72a709676', 'In the Box', 'Contents', 'USB Hub, User Manual', 11);
INSERT INTO product_images (product_id, image_url, thumbnail_url, is_primary, sort_order) VALUES
  ('8023536f-93fc-48f7-81a5-42b72a709676', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/zebronics-150hb-4-port-usb-hub-black/1.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/zebronics-150hb-4-port-usb-hub-black/1.jpg', true, 0),
  ('8023536f-93fc-48f7-81a5-42b72a709676', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/zebronics-150hb-4-port-usb-hub-black/2.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/zebronics-150hb-4-port-usb-hub-black/2.jpg', false, 1),
  ('8023536f-93fc-48f7-81a5-42b72a709676', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/zebronics-150hb-4-port-usb-hub-black/3.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/zebronics-150hb-4-port-usb-hub-black/3.jpg', false, 2),
  ('8023536f-93fc-48f7-81a5-42b72a709676', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/zebronics-150hb-4-port-usb-hub-black/4.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/zebronics-150hb-4-port-usb-hub-black/4.jpg', false, 3),
  ('8023536f-93fc-48f7-81a5-42b72a709676', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/zebronics-150hb-4-port-usb-hub-black/5.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/zebronics-150hb-4-port-usb-hub-black/5.jpg', false, 4);

-- ===== 5. WINGS-PHANTOM345-BLK =====
INSERT INTO products (id, name, slug, description, short_description, sku, category_id, subcategory_id, brand_id, mrp, selling_price, discount_percent, stock_quantity, low_stock_threshold, weight_grams, length_cm, breadth_cm, height_cm, is_active, is_featured, is_deal_of_day, rating, review_count, sold_count, meta_title, meta_description) VALUES (
  '400f80a4-40fb-45f0-943a-fa9a572087c9', 'WINGS Phantom 345 True Wireless Earbuds Black', 'wings-phantom-345-earbuds-black', 'WINGS Phantom 345 True Wireless Earbuds Black.

KEY FEATURES:
- Up to 50 hours playtime
- 40ms low latency gaming
- Quad ENC mics for clear calls
- 13mm drivers with deep bass
- App support
- Bluetooth 5.3 with 15m range
- Sweat & water resistant', 'TWS | 50Hr Playtime | 40ms Low Latency | Quad ENC Mic | 13mm Drivers | BT 5.3 | App Support | Deep Bass', 'WINGS-PHANTOM345-BLK', 'b1832a09-4562-484f-8fd3-ad0c885d154a', '4ef6e248-5eef-4898-bcb3-e4f64c9d6dae', (SELECT id FROM brands WHERE slug='wings'), 2999, 449, 85.03, 50, 2, 150, 11, 11, 4, true, false, false, 4.2, 520, 0, 'WINGS Phantom 345 True Wireless Earbuds Black at ₹449 | BoxDeal', 'Buy WINGS Phantom 345 True Wireless Earbuds Black at ₹449 (MRP ₹2999). TWS | 50Hr Playtime | 40ms Low Latency | Quad ENC Mic | 13mm Drivers | BT 5.3 | App Support | Deep Bass');
INSERT INTO product_specifications (product_id, spec_group, spec_name, spec_value, sort_order) VALUES
  ('400f80a4-40fb-45f0-943a-fa9a572087c9', 'General', 'Brand', 'WINGS', 1),
  ('400f80a4-40fb-45f0-943a-fa9a572087c9', 'General', 'Model', 'Phantom 345', 2),
  ('400f80a4-40fb-45f0-943a-fa9a572087c9', 'General', 'Colour', 'Black', 3),
  ('400f80a4-40fb-45f0-943a-fa9a572087c9', 'General', 'Form Factor', 'In Ear (True Wireless)', 4),
  ('400f80a4-40fb-45f0-943a-fa9a572087c9', 'Audio', 'Driver', '13mm', 5),
  ('400f80a4-40fb-45f0-943a-fa9a572087c9', 'Audio', 'SNR', '80 dB', 6),
  ('400f80a4-40fb-45f0-943a-fa9a572087c9', 'Audio', 'Noise Cancellation', 'Yes (Quad ENC)', 7),
  ('400f80a4-40fb-45f0-943a-fa9a572087c9', 'Technical', 'Bluetooth', '5.3', 8),
  ('400f80a4-40fb-45f0-943a-fa9a572087c9', 'Technical', 'Range', '15 m', 9),
  ('400f80a4-40fb-45f0-943a-fa9a572087c9', 'Technical', 'Latency', '40 ms', 10),
  ('400f80a4-40fb-45f0-943a-fa9a572087c9', 'Battery', 'Playtime', '50 hours', 11),
  ('400f80a4-40fb-45f0-943a-fa9a572087c9', 'Battery', 'Standby', '300 hours', 12),
  ('400f80a4-40fb-45f0-943a-fa9a572087c9', 'Battery', 'Charge Time', '1.5 hours', 13),
  ('400f80a4-40fb-45f0-943a-fa9a572087c9', 'In the Box', 'Contents', 'Earbuds, Charging Case, Charging Cable, User Manual', 14);
INSERT INTO product_images (product_id, image_url, thumbnail_url, is_primary, sort_order) VALUES
  ('400f80a4-40fb-45f0-943a-fa9a572087c9', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/wings-phantom-345-earbuds-black/1.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/wings-phantom-345-earbuds-black/1.jpg', true, 0),
  ('400f80a4-40fb-45f0-943a-fa9a572087c9', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/wings-phantom-345-earbuds-black/2.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/wings-phantom-345-earbuds-black/2.jpg', false, 1),
  ('400f80a4-40fb-45f0-943a-fa9a572087c9', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/wings-phantom-345-earbuds-black/3.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/wings-phantom-345-earbuds-black/3.jpg', false, 2),
  ('400f80a4-40fb-45f0-943a-fa9a572087c9', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/wings-phantom-345-earbuds-black/4.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/wings-phantom-345-earbuds-black/4.jpg', false, 3),
  ('400f80a4-40fb-45f0-943a-fa9a572087c9', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/wings-phantom-345-earbuds-black/5.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/wings-phantom-345-earbuds-black/5.jpg', false, 4);

-- ===== 6. HP-SPEAKER360-SLV =====
INSERT INTO products (id, name, slug, description, short_description, sku, category_id, subcategory_id, brand_id, mrp, selling_price, discount_percent, stock_quantity, low_stock_threshold, weight_grams, length_cm, breadth_cm, height_cm, is_active, is_featured, is_deal_of_day, rating, review_count, sold_count, meta_title, meta_description) VALUES (
  '54ab59b6-6f1e-47d6-aa7d-71af71e8431c', 'HP 360 Mono Portable Bluetooth Speaker with Mic IP54 Silver', 'hp-360-portable-bluetooth-speaker-silver', 'HP 360 Mono Portable Bluetooth Speaker with Mic IP54 Silver.

KEY FEATURES:
- DSP-enhanced distortion-free sound with deep bass
- Built-in microphone for calls
- IP54 dust & water resistant
- 40mm driver
- Portable tabletop design
- Bluetooth + AUX connectivity
- USB-C charging', 'Portable Bluetooth Speaker | DSP-Enhanced Sound | Built-in Mic | IP54 Dust & Water Resistant | USB-C', 'HP-SPEAKER360-SLV', '91b8a207-2b75-4fac-bcbb-bfe47474acec', '1a90e2b7-e458-43d8-8c7a-245de19cbed8', (SELECT id FROM brands WHERE slug='hp'), 2996, 475, 84.15, 1, 2, 500, 11, 11, 11, true, false, false, 4.1, 269, 0, 'HP 360 Mono Portable Bluetooth Speaker with Mic IP54 Silver at ₹475 | BoxDeal', 'Buy HP 360 Mono Portable Bluetooth Speaker with Mic IP54 Silver at ₹475 (MRP ₹2996). Portable Bluetooth Speaker | DSP-Enhanced Sound | Built-in Mic | IP54 Dust & Water Resistant | USB-C');
INSERT INTO product_specifications (product_id, spec_group, spec_name, spec_value, sort_order) VALUES
  ('54ab59b6-6f1e-47d6-aa7d-71af71e8431c', 'General', 'Brand', 'HP', 1),
  ('54ab59b6-6f1e-47d6-aa7d-71af71e8431c', 'General', 'Model', 'Speaker 360 (2D801AA)', 2),
  ('54ab59b6-6f1e-47d6-aa7d-71af71e8431c', 'General', 'Colour', 'Silver', 3),
  ('54ab59b6-6f1e-47d6-aa7d-71af71e8431c', 'General', 'Type', 'Portable Speaker', 4),
  ('54ab59b6-6f1e-47d6-aa7d-71af71e8431c', 'General', 'Country of Origin', 'China', 5),
  ('54ab59b6-6f1e-47d6-aa7d-71af71e8431c', 'General', 'Weight', '180 g', 6),
  ('54ab59b6-6f1e-47d6-aa7d-71af71e8431c', 'Audio', 'Driver', '40mm', 7),
  ('54ab59b6-6f1e-47d6-aa7d-71af71e8431c', 'Audio', 'Mode', 'Mono', 8),
  ('54ab59b6-6f1e-47d6-aa7d-71af71e8431c', 'Technical', 'Bluetooth', 'Yes', 9),
  ('54ab59b6-6f1e-47d6-aa7d-71af71e8431c', 'Technical', 'Mic', 'Built-in (1)', 10),
  ('54ab59b6-6f1e-47d6-aa7d-71af71e8431c', 'Technical', 'Water Resistance', 'IP54', 11),
  ('54ab59b6-6f1e-47d6-aa7d-71af71e8431c', 'In the Box', 'Contents', 'Speaker, USB-C Cable, Quick Start Poster, Warranty', 12);
INSERT INTO product_images (product_id, image_url, thumbnail_url, is_primary, sort_order) VALUES
  ('54ab59b6-6f1e-47d6-aa7d-71af71e8431c', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/hp-360-portable-bluetooth-speaker-silver/1.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/hp-360-portable-bluetooth-speaker-silver/1.jpg', true, 0),
  ('54ab59b6-6f1e-47d6-aa7d-71af71e8431c', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/hp-360-portable-bluetooth-speaker-silver/2.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/hp-360-portable-bluetooth-speaker-silver/2.jpg', false, 1),
  ('54ab59b6-6f1e-47d6-aa7d-71af71e8431c', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/hp-360-portable-bluetooth-speaker-silver/3.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/hp-360-portable-bluetooth-speaker-silver/3.jpg', false, 2),
  ('54ab59b6-6f1e-47d6-aa7d-71af71e8431c', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/hp-360-portable-bluetooth-speaker-silver/4.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/hp-360-portable-bluetooth-speaker-silver/4.jpg', false, 3),
  ('54ab59b6-6f1e-47d6-aa7d-71af71e8431c', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/hp-360-portable-bluetooth-speaker-silver/5.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/hp-360-portable-bluetooth-speaker-silver/5.jpg', false, 4);

-- ===== 7. ZEB-JUKEBAR3902-BLK =====
INSERT INTO products (id, name, slug, description, short_description, sku, category_id, subcategory_id, brand_id, mrp, selling_price, discount_percent, stock_quantity, low_stock_threshold, weight_grams, length_cm, breadth_cm, height_cm, is_active, is_featured, is_deal_of_day, rating, review_count, sold_count, meta_title, meta_description) VALUES (
  '81bf8081-5f33-4fb8-807f-9fcad8477e0c', 'ZEBRONICS Juke BAR 3902 140W Soundbar with Subwoofer Black', 'zebronics-juke-bar-3902-soundbar-black', 'ZEBRONICS Juke BAR 3902 140W Soundbar with Subwoofer Black.

KEY FEATURES:
- 100W output - 40W soundbar + 60W subwoofer
- Virtual 5.1 surround sound
- 4.46-inch subwoofer driver for deep bass
- HDMI ARC, Optical, USB, AUX & Bluetooth 5.0
- Wall mountable design
- LED indicator for settings & modes
- Remote control included', 'Soundbar + Subwoofer | 100W | Virtual 5.1 | HDMI ARC | Optical | USB | AUX | Bluetooth 5.0 | Wall Mountable', 'ZEB-JUKEBAR3902-BLK', '91b8a207-2b75-4fac-bcbb-bfe47474acec', 'f254ebf8-dc19-4717-b144-361660cb78cf', (SELECT id FROM brands WHERE slug='zebronics'), 14999, 2799, 81.34, 2, 2, 4000, 36, 20, 70, true, false, false, 4.2, 895, 0, 'ZEBRONICS Juke BAR 3902 140W Soundbar with Subwoofer Black at ₹2799 | BoxDeal', 'Buy ZEBRONICS Juke BAR 3902 140W Soundbar with Subwoofer Black at ₹2799 (MRP ₹14999). Soundbar + Subwoofer | 100W | Virtual 5.1 | HDMI ARC | Optical | USB | AUX | Bluetooth 5.0 | Wall Mountable');
INSERT INTO product_specifications (product_id, spec_group, spec_name, spec_value, sort_order) VALUES
  ('81bf8081-5f33-4fb8-807f-9fcad8477e0c', 'General', 'Brand', 'ZEBRONICS', 1),
  ('81bf8081-5f33-4fb8-807f-9fcad8477e0c', 'General', 'Model', 'ZEB-Jukebar 3902', 2),
  ('81bf8081-5f33-4fb8-807f-9fcad8477e0c', 'General', 'Colour', 'Black', 3),
  ('81bf8081-5f33-4fb8-807f-9fcad8477e0c', 'General', 'Type', 'Soundbar + Subwoofer', 4),
  ('81bf8081-5f33-4fb8-807f-9fcad8477e0c', 'General', 'Weight', '2 kg', 5),
  ('81bf8081-5f33-4fb8-807f-9fcad8477e0c', 'Audio', 'Output Power', '100W (40W bar + 60W sub)', 6),
  ('81bf8081-5f33-4fb8-807f-9fcad8477e0c', 'Audio', 'Channels', 'Virtual 5.1', 7),
  ('81bf8081-5f33-4fb8-807f-9fcad8477e0c', 'Audio', 'Woofer', '11.43 cm (4.46")', 8),
  ('81bf8081-5f33-4fb8-807f-9fcad8477e0c', 'Audio', 'Frequency', '55 Hz', 9),
  ('81bf8081-5f33-4fb8-807f-9fcad8477e0c', 'Technical', 'Connectivity', 'HDMI ARC, Optical, USB, AUX, BT 5.0', 10),
  ('81bf8081-5f33-4fb8-807f-9fcad8477e0c', 'Technical', 'Mounting', 'Wall Mountable', 11),
  ('81bf8081-5f33-4fb8-807f-9fcad8477e0c', 'Technical', 'Control', 'Remote', 12),
  ('81bf8081-5f33-4fb8-807f-9fcad8477e0c', 'In the Box', 'Contents', 'Soundbar, Subwoofer, Remote, Input Cable, QR Guide', 13);
INSERT INTO product_images (product_id, image_url, thumbnail_url, is_primary, sort_order) VALUES
  ('81bf8081-5f33-4fb8-807f-9fcad8477e0c', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/zebronics-juke-bar-3902-soundbar-black/1.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/zebronics-juke-bar-3902-soundbar-black/1.jpg', true, 0),
  ('81bf8081-5f33-4fb8-807f-9fcad8477e0c', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/zebronics-juke-bar-3902-soundbar-black/2.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/zebronics-juke-bar-3902-soundbar-black/2.jpg', false, 1),
  ('81bf8081-5f33-4fb8-807f-9fcad8477e0c', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/zebronics-juke-bar-3902-soundbar-black/3.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/zebronics-juke-bar-3902-soundbar-black/3.jpg', false, 2),
  ('81bf8081-5f33-4fb8-807f-9fcad8477e0c', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/zebronics-juke-bar-3902-soundbar-black/4.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/zebronics-juke-bar-3902-soundbar-black/4.jpg', false, 3),
  ('81bf8081-5f33-4fb8-807f-9fcad8477e0c', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/zebronics-juke-bar-3902-soundbar-black/5.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/zebronics-juke-bar-3902-soundbar-black/5.jpg', false, 4);
