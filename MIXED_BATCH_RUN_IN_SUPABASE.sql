-- New brands (idempotent)
INSERT INTO brands (id, name, slug, is_active) SELECT '8839dfb6-1566-4dc8-8738-a8807a33afc0', 'Lifelong', 'lifelong', true WHERE NOT EXISTS (SELECT 1 FROM brands WHERE slug='lifelong');
INSERT INTO brands (id, name, slug, is_active) SELECT '39c227d7-0c99-4aaa-adfd-f45d097173db', 'ELIIDE', 'eliide', true WHERE NOT EXISTS (SELECT 1 FROM brands WHERE slug='eliide');
INSERT INTO brands (id, name, slug, is_active) SELECT '46952d43-50e7-4861-af3f-c590bb491c3b', 'Photron', 'photron', true WHERE NOT EXISTS (SELECT 1 FROM brands WHERE slug='photron');

-- New subcategory: Projector under Camera Accessories (idempotent)
INSERT INTO subcategories (id, category_id, name, slug, is_active, sort_order) SELECT 'd1f0c2a4-7b3e-4c58-9a21-6e4f8b0d5c33', '0e92eb22-430e-4db6-b54c-ce0f2b76bf4d', 'Projector', 'projector', true, 5 WHERE NOT EXISTS (SELECT 1 FROM subcategories WHERE slug='projector' AND category_id='0e92eb22-430e-4db6-b54c-ce0f2b76bf4d');

