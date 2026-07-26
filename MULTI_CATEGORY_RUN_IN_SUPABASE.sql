-- New brands (idempotent)
INSERT INTO brands (id, name, slug, is_active) SELECT gen_random_uuid(), 'Tukzer', 'tukzer', true WHERE NOT EXISTS (SELECT 1 FROM brands WHERE slug='tukzer');
INSERT INTO brands (id, name, slug, is_active) SELECT gen_random_uuid(), 'Lenovo', 'lenovo', true WHERE NOT EXISTS (SELECT 1 FROM brands WHERE slug='lenovo');
INSERT INTO brands (id, name, slug, is_active) SELECT gen_random_uuid(), 'Poly', 'poly', true WHERE NOT EXISTS (SELECT 1 FROM brands WHERE slug='poly');
INSERT INTO brands (id, name, slug, is_active) SELECT gen_random_uuid(), 'Belkin', 'belkin', true WHERE NOT EXISTS (SELECT 1 FROM brands WHERE slug='belkin');
-- New subcategories under Charger: Dongle + Cables
INSERT INTO subcategories (id, category_id, name, slug) SELECT gen_random_uuid(), '08094555-b1b6-409a-af97-afa9fdffe03a', 'Dongle', 'dongle' WHERE NOT EXISTS (SELECT 1 FROM subcategories WHERE slug='dongle');
INSERT INTO subcategories (id, category_id, name, slug) SELECT gen_random_uuid(), '08094555-b1b6-409a-af97-afa9fdffe03a', 'Cables', 'cables' WHERE NOT EXISTS (SELECT 1 FROM subcategories WHERE slug='cables');

