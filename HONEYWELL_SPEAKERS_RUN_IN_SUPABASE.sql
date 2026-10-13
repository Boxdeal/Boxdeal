-- Honeywell Portable Speakers x4 (brand Honeywell already exists)
-- Honeywell Trueno U300 Bluetooth 5.3 Wireless Portable Speaker 20W Blue
INSERT INTO products (id, name, slug, description, short_description, sku, category_id, subcategory_id, brand_id, mrp, selling_price, discount_percent, stock_quantity, low_stock_threshold, weight_grams, length_cm, breadth_cm, height_cm, is_active, is_featured, is_deal_of_day, rating, review_count, sold_count, meta_title, meta_description) VALUES (
  '83876ddd-bb89-488d-b5b7-242d642b07f2', 'Honeywell Trueno U300 Bluetooth 5.3 Wireless Portable Speaker 20W Blue', 'honeywell-trueno-u300-portable-speaker', 'Honeywell Trueno U300 Bluetooth 5.3 Wireless Portable Speaker 20W Blue. 20W, Dual 78mm Drivers, 13H Playtime, IPX6, TWS, BT 5.3, SD/USB-C/AUX, Built-in Mic.

KEY FEATURES:
- 20W output power for powerful, clear sound
- Dual 78mm drivers for vibrant, full-range audio
- Up to 13 hours playtime on 4500mAh battery
- Bluetooth 5.3 wireless up to 15m range
- IPX6 water-resistant for indoor & outdoor use
- TWS pairing - connect two speakers for stereo
- Twin bass radiators for deep, core-shaking bass
- SD card, USB, AUX & Type-C fast charging', '20W | Dual 78mm Drivers | 13H Playtime | IPX6 | TWS | BT 5.3 | SD/USB-C/AUX | Built-in Mic', 'HW-TRUENO-U300-BLU', '91b8a207-2b75-4fac-bcbb-bfe47474acec', '1a90e2b7-e458-43d8-8c7a-245de19cbed8', (SELECT id FROM brands WHERE slug='honeywell'), 5999, 1699, 71.68, 50, 5, 1181, 31, 14, 9, true, false, false, 4.2, 620, 0, 'Honeywell Trueno U300 Bluetooth 5.3 Wireless Portable Speaker 20W Blue at ₹1699 | BoxDeal', 'Buy Honeywell Trueno U300 Bluetooth 5.3 Wireless Portable Speaker 20W Blue at ₹1699 (MRP ₹5999). 20W | Dual 78mm Drivers | 13H Playtime | IPX6 | TWS | BT 5.3 | SD/USB-C/AUX | Built-in Mic');
INSERT INTO product_specifications (product_id, spec_group, spec_name, spec_value, sort_order) VALUES
  ('83876ddd-bb89-488d-b5b7-242d642b07f2', 'General', 'Brand', 'Honeywell', 1),
  ('83876ddd-bb89-488d-b5b7-242d642b07f2', 'General', 'Model', 'Trueno U300 (HC000119)', 2),
  ('83876ddd-bb89-488d-b5b7-242d642b07f2', 'General', 'Type', 'Portable Bluetooth Speaker', 3),
  ('83876ddd-bb89-488d-b5b7-242d642b07f2', 'General', 'Colour', 'Blue', 4),
  ('83876ddd-bb89-488d-b5b7-242d642b07f2', 'General', 'Weight', '1.181 kg', 5),
  ('83876ddd-bb89-488d-b5b7-242d642b07f2', 'Audio', 'Output Power', '20 W', 6),
  ('83876ddd-bb89-488d-b5b7-242d642b07f2', 'Audio', 'Drivers', 'Dual 78mm (78mm x2)', 7),
  ('83876ddd-bb89-488d-b5b7-242d642b07f2', 'Audio', 'Audio Channels', '2.0 (Stereo)', 8),
  ('83876ddd-bb89-488d-b5b7-242d642b07f2', 'Technical', 'Bluetooth', '5.3 (up to 15m range)', 9),
  ('83876ddd-bb89-488d-b5b7-242d642b07f2', 'Technical', 'TWS', 'Yes (pair 2 speakers)', 10),
  ('83876ddd-bb89-488d-b5b7-242d642b07f2', 'Technical', 'Water Resistance', 'IPX6', 11),
  ('83876ddd-bb89-488d-b5b7-242d642b07f2', 'Technical', 'Inputs', 'Bluetooth, SD Card, USB, AUX, Type-C', 12),
  ('83876ddd-bb89-488d-b5b7-242d642b07f2', 'Technical', 'Built-in Mic', 'Yes', 13),
  ('83876ddd-bb89-488d-b5b7-242d642b07f2', 'Battery', 'Capacity', '4500 mAh (Li-ion)', 14),
  ('83876ddd-bb89-488d-b5b7-242d642b07f2', 'Battery', 'Playtime', 'Up to 13 hours', 15),
  ('83876ddd-bb89-488d-b5b7-242d642b07f2', 'Battery', 'Charging', 'Type-C', 16),
  ('83876ddd-bb89-488d-b5b7-242d642b07f2', 'In the Box', 'Contents', 'Speaker, USB-A to Type-C Cable, AUX Cable, User Manual', 17);
INSERT INTO product_images (product_id, image_url, thumbnail_url, is_primary, sort_order) VALUES
  ('83876ddd-bb89-488d-b5b7-242d642b07f2', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/honeywell-trueno-u300-portable-speaker/1.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/honeywell-trueno-u300-portable-speaker/1.jpg', true, 0),
  ('83876ddd-bb89-488d-b5b7-242d642b07f2', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/honeywell-trueno-u300-portable-speaker/2.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/honeywell-trueno-u300-portable-speaker/2.jpg', false, 1),
  ('83876ddd-bb89-488d-b5b7-242d642b07f2', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/honeywell-trueno-u300-portable-speaker/3.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/honeywell-trueno-u300-portable-speaker/3.jpg', false, 2),
  ('83876ddd-bb89-488d-b5b7-242d642b07f2', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/honeywell-trueno-u300-portable-speaker/4.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/honeywell-trueno-u300-portable-speaker/4.jpg', false, 3),
  ('83876ddd-bb89-488d-b5b7-242d642b07f2', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/honeywell-trueno-u300-portable-speaker/5.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/honeywell-trueno-u300-portable-speaker/5.jpg', false, 4);
-- Honeywell Suono P400 Bluetooth 5.3 Wireless Portable Speaker 15W Black
INSERT INTO products (id, name, slug, description, short_description, sku, category_id, subcategory_id, brand_id, mrp, selling_price, discount_percent, stock_quantity, low_stock_threshold, weight_grams, length_cm, breadth_cm, height_cm, is_active, is_featured, is_deal_of_day, rating, review_count, sold_count, meta_title, meta_description) VALUES (
  'f4977c62-7052-4461-9925-997e2baefd68', 'Honeywell Suono P400 Bluetooth 5.3 Wireless Portable Speaker 15W Black', 'honeywell-suono-p400-portable-speaker', 'Honeywell Suono P400 Bluetooth 5.3 Wireless Portable Speaker 15W Black. 15W, 78mm Driver, 10H Playtime, IPX6, TWS, RGB Lights, BT 5.3, SD/AUX/Type-C, Built-in Mic.

KEY FEATURES:
- 15W output power for immersive audio
- 78mm dynamic driver for rich sound
- Up to 10 hours playtime on 2400mAh battery
- Bluetooth 5.3 wireless up to 15m range
- IPX6 waterproof for worry-free use
- TWS pairing for stereo sound
- RGB lights with twin bass radiators
- SD card, AUX & Type-C fast charging', '15W | 78mm Driver | 10H Playtime | IPX6 | TWS | RGB Lights | BT 5.3 | SD/AUX/Type-C | Built-in Mic', 'HW-SUONO-P400-BLK', '91b8a207-2b75-4fac-bcbb-bfe47474acec', '1a90e2b7-e458-43d8-8c7a-245de19cbed8', (SELECT id FROM brands WHERE slug='honeywell'), 4999, 1449, 71.01, 50, 5, 1000, 22, 14, 13, true, false, false, 4.3, 230, 0, 'Honeywell Suono P400 Bluetooth 5.3 Wireless Portable Speaker 15W Black at ₹1449 | BoxDeal', 'Buy Honeywell Suono P400 Bluetooth 5.3 Wireless Portable Speaker 15W Black at ₹1449 (MRP ₹4999). 15W | 78mm Driver | 10H Playtime | IPX6 | TWS | RGB Lights | BT 5.3 | SD/AUX/Type-C | Built-in Mic');
INSERT INTO product_specifications (product_id, spec_group, spec_name, spec_value, sort_order) VALUES
  ('f4977c62-7052-4461-9925-997e2baefd68', 'General', 'Brand', 'Honeywell', 1),
  ('f4977c62-7052-4461-9925-997e2baefd68', 'General', 'Model', 'Suono P400 (HC000117)', 2),
  ('f4977c62-7052-4461-9925-997e2baefd68', 'General', 'Type', 'Portable Bluetooth Speaker', 3),
  ('f4977c62-7052-4461-9925-997e2baefd68', 'General', 'Colour', 'Black', 4),
  ('f4977c62-7052-4461-9925-997e2baefd68', 'General', 'Weight', '1 kg', 5),
  ('f4977c62-7052-4461-9925-997e2baefd68', 'Audio', 'Output Power', '15 W', 6),
  ('f4977c62-7052-4461-9925-997e2baefd68', 'Audio', 'Driver', '78mm Dynamic Driver', 7),
  ('f4977c62-7052-4461-9925-997e2baefd68', 'Audio', 'Audio Channels', '2.0 (Stereo)', 8),
  ('f4977c62-7052-4461-9925-997e2baefd68', 'Technical', 'Bluetooth', '5.3 (up to 15m range)', 9),
  ('f4977c62-7052-4461-9925-997e2baefd68', 'Technical', 'TWS', 'Yes (pair 2 speakers)', 10),
  ('f4977c62-7052-4461-9925-997e2baefd68', 'Technical', 'Water Resistance', 'IPX6', 11),
  ('f4977c62-7052-4461-9925-997e2baefd68', 'Technical', 'Lighting', 'RGB Lights', 12),
  ('f4977c62-7052-4461-9925-997e2baefd68', 'Technical', 'Inputs', 'Bluetooth, SD Card, AUX, Type-C', 13),
  ('f4977c62-7052-4461-9925-997e2baefd68', 'Technical', 'Built-in Mic', 'Yes', 14),
  ('f4977c62-7052-4461-9925-997e2baefd68', 'Battery', 'Capacity', '2400 mAh (Li-ion)', 15),
  ('f4977c62-7052-4461-9925-997e2baefd68', 'Battery', 'Playtime', 'Up to 10 hours', 16),
  ('f4977c62-7052-4461-9925-997e2baefd68', 'Battery', 'Input Voltage', '7.4 V', 17),
  ('f4977c62-7052-4461-9925-997e2baefd68', 'In the Box', 'Contents', 'Speaker, Warranty Card', 18);
INSERT INTO product_images (product_id, image_url, thumbnail_url, is_primary, sort_order) VALUES
  ('f4977c62-7052-4461-9925-997e2baefd68', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/honeywell-suono-p400-portable-speaker/1.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/honeywell-suono-p400-portable-speaker/1.jpg', true, 0),
  ('f4977c62-7052-4461-9925-997e2baefd68', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/honeywell-suono-p400-portable-speaker/2.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/honeywell-suono-p400-portable-speaker/2.jpg', false, 1),
  ('f4977c62-7052-4461-9925-997e2baefd68', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/honeywell-suono-p400-portable-speaker/3.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/honeywell-suono-p400-portable-speaker/3.jpg', false, 2),
  ('f4977c62-7052-4461-9925-997e2baefd68', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/honeywell-suono-p400-portable-speaker/4.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/honeywell-suono-p400-portable-speaker/4.jpg', false, 3),
  ('f4977c62-7052-4461-9925-997e2baefd68', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/honeywell-suono-p400-portable-speaker/5.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/honeywell-suono-p400-portable-speaker/5.jpg', false, 4);
-- Honeywell Trueno U400 Bluetooth 5.3 Wireless Portable Speaker 30W Black
INSERT INTO products (id, name, slug, description, short_description, sku, category_id, subcategory_id, brand_id, mrp, selling_price, discount_percent, stock_quantity, low_stock_threshold, weight_grams, length_cm, breadth_cm, height_cm, is_active, is_featured, is_deal_of_day, rating, review_count, sold_count, meta_title, meta_description) VALUES (
  '81d2fdd0-ebbb-495a-b165-4b84b6e7de42', 'Honeywell Trueno U400 Bluetooth 5.3 Wireless Portable Speaker 30W Black', 'honeywell-trueno-u400-portable-speaker', 'Honeywell Trueno U400 Bluetooth 5.3 Wireless Portable Speaker 30W Black. 30W, Dual 78mm Drivers, 15H Playtime, IPX6, TWS, RGB Lights, BT 5.3, SD/AUX/USB-C, Built-in Mic.

KEY FEATURES:
- 30W output power for exceptional sound
- Dual 78mm drivers for full stereo audio
- Up to 15 hours playtime on 5000mAh battery
- Bluetooth 5.3 wireless up to 15m range
- IPX6 waterproof for any setting
- TWS pairing for stereo sound
- RGB lights with twin bass radiators
- SD card, AUX & Type-C fast charging', '30W | Dual 78mm Drivers | 15H Playtime | IPX6 | TWS | RGB Lights | BT 5.3 | SD/AUX/USB-C | Built-in Mic', 'HW-TRUENO-U400-BLK', '91b8a207-2b75-4fac-bcbb-bfe47474acec', '1a90e2b7-e458-43d8-8c7a-245de19cbed8', (SELECT id FROM brands WHERE slug='honeywell'), 8499, 2399, 71.77, 100, 5, 1600, 28, 14, 14, true, false, false, 4.2, 98, 0, 'Honeywell Trueno U400 Bluetooth 5.3 Wireless Portable Speaker 30W Black at ₹2399 | BoxDeal', 'Buy Honeywell Trueno U400 Bluetooth 5.3 Wireless Portable Speaker 30W Black at ₹2399 (MRP ₹8499). 30W | Dual 78mm Drivers | 15H Playtime | IPX6 | TWS | RGB Lights | BT 5.3 | SD/AUX/USB-C | Built-in Mic');
INSERT INTO product_specifications (product_id, spec_group, spec_name, spec_value, sort_order) VALUES
  ('81d2fdd0-ebbb-495a-b165-4b84b6e7de42', 'General', 'Brand', 'Honeywell', 1),
  ('81d2fdd0-ebbb-495a-b165-4b84b6e7de42', 'General', 'Model', 'Trueno U400 (HC000120)', 2),
  ('81d2fdd0-ebbb-495a-b165-4b84b6e7de42', 'General', 'Type', 'Portable Bluetooth Speaker', 3),
  ('81d2fdd0-ebbb-495a-b165-4b84b6e7de42', 'General', 'Colour', 'Black', 4),
  ('81d2fdd0-ebbb-495a-b165-4b84b6e7de42', 'General', 'Weight', '1.6 kg', 5),
  ('81d2fdd0-ebbb-495a-b165-4b84b6e7de42', 'Audio', 'Output Power', '30 W', 6),
  ('81d2fdd0-ebbb-495a-b165-4b84b6e7de42', 'Audio', 'Drivers', 'Dual 78mm (78mm x2)', 7),
  ('81d2fdd0-ebbb-495a-b165-4b84b6e7de42', 'Audio', 'Audio Channels', '2.0 (Stereo)', 8),
  ('81d2fdd0-ebbb-495a-b165-4b84b6e7de42', 'Technical', 'Bluetooth', '5.3 (up to 15m range)', 9),
  ('81d2fdd0-ebbb-495a-b165-4b84b6e7de42', 'Technical', 'TWS', 'Yes (pair 2 speakers)', 10),
  ('81d2fdd0-ebbb-495a-b165-4b84b6e7de42', 'Technical', 'Water Resistance', 'IPX6', 11),
  ('81d2fdd0-ebbb-495a-b165-4b84b6e7de42', 'Technical', 'Lighting', 'RGB Lights', 12),
  ('81d2fdd0-ebbb-495a-b165-4b84b6e7de42', 'Technical', 'Inputs', 'Bluetooth, SD Card, AUX, USB Type-C', 13),
  ('81d2fdd0-ebbb-495a-b165-4b84b6e7de42', 'Technical', 'Built-in Mic', 'Yes', 14),
  ('81d2fdd0-ebbb-495a-b165-4b84b6e7de42', 'Battery', 'Capacity', '5000 mAh (Li-ion)', 15),
  ('81d2fdd0-ebbb-495a-b165-4b84b6e7de42', 'Battery', 'Playtime', 'Up to 15 hours', 16),
  ('81d2fdd0-ebbb-495a-b165-4b84b6e7de42', 'Battery', 'Charging', 'Type-C Fast Charging', 17),
  ('81d2fdd0-ebbb-495a-b165-4b84b6e7de42', 'In the Box', 'Contents', 'Speaker, Warranty Card', 18);
INSERT INTO product_images (product_id, image_url, thumbnail_url, is_primary, sort_order) VALUES
  ('81d2fdd0-ebbb-495a-b165-4b84b6e7de42', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/honeywell-trueno-u400-portable-speaker/1.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/honeywell-trueno-u400-portable-speaker/1.jpg', true, 0),
  ('81d2fdd0-ebbb-495a-b165-4b84b6e7de42', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/honeywell-trueno-u400-portable-speaker/2.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/honeywell-trueno-u400-portable-speaker/2.jpg', false, 1),
  ('81d2fdd0-ebbb-495a-b165-4b84b6e7de42', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/honeywell-trueno-u400-portable-speaker/3.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/honeywell-trueno-u400-portable-speaker/3.jpg', false, 2),
  ('81d2fdd0-ebbb-495a-b165-4b84b6e7de42', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/honeywell-trueno-u400-portable-speaker/4.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/honeywell-trueno-u400-portable-speaker/4.jpg', false, 3),
  ('81d2fdd0-ebbb-495a-b165-4b84b6e7de42', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/honeywell-trueno-u400-portable-speaker/5.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/honeywell-trueno-u400-portable-speaker/5.jpg', false, 4);
-- Honeywell Trueno U500 Bluetooth 5.3 Wireless Portable Speaker 60W Black
INSERT INTO products (id, name, slug, description, short_description, sku, category_id, subcategory_id, brand_id, mrp, selling_price, discount_percent, stock_quantity, low_stock_threshold, weight_grams, length_cm, breadth_cm, height_cm, is_active, is_featured, is_deal_of_day, rating, review_count, sold_count, meta_title, meta_description) VALUES (
  'f1eb711e-efa5-4002-8c10-5ec375aea886', 'Honeywell Trueno U500 Bluetooth 5.3 Wireless Portable Speaker 60W Black', 'honeywell-trueno-u500-portable-speaker', 'Honeywell Trueno U500 Bluetooth 5.3 Wireless Portable Speaker 60W Black. 60W, Dual 93mm Drivers, 18H Playtime, IPX6, TWS, RGB Lights, BT 5.3, SD/AUX/USB-C, Built-in Mic.

KEY FEATURES:
- 60W output power for room-filling sound
- Dual 93mm drivers for deep, powerful audio
- Up to 18 hours playtime on 7200mAh battery
- Bluetooth 5.3 wireless up to 15m range
- IPX6 waterproof for any occasion
- TWS pairing for stereo sound
- RGB lights with twin bass radiators
- SD card, AUX & Type-C fast charging', '60W | Dual 93mm Drivers | 18H Playtime | IPX6 | TWS | RGB Lights | BT 5.3 | SD/AUX/USB-C | Built-in Mic', 'HW-TRUENO-U500-BLK', '91b8a207-2b75-4fac-bcbb-bfe47474acec', '1a90e2b7-e458-43d8-8c7a-245de19cbed8', (SELECT id FROM brands WHERE slug='honeywell'), 10999, 3999, 63.64, 100, 5, 2400, 33, 17, 16, true, false, false, 4.1, 120, 0, 'Honeywell Trueno U500 Bluetooth 5.3 Wireless Portable Speaker 60W Black at ₹3999 | BoxDeal', 'Buy Honeywell Trueno U500 Bluetooth 5.3 Wireless Portable Speaker 60W Black at ₹3999 (MRP ₹10999). 60W | Dual 93mm Drivers | 18H Playtime | IPX6 | TWS | RGB Lights | BT 5.3 | SD/AUX/USB-C | Built-in Mic');
INSERT INTO product_specifications (product_id, spec_group, spec_name, spec_value, sort_order) VALUES
  ('f1eb711e-efa5-4002-8c10-5ec375aea886', 'General', 'Brand', 'Honeywell', 1),
  ('f1eb711e-efa5-4002-8c10-5ec375aea886', 'General', 'Model', 'Trueno U500 (HC000121)', 2),
  ('f1eb711e-efa5-4002-8c10-5ec375aea886', 'General', 'Type', 'Portable Bluetooth Speaker', 3),
  ('f1eb711e-efa5-4002-8c10-5ec375aea886', 'General', 'Colour', 'Black', 4),
  ('f1eb711e-efa5-4002-8c10-5ec375aea886', 'General', 'Weight', '2.4 kg', 5),
  ('f1eb711e-efa5-4002-8c10-5ec375aea886', 'Audio', 'Output Power', '60 W', 6),
  ('f1eb711e-efa5-4002-8c10-5ec375aea886', 'Audio', 'Drivers', 'Dual 93mm (93mm x2)', 7),
  ('f1eb711e-efa5-4002-8c10-5ec375aea886', 'Audio', 'Audio Channels', '2.0 (Stereo)', 8),
  ('f1eb711e-efa5-4002-8c10-5ec375aea886', 'Technical', 'Bluetooth', '5.3 (up to 15m range)', 9),
  ('f1eb711e-efa5-4002-8c10-5ec375aea886', 'Technical', 'TWS', 'Yes (pair 2 speakers)', 10),
  ('f1eb711e-efa5-4002-8c10-5ec375aea886', 'Technical', 'Water Resistance', 'IPX6', 11),
  ('f1eb711e-efa5-4002-8c10-5ec375aea886', 'Technical', 'Lighting', 'RGB Lights', 12),
  ('f1eb711e-efa5-4002-8c10-5ec375aea886', 'Technical', 'Inputs', 'Bluetooth, SD Card, AUX, USB Type-C', 13),
  ('f1eb711e-efa5-4002-8c10-5ec375aea886', 'Technical', 'Built-in Mic', 'Yes', 14),
  ('f1eb711e-efa5-4002-8c10-5ec375aea886', 'Battery', 'Capacity', '7200 mAh (Li-ion)', 15),
  ('f1eb711e-efa5-4002-8c10-5ec375aea886', 'Battery', 'Playtime', 'Up to 18 hours', 16),
  ('f1eb711e-efa5-4002-8c10-5ec375aea886', 'Battery', 'Charging', 'Type-C Fast Charging', 17),
  ('f1eb711e-efa5-4002-8c10-5ec375aea886', 'In the Box', 'Contents', 'Speaker, Warranty Card', 18);
INSERT INTO product_images (product_id, image_url, thumbnail_url, is_primary, sort_order) VALUES
  ('f1eb711e-efa5-4002-8c10-5ec375aea886', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/honeywell-trueno-u500-portable-speaker/1.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/honeywell-trueno-u500-portable-speaker/1.jpg', true, 0),
  ('f1eb711e-efa5-4002-8c10-5ec375aea886', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/honeywell-trueno-u500-portable-speaker/2.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/honeywell-trueno-u500-portable-speaker/2.jpg', false, 1),
  ('f1eb711e-efa5-4002-8c10-5ec375aea886', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/honeywell-trueno-u500-portable-speaker/3.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/honeywell-trueno-u500-portable-speaker/3.jpg', false, 2),
  ('f1eb711e-efa5-4002-8c10-5ec375aea886', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/honeywell-trueno-u500-portable-speaker/4.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/honeywell-trueno-u500-portable-speaker/4.jpg', false, 3),
  ('f1eb711e-efa5-4002-8c10-5ec375aea886', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/honeywell-trueno-u500-portable-speaker/5.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/honeywell-trueno-u500-portable-speaker/5.jpg', false, 4);