-- Lifelong Minipix 3500lm Portable Android Smart Projector 720p HD with 4K Support Black
INSERT INTO products (id, name, slug, description, short_description, sku, category_id, subcategory_id, brand_id, mrp, selling_price, discount_percent, stock_quantity, low_stock_threshold, weight_grams, length_cm, breadth_cm, height_cm, is_active, is_featured, is_deal_of_day, rating, review_count, sold_count, meta_title, meta_description) VALUES (
  '24f5dacc-717f-4901-ba5b-83cb8e46a8b1', 'Lifelong Minipix 3500lm Portable Android Smart Projector 720p HD with 4K Support Black', 'lifelong-minipix-portable-projector', 'Lifelong Minipix 3500lm Portable Android Smart Projector 720p HD with 4K Support Black. 3500 lm, 720p HD (4K Support), Up to 120 inch Display, Android Smart, Netflix/Prime/YouTube, Bluetooth, Wi-Fi, Inbuilt Speaker.

KEY FEATURES:
- 3500 lumens brightness for vivid picture
- 720p HD native resolution with 4K support
- Projects up to a 120-inch big-screen display
- Android smart OS - Netflix, Prime, YouTube & more
- Built-in speaker, Bluetooth & Wi-Fi connectivity
- 50000-hour long-life LED lamp
- Compact & portable home projector', '3500 lm | 720p HD (4K Support) | Up to 120" Display | Android Smart | Netflix/Prime/YouTube | Bluetooth | Wi-Fi | Inbuilt Speaker', 'LL-MINIPIX-BLK', '0e92eb22-430e-4db6-b54c-ce0f2b76bf4d', 'd1f0c2a4-7b3e-4c58-9a21-6e4f8b0d5c33', (SELECT id FROM brands WHERE slug='lifelong'), 19999, 4699, 76.5, 50, 5, 1500, 23, 23, 16, true, false, false, 4.2, 340, 0, 'Lifelong Minipix 3500lm Portable Android Smart Projector 720p HD with 4K Support Black at ₹4699 | BoxDeal', 'Buy Lifelong Minipix 3500lm Portable Android Smart Projector 720p HD with 4K Support Black at ₹4699 (MRP ₹19999). 3500 lm | 720p HD (4K Support) | Up to 120" Display | Android Smart | Netflix/Prime/YouTube | Bluetooth | Wi-Fi | Inbuilt Speaker');
INSERT INTO product_specifications (product_id, spec_group, spec_name, spec_value, sort_order) VALUES
  ('24f5dacc-717f-4901-ba5b-83cb8e46a8b1', 'General', 'Brand', 'Lifelong', 1),
  ('24f5dacc-717f-4901-ba5b-83cb8e46a8b1', 'General', 'Model', 'Minipix (LLPJEJ40)', 2),
  ('24f5dacc-717f-4901-ba5b-83cb8e46a8b1', 'General', 'Type', 'LED Smart Projector', 3),
  ('24f5dacc-717f-4901-ba5b-83cb8e46a8b1', 'General', 'Colour', 'Black', 4),
  ('24f5dacc-717f-4901-ba5b-83cb8e46a8b1', 'General', 'Portable', 'Yes', 5),
  ('24f5dacc-717f-4901-ba5b-83cb8e46a8b1', 'Display', 'Native Resolution', '1280 x 720 (720p HD)', 6),
  ('24f5dacc-717f-4901-ba5b-83cb8e46a8b1', 'Display', '4K Support', 'Yes', 7),
  ('24f5dacc-717f-4901-ba5b-83cb8e46a8b1', 'Display', 'Max Display Size', 'Up to 120 inch', 8),
  ('24f5dacc-717f-4901-ba5b-83cb8e46a8b1', 'Display', 'Brightness', '3500 lm', 9),
  ('24f5dacc-717f-4901-ba5b-83cb8e46a8b1', 'Display', 'Light Source', 'LED', 10),
  ('24f5dacc-717f-4901-ba5b-83cb8e46a8b1', 'Display', 'Lamp Life', '50000 hours', 11),
  ('24f5dacc-717f-4901-ba5b-83cb8e46a8b1', 'Display', 'Projection Distance', '96 inch - 13 ft', 12),
  ('24f5dacc-717f-4901-ba5b-83cb8e46a8b1', 'Smart', 'OS', 'Android (Smart Apps)', 13),
  ('24f5dacc-717f-4901-ba5b-83cb8e46a8b1', 'Smart', 'Supported Apps', 'Netflix, Prime Video, YouTube & more', 14),
  ('24f5dacc-717f-4901-ba5b-83cb8e46a8b1', 'Connectivity', 'Wireless', 'Bluetooth, Wi-Fi', 15),
  ('24f5dacc-717f-4901-ba5b-83cb8e46a8b1', 'Audio', 'Speaker', 'Built-in', 16),
  ('24f5dacc-717f-4901-ba5b-83cb8e46a8b1', 'In the Box', 'Contents', 'Projector, Charging Cable, HDMI Cable, A/V Cable, User Manual, Warranty Card', 17);
INSERT INTO product_images (product_id, image_url, thumbnail_url, is_primary, sort_order) VALUES
  ('24f5dacc-717f-4901-ba5b-83cb8e46a8b1', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/lifelong-minipix-portable-projector/1.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/lifelong-minipix-portable-projector/1.jpg', true, 0),
  ('24f5dacc-717f-4901-ba5b-83cb8e46a8b1', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/lifelong-minipix-portable-projector/2.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/lifelong-minipix-portable-projector/2.jpg', false, 1),
  ('24f5dacc-717f-4901-ba5b-83cb8e46a8b1', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/lifelong-minipix-portable-projector/3.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/lifelong-minipix-portable-projector/3.jpg', false, 2),
  ('24f5dacc-717f-4901-ba5b-83cb8e46a8b1', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/lifelong-minipix-portable-projector/4.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/lifelong-minipix-portable-projector/4.jpg', false, 3),
  ('24f5dacc-717f-4901-ba5b-83cb8e46a8b1', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/lifelong-minipix-portable-projector/5.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/lifelong-minipix-portable-projector/5.jpg', false, 4);

-- ELIIDE 10000mAh 22.5W Slim Pocket Size Fast Charging Power Bank Multicolor
INSERT INTO products (id, name, slug, description, short_description, sku, category_id, subcategory_id, brand_id, mrp, selling_price, discount_percent, stock_quantity, low_stock_threshold, weight_grams, length_cm, breadth_cm, height_cm, is_active, is_featured, is_deal_of_day, rating, review_count, sold_count, meta_title, meta_description) VALUES (
  '00ec85d4-0810-4bb1-be12-8f1343ae2a5a', 'ELIIDE 10000mAh 22.5W Slim Pocket Size Fast Charging Power Bank Multicolor', 'eliide-10000mah-22-5w-slim-power-bank', 'ELIIDE 10000mAh 22.5W Slim Pocket Size Fast Charging Power Bank Multicolor. 10000mAh, 22.5W Fast Charging, Slim Pocket Size, Type-C, 2 Output Ports, Li-ion, Cable Included.

KEY FEATURES:
- 10000mAh capacity for multiple charges
- 22.5W max fast charging output
- Slim pocket-size design
- Type-C connector with 2 output ports
- Charges phones, earbuds, smartwatch, tablet & more
- Charging cable included in box
- Lithium-ion battery', '10000mAh | 22.5W Fast Charging | Slim Pocket Size | Type-C | 2 Output Ports | Li-ion | Cable Included', 'ELIIDE-BOLT10K-PD', 'b3ca7969-a164-4d7d-8063-0d2ee6e00dec', NULL, (SELECT id FROM brands WHERE slug='eliide'), 1499, 549, 63.38, 100, 5, 500, 20, 12, 4, true, false, false, 4.1, 280, 0, 'ELIIDE 10000mAh 22.5W Slim Pocket Size Fast Charging Power Bank Multicolor at ₹549 | BoxDeal', 'Buy ELIIDE 10000mAh 22.5W Slim Pocket Size Fast Charging Power Bank Multicolor at ₹549 (MRP ₹1499). 10000mAh | 22.5W Fast Charging | Slim Pocket Size | Type-C | 2 Output Ports | Li-ion | Cable Included');
INSERT INTO product_specifications (product_id, spec_group, spec_name, spec_value, sort_order) VALUES
  ('00ec85d4-0810-4bb1-be12-8f1343ae2a5a', 'General', 'Brand', 'ELIIDE', 1),
  ('00ec85d4-0810-4bb1-be12-8f1343ae2a5a', 'General', 'Model', 'BOLT 10K PD (GOODBANK)', 2),
  ('00ec85d4-0810-4bb1-be12-8f1343ae2a5a', 'General', 'Type', 'Wired Power Bank', 3),
  ('00ec85d4-0810-4bb1-be12-8f1343ae2a5a', 'General', 'Colour', 'Black / Blue', 4),
  ('00ec85d4-0810-4bb1-be12-8f1343ae2a5a', 'General', 'Pocket Size', 'Yes', 5),
  ('00ec85d4-0810-4bb1-be12-8f1343ae2a5a', 'Battery', 'Capacity', '10000 mAh', 6),
  ('00ec85d4-0810-4bb1-be12-8f1343ae2a5a', 'Battery', 'Battery Type', 'Lithium-ion', 7),
  ('00ec85d4-0810-4bb1-be12-8f1343ae2a5a', 'Power', 'Max Output', '22.5 W', 8),
  ('00ec85d4-0810-4bb1-be12-8f1343ae2a5a', 'Power', 'Output', '2 x 4.5V/5A, 5V/3A, 9V/2A, 12V/1.5A', 9),
  ('00ec85d4-0810-4bb1-be12-8f1343ae2a5a', 'Technical', 'Output Ports', '2', 10),
  ('00ec85d4-0810-4bb1-be12-8f1343ae2a5a', 'Technical', 'Connectors', 'Type-C', 11),
  ('00ec85d4-0810-4bb1-be12-8f1343ae2a5a', 'Technical', 'Charging Type', 'Fast Charging', 12),
  ('00ec85d4-0810-4bb1-be12-8f1343ae2a5a', 'In the Box', 'Contents', 'Power Bank, Charging Cable', 13);
INSERT INTO product_images (product_id, image_url, thumbnail_url, is_primary, sort_order) VALUES
  ('00ec85d4-0810-4bb1-be12-8f1343ae2a5a', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/eliide-10000mah-22-5w-slim-power-bank/1.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/eliide-10000mah-22-5w-slim-power-bank/1.jpg', true, 0),
  ('00ec85d4-0810-4bb1-be12-8f1343ae2a5a', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/eliide-10000mah-22-5w-slim-power-bank/2.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/eliide-10000mah-22-5w-slim-power-bank/2.jpg', false, 1),
  ('00ec85d4-0810-4bb1-be12-8f1343ae2a5a', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/eliide-10000mah-22-5w-slim-power-bank/3.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/eliide-10000mah-22-5w-slim-power-bank/3.jpg', false, 2),
  ('00ec85d4-0810-4bb1-be12-8f1343ae2a5a', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/eliide-10000mah-22-5w-slim-power-bank/4.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/eliide-10000mah-22-5w-slim-power-bank/4.jpg', false, 3),
  ('00ec85d4-0810-4bb1-be12-8f1343ae2a5a', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/eliide-10000mah-22-5w-slim-power-bank/5.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/eliide-10000mah-22-5w-slim-power-bank/5.jpg', false, 4);

-- ELIIDE 10000mAh Power Bank Black Lithium-ion with Type-C
INSERT INTO products (id, name, slug, description, short_description, sku, category_id, subcategory_id, brand_id, mrp, selling_price, discount_percent, stock_quantity, low_stock_threshold, weight_grams, length_cm, breadth_cm, height_cm, is_active, is_featured, is_deal_of_day, rating, review_count, sold_count, meta_title, meta_description) VALUES (
  'be77f408-075f-406a-ae1f-c90215affa20', 'ELIIDE 10000mAh Power Bank Black Lithium-ion with Type-C', 'eliide-10000mah-power-bank-zapcell', 'ELIIDE 10000mAh Power Bank Black Lithium-ion with Type-C. 10000mAh, Type-C, 2 Output Ports, Li-ion, For Earbuds, Laptop, Mobile, Smartwatch, Tablet.

KEY FEATURES:
- 10000mAh capacity for all-day backup
- Type-C connector for modern devices
- 2 output ports to charge two devices
- Charges earbuds, laptop, mobile, smartwatch & tablet
- Lithium-ion battery
- Compact, travel-ready design', '10000mAh | Type-C | 2 Output Ports | Li-ion | For Earbuds, Laptop, Mobile, Smartwatch, Tablet', 'ELIIDE-ELP1410', 'b3ca7969-a164-4d7d-8063-0d2ee6e00dec', NULL, (SELECT id FROM brands WHERE slug='eliide'), 1499, 419, 72.05, 100, 5, 400, 19, 10, 3, true, false, false, 4, 210, 0, 'ELIIDE 10000mAh Power Bank Black Lithium-ion with Type-C at ₹419 | BoxDeal', 'Buy ELIIDE 10000mAh Power Bank Black Lithium-ion with Type-C at ₹419 (MRP ₹1499). 10000mAh | Type-C | 2 Output Ports | Li-ion | For Earbuds, Laptop, Mobile, Smartwatch, Tablet');
INSERT INTO product_specifications (product_id, spec_group, spec_name, spec_value, sort_order) VALUES
  ('be77f408-075f-406a-ae1f-c90215affa20', 'General', 'Brand', 'ELIIDE', 1),
  ('be77f408-075f-406a-ae1f-c90215affa20', 'General', 'Model', 'ELP-1410 (ZAPCELL)', 2),
  ('be77f408-075f-406a-ae1f-c90215affa20', 'General', 'Type', 'Wired Power Bank', 3),
  ('be77f408-075f-406a-ae1f-c90215affa20', 'General', 'Colour', 'Black / Blue', 4),
  ('be77f408-075f-406a-ae1f-c90215affa20', 'Battery', 'Capacity', '10000 mAh', 5),
  ('be77f408-075f-406a-ae1f-c90215affa20', 'Battery', 'Battery Type', 'Lithium-ion', 6),
  ('be77f408-075f-406a-ae1f-c90215affa20', 'Technical', 'Output Ports', '2', 7),
  ('be77f408-075f-406a-ae1f-c90215affa20', 'Technical', 'Connectors', 'Type-C', 8),
  ('be77f408-075f-406a-ae1f-c90215affa20', 'Technical', 'Charging Cable', 'Not Included', 9),
  ('be77f408-075f-406a-ae1f-c90215affa20', 'In the Box', 'Contents', 'Power Bank', 10);
INSERT INTO product_images (product_id, image_url, thumbnail_url, is_primary, sort_order) VALUES
  ('be77f408-075f-406a-ae1f-c90215affa20', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/eliide-10000mah-power-bank-zapcell/1.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/eliide-10000mah-power-bank-zapcell/1.jpg', true, 0),
  ('be77f408-075f-406a-ae1f-c90215affa20', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/eliide-10000mah-power-bank-zapcell/2.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/eliide-10000mah-power-bank-zapcell/2.jpg', false, 1),
  ('be77f408-075f-406a-ae1f-c90215affa20', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/eliide-10000mah-power-bank-zapcell/3.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/eliide-10000mah-power-bank-zapcell/3.jpg', false, 2),
  ('be77f408-075f-406a-ae1f-c90215affa20', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/eliide-10000mah-power-bank-zapcell/4.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/eliide-10000mah-power-bank-zapcell/4.jpg', false, 3),
  ('be77f408-075f-406a-ae1f-c90215affa20', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/eliide-10000mah-power-bank-zapcell/5.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/eliide-10000mah-power-bank-zapcell/5.jpg', false, 4);

-- OnePlus Warp Charge Type-C to Type-C Cable 100cm Red
INSERT INTO products (id, name, slug, description, short_description, sku, category_id, subcategory_id, brand_id, mrp, selling_price, discount_percent, stock_quantity, low_stock_threshold, weight_grams, length_cm, breadth_cm, height_cm, is_active, is_featured, is_deal_of_day, rating, review_count, sold_count, meta_title, meta_description) VALUES (
  '765a0dae-14d6-4a3d-b707-65260e2063d7', 'OnePlus Warp Charge Type-C to Type-C Cable 100cm Red', 'oneplus-warp-charge-type-c-to-type-c-cable', 'OnePlus Warp Charge Type-C to Type-C Cable 100cm Red. Type-C to Type-C, 100cm, Up to 65W Warp Charge, 6.5A, SUPERVOOC, Silicone, Data Sync, Red & White.

KEY FEATURES:
- Type-C to Type-C cable, 100cm length
- Up to 65W Warp Charge fast charging
- 6.5A max current (max output 6.5A at 10V)
- SUPERVOOC specification
- Premium silicone coating, tangle-free
- High-grade copper & nickel internal cabling
- 480 Mbps data transfer & sync
- Signature OnePlus red & white design', 'Type-C to Type-C | 100cm | Up to 65W Warp Charge | 6.5A | SUPERVOOC | Silicone | Data Sync | Red & White', 'OP-WARP-CC-100CM', '08094555-b1b6-409a-af97-afa9fdffe03a', 'c6ff88e2-dc05-49cc-9541-421116be4058', (SELECT id FROM brands WHERE slug='oneplus'), 849, 399, 53, 50, 5, 50, 20, 10, 1, true, false, false, 4.1, 1535, 0, 'OnePlus Warp Charge Type-C to Type-C Cable 100cm Red at ₹399 | BoxDeal', 'Buy OnePlus Warp Charge Type-C to Type-C Cable 100cm Red at ₹399 (MRP ₹849). Type-C to Type-C | 100cm | Up to 65W Warp Charge | 6.5A | SUPERVOOC | Silicone | Data Sync | Red & White');
INSERT INTO product_specifications (product_id, spec_group, spec_name, spec_value, sort_order) VALUES
  ('765a0dae-14d6-4a3d-b707-65260e2063d7', 'General', 'Brand', 'OnePlus', 1),
  ('765a0dae-14d6-4a3d-b707-65260e2063d7', 'General', 'Model', 'SUPERVOOC Type-C to Type-C Cable', 2),
  ('765a0dae-14d6-4a3d-b707-65260e2063d7', 'General', 'Colour', 'Red / White', 3),
  ('765a0dae-14d6-4a3d-b707-65260e2063d7', 'General', 'Length', '100 cm', 4),
  ('765a0dae-14d6-4a3d-b707-65260e2063d7', 'General', 'Outer Material', 'Silicone', 5),
  ('765a0dae-14d6-4a3d-b707-65260e2063d7', 'Technical', 'Connector Type', 'USB Type-C to Type-C', 6),
  ('765a0dae-14d6-4a3d-b707-65260e2063d7', 'Technical', 'Connector Gender', 'Male-to-Male', 7),
  ('765a0dae-14d6-4a3d-b707-65260e2063d7', 'Technical', 'Max Current', '6.5 A', 8),
  ('765a0dae-14d6-4a3d-b707-65260e2063d7', 'Technical', 'Wattage', 'Up to 65W Warp / 150W rated', 9),
  ('765a0dae-14d6-4a3d-b707-65260e2063d7', 'Technical', 'Data Transfer Rate', '480 Mbps', 10),
  ('765a0dae-14d6-4a3d-b707-65260e2063d7', 'Technical', 'Number of Pins', '48', 11),
  ('765a0dae-14d6-4a3d-b707-65260e2063d7', 'Technical', 'Specification Met', 'SUPERVOOC', 12),
  ('765a0dae-14d6-4a3d-b707-65260e2063d7', 'In the Box', 'Contents', 'SUPERVOOC Type-C to Type-C Cable', 13);
INSERT INTO product_images (product_id, image_url, thumbnail_url, is_primary, sort_order) VALUES
  ('765a0dae-14d6-4a3d-b707-65260e2063d7', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/oneplus-warp-charge-type-c-to-type-c-cable/1.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/oneplus-warp-charge-type-c-to-type-c-cable/1.jpg', true, 0),
  ('765a0dae-14d6-4a3d-b707-65260e2063d7', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/oneplus-warp-charge-type-c-to-type-c-cable/2.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/oneplus-warp-charge-type-c-to-type-c-cable/2.jpg', false, 1),
  ('765a0dae-14d6-4a3d-b707-65260e2063d7', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/oneplus-warp-charge-type-c-to-type-c-cable/3.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/oneplus-warp-charge-type-c-to-type-c-cable/3.jpg', false, 2),
  ('765a0dae-14d6-4a3d-b707-65260e2063d7', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/oneplus-warp-charge-type-c-to-type-c-cable/4.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/oneplus-warp-charge-type-c-to-type-c-cable/4.jpg', false, 3),
  ('765a0dae-14d6-4a3d-b707-65260e2063d7', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/oneplus-warp-charge-type-c-to-type-c-cable/5.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/oneplus-warp-charge-type-c-to-type-c-cable/5.jpg', false, 4);

-- boAt Cosmos Smart Watch 1.78" AMOLED Display 700+ Active Modes ASAP Charge Ink Blue
INSERT INTO products (id, name, slug, description, short_description, sku, category_id, subcategory_id, brand_id, mrp, selling_price, discount_percent, stock_quantity, low_stock_threshold, weight_grams, length_cm, breadth_cm, height_cm, is_active, is_featured, is_deal_of_day, rating, review_count, sold_count, meta_title, meta_description) VALUES (
  'e43394b0-071a-4d9d-8d18-c0d53f35522e', 'boAt Cosmos Smart Watch 1.78" AMOLED Display 700+ Active Modes ASAP Charge Ink Blue', 'boat-cosmos-smart-watch-ink-blue', 'boAt Cosmos Smart Watch 1.78" AMOLED Display 700+ Active Modes ASAP Charge Ink Blue. 1.78" AMOLED, 454x454, 700+ Active Modes, ASAP Charge, Always On Display, BT Calling, GPS, Live Cricket Score, Ink Blue.

KEY FEATURES:
- 1.78-inch AMOLED display, 454x454, 325ppi
- 700+ active sports & fitness modes
- ASAP Charge - 30 min fast charge
- Always On Display with 60Hz refresh
- Premium metal body with silicone straps
- Live cricket score & voice assistant
- Heart rate, SpO2, sleep & activity tracking
- GPS via smartphone', '1.78" AMOLED | 454x454 | 700+ Active Modes | ASAP Charge | Always On Display | BT Calling | GPS | Live Cricket Score | Ink Blue', 'BOAT-COSMOS-INKBLU', '7b0b7971-dd65-4643-91c9-c9c4a943da19', NULL, (SELECT id FROM brands WHERE slug='boat'), 8999, 1149, 87.23, 100, 5, 400, 19, 14, 5, true, false, false, 4.2, 520, 0, 'boAt Cosmos Smart Watch 1.78" AMOLED Display 700+ Active Modes ASAP Charge Ink Blue at ₹1149 | BoxDeal', 'Buy boAt Cosmos Smart Watch 1.78" AMOLED Display 700+ Active Modes ASAP Charge Ink Blue at ₹1149 (MRP ₹8999). 1.78" AMOLED | 454x454 | 700+ Active Modes | ASAP Charge | Always On Display | BT Calling | GPS | Live Cricket Score | Ink Blue');
INSERT INTO product_specifications (product_id, spec_group, spec_name, spec_value, sort_order) VALUES
  ('e43394b0-071a-4d9d-8d18-c0d53f35522e', 'General', 'Brand', 'boAt', 1),
  ('e43394b0-071a-4d9d-8d18-c0d53f35522e', 'General', 'Model', 'Cosmos', 2),
  ('e43394b0-071a-4d9d-8d18-c0d53f35522e', 'General', 'Colour', 'Ink Blue', 3),
  ('e43394b0-071a-4d9d-8d18-c0d53f35522e', 'General', 'Target Audience', 'Unisex Adult', 4),
  ('e43394b0-071a-4d9d-8d18-c0d53f35522e', 'Display', 'Screen Size', '1.78 inch', 5),
  ('e43394b0-071a-4d9d-8d18-c0d53f35522e', 'Display', 'Display Type', 'AMOLED', 6),
  ('e43394b0-071a-4d9d-8d18-c0d53f35522e', 'Display', 'Resolution', '454 x 454', 7),
  ('e43394b0-071a-4d9d-8d18-c0d53f35522e', 'Display', 'Refresh Rate', '60 Hz', 8),
  ('e43394b0-071a-4d9d-8d18-c0d53f35522e', 'Features', 'Active Modes', '700+', 9),
  ('e43394b0-071a-4d9d-8d18-c0d53f35522e', 'Features', 'Always On Display', 'Yes', 10),
  ('e43394b0-071a-4d9d-8d18-c0d53f35522e', 'Features', 'BT Calling', 'Yes', 11),
  ('e43394b0-071a-4d9d-8d18-c0d53f35522e', 'Features', 'Water Resistance', 'Water Resistant', 12),
  ('e43394b0-071a-4d9d-8d18-c0d53f35522e', 'Battery', 'Battery Type', 'Lithium Ion', 13),
  ('e43394b0-071a-4d9d-8d18-c0d53f35522e', 'Battery', 'Fast Charge', 'ASAP Charge (30 min)', 14),
  ('e43394b0-071a-4d9d-8d18-c0d53f35522e', 'Connectivity', 'Bluetooth', 'Yes', 15),
  ('e43394b0-071a-4d9d-8d18-c0d53f35522e', 'In the Box', 'Contents', 'Cosmos Watch, Charging Cable, User Manual, Warranty Card', 16);
INSERT INTO product_images (product_id, image_url, thumbnail_url, is_primary, sort_order) VALUES
  ('e43394b0-071a-4d9d-8d18-c0d53f35522e', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/boat-cosmos-smart-watch-ink-blue/1.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/boat-cosmos-smart-watch-ink-blue/1.jpg', true, 0),
  ('e43394b0-071a-4d9d-8d18-c0d53f35522e', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/boat-cosmos-smart-watch-ink-blue/2.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/boat-cosmos-smart-watch-ink-blue/2.jpg', false, 1),
  ('e43394b0-071a-4d9d-8d18-c0d53f35522e', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/boat-cosmos-smart-watch-ink-blue/3.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/boat-cosmos-smart-watch-ink-blue/3.jpg', false, 2),
  ('e43394b0-071a-4d9d-8d18-c0d53f35522e', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/boat-cosmos-smart-watch-ink-blue/4.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/boat-cosmos-smart-watch-ink-blue/4.jpg', false, 3),
  ('e43394b0-071a-4d9d-8d18-c0d53f35522e', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/boat-cosmos-smart-watch-ink-blue/5.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/boat-cosmos-smart-watch-ink-blue/5.jpg', false, 4);

-- Photron P10 WASH 10W Bluetooth Speaker Black Stereo
INSERT INTO products (id, name, slug, description, short_description, sku, category_id, subcategory_id, brand_id, mrp, selling_price, discount_percent, stock_quantity, low_stock_threshold, weight_grams, length_cm, breadth_cm, height_cm, is_active, is_featured, is_deal_of_day, rating, review_count, sold_count, meta_title, meta_description) VALUES (
  '3b31421b-f3ce-48c0-802d-8223c3dd76ac', 'Photron P10 WASH 10W Bluetooth Speaker Black Stereo', 'photron-p10-wash-bluetooth-speaker', 'Photron P10 WASH 10W Bluetooth Speaker Black Stereo. 10W, Stereo, Bluetooth 4.2, IPX5 Waterproof, Built-in Mic, 8-10H Playtime, Silicone Cover, Portable.

KEY FEATURES:
- 10W powerful stereo sound output
- Bluetooth 4.2 with up to 10m range
- IPX5 waterproof - indoor & outdoor use
- Dust-proof & shockproof silicone cover
- Built-in microphone for hands-free calls
- 8-10 hours music playtime
- Dual 8.3cm speaker units, compact body
- Lanyard design for easy carry', '10W | Stereo | Bluetooth 4.2 | IPX5 Waterproof | Built-in Mic | 8-10H Playtime | Silicone Cover | Portable', 'PHOTRON-P10-WASH-BLK', '91b8a207-2b75-4fac-bcbb-bfe47474acec', '1a90e2b7-e458-43d8-8c7a-245de19cbed8', (SELECT id FROM brands WHERE slug='photron'), 2990, 549, 81.64, 5, 5, 500, 15, 12, 8, true, false, false, 4, 95, 0, 'Photron P10 WASH 10W Bluetooth Speaker Black Stereo at ₹549 | BoxDeal', 'Buy Photron P10 WASH 10W Bluetooth Speaker Black Stereo at ₹549 (MRP ₹2990). 10W | Stereo | Bluetooth 4.2 | IPX5 Waterproof | Built-in Mic | 8-10H Playtime | Silicone Cover | Portable');
INSERT INTO product_specifications (product_id, spec_group, spec_name, spec_value, sort_order) VALUES
  ('3b31421b-f3ce-48c0-802d-8223c3dd76ac', 'General', 'Brand', 'Photron', 1),
  ('3b31421b-f3ce-48c0-802d-8223c3dd76ac', 'General', 'Model', 'P10 WASH', 2),
  ('3b31421b-f3ce-48c0-802d-8223c3dd76ac', 'General', 'Type', 'Portable Bluetooth Speaker', 3),
  ('3b31421b-f3ce-48c0-802d-8223c3dd76ac', 'General', 'Colour', 'Black', 4),
  ('3b31421b-f3ce-48c0-802d-8223c3dd76ac', 'General', 'Configuration', 'Stereo', 5),
  ('3b31421b-f3ce-48c0-802d-8223c3dd76ac', 'Audio', 'Output Power', '10 W', 6),
  ('3b31421b-f3ce-48c0-802d-8223c3dd76ac', 'Audio', 'Driver', '8.3 cm Dual Units', 7),
  ('3b31421b-f3ce-48c0-802d-8223c3dd76ac', 'Technical', 'Bluetooth', '4.2 (up to 10m range)', 8),
  ('3b31421b-f3ce-48c0-802d-8223c3dd76ac', 'Technical', 'Water Resistance', 'IPX5', 9),
  ('3b31421b-f3ce-48c0-802d-8223c3dd76ac', 'Technical', 'Built-in Mic', 'Yes', 10),
  ('3b31421b-f3ce-48c0-802d-8223c3dd76ac', 'Technical', 'Protection', 'Dust-proof & Shockproof Silicone Cover', 11),
  ('3b31421b-f3ce-48c0-802d-8223c3dd76ac', 'Battery', 'Playtime', '8-10 hours', 12),
  ('3b31421b-f3ce-48c0-802d-8223c3dd76ac', 'In the Box', 'Contents', 'Speaker, Charging Cable, User Manual', 13);
INSERT INTO product_images (product_id, image_url, thumbnail_url, is_primary, sort_order) VALUES
  ('3b31421b-f3ce-48c0-802d-8223c3dd76ac', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/photron-p10-wash-bluetooth-speaker/1.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/photron-p10-wash-bluetooth-speaker/1.jpg', true, 0),
  ('3b31421b-f3ce-48c0-802d-8223c3dd76ac', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/photron-p10-wash-bluetooth-speaker/2.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/photron-p10-wash-bluetooth-speaker/2.jpg', false, 1),
  ('3b31421b-f3ce-48c0-802d-8223c3dd76ac', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/photron-p10-wash-bluetooth-speaker/3.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/photron-p10-wash-bluetooth-speaker/3.jpg', false, 2),
  ('3b31421b-f3ce-48c0-802d-8223c3dd76ac', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/photron-p10-wash-bluetooth-speaker/4.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/photron-p10-wash-bluetooth-speaker/4.jpg', false, 3),
  ('3b31421b-f3ce-48c0-802d-8223c3dd76ac', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/photron-p10-wash-bluetooth-speaker/5.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/photron-p10-wash-bluetooth-speaker/5.jpg', false, 4);

-- Honeywell Trueno U4000 Soundbar 240W 2.1Ch Surround Home Theatre with Subwoofer Black
INSERT INTO products (id, name, slug, description, short_description, sku, category_id, subcategory_id, brand_id, mrp, selling_price, discount_percent, stock_quantity, low_stock_threshold, weight_grams, length_cm, breadth_cm, height_cm, is_active, is_featured, is_deal_of_day, rating, review_count, sold_count, meta_title, meta_description) VALUES (
  '2aaba9df-7898-4af3-a351-331902baa8ba', 'Honeywell Trueno U4000 Soundbar 240W 2.1Ch Surround Home Theatre with Subwoofer Black', 'honeywell-trueno-u4000-soundbar', 'Honeywell Trueno U4000 Soundbar 240W 2.1Ch Surround Home Theatre with Subwoofer Black. 240W, 2.1Ch Surround, Wired Subwoofer, 3 EQ Modes, LED Display + Ambient Light, BT 5.3, AUX/USB/Optical/HDMI ARC, Remote.

KEY FEATURES:
- 240W output from 4x57mm drivers
- 2.1 channel surround sound system
- Wired subwoofer with 165.1mm driver for deep bass
- 3 EQ modes - Music, Movie, News
- LED display with ambient light
- Bluetooth 5.3+EDR up to 10m range
- AUX, USB, Optical & HDMI ARC inputs
- Sleek remote control included', '240W | 2.1Ch Surround | Wired Subwoofer | 3 EQ Modes | LED Display + Ambient Light | BT 5.3 | AUX/USB/Optical/HDMI ARC | Remote', 'HW-TRUENO-U4000-BLK', '91b8a207-2b75-4fac-bcbb-bfe47474acec', 'f254ebf8-dc19-4717-b144-361660cb78cf', (SELECT id FROM brands WHERE slug='honeywell'), 24999, 4899, 80.4, 100, 5, 12000, 40, 20, 12, true, false, false, 4.1, 120, 0, 'Honeywell Trueno U4000 Soundbar 240W 2.1Ch Surround Home Theatre with Subwoofer Black at ₹4899 | BoxDeal', 'Buy Honeywell Trueno U4000 Soundbar 240W 2.1Ch Surround Home Theatre with Subwoofer Black at ₹4899 (MRP ₹24999). 240W | 2.1Ch Surround | Wired Subwoofer | 3 EQ Modes | LED Display + Ambient Light | BT 5.3 | AUX/USB/Optical/HDMI ARC | Remote');
INSERT INTO product_specifications (product_id, spec_group, spec_name, spec_value, sort_order) VALUES
  ('2aaba9df-7898-4af3-a351-331902baa8ba', 'General', 'Brand', 'Honeywell', 1),
  ('2aaba9df-7898-4af3-a351-331902baa8ba', 'General', 'Model', 'Trueno U4000 (HC000260)', 2),
  ('2aaba9df-7898-4af3-a351-331902baa8ba', 'General', 'Type', 'Soundbar Home Theatre', 3),
  ('2aaba9df-7898-4af3-a351-331902baa8ba', 'General', 'Colour', 'Black', 4),
  ('2aaba9df-7898-4af3-a351-331902baa8ba', 'Audio', 'Output Power', '240 W', 5),
  ('2aaba9df-7898-4af3-a351-331902baa8ba', 'Audio', 'Channels', '2.1', 6),
  ('2aaba9df-7898-4af3-a351-331902baa8ba', 'Audio', 'Soundbar Drivers', '4 x 57mm', 7),
  ('2aaba9df-7898-4af3-a351-331902baa8ba', 'Audio', 'Subwoofer Driver', '165.1 mm', 8),
  ('2aaba9df-7898-4af3-a351-331902baa8ba', 'Audio', 'EQ Modes', '3 (Music, Movie, News)', 9),
  ('2aaba9df-7898-4af3-a351-331902baa8ba', 'Technical', 'Bluetooth', '5.3 + EDR (up to 10m)', 10),
  ('2aaba9df-7898-4af3-a351-331902baa8ba', 'Technical', 'Inputs', 'AUX, USB, Optical, HDMI ARC', 11),
  ('2aaba9df-7898-4af3-a351-331902baa8ba', 'Technical', 'Display', 'LED Display + Ambient Light', 12),
  ('2aaba9df-7898-4af3-a351-331902baa8ba', 'Technical', 'Mounting', 'Wall Mount', 13),
  ('2aaba9df-7898-4af3-a351-331902baa8ba', 'In the Box', 'Contents', 'Soundbar, Subwoofer, Remote, Warranty Card', 14);
INSERT INTO product_images (product_id, image_url, thumbnail_url, is_primary, sort_order) VALUES
  ('2aaba9df-7898-4af3-a351-331902baa8ba', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/honeywell-trueno-u4000-soundbar/1.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/honeywell-trueno-u4000-soundbar/1.jpg', true, 0),
  ('2aaba9df-7898-4af3-a351-331902baa8ba', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/honeywell-trueno-u4000-soundbar/2.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/honeywell-trueno-u4000-soundbar/2.jpg', false, 1),
  ('2aaba9df-7898-4af3-a351-331902baa8ba', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/honeywell-trueno-u4000-soundbar/3.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/honeywell-trueno-u4000-soundbar/3.jpg', false, 2),
  ('2aaba9df-7898-4af3-a351-331902baa8ba', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/honeywell-trueno-u4000-soundbar/4.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/honeywell-trueno-u4000-soundbar/4.jpg', false, 3),
  ('2aaba9df-7898-4af3-a351-331902baa8ba', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/honeywell-trueno-u4000-soundbar/5.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/honeywell-trueno-u4000-soundbar/5.jpg', false, 4);

-- Honeywell Trueno U7000 Dolby Audio Soundbar 500W 5.1Ch Surround Home Theatre with Subwoofer
INSERT INTO products (id, name, slug, description, short_description, sku, category_id, subcategory_id, brand_id, mrp, selling_price, discount_percent, stock_quantity, low_stock_threshold, weight_grams, length_cm, breadth_cm, height_cm, is_active, is_featured, is_deal_of_day, rating, review_count, sold_count, meta_title, meta_description) VALUES (
  '35dd1d99-74ae-470e-9bb4-94911348f4dc', 'Honeywell Trueno U7000 Dolby Audio Soundbar 500W 5.1Ch Surround Home Theatre with Subwoofer', 'honeywell-trueno-u7000-soundbar', 'Honeywell Trueno U7000 Dolby Audio Soundbar 500W 5.1Ch Surround Home Theatre with Subwoofer. 500W, 5.1Ch Dolby Audio, Wired Subwoofer, 2 Satellite Speakers, 6 EQ Modes, BT 5.3, AUX/USB/Optical/HDMI ARC, Remote.

KEY FEATURES:
- 500W Dolby Audio with 5.1 channel setup
- 3x58mm soundbar drivers for crisp sound
- 165.1mm subwoofer driver for thunderous bass
- 2x58mm satellite speakers for surround
- 6 EQ modes for every genre
- Bluetooth 5.3+EDR up to 10m range
- AUX, USB, Optical & HDMI ARC inputs
- Immersive 3D surround sound', '500W | 5.1Ch Dolby Audio | Wired Subwoofer | 2 Satellite Speakers | 6 EQ Modes | BT 5.3 | AUX/USB/Optical/HDMI ARC | Remote', 'HW-TRUENO-U7000-GRY', '91b8a207-2b75-4fac-bcbb-bfe47474acec', 'f254ebf8-dc19-4717-b144-361660cb78cf', (SELECT id FROM brands WHERE slug='honeywell'), 33999, 5699, 83.24, 100, 5, 11000, 39, 21, 12, true, false, false, 4, 88, 0, 'Honeywell Trueno U7000 Dolby Audio Soundbar 500W 5.1Ch Surround Home Theatre with Subwoofer at ₹5699 | BoxDeal', 'Buy Honeywell Trueno U7000 Dolby Audio Soundbar 500W 5.1Ch Surround Home Theatre with Subwoofer at ₹5699 (MRP ₹33999). 500W | 5.1Ch Dolby Audio | Wired Subwoofer | 2 Satellite Speakers | 6 EQ Modes | BT 5.3 | AUX/USB/Optical/HDMI ARC | Remote');
INSERT INTO product_specifications (product_id, spec_group, spec_name, spec_value, sort_order) VALUES
  ('35dd1d99-74ae-470e-9bb4-94911348f4dc', 'General', 'Brand', 'Honeywell', 1),
  ('35dd1d99-74ae-470e-9bb4-94911348f4dc', 'General', 'Model', 'Trueno U7000', 2),
  ('35dd1d99-74ae-470e-9bb4-94911348f4dc', 'General', 'Type', 'Dolby Audio Soundbar Home Theatre', 3),
  ('35dd1d99-74ae-470e-9bb4-94911348f4dc', 'General', 'Colour', 'Grey & Black', 4),
  ('35dd1d99-74ae-470e-9bb4-94911348f4dc', 'Audio', 'Output Power', '500 W', 5),
  ('35dd1d99-74ae-470e-9bb4-94911348f4dc', 'Audio', 'Channels', '5.1', 6),
  ('35dd1d99-74ae-470e-9bb4-94911348f4dc', 'Audio', 'Soundbar Drivers', '3 x 58mm', 7),
  ('35dd1d99-74ae-470e-9bb4-94911348f4dc', 'Audio', 'Subwoofer Driver', '165.1 mm', 8),
  ('35dd1d99-74ae-470e-9bb4-94911348f4dc', 'Audio', 'Satellite Speakers', '2 x 58mm', 9),
  ('35dd1d99-74ae-470e-9bb4-94911348f4dc', 'Audio', 'EQ Modes', '6', 10),
  ('35dd1d99-74ae-470e-9bb4-94911348f4dc', 'Audio', 'Dolby Audio', 'Yes', 11),
  ('35dd1d99-74ae-470e-9bb4-94911348f4dc', 'Technical', 'Bluetooth', '5.3 + EDR (up to 10m)', 12),
  ('35dd1d99-74ae-470e-9bb4-94911348f4dc', 'Technical', 'Inputs', 'AUX, USB, Optical, HDMI ARC', 13),
  ('35dd1d99-74ae-470e-9bb4-94911348f4dc', 'In the Box', 'Contents', 'Soundbar, Subwoofer, 2 Satellite Speakers, Remote, Warranty Card', 14);
INSERT INTO product_images (product_id, image_url, thumbnail_url, is_primary, sort_order) VALUES
  ('35dd1d99-74ae-470e-9bb4-94911348f4dc', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/honeywell-trueno-u7000-soundbar/1.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/honeywell-trueno-u7000-soundbar/1.jpg', true, 0),
  ('35dd1d99-74ae-470e-9bb4-94911348f4dc', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/honeywell-trueno-u7000-soundbar/2.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/honeywell-trueno-u7000-soundbar/2.jpg', false, 1),
  ('35dd1d99-74ae-470e-9bb4-94911348f4dc', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/honeywell-trueno-u7000-soundbar/3.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/honeywell-trueno-u7000-soundbar/3.jpg', false, 2),
  ('35dd1d99-74ae-470e-9bb4-94911348f4dc', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/honeywell-trueno-u7000-soundbar/4.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/honeywell-trueno-u7000-soundbar/4.jpg', false, 3),
  ('35dd1d99-74ae-470e-9bb4-94911348f4dc', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/honeywell-trueno-u7000-soundbar/5.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/honeywell-trueno-u7000-soundbar/5.jpg', false, 4);

-- Honeywell Trueno U8000 Dolby Atmos Soundbar 700W 5.1Ch Surround Home Theatre with Wireless Satellites
INSERT INTO products (id, name, slug, description, short_description, sku, category_id, subcategory_id, brand_id, mrp, selling_price, discount_percent, stock_quantity, low_stock_threshold, weight_grams, length_cm, breadth_cm, height_cm, is_active, is_featured, is_deal_of_day, rating, review_count, sold_count, meta_title, meta_description) VALUES (
  '5455b471-3c98-43bb-a305-e447b3a7fd14', 'Honeywell Trueno U8000 Dolby Atmos Soundbar 700W 5.1Ch Surround Home Theatre with Wireless Satellites', 'honeywell-trueno-u8000-soundbar', 'Honeywell Trueno U8000 Dolby Atmos Soundbar 700W 5.1Ch Surround Home Theatre with Wireless Satellites. 700W, 5.1Ch Dolby Atmos, Wired Subwoofer, Wireless Satellite Speakers, 4 EQ Modes, BT 5.4, AUX/USB/Optical/HDMI eARC, Remote.

KEY FEATURES:
- 700W Dolby Atmos with 5.1 channel setup
- Driver array: 4x57.15mm + 2x50.8mm
- 165.1mm subwoofer driver for deep bass
- Wireless satellite speakers (2x58mm)
- 4 EQ modes for tailored sound
- Bluetooth 5.4+EDR up to 10m range
- AUX, USB, Optical & HDMI ARC/eARC inputs
- 3D surround cinematic experience', '700W | 5.1Ch Dolby Atmos | Wired Subwoofer | Wireless Satellite Speakers | 4 EQ Modes | BT 5.4 | AUX/USB/Optical/HDMI eARC | Remote', 'HW-TRUENO-U8000-BLK', '91b8a207-2b75-4fac-bcbb-bfe47474acec', 'f254ebf8-dc19-4717-b144-361660cb78cf', (SELECT id FROM brands WHERE slug='honeywell'), 69999, 15399, 78, 100, 5, 12000, 40, 21, 11, true, false, false, 4, 42, 0, 'Honeywell Trueno U8000 Dolby Atmos Soundbar 700W 5.1Ch Surround Home Theatre with Wireless Satellites at ₹15399 | BoxDeal', 'Buy Honeywell Trueno U8000 Dolby Atmos Soundbar 700W 5.1Ch Surround Home Theatre with Wireless Satellites at ₹15399 (MRP ₹69999). 700W | 5.1Ch Dolby Atmos | Wired Subwoofer | Wireless Satellite Speakers | 4 EQ Modes | BT 5.4 | AUX/USB/Optical/HDMI eARC | Remote');
INSERT INTO product_specifications (product_id, spec_group, spec_name, spec_value, sort_order) VALUES
  ('5455b471-3c98-43bb-a305-e447b3a7fd14', 'General', 'Brand', 'Honeywell', 1),
  ('5455b471-3c98-43bb-a305-e447b3a7fd14', 'General', 'Model', 'Trueno U8000 (HC000267)', 2),
  ('5455b471-3c98-43bb-a305-e447b3a7fd14', 'General', 'Type', 'Dolby Atmos Soundbar Home Theatre', 3),
  ('5455b471-3c98-43bb-a305-e447b3a7fd14', 'General', 'Colour', 'Black', 4),
  ('5455b471-3c98-43bb-a305-e447b3a7fd14', 'Audio', 'Output Power', '700 W', 5),
  ('5455b471-3c98-43bb-a305-e447b3a7fd14', 'Audio', 'Channels', '5.1', 6),
  ('5455b471-3c98-43bb-a305-e447b3a7fd14', 'Audio', 'Dolby Atmos', 'Yes', 7),
  ('5455b471-3c98-43bb-a305-e447b3a7fd14', 'Audio', 'Soundbar Drivers', '4 x 57.15mm + 2 x 50.8mm', 8),
  ('5455b471-3c98-43bb-a305-e447b3a7fd14', 'Audio', 'Subwoofer Driver', '165.1 mm', 9),
  ('5455b471-3c98-43bb-a305-e447b3a7fd14', 'Audio', 'Satellite Speakers', '2 x 58mm (Wireless)', 10),
  ('5455b471-3c98-43bb-a305-e447b3a7fd14', 'Audio', 'EQ Modes', '4', 11),
  ('5455b471-3c98-43bb-a305-e447b3a7fd14', 'Technical', 'Bluetooth', '5.4 + EDR (up to 10m)', 12),
  ('5455b471-3c98-43bb-a305-e447b3a7fd14', 'Technical', 'Inputs', 'AUX, USB, Optical, HDMI ARC/eARC', 13),
  ('5455b471-3c98-43bb-a305-e447b3a7fd14', 'In the Box', 'Contents', 'Soundbar, Subwoofer, 2 Wireless Satellite Speakers, Remote, Warranty Card', 14);
INSERT INTO product_images (product_id, image_url, thumbnail_url, is_primary, sort_order) VALUES
  ('5455b471-3c98-43bb-a305-e447b3a7fd14', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/honeywell-trueno-u8000-soundbar/1.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/honeywell-trueno-u8000-soundbar/1.jpg', true, 0),
  ('5455b471-3c98-43bb-a305-e447b3a7fd14', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/honeywell-trueno-u8000-soundbar/2.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/honeywell-trueno-u8000-soundbar/2.jpg', false, 1),
  ('5455b471-3c98-43bb-a305-e447b3a7fd14', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/honeywell-trueno-u8000-soundbar/3.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/honeywell-trueno-u8000-soundbar/3.jpg', false, 2),
  ('5455b471-3c98-43bb-a305-e447b3a7fd14', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/honeywell-trueno-u8000-soundbar/4.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/honeywell-trueno-u8000-soundbar/4.jpg', false, 3),
  ('5455b471-3c98-43bb-a305-e447b3a7fd14', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/honeywell-trueno-u8000-soundbar/5.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/honeywell-trueno-u8000-soundbar/5.jpg', false, 4);