-- ===== 1. TUKZER-TZRL1-BLK =====
INSERT INTO products (id, name, slug, description, short_description, sku, category_id, subcategory_id, brand_id, mrp, selling_price, discount_percent, stock_quantity, low_stock_threshold, weight_grams, length_cm, breadth_cm, height_cm, is_active, is_featured, is_deal_of_day, rating, review_count, sold_count, meta_title, meta_description) VALUES (
  'ab84b097-0f15-4898-bb69-7896671c84ed', 'Tukzer 3.5" LED Selfie Ring Light with Flexible Arm Desk Clamp Black', 'tukzer-selfie-ring-light-black', 'Tukzer 3.5" LED Selfie Ring Light with Flexible Arm Desk Clamp Black.

KEY FEATURES:
- 12W dimmable LED with 3 light modes (3000K/4500K/6500K)
- 10 adjustable brightness levels per mode
- 360° flexible 1.8ft gooseneck arm
- Strong metal clip (opens up to 2.9 inch) with foam pad
- Eye-caring no-flicker soft light
- USB powered (5V/2A) - no battery needed
- Aluminium build', '3.5" LED Ring Light | 3 Colour Modes | 10 Brightness Levels | 360° Gooseneck | Desk Clamp | USB Powered', 'TUKZER-TZRL1-BLK', 'b6404196-92a1-4de0-8609-c0ef62d51afe', '9652fe4e-7334-4395-8d62-69eb3b14c0ff', (SELECT id FROM brands WHERE slug='tukzer'), 1799, 475, 73.6, 1, 1, 400, 20, 9, 26, true, false, false, 0, 0, 0, 'Tukzer 3.5" LED Selfie Ring Light with Flexible Arm Desk Clamp Black at ₹475 | BoxDeal', 'Buy Tukzer 3.5" LED Selfie Ring Light with Flexible Arm Desk Clamp Black at ₹475 (MRP ₹1799). 3.5" LED Ring Light | 3 Colour Modes | 10 Brightness Levels | 360° Gooseneck | Desk Clamp | USB Powered');
INSERT INTO product_specifications (product_id, spec_group, spec_name, spec_value, sort_order) VALUES
  ('ab84b097-0f15-4898-bb69-7896671c84ed', 'General', 'Brand', 'Tukzer', 1),
  ('ab84b097-0f15-4898-bb69-7896671c84ed', 'General', 'Model', 'TZ-RL1', 2),
  ('ab84b097-0f15-4898-bb69-7896671c84ed', 'General', 'Colour', 'Black', 3),
  ('ab84b097-0f15-4898-bb69-7896671c84ed', 'General', 'Material', 'Aluminium', 4),
  ('ab84b097-0f15-4898-bb69-7896671c84ed', 'General', 'Weight', '312 g', 5),
  ('ab84b097-0f15-4898-bb69-7896671c84ed', 'Technical', 'Power', '12W LED, USB (5V/2A)', 6),
  ('ab84b097-0f15-4898-bb69-7896671c84ed', 'Technical', 'Light Modes', '3 (3000K / 4500K / 6500K)', 7),
  ('ab84b097-0f15-4898-bb69-7896671c84ed', 'Technical', 'Brightness Levels', '10 per mode', 8),
  ('ab84b097-0f15-4898-bb69-7896671c84ed', 'Technical', 'Arm', '360° Gooseneck, 1.8 ft', 9),
  ('ab84b097-0f15-4898-bb69-7896671c84ed', 'Technical', 'Clip Opening', 'Up to 2.9 inch', 10),
  ('ab84b097-0f15-4898-bb69-7896671c84ed', 'In the Box', 'Contents', '1 x Selfie Ring Light', 11);
INSERT INTO product_images (product_id, image_url, thumbnail_url, is_primary, sort_order) VALUES
  ('ab84b097-0f15-4898-bb69-7896671c84ed', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/tukzer-selfie-ring-light-black/1.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/tukzer-selfie-ring-light-black/1.jpg', true, 0),
  ('ab84b097-0f15-4898-bb69-7896671c84ed', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/tukzer-selfie-ring-light-black/2.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/tukzer-selfie-ring-light-black/2.jpg', false, 1),
  ('ab84b097-0f15-4898-bb69-7896671c84ed', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/tukzer-selfie-ring-light-black/3.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/tukzer-selfie-ring-light-black/3.jpg', false, 2),
  ('ab84b097-0f15-4898-bb69-7896671c84ed', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/tukzer-selfie-ring-light-black/4.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/tukzer-selfie-ring-light-black/4.jpg', false, 3),
  ('ab84b097-0f15-4898-bb69-7896671c84ed', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/tukzer-selfie-ring-light-black/5.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/tukzer-selfie-ring-light-black/5.jpg', false, 4);

-- ===== 2. POR-2530-BLK =====
INSERT INTO products (id, name, slug, description, short_description, sku, category_id, subcategory_id, brand_id, mrp, selling_price, discount_percent, stock_quantity, low_stock_threshold, weight_grams, length_cm, breadth_cm, height_cm, is_active, is_featured, is_deal_of_day, rating, review_count, sold_count, meta_title, meta_description) VALUES (
  '1c206021-7485-4127-869e-a2d90fdaba73', 'Portronics Clamp M4 Car Phone Holder with 360° Rotation & Suction Mount Black', 'portronics-clamp-m4-car-phone-holder-black', 'Portronics Clamp M4 Car Phone Holder with 360° Rotation & Suction Mount Black.

KEY FEATURES:
- Powerful suction cup adheres to smooth surfaces
- Strong steady grip prevents slipping
- Effortless one-hand operation
- Durable shockproof ABS build
- 180° adjustable rotation
- Fits 5.4" to 6.7" smartphones', 'Car Phone Holder | Suction Cup Mount | 360° Rotation | Strong Grip | One-Hand Use | Shockproof ABS', 'POR-2530-BLK', 'e28382bd-5edc-4042-acfb-4624e017e3d9', 'dc93791a-2d73-4ad6-ab08-eda9ca247dc4', (SELECT id FROM brands WHERE slug='portronics'), 799, 160, 79.97, 1, 1, 250, 17, 8, 2, true, false, false, 0, 0, 0, 'Portronics Clamp M4 Car Phone Holder with 360° Rotation & Suction Mount Black at ₹160 | BoxDeal', 'Buy Portronics Clamp M4 Car Phone Holder with 360° Rotation & Suction Mount Black at ₹160 (MRP ₹799). Car Phone Holder | Suction Cup Mount | 360° Rotation | Strong Grip | One-Hand Use | Shockproof ABS');
INSERT INTO product_specifications (product_id, spec_group, spec_name, spec_value, sort_order) VALUES
  ('1c206021-7485-4127-869e-a2d90fdaba73', 'General', 'Brand', 'Portronics', 1),
  ('1c206021-7485-4127-869e-a2d90fdaba73', 'General', 'Model', 'Clamp M4', 2),
  ('1c206021-7485-4127-869e-a2d90fdaba73', 'General', 'Colour', 'Black', 3),
  ('1c206021-7485-4127-869e-a2d90fdaba73', 'General', 'Material', 'ABS Plastic', 4),
  ('1c206021-7485-4127-869e-a2d90fdaba73', 'General', 'Weight', '200 g', 5),
  ('1c206021-7485-4127-869e-a2d90fdaba73', 'General', 'Country of Origin', 'China', 6),
  ('1c206021-7485-4127-869e-a2d90fdaba73', 'Technical', 'Mounting', 'Dashboard / Suction Cup', 7),
  ('1c206021-7485-4127-869e-a2d90fdaba73', 'Technical', 'Rotation', '360°', 8),
  ('1c206021-7485-4127-869e-a2d90fdaba73', 'Technical', 'Compatible', '5.4 - 6.7 inch smartphones', 9),
  ('1c206021-7485-4127-869e-a2d90fdaba73', 'In the Box', 'Contents', '1 x Car Mobile Holder', 10);
INSERT INTO product_images (product_id, image_url, thumbnail_url, is_primary, sort_order) VALUES
  ('1c206021-7485-4127-869e-a2d90fdaba73', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/portronics-clamp-m4-car-phone-holder-black/1.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/portronics-clamp-m4-car-phone-holder-black/1.jpg', true, 0),
  ('1c206021-7485-4127-869e-a2d90fdaba73', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/portronics-clamp-m4-car-phone-holder-black/2.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/portronics-clamp-m4-car-phone-holder-black/2.jpg', false, 1),
  ('1c206021-7485-4127-869e-a2d90fdaba73', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/portronics-clamp-m4-car-phone-holder-black/3.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/portronics-clamp-m4-car-phone-holder-black/3.jpg', false, 2),
  ('1c206021-7485-4127-869e-a2d90fdaba73', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/portronics-clamp-m4-car-phone-holder-black/4.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/portronics-clamp-m4-car-phone-holder-black/4.jpg', false, 3),
  ('1c206021-7485-4127-869e-a2d90fdaba73', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/portronics-clamp-m4-car-phone-holder-black/5.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/portronics-clamp-m4-car-phone-holder-black/5.jpg', false, 4);

-- ===== 3. XIAOMI-MIBAND4-BLK =====
INSERT INTO products (id, name, slug, description, short_description, sku, category_id, subcategory_id, brand_id, mrp, selling_price, discount_percent, stock_quantity, low_stock_threshold, weight_grams, length_cm, breadth_cm, height_cm, is_active, is_featured, is_deal_of_day, rating, review_count, sold_count, meta_title, meta_description) VALUES (
  '8eb5ef53-c67d-40d5-91e1-18b9de9defd5', 'Mi Smart Band 4 AMOLED Fitness Band Black', 'mi-smart-band-4-fitness-band-black', 'Mi Smart Band 4 AMOLED Fitness Band Black.

KEY FEATURES:
- Colour AMOLED full-touch display
- Up to 20 days battery life
- 24/7 heart rate monitoring
- Water resistant up to 50m (5ATM)
- Swim tracking with stroke recognition
- Sleep monitoring & wristband alarm
- 6 workout modes
- Incoming call & app notifications, music controls
- Unlimited watch faces', 'AMOLED Full-Touch Display | 20 Day Battery | 24/7 Heart Rate | 5ATM Waterproof | Swim Tracking | Sleep Monitor', 'XIAOMI-MIBAND4-BLK', '7b0b7971-dd65-4643-91c9-c9c4a943da19', NULL, (SELECT id FROM brands WHERE slug='xiaomi'), 2499, 900, 63.99, 1, 1, 100, 17, 8, 2, true, false, false, 0, 0, 0, 'Mi Smart Band 4 AMOLED Fitness Band Black at ₹900 | BoxDeal', 'Buy Mi Smart Band 4 AMOLED Fitness Band Black at ₹900 (MRP ₹2499). AMOLED Full-Touch Display | 20 Day Battery | 24/7 Heart Rate | 5ATM Waterproof | Swim Tracking | Sleep Monitor');
INSERT INTO product_specifications (product_id, spec_group, spec_name, spec_value, sort_order) VALUES
  ('8eb5ef53-c67d-40d5-91e1-18b9de9defd5', 'General', 'Brand', 'Xiaomi (Mi)', 1),
  ('8eb5ef53-c67d-40d5-91e1-18b9de9defd5', 'General', 'Model', 'Mi Smart Band 4', 2),
  ('8eb5ef53-c67d-40d5-91e1-18b9de9defd5', 'General', 'Colour', 'Black', 3),
  ('8eb5ef53-c67d-40d5-91e1-18b9de9defd5', 'General', 'Display', 'AMOLED Full-Touch Colour', 4),
  ('8eb5ef53-c67d-40d5-91e1-18b9de9defd5', 'Technical', 'Heart Rate', '24/7 Monitoring', 5),
  ('8eb5ef53-c67d-40d5-91e1-18b9de9defd5', 'Technical', 'Water Resistance', '50m (5ATM)', 6),
  ('8eb5ef53-c67d-40d5-91e1-18b9de9defd5', 'Technical', 'Workout Modes', '6 (incl. swim tracking)', 7),
  ('8eb5ef53-c67d-40d5-91e1-18b9de9defd5', 'Technical', 'Notifications', 'Call, App, Message', 8),
  ('8eb5ef53-c67d-40d5-91e1-18b9de9defd5', 'Battery', 'Life', 'Up to 20 days', 9),
  ('8eb5ef53-c67d-40d5-91e1-18b9de9defd5', 'In the Box', 'Contents', 'Smart Band, Strap, Charging Cable, User Manual', 10);
INSERT INTO product_images (product_id, image_url, thumbnail_url, is_primary, sort_order) VALUES
  ('8eb5ef53-c67d-40d5-91e1-18b9de9defd5', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/mi-smart-band-4-fitness-band-black/1.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/mi-smart-band-4-fitness-band-black/1.jpg', true, 0),
  ('8eb5ef53-c67d-40d5-91e1-18b9de9defd5', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/mi-smart-band-4-fitness-band-black/2.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/mi-smart-band-4-fitness-band-black/2.jpg', false, 1),
  ('8eb5ef53-c67d-40d5-91e1-18b9de9defd5', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/mi-smart-band-4-fitness-band-black/3.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/mi-smart-band-4-fitness-band-black/3.jpg', false, 2),
  ('8eb5ef53-c67d-40d5-91e1-18b9de9defd5', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/mi-smart-band-4-fitness-band-black/4.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/mi-smart-band-4-fitness-band-black/4.jpg', false, 3),
  ('8eb5ef53-c67d-40d5-91e1-18b9de9defd5', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/mi-smart-band-4-fitness-band-black/5.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/mi-smart-band-4-fitness-band-black/5.jpg', false, 4);

-- ===== 4. LENOVO-110-WHT =====
INSERT INTO products (id, name, slug, description, short_description, sku, category_id, subcategory_id, brand_id, mrp, selling_price, discount_percent, stock_quantity, low_stock_threshold, weight_grams, length_cm, breadth_cm, height_cm, is_active, is_featured, is_deal_of_day, rating, review_count, sold_count, meta_title, meta_description) VALUES (
  '7f8a3978-95a2-4617-a806-4b2ababa34ae', 'Lenovo 110 Wired On-Ear USB Headphones with Mic White', 'lenovo-110-wired-headphones-white', 'Lenovo 110 Wired On-Ear USB Headphones with Mic White.

KEY FEATURES:
- Plug & play with 1.8m USB-A cable
- 30mm drivers with neodymium magnets
- Rotatable boom mic (left/right wearing)
- Passive noise cancelling
- Protein leather & memory foam earcups
- Lightweight ergonomic design
- Works with Chromebook, PC, laptops', 'Wired On-Ear | USB-A | 30mm Drivers | Rotatable Boom Mic | Passive Noise Cancelling | Memory Foam | 1.8m Cable', 'LENOVO-110-WHT', '73a3176b-3552-435f-9d04-eb8f07439994', 'df763827-133e-4b05-be75-450eab2daf17', (SELECT id FROM brands WHERE slug='lenovo'), 5251, 2935, 44.11, 1, 1, 350, 20, 20, 7, true, false, false, 0, 0, 0, 'Lenovo 110 Wired On-Ear USB Headphones with Mic White at ₹2935 | BoxDeal', 'Buy Lenovo 110 Wired On-Ear USB Headphones with Mic White at ₹2935 (MRP ₹5251). Wired On-Ear | USB-A | 30mm Drivers | Rotatable Boom Mic | Passive Noise Cancelling | Memory Foam | 1.8m Cable');
INSERT INTO product_specifications (product_id, spec_group, spec_name, spec_value, sort_order) VALUES
  ('7f8a3978-95a2-4617-a806-4b2ababa34ae', 'General', 'Brand', 'Lenovo', 1),
  ('7f8a3978-95a2-4617-a806-4b2ababa34ae', 'General', 'Model', '110 USB Headset', 2),
  ('7f8a3978-95a2-4617-a806-4b2ababa34ae', 'General', 'Colour', 'White', 3),
  ('7f8a3978-95a2-4617-a806-4b2ababa34ae', 'General', 'Form Factor', 'On Ear', 4),
  ('7f8a3978-95a2-4617-a806-4b2ababa34ae', 'General', 'Weight', '137 g', 5),
  ('7f8a3978-95a2-4617-a806-4b2ababa34ae', 'Audio', 'Driver', '30mm Dynamic (Neodymium)', 6),
  ('7f8a3978-95a2-4617-a806-4b2ababa34ae', 'Audio', 'Impedance', '32 Ohms', 7),
  ('7f8a3978-95a2-4617-a806-4b2ababa34ae', 'Audio', 'Noise Control', 'Passive Noise Cancellation', 8),
  ('7f8a3978-95a2-4617-a806-4b2ababa34ae', 'Technical', 'Connectivity', 'Wired USB-A (1.8m)', 9),
  ('7f8a3978-95a2-4617-a806-4b2ababa34ae', 'Technical', 'Microphone', 'Rotatable Boom Mic', 10),
  ('7f8a3978-95a2-4617-a806-4b2ababa34ae', 'In the Box', 'Contents', 'Headset, Warranty Poster', 11);
INSERT INTO product_images (product_id, image_url, thumbnail_url, is_primary, sort_order) VALUES
  ('7f8a3978-95a2-4617-a806-4b2ababa34ae', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/lenovo-110-wired-headphones-white/1.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/lenovo-110-wired-headphones-white/1.jpg', true, 0),
  ('7f8a3978-95a2-4617-a806-4b2ababa34ae', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/lenovo-110-wired-headphones-white/2.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/lenovo-110-wired-headphones-white/2.jpg', false, 1),
  ('7f8a3978-95a2-4617-a806-4b2ababa34ae', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/lenovo-110-wired-headphones-white/3.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/lenovo-110-wired-headphones-white/3.jpg', false, 2),
  ('7f8a3978-95a2-4617-a806-4b2ababa34ae', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/lenovo-110-wired-headphones-white/4.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/lenovo-110-wired-headphones-white/4.jpg', false, 3),
  ('7f8a3978-95a2-4617-a806-4b2ababa34ae', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/lenovo-110-wired-headphones-white/5.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/lenovo-110-wired-headphones-white/5.jpg', false, 4);

-- ===== 5. AMZB-4GDONGLE-BLK =====
INSERT INTO products (id, name, slug, description, short_description, sku, category_id, subcategory_id, brand_id, mrp, selling_price, discount_percent, stock_quantity, low_stock_threshold, weight_grams, length_cm, breadth_cm, height_cm, is_active, is_featured, is_deal_of_day, rating, review_count, sold_count, meta_title, meta_description) VALUES (
  '64ad0baa-66da-4b0b-a4e9-42a85e0c19c9', 'Amazon Basics 4G LTE Wireless Dongle with All SIM Support Black', 'amazon-basics-4g-lte-wireless-dongle-black', 'Amazon Basics 4G LTE Wireless Dongle with All SIM Support Black.

KEY FEATURES:
- Supports up to 10 Wi-Fi devices
- ASR1803S chipset, all-SIM support
- Up to 150Mbps download / 50Mbps upload
- All SIM support (Jio, Airtel, Vi, BSNL)
- 2200mAh rechargeable battery
- LED signal indicator, ultra-portable
- SIM adapter included', '4G LTE Wi-Fi Dongle | All SIM Support | Up to 150Mbps | 10 Device Hotspot | 2200mAh Battery | Plug & Play', 'AMZB-4GDONGLE-BLK', '08094555-b1b6-409a-af97-afa9fdffe03a', (SELECT id FROM subcategories WHERE slug='dongle'), (SELECT id FROM brands WHERE slug='amazon-basics'), 4999, 1749, 65.01, 1, 1, 150, 7, 11, 3, true, false, false, 0, 0, 0, 'Amazon Basics 4G LTE Wireless Dongle with All SIM Support Black at ₹1749 | BoxDeal', 'Buy Amazon Basics 4G LTE Wireless Dongle with All SIM Support Black at ₹1749 (MRP ₹4999). 4G LTE Wi-Fi Dongle | All SIM Support | Up to 150Mbps | 10 Device Hotspot | 2200mAh Battery | Plug & Play');
INSERT INTO product_specifications (product_id, spec_group, spec_name, spec_value, sort_order) VALUES
  ('64ad0baa-66da-4b0b-a4e9-42a85e0c19c9', 'General', 'Brand', 'Amazon Basics', 1),
  ('64ad0baa-66da-4b0b-a4e9-42a85e0c19c9', 'General', 'Model', 'AB-YAS-WIFID', 2),
  ('64ad0baa-66da-4b0b-a4e9-42a85e0c19c9', 'General', 'Colour', 'Black', 3),
  ('64ad0baa-66da-4b0b-a4e9-42a85e0c19c9', 'General', 'Country of Origin', 'China', 4),
  ('64ad0baa-66da-4b0b-a4e9-42a85e0c19c9', 'Technical', 'Connectivity', '4G LTE', 5),
  ('64ad0baa-66da-4b0b-a4e9-42a85e0c19c9', 'Technical', 'Wi-Fi', '802.11g (Wi-Fi 4)', 6),
  ('64ad0baa-66da-4b0b-a4e9-42a85e0c19c9', 'Technical', 'Download Speed', 'Up to 150 Mbps', 7),
  ('64ad0baa-66da-4b0b-a4e9-42a85e0c19c9', 'Technical', 'Upload Speed', 'Up to 50 Mbps', 8),
  ('64ad0baa-66da-4b0b-a4e9-42a85e0c19c9', 'Technical', 'Devices Supported', '10', 9),
  ('64ad0baa-66da-4b0b-a4e9-42a85e0c19c9', 'Battery', 'Capacity', '2200 mAh', 10),
  ('64ad0baa-66da-4b0b-a4e9-42a85e0c19c9', 'In the Box', 'Contents', 'Wi-Fi Dongle, Battery, Charging Cable, SIM Tray', 11);
INSERT INTO product_images (product_id, image_url, thumbnail_url, is_primary, sort_order) VALUES
  ('64ad0baa-66da-4b0b-a4e9-42a85e0c19c9', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/amazon-basics-4g-lte-wireless-dongle-black/1.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/amazon-basics-4g-lte-wireless-dongle-black/1.jpg', true, 0),
  ('64ad0baa-66da-4b0b-a4e9-42a85e0c19c9', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/amazon-basics-4g-lte-wireless-dongle-black/2.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/amazon-basics-4g-lte-wireless-dongle-black/2.jpg', false, 1),
  ('64ad0baa-66da-4b0b-a4e9-42a85e0c19c9', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/amazon-basics-4g-lte-wireless-dongle-black/3.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/amazon-basics-4g-lte-wireless-dongle-black/3.jpg', false, 2),
  ('64ad0baa-66da-4b0b-a4e9-42a85e0c19c9', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/amazon-basics-4g-lte-wireless-dongle-black/4.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/amazon-basics-4g-lte-wireless-dongle-black/4.jpg', false, 3),
  ('64ad0baa-66da-4b0b-a4e9-42a85e0c19c9', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/amazon-basics-4g-lte-wireless-dongle-black/5.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/amazon-basics-4g-lte-wireless-dongle-black/5.jpg', false, 4);

-- ===== 6. APPLE-35W-DUALC-WHT =====
INSERT INTO products (id, name, slug, description, short_description, sku, category_id, subcategory_id, brand_id, mrp, selling_price, discount_percent, stock_quantity, low_stock_threshold, weight_grams, length_cm, breadth_cm, height_cm, is_active, is_featured, is_deal_of_day, rating, review_count, sold_count, meta_title, meta_description) VALUES (
  '16e9b625-14ef-4651-9080-541d8d7ac157', 'Apple 35W Dual USB-C Port Power Adapter White', 'apple-35w-dual-usb-c-power-adapter-white', 'Apple 35W Dual USB-C Port Power Adapter White.

KEY FEATURES:
- Dual USB-C ports - charge two devices at once
- 35W fast charging output
- Compatible with iPhone, iPad and MacBook
- Genuine Apple adapter
- Works with World Travel Adapter Kit
- Charging cable sold separately', '35W | Dual USB-C Ports | Fast Charging | iPhone/iPad/MacBook | Genuine Apple | Foldable Pins', 'APPLE-35W-DUALC-WHT', '08094555-b1b6-409a-af97-afa9fdffe03a', '2ae33dea-e2df-4b26-9ac2-73a98cee3fb2', (SELECT id FROM brands WHERE slug='apple'), 5800, 3604, 37.86, 1, 1, 250, 12, 10, 5, true, false, false, 0, 0, 0, 'Apple 35W Dual USB-C Port Power Adapter White at ₹3604 | BoxDeal', 'Buy Apple 35W Dual USB-C Port Power Adapter White at ₹3604 (MRP ₹5800). 35W | Dual USB-C Ports | Fast Charging | iPhone/iPad/MacBook | Genuine Apple | Foldable Pins');
INSERT INTO product_specifications (product_id, spec_group, spec_name, spec_value, sort_order) VALUES
  ('16e9b625-14ef-4651-9080-541d8d7ac157', 'General', 'Brand', 'Apple', 1),
  ('16e9b625-14ef-4651-9080-541d8d7ac157', 'General', 'Model', 'MW2K3HN/A', 2),
  ('16e9b625-14ef-4651-9080-541d8d7ac157', 'General', 'Colour', 'White', 3),
  ('16e9b625-14ef-4651-9080-541d8d7ac157', 'General', 'Weight', '170 g', 4),
  ('16e9b625-14ef-4651-9080-541d8d7ac157', 'General', 'Country of Origin', 'China', 5),
  ('16e9b625-14ef-4651-9080-541d8d7ac157', 'Technical', 'Output', '35W', 6),
  ('16e9b625-14ef-4651-9080-541d8d7ac157', 'Technical', 'Ports', '2x USB-C', 7),
  ('16e9b625-14ef-4651-9080-541d8d7ac157', 'Technical', 'Input Voltage', '100-240V', 8),
  ('16e9b625-14ef-4651-9080-541d8d7ac157', 'In the Box', 'Contents', '35W Dual USB-C Power Adapter', 9);
INSERT INTO product_images (product_id, image_url, thumbnail_url, is_primary, sort_order) VALUES
  ('16e9b625-14ef-4651-9080-541d8d7ac157', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/apple-35w-dual-usb-c-power-adapter-white/1.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/apple-35w-dual-usb-c-power-adapter-white/1.jpg', true, 0),
  ('16e9b625-14ef-4651-9080-541d8d7ac157', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/apple-35w-dual-usb-c-power-adapter-white/2.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/apple-35w-dual-usb-c-power-adapter-white/2.jpg', false, 1),
  ('16e9b625-14ef-4651-9080-541d8d7ac157', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/apple-35w-dual-usb-c-power-adapter-white/3.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/apple-35w-dual-usb-c-power-adapter-white/3.jpg', false, 2),
  ('16e9b625-14ef-4651-9080-541d8d7ac157', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/apple-35w-dual-usb-c-power-adapter-white/4.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/apple-35w-dual-usb-c-power-adapter-white/4.jpg', false, 3),
  ('16e9b625-14ef-4651-9080-541d8d7ac157', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/apple-35w-dual-usb-c-power-adapter-white/5.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/apple-35w-dual-usb-c-power-adapter-white/5.jpg', false, 4);

-- ===== 7. APPLE-EARPODS-USBC =====
INSERT INTO products (id, name, slug, description, short_description, sku, category_id, subcategory_id, brand_id, mrp, selling_price, discount_percent, stock_quantity, low_stock_threshold, weight_grams, length_cm, breadth_cm, height_cm, is_active, is_featured, is_deal_of_day, rating, review_count, sold_count, meta_title, meta_description) VALUES (
  'e83d11e4-611c-4ecd-afb1-4ea116b3caa3', 'Apple EarPods (USB-C) Wired In-Ear Earphones White', 'apple-earpods-usb-c-white', 'Apple EarPods (USB-C) Wired In-Ear Earphones White.

KEY FEATURES:
- USB-C connector - plug and play
- In-built remote with volume control & mic
- Designed by Apple for comfortable fit
- Lightweight wired earphones
- 1 year Apple limited warranty', 'Wired In-Ear | USB-C Connector | Built-in Remote & Mic | Volume Control | Designed by Apple', 'APPLE-EARPODS-USBC', 'b1832a09-4562-484f-8fd3-ad0c885d154a', '0ef6dafa-c3f4-4f58-bc8a-f894ee56c568', (SELECT id FROM brands WHERE slug='apple'), 2000, 1224, 38.8, 1, 1, 80, 8, 8, 2, true, false, false, 0, 0, 0, 'Apple EarPods (USB-C) Wired In-Ear Earphones White at ₹1224 | BoxDeal', 'Buy Apple EarPods (USB-C) Wired In-Ear Earphones White at ₹1224 (MRP ₹2000). Wired In-Ear | USB-C Connector | Built-in Remote & Mic | Volume Control | Designed by Apple');
INSERT INTO product_specifications (product_id, spec_group, spec_name, spec_value, sort_order) VALUES
  ('e83d11e4-611c-4ecd-afb1-4ea116b3caa3', 'General', 'Brand', 'Apple', 1),
  ('e83d11e4-611c-4ecd-afb1-4ea116b3caa3', 'General', 'Model', 'EarPods (USB-C)', 2),
  ('e83d11e4-611c-4ecd-afb1-4ea116b3caa3', 'General', 'Colour', 'White', 3),
  ('e83d11e4-611c-4ecd-afb1-4ea116b3caa3', 'General', 'Form Factor', 'In Ear (Wired)', 4),
  ('e83d11e4-611c-4ecd-afb1-4ea116b3caa3', 'General', 'Weight', '30 g', 5),
  ('e83d11e4-611c-4ecd-afb1-4ea116b3caa3', 'Technical', 'Connector', 'USB-C', 6),
  ('e83d11e4-611c-4ecd-afb1-4ea116b3caa3', 'Technical', 'Connectivity', 'Wired', 7),
  ('e83d11e4-611c-4ecd-afb1-4ea116b3caa3', 'Technical', 'Controls', 'Volume + Mic', 8),
  ('e83d11e4-611c-4ecd-afb1-4ea116b3caa3', 'In the Box', 'Contents', 'EarPods with USB-C Connector', 9);
INSERT INTO product_images (product_id, image_url, thumbnail_url, is_primary, sort_order) VALUES
  ('e83d11e4-611c-4ecd-afb1-4ea116b3caa3', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/apple-earpods-usb-c-white/1.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/apple-earpods-usb-c-white/1.jpg', true, 0),
  ('e83d11e4-611c-4ecd-afb1-4ea116b3caa3', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/apple-earpods-usb-c-white/2.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/apple-earpods-usb-c-white/2.jpg', false, 1),
  ('e83d11e4-611c-4ecd-afb1-4ea116b3caa3', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/apple-earpods-usb-c-white/3.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/apple-earpods-usb-c-white/3.jpg', false, 2),
  ('e83d11e4-611c-4ecd-afb1-4ea116b3caa3', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/apple-earpods-usb-c-white/4.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/apple-earpods-usb-c-white/4.jpg', false, 3),
  ('e83d11e4-611c-4ecd-afb1-4ea116b3caa3', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/apple-earpods-usb-c-white/5.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/apple-earpods-usb-c-white/5.jpg', false, 4);

-- ===== 8. POLY-VF60UC-BLK =====
INSERT INTO products (id, name, slug, description, short_description, sku, category_id, subcategory_id, brand_id, mrp, selling_price, discount_percent, stock_quantity, low_stock_threshold, weight_grams, length_cm, breadth_cm, height_cm, is_active, is_featured, is_deal_of_day, rating, review_count, sold_count, meta_title, meta_description) VALUES (
  'c6bd288d-25b9-4040-8661-bb9a49760bad', 'Poly Voyager Free 60 UC True Wireless ANC Earbuds Black', 'poly-voyager-free-60-uc-earbuds-black', 'Poly Voyager Free 60 UC True Wireless ANC Earbuds Black.

KEY FEATURES:
- 6 mics (3 per earbud) with WindSmart tech
- Adaptive Active Noise Cancelling + transparency
- Bluetooth 5.3, up to 30m range, BT700 adapter included
- Up to 16.5 hours talk time
- Qi wireless charging case
- Smart sensor controls (auto answer/pause)
- Certified for Zoom, Teams, Windows/Mac/iOS/Android
- 2 year warranty', 'TWS | Adaptive ANC | 6 Mics WindSmart | 16.5H Talk Time | BT 5.3 | Qi Wireless Case | BT700 Adapter | UC Certified', 'POLY-VF60UC-BLK', 'b1832a09-4562-484f-8fd3-ad0c885d154a', '4ef6e248-5eef-4898-bcb3-e4f64c9d6dae', (SELECT id FROM brands WHERE slug='poly'), 24999, 9999, 60, 1, 1, 300, 13, 10, 4, true, false, false, 0, 0, 0, 'Poly Voyager Free 60 UC True Wireless ANC Earbuds Black at ₹9999 | BoxDeal', 'Buy Poly Voyager Free 60 UC True Wireless ANC Earbuds Black at ₹9999 (MRP ₹24999). TWS | Adaptive ANC | 6 Mics WindSmart | 16.5H Talk Time | BT 5.3 | Qi Wireless Case | BT700 Adapter | UC Certified');
INSERT INTO product_specifications (product_id, spec_group, spec_name, spec_value, sort_order) VALUES
  ('c6bd288d-25b9-4040-8661-bb9a49760bad', 'General', 'Brand', 'Poly (Plantronics)', 1),
  ('c6bd288d-25b9-4040-8661-bb9a49760bad', 'General', 'Model', 'Voyager Free 60 UC', 2),
  ('c6bd288d-25b9-4040-8661-bb9a49760bad', 'General', 'Colour', 'Black', 3),
  ('c6bd288d-25b9-4040-8661-bb9a49760bad', 'General', 'Form Factor', 'In Ear (True Wireless)', 4),
  ('c6bd288d-25b9-4040-8661-bb9a49760bad', 'Audio', 'Frequency', '20Hz - 20kHz', 5),
  ('c6bd288d-25b9-4040-8661-bb9a49760bad', 'Audio', 'Noise Control', 'Adaptive ANC', 6),
  ('c6bd288d-25b9-4040-8661-bb9a49760bad', 'Technical', 'Bluetooth', '5.3', 7),
  ('c6bd288d-25b9-4040-8661-bb9a49760bad', 'Technical', 'Range', 'Up to 30 m', 8),
  ('c6bd288d-25b9-4040-8661-bb9a49760bad', 'Technical', 'Mics', '6 (WindSmart)', 9),
  ('c6bd288d-25b9-4040-8661-bb9a49760bad', 'Battery', 'Talk Time', 'Up to 16.5 hours', 10),
  ('c6bd288d-25b9-4040-8661-bb9a49760bad', 'Battery', 'Case', 'Qi Wireless Charging', 11),
  ('c6bd288d-25b9-4040-8661-bb9a49760bad', 'In the Box', 'Contents', 'Earbuds, Charge Case, USB Cable, BT700 Adapter, USB-A to C Adapter, Ear Tips (S/M/L), Travel Pouch', 12);
INSERT INTO product_images (product_id, image_url, thumbnail_url, is_primary, sort_order) VALUES
  ('c6bd288d-25b9-4040-8661-bb9a49760bad', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/poly-voyager-free-60-uc-earbuds-black/1.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/poly-voyager-free-60-uc-earbuds-black/1.jpg', true, 0),
  ('c6bd288d-25b9-4040-8661-bb9a49760bad', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/poly-voyager-free-60-uc-earbuds-black/2.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/poly-voyager-free-60-uc-earbuds-black/2.jpg', false, 1),
  ('c6bd288d-25b9-4040-8661-bb9a49760bad', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/poly-voyager-free-60-uc-earbuds-black/3.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/poly-voyager-free-60-uc-earbuds-black/3.jpg', false, 2),
  ('c6bd288d-25b9-4040-8661-bb9a49760bad', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/poly-voyager-free-60-uc-earbuds-black/4.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/poly-voyager-free-60-uc-earbuds-black/4.jpg', false, 3),
  ('c6bd288d-25b9-4040-8661-bb9a49760bad', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/poly-voyager-free-60-uc-earbuds-black/5.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/poly-voyager-free-60-uc-earbuds-black/5.jpg', false, 4);

-- ===== 9. BELKIN-MICROUSB-BLK =====
INSERT INTO products (id, name, slug, description, short_description, sku, category_id, subcategory_id, brand_id, mrp, selling_price, discount_percent, stock_quantity, low_stock_threshold, weight_grams, length_cm, breadth_cm, height_cm, is_active, is_featured, is_deal_of_day, rating, review_count, sold_count, meta_title, meta_description) VALUES (
  '1ede85b6-81ee-46db-99f1-cc1dd7081cb3', 'Belkin USB-A to Micro USB Charging Cable 1m Black', 'belkin-usb-a-micro-usb-cable-black', 'Belkin USB-A to Micro USB Charging Cable 1m Black.

KEY FEATURES:
- USB-A to Micro USB charging cable
- 1 metre (3.3 ft) length
- Up to 480 Mbps data transfer
- Ideal for Android phones, tablets, PC peripherals
- Compact connector works with most cases
- 2 year warranty', 'USB-A to Micro USB | 1m / 3.3ft | 480Mbps Data | Charging & Sync | Android Phones & Tablets', 'BELKIN-MICROUSB-BLK', '08094555-b1b6-409a-af97-afa9fdffe03a', (SELECT id FROM subcategories WHERE slug='cables'), (SELECT id FROM brands WHERE slug='belkin'), 399, 244, 38.85, 1, 1, 80, 13, 10, 2, true, false, false, 0, 0, 0, 'Belkin USB-A to Micro USB Charging Cable 1m Black at ₹244 | BoxDeal', 'Buy Belkin USB-A to Micro USB Charging Cable 1m Black at ₹244 (MRP ₹399). USB-A to Micro USB | 1m / 3.3ft | 480Mbps Data | Charging & Sync | Android Phones & Tablets');
INSERT INTO product_specifications (product_id, spec_group, spec_name, spec_value, sort_order) VALUES
  ('1ede85b6-81ee-46db-99f1-cc1dd7081cb3', 'General', 'Brand', 'Belkin', 1),
  ('1ede85b6-81ee-46db-99f1-cc1dd7081cb3', 'General', 'Model', '086D707', 2),
  ('1ede85b6-81ee-46db-99f1-cc1dd7081cb3', 'General', 'Colour', 'Black', 3),
  ('1ede85b6-81ee-46db-99f1-cc1dd7081cb3', 'General', 'Length', '1 m (3.3 ft)', 4),
  ('1ede85b6-81ee-46db-99f1-cc1dd7081cb3', 'General', 'Country of Origin', 'Vietnam', 5),
  ('1ede85b6-81ee-46db-99f1-cc1dd7081cb3', 'Technical', 'Connector', 'USB-A to Micro USB', 6),
  ('1ede85b6-81ee-46db-99f1-cc1dd7081cb3', 'Technical', 'Data Rate', 'Up to 480 Mbps', 7),
  ('1ede85b6-81ee-46db-99f1-cc1dd7081cb3', 'Technical', 'Connector Gender', 'Male-to-Male', 8),
  ('1ede85b6-81ee-46db-99f1-cc1dd7081cb3', 'In the Box', 'Contents', '1 x Belkin Micro USB Cable', 9);
INSERT INTO product_images (product_id, image_url, thumbnail_url, is_primary, sort_order) VALUES
  ('1ede85b6-81ee-46db-99f1-cc1dd7081cb3', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/belkin-usb-a-micro-usb-cable-black/1.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/belkin-usb-a-micro-usb-cable-black/1.jpg', true, 0),
  ('1ede85b6-81ee-46db-99f1-cc1dd7081cb3', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/belkin-usb-a-micro-usb-cable-black/2.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/belkin-usb-a-micro-usb-cable-black/2.jpg', false, 1),
  ('1ede85b6-81ee-46db-99f1-cc1dd7081cb3', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/belkin-usb-a-micro-usb-cable-black/3.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/belkin-usb-a-micro-usb-cable-black/3.jpg', false, 2),
  ('1ede85b6-81ee-46db-99f1-cc1dd7081cb3', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/belkin-usb-a-micro-usb-cable-black/4.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/belkin-usb-a-micro-usb-cable-black/4.jpg', false, 3),
  ('1ede85b6-81ee-46db-99f1-cc1dd7081cb3', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/belkin-usb-a-micro-usb-cable-black/5.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/belkin-usb-a-micro-usb-cable-black/5.jpg', false, 4);

-- ===== 10. INTEX-RHINO10K-BLU =====
INSERT INTO products (id, name, slug, description, short_description, sku, category_id, subcategory_id, brand_id, mrp, selling_price, discount_percent, stock_quantity, low_stock_threshold, weight_grams, length_cm, breadth_cm, height_cm, is_active, is_featured, is_deal_of_day, rating, review_count, sold_count, meta_title, meta_description) VALUES (
  'f060b38c-0f1c-4353-b393-421721767397', 'Intex Strong Rhino QC PD 10K 10000mAh 22W Fast Charging Power Bank Blue', 'intex-rhino-qc-pd-10k-powerbank-blue', 'Intex Strong Rhino QC PD 10K 10000mAh 22W Fast Charging Power Bank Blue.

KEY FEATURES:
- 10000mAh capacity with rapid charging
- 22W total output with QC + PD support
- 3 USB ports
- Digital display + LED indicator
- Smart IC protection (overcharge/overcurrent/short circuit)
- Lightweight pocket-size design', '10000mAh | 22W Output | QC + PD | 3 USB Ports | Digital Display | LED Indicator | Smart IC Protection', 'INTEX-RHINO10K-BLU', 'b3ca7969-a164-4d7d-8063-0d2ee6e00dec', NULL, (SELECT id FROM brands WHERE slug='intex'), 3249, 700, 78.45, 1, 1, 300, 22, 9, 2, true, false, false, 0, 0, 0, 'Intex Strong Rhino QC PD 10K 10000mAh 22W Fast Charging Power Bank Blue at ₹700 | BoxDeal', 'Buy Intex Strong Rhino QC PD 10K 10000mAh 22W Fast Charging Power Bank Blue at ₹700 (MRP ₹3249). 10000mAh | 22W Output | QC + PD | 3 USB Ports | Digital Display | LED Indicator | Smart IC Protection');
INSERT INTO product_specifications (product_id, spec_group, spec_name, spec_value, sort_order) VALUES
  ('f060b38c-0f1c-4353-b393-421721767397', 'General', 'Brand', 'Intex', 1),
  ('f060b38c-0f1c-4353-b393-421721767397', 'General', 'Model', 'Rhino QC PD 10K', 2),
  ('f060b38c-0f1c-4353-b393-421721767397', 'General', 'Capacity', '10000 mAh', 3),
  ('f060b38c-0f1c-4353-b393-421721767397', 'General', 'Colour', 'Blue', 4),
  ('f060b38c-0f1c-4353-b393-421721767397', 'General', 'Weight', '221 g', 5),
  ('f060b38c-0f1c-4353-b393-421721767397', 'General', 'Material', 'Plastic', 6),
  ('f060b38c-0f1c-4353-b393-421721767397', 'Technical', 'Output', '22W', 7),
  ('f060b38c-0f1c-4353-b393-421721767397', 'Technical', 'USB Ports', '3', 8),
  ('f060b38c-0f1c-4353-b393-421721767397', 'Technical', 'Fast Charge', 'QC + PD', 9),
  ('f060b38c-0f1c-4353-b393-421721767397', 'Technical', 'Display', 'Digital + LED', 10),
  ('f060b38c-0f1c-4353-b393-421721767397', 'In the Box', 'Contents', 'Power Bank, Charging Cable, User Manual', 11);
INSERT INTO product_images (product_id, image_url, thumbnail_url, is_primary, sort_order) VALUES
  ('f060b38c-0f1c-4353-b393-421721767397', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/intex-rhino-qc-pd-10k-powerbank-blue/1.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/intex-rhino-qc-pd-10k-powerbank-blue/1.jpg', true, 0),
  ('f060b38c-0f1c-4353-b393-421721767397', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/intex-rhino-qc-pd-10k-powerbank-blue/2.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/intex-rhino-qc-pd-10k-powerbank-blue/2.jpg', false, 1),
  ('f060b38c-0f1c-4353-b393-421721767397', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/intex-rhino-qc-pd-10k-powerbank-blue/3.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/intex-rhino-qc-pd-10k-powerbank-blue/3.jpg', false, 2),
  ('f060b38c-0f1c-4353-b393-421721767397', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/intex-rhino-qc-pd-10k-powerbank-blue/4.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/intex-rhino-qc-pd-10k-powerbank-blue/4.jpg', false, 3),
  ('f060b38c-0f1c-4353-b393-421721767397', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/intex-rhino-qc-pd-10k-powerbank-blue/5.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/intex-rhino-qc-pd-10k-powerbank-blue/5.jpg', false, 4);
