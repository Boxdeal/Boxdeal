-- New brands (idempotent)
INSERT INTO brands (id, name, slug, is_active) SELECT 'eae707b1-d191-46bf-ab47-2b6879d4faf4', 'Hola!', 'hola', true WHERE NOT EXISTS (SELECT 1 FROM brands WHERE slug='hola');
INSERT INTO brands (id, name, slug, is_active) SELECT '06a3b2c6-fa5d-46fe-b6e3-68ac87dc218a', 'Fastrack', 'fastrack', true WHERE NOT EXISTS (SELECT 1 FROM brands WHERE slug='fastrack');

-- JBL Go 4 Ultra Portable Wireless Bluetooth Speaker IP67 Black
INSERT INTO products (id, name, slug, description, short_description, sku, category_id, subcategory_id, brand_id, mrp, selling_price, discount_percent, stock_quantity, low_stock_threshold, weight_grams, length_cm, breadth_cm, height_cm, is_active, is_featured, is_deal_of_day, rating, review_count, sold_count, meta_title, meta_description) VALUES (
  '4d8b2850-bddb-4834-b82f-bd8f31995e1a', 'JBL Go 4 Ultra Portable Wireless Bluetooth Speaker IP67 Black', 'jbl-go-4-portable-bluetooth-speaker-black', 'JBL Go 4 Ultra Portable Wireless Bluetooth Speaker IP67 Black. JBL Pro Sound, 4.2W, Up to 7H (+2H Boost), IP67 Water & Dust Proof, Auracast, BT, Type-C, Ultra Portable.

KEY FEATURES:
- Big JBL Pro Sound with punchy bass
- Up to 7 hours playtime (+2h Playtime Boost)
- IP67 waterproof & dustproof
- Auracast multi-speaker connection
- Pair two Go 4s for stereo sound
- JBL Portable app with custom EQ
- Type-C charging, ultra-portable design', 'JBL Pro Sound | 4.2W | Up to 7H (+2H Boost) | IP67 Water & Dust Proof | Auracast | BT | Type-C | Ultra Portable', 'JBL-GO4-BLK', '91b8a207-2b75-4fac-bcbb-bfe47474acec', '1a90e2b7-e458-43d8-8c7a-245de19cbed8', (SELECT id FROM brands WHERE slug='jbl'), 5499, 2990, 45.63, 5, 5, 350, 16, 14, 9, true, false, false, 4.4, 3800, 0, 'JBL Go 4 Ultra Portable Wireless Bluetooth Speaker IP67 Black at ₹2990 | BoxDeal', 'Buy JBL Go 4 Ultra Portable Wireless Bluetooth Speaker IP67 Black at ₹2990 (MRP ₹5499). JBL Pro Sound | 4.2W | Up to 7H (+2H Boost) | IP67 Water & Dust Proof | Auracast | BT | Type-C | Ultra Portable');
INSERT INTO product_specifications (product_id, spec_group, spec_name, spec_value, sort_order) VALUES
  ('4d8b2850-bddb-4834-b82f-bd8f31995e1a', 'General', 'Brand', 'JBL', 1),
  ('4d8b2850-bddb-4834-b82f-bd8f31995e1a', 'General', 'Model', 'Go 4 (GO4T)', 2),
  ('4d8b2850-bddb-4834-b82f-bd8f31995e1a', 'General', 'Type', 'Ultra Portable Bluetooth Speaker', 3),
  ('4d8b2850-bddb-4834-b82f-bd8f31995e1a', 'General', 'Colour', 'Black', 4),
  ('4d8b2850-bddb-4834-b82f-bd8f31995e1a', 'General', 'Configuration', 'Stereo', 5),
  ('4d8b2850-bddb-4834-b82f-bd8f31995e1a', 'Audio', 'Output Power', '4.2 W', 6),
  ('4d8b2850-bddb-4834-b82f-bd8f31995e1a', 'Audio', 'Driver', '7.52 cm Dynamic Driver', 7),
  ('4d8b2850-bddb-4834-b82f-bd8f31995e1a', 'Audio', 'Audio Channels', '2.0', 8),
  ('4d8b2850-bddb-4834-b82f-bd8f31995e1a', 'Technical', 'Bluetooth', 'Yes', 9),
  ('4d8b2850-bddb-4834-b82f-bd8f31995e1a', 'Technical', 'Auracast', 'Yes (multi-speaker)', 10),
  ('4d8b2850-bddb-4834-b82f-bd8f31995e1a', 'Technical', 'Water Resistance', 'IP67 (Water & Dust Proof)', 11),
  ('4d8b2850-bddb-4834-b82f-bd8f31995e1a', 'Technical', 'App', 'JBL Portable (Custom EQ)', 12),
  ('4d8b2850-bddb-4834-b82f-bd8f31995e1a', 'Battery', 'Capacity', 'Li-Polymer', 13),
  ('4d8b2850-bddb-4834-b82f-bd8f31995e1a', 'Battery', 'Playtime', 'Up to 7 hours (+2h Boost)', 14),
  ('4d8b2850-bddb-4834-b82f-bd8f31995e1a', 'Battery', 'Charging', 'Type-C', 15),
  ('4d8b2850-bddb-4834-b82f-bd8f31995e1a', 'In the Box', 'Contents', 'JBL Go 4 Speaker', 16);
INSERT INTO product_images (product_id, image_url, thumbnail_url, is_primary, sort_order) VALUES
  ('4d8b2850-bddb-4834-b82f-bd8f31995e1a', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/jbl-go-4-portable-bluetooth-speaker-black/1.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/jbl-go-4-portable-bluetooth-speaker-black/1.jpg', true, 0),
  ('4d8b2850-bddb-4834-b82f-bd8f31995e1a', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/jbl-go-4-portable-bluetooth-speaker-black/2.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/jbl-go-4-portable-bluetooth-speaker-black/2.jpg', false, 1),
  ('4d8b2850-bddb-4834-b82f-bd8f31995e1a', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/jbl-go-4-portable-bluetooth-speaker-black/3.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/jbl-go-4-portable-bluetooth-speaker-black/3.jpg', false, 2),
  ('4d8b2850-bddb-4834-b82f-bd8f31995e1a', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/jbl-go-4-portable-bluetooth-speaker-black/4.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/jbl-go-4-portable-bluetooth-speaker-black/4.jpg', false, 3),
  ('4d8b2850-bddb-4834-b82f-bd8f31995e1a', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/jbl-go-4-portable-bluetooth-speaker-black/5.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/jbl-go-4-portable-bluetooth-speaker-black/5.jpg', false, 4);

-- Titan Talk 1.39" AMOLED BT Calling Smartwatch with Music Storage Black
INSERT INTO products (id, name, slug, description, short_description, sku, category_id, subcategory_id, brand_id, mrp, selling_price, discount_percent, stock_quantity, low_stock_threshold, weight_grams, length_cm, breadth_cm, height_cm, is_active, is_featured, is_deal_of_day, rating, review_count, sold_count, meta_title, meta_description) VALUES (
  'f03bad0c-c5ea-480b-81d7-b28fd818bd3d', 'Titan Talk 1.39" AMOLED BT Calling Smartwatch with Music Storage Black', 'titan-talk-amoled-bt-calling-smartwatch-black', 'Titan Talk 1.39" AMOLED BT Calling Smartwatch with Music Storage Black. 1.39" AMOLED, BT Calling, Music Storage, TWS Connect, Heart Rate, SpO2, Sleep & Period Tracker, Up to 5 Days Battery.

KEY FEATURES:
- 1.39-inch AMOLED touchscreen display
- Bluetooth calling with voice support
- Onboard music storage + TWS connect
- 24x7 heart rate & SpO2 monitoring
- Sleep monitor & period tracker
- Step count & multisport tracking
- Up to 5 days battery, magnetic charging', '1.39" AMOLED | BT Calling | Music Storage | TWS Connect | Heart Rate | SpO2 | Sleep & Period Tracker | Up to 5 Days Battery', 'TITAN-TALK-BLK', '7b0b7971-dd65-4643-91c9-c9c4a943da19', NULL, (SELECT id FROM brands WHERE slug='titan'), 14995, 3190, 78.73, 5, 5, 300, 19, 18, 7, true, false, false, 4.1, 410, 0, 'Titan Talk 1.39" AMOLED BT Calling Smartwatch with Music Storage Black at ₹3190 | BoxDeal', 'Buy Titan Talk 1.39" AMOLED BT Calling Smartwatch with Music Storage Black at ₹3190 (MRP ₹14995). 1.39" AMOLED | BT Calling | Music Storage | TWS Connect | Heart Rate | SpO2 | Sleep & Period Tracker | Up to 5 Days Battery');
INSERT INTO product_specifications (product_id, spec_group, spec_name, spec_value, sort_order) VALUES
  ('f03bad0c-c5ea-480b-81d7-b28fd818bd3d', 'General', 'Brand', 'Titan', 1),
  ('f03bad0c-c5ea-480b-81d7-b28fd818bd3d', 'General', 'Model', 'Talk', 2),
  ('f03bad0c-c5ea-480b-81d7-b28fd818bd3d', 'General', 'Colour', 'Black', 3),
  ('f03bad0c-c5ea-480b-81d7-b28fd818bd3d', 'General', 'Strap', 'Black Silicone, Free Size', 4),
  ('f03bad0c-c5ea-480b-81d7-b28fd818bd3d', 'Display', 'Screen Size', '1.39 inch', 5),
  ('f03bad0c-c5ea-480b-81d7-b28fd818bd3d', 'Display', 'Display Type', 'AMOLED', 6),
  ('f03bad0c-c5ea-480b-81d7-b28fd818bd3d', 'Display', 'Input', 'Touchscreen', 7),
  ('f03bad0c-c5ea-480b-81d7-b28fd818bd3d', 'Features', 'BT Calling', 'Yes', 8),
  ('f03bad0c-c5ea-480b-81d7-b28fd818bd3d', 'Features', 'Music Storage', 'Yes', 9),
  ('f03bad0c-c5ea-480b-81d7-b28fd818bd3d', 'Features', 'TWS Connect', 'Yes', 10),
  ('f03bad0c-c5ea-480b-81d7-b28fd818bd3d', 'Features', 'Heart Rate', '24x7 Monitor', 11),
  ('f03bad0c-c5ea-480b-81d7-b28fd818bd3d', 'Features', 'SpO2', 'Yes', 12),
  ('f03bad0c-c5ea-480b-81d7-b28fd818bd3d', 'Features', 'Sleep Monitor', 'Yes', 13),
  ('f03bad0c-c5ea-480b-81d7-b28fd818bd3d', 'Features', 'Women Health', 'Period Tracker', 14),
  ('f03bad0c-c5ea-480b-81d7-b28fd818bd3d', 'Features', 'Sensor', 'Accelerometer', 15),
  ('f03bad0c-c5ea-480b-81d7-b28fd818bd3d', 'Features', 'Watch Functions', 'Alarm, Stopwatch, Timer', 16),
  ('f03bad0c-c5ea-480b-81d7-b28fd818bd3d', 'Connectivity', 'Bluetooth', 'v5.1 (10m range)', 17),
  ('f03bad0c-c5ea-480b-81d7-b28fd818bd3d', 'Battery', 'Battery Type', 'Lithium Polymer', 18),
  ('f03bad0c-c5ea-480b-81d7-b28fd818bd3d', 'Battery', 'Battery Life', 'Up to 5 Days', 19),
  ('f03bad0c-c5ea-480b-81d7-b28fd818bd3d', 'Battery', 'Charge Time', '120 min (Magnetic Cable)', 20),
  ('f03bad0c-c5ea-480b-81d7-b28fd818bd3d', 'In the Box', 'Contents', 'Watch, Charging Cable, Quick Start Guide', 21);
INSERT INTO product_images (product_id, image_url, thumbnail_url, is_primary, sort_order) VALUES
  ('f03bad0c-c5ea-480b-81d7-b28fd818bd3d', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/titan-talk-amoled-bt-calling-smartwatch-black/1.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/titan-talk-amoled-bt-calling-smartwatch-black/1.jpg', true, 0),
  ('f03bad0c-c5ea-480b-81d7-b28fd818bd3d', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/titan-talk-amoled-bt-calling-smartwatch-black/2.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/titan-talk-amoled-bt-calling-smartwatch-black/2.jpg', false, 1),
  ('f03bad0c-c5ea-480b-81d7-b28fd818bd3d', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/titan-talk-amoled-bt-calling-smartwatch-black/3.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/titan-talk-amoled-bt-calling-smartwatch-black/3.jpg', false, 2),
  ('f03bad0c-c5ea-480b-81d7-b28fd818bd3d', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/titan-talk-amoled-bt-calling-smartwatch-black/4.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/titan-talk-amoled-bt-calling-smartwatch-black/4.jpg', false, 3),
  ('f03bad0c-c5ea-480b-81d7-b28fd818bd3d', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/titan-talk-amoled-bt-calling-smartwatch-black/5.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/titan-talk-amoled-bt-calling-smartwatch-black/5.jpg', false, 4);

-- Hola TF 630 Corded Landline Telephone with Caller ID & 2-Way Speaker Black
INSERT INTO products (id, name, slug, description, short_description, sku, category_id, subcategory_id, brand_id, mrp, selling_price, discount_percent, stock_quantity, low_stock_threshold, weight_grams, length_cm, breadth_cm, height_cm, is_active, is_featured, is_deal_of_day, rating, review_count, sold_count, meta_title, meta_description) VALUES (
  'e754226c-4b7b-492d-b5c1-cf94d505d3fb', 'Hola TF 630 Corded Landline Telephone with Caller ID & 2-Way Speaker Black', 'hola-tf-630-corded-landline-telephone-black', 'Hola TF 630 Corded Landline Telephone with Caller ID & 2-Way Speaker Black. Corded, Caller ID LCD Display, 2-Way Speakerphone, Desk/Wall Mount, Volume Control, Redial, Memory Storage, Black.

KEY FEATURES:
- Dual desk & wall mount placement
- LCD caller ID display with call history
- Built-in 2-way speakerphone for hands-free calls
- Volume control, flash & redial buttons
- Memory storage for frequent numbers
- Backlit LCD screen, ergonomic keypad
- Sleek black ABS finish', 'Corded | Caller ID LCD Display | 2-Way Speakerphone | Desk/Wall Mount | Volume Control | Redial | Memory Storage | Black', 'HOLA-TF630-BLK', 'bedc5a2f-e8c1-4cdc-a1d7-cedd03e45b69', NULL, (SELECT id FROM brands WHERE slug='hola'), 1499, 550, 63.31, 2, 5, 550, 25, 25, 9, true, false, false, 4.1, 150, 0, 'Hola TF 630 Corded Landline Telephone with Caller ID & 2-Way Speaker Black at ₹550 | BoxDeal', 'Buy Hola TF 630 Corded Landline Telephone with Caller ID & 2-Way Speaker Black at ₹550 (MRP ₹1499). Corded | Caller ID LCD Display | 2-Way Speakerphone | Desk/Wall Mount | Volume Control | Redial | Memory Storage | Black');
INSERT INTO product_specifications (product_id, spec_group, spec_name, spec_value, sort_order) VALUES
  ('e754226c-4b7b-492d-b5c1-cf94d505d3fb', 'General', 'Brand', 'Hola!', 1),
  ('e754226c-4b7b-492d-b5c1-cf94d505d3fb', 'General', 'Model', 'TF 630', 2),
  ('e754226c-4b7b-492d-b5c1-cf94d505d3fb', 'General', 'Type', 'Corded Telephone', 3),
  ('e754226c-4b7b-492d-b5c1-cf94d505d3fb', 'General', 'Colour', 'Black', 4),
  ('e754226c-4b7b-492d-b5c1-cf94d505d3fb', 'General', 'Material', 'ABS', 5),
  ('e754226c-4b7b-492d-b5c1-cf94d505d3fb', 'Features', 'Caller ID', 'Yes (LCD Display)', 6),
  ('e754226c-4b7b-492d-b5c1-cf94d505d3fb', 'Features', 'Speakerphone', '2-Way', 7),
  ('e754226c-4b7b-492d-b5c1-cf94d505d3fb', 'Features', 'Memory Storage', 'Yes', 8),
  ('e754226c-4b7b-492d-b5c1-cf94d505d3fb', 'Features', 'Controls', 'Volume, Flash, Redial', 9),
  ('e754226c-4b7b-492d-b5c1-cf94d505d3fb', 'Features', 'Mounting', 'Desk / Wall', 10),
  ('e754226c-4b7b-492d-b5c1-cf94d505d3fb', 'Power', 'Power Source', 'Telephone Line Powered', 11),
  ('e754226c-4b7b-492d-b5c1-cf94d505d3fb', 'Power', 'Batteries', 'AAA (for display)', 12),
  ('e754226c-4b7b-492d-b5c1-cf94d505d3fb', 'In the Box', 'Contents', 'Main Body, Handset, Coil Cord, Line Cord', 13);
INSERT INTO product_images (product_id, image_url, thumbnail_url, is_primary, sort_order) VALUES
  ('e754226c-4b7b-492d-b5c1-cf94d505d3fb', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/hola-tf-630-corded-landline-telephone-black/1.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/hola-tf-630-corded-landline-telephone-black/1.jpg', true, 0),
  ('e754226c-4b7b-492d-b5c1-cf94d505d3fb', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/hola-tf-630-corded-landline-telephone-black/2.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/hola-tf-630-corded-landline-telephone-black/2.jpg', false, 1),
  ('e754226c-4b7b-492d-b5c1-cf94d505d3fb', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/hola-tf-630-corded-landline-telephone-black/3.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/hola-tf-630-corded-landline-telephone-black/3.jpg', false, 2),
  ('e754226c-4b7b-492d-b5c1-cf94d505d3fb', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/hola-tf-630-corded-landline-telephone-black/4.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/hola-tf-630-corded-landline-telephone-black/4.jpg', false, 3),
  ('e754226c-4b7b-492d-b5c1-cf94d505d3fb', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/hola-tf-630-corded-landline-telephone-black/5.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/hola-tf-630-corded-landline-telephone-black/5.jpg', false, 4);

-- ZEBRONICS Pulse Dual Connectivity Wireless Mouse 1200 DPI Lavender
INSERT INTO products (id, name, slug, description, short_description, sku, category_id, subcategory_id, brand_id, mrp, selling_price, discount_percent, stock_quantity, low_stock_threshold, weight_grams, length_cm, breadth_cm, height_cm, is_active, is_featured, is_deal_of_day, rating, review_count, sold_count, meta_title, meta_description) VALUES (
  '72aa2a44-fdc1-4451-be04-cb5aaee5d9b1', 'ZEBRONICS Pulse Dual Connectivity Wireless Mouse 1200 DPI Lavender', 'zebronics-pulse-dual-connectivity-wireless-mouse-lavender', 'ZEBRONICS Pulse Dual Connectivity Wireless Mouse 1200 DPI Lavender. Wireless + Bluetooth v5, 1200 DPI, 3 Buttons, Dual Connectivity, Optical, Ergonomic, 10m Range, For Laptop & PC, Lavender.

KEY FEATURES:
- Dual connectivity - USB wireless + Bluetooth v5
- 1200 DPI optical sensor
- 3 buttons, ergonomic design
- 10m wireless range
- Compatible with laptop, PC, Mac & tablet
- 1x AA battery operated
- Includes nano receiver', 'Wireless + Bluetooth v5 | 1200 DPI | 3 Buttons | Dual Connectivity | Optical | Ergonomic | 10m Range | For Laptop & PC | Lavender', 'ZEB-PULSE-LAV', 'e28382bd-5edc-4042-acfb-4624e017e3d9', '6fd8540f-163c-4819-85ac-606757a29242', (SELECT id FROM brands WHERE slug='zebronics'), 599, 240, 59.93, 4, 5, 150, 16, 12, 6, true, false, false, 4.2, 180, 0, 'ZEBRONICS Pulse Dual Connectivity Wireless Mouse 1200 DPI Lavender at ₹240 | BoxDeal', 'Buy ZEBRONICS Pulse Dual Connectivity Wireless Mouse 1200 DPI Lavender at ₹240 (MRP ₹599). Wireless + Bluetooth v5 | 1200 DPI | 3 Buttons | Dual Connectivity | Optical | Ergonomic | 10m Range | For Laptop & PC | Lavender');
INSERT INTO product_specifications (product_id, spec_group, spec_name, spec_value, sort_order) VALUES
  ('72aa2a44-fdc1-4451-be04-cb5aaee5d9b1', 'General', 'Brand', 'ZEBRONICS', 1),
  ('72aa2a44-fdc1-4451-be04-cb5aaee5d9b1', 'General', 'Model', 'Pulse', 2),
  ('72aa2a44-fdc1-4451-be04-cb5aaee5d9b1', 'General', 'Type', 'Wireless Mouse', 3),
  ('72aa2a44-fdc1-4451-be04-cb5aaee5d9b1', 'General', 'Colour', 'Lavender', 4),
  ('72aa2a44-fdc1-4451-be04-cb5aaee5d9b1', 'General', 'Design', 'Ergonomic', 5),
  ('72aa2a44-fdc1-4451-be04-cb5aaee5d9b1', 'General', 'Material', 'Plastic', 6),
  ('72aa2a44-fdc1-4451-be04-cb5aaee5d9b1', 'Technical', 'DPI', '1200', 7),
  ('72aa2a44-fdc1-4451-be04-cb5aaee5d9b1', 'Technical', 'Buttons', '3', 8),
  ('72aa2a44-fdc1-4451-be04-cb5aaee5d9b1', 'Technical', 'Sensor', 'Optical', 9),
  ('72aa2a44-fdc1-4451-be04-cb5aaee5d9b1', 'Technical', 'Connectivity', 'USB Wireless + Bluetooth v5', 10),
  ('72aa2a44-fdc1-4451-be04-cb5aaee5d9b1', 'Technical', 'Wireless Range', '10 m', 11),
  ('72aa2a44-fdc1-4451-be04-cb5aaee5d9b1', 'Technical', 'Battery', '1x AA (Alkaline)', 12),
  ('72aa2a44-fdc1-4451-be04-cb5aaee5d9b1', 'In the Box', 'Contents', 'Wireless Mouse, Nano Receiver, Quick User Guide', 13);
INSERT INTO product_images (product_id, image_url, thumbnail_url, is_primary, sort_order) VALUES
  ('72aa2a44-fdc1-4451-be04-cb5aaee5d9b1', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/zebronics-pulse-dual-connectivity-wireless-mouse-lavender/1.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/zebronics-pulse-dual-connectivity-wireless-mouse-lavender/1.jpg', true, 0),
  ('72aa2a44-fdc1-4451-be04-cb5aaee5d9b1', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/zebronics-pulse-dual-connectivity-wireless-mouse-lavender/2.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/zebronics-pulse-dual-connectivity-wireless-mouse-lavender/2.jpg', false, 1),
  ('72aa2a44-fdc1-4451-be04-cb5aaee5d9b1', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/zebronics-pulse-dual-connectivity-wireless-mouse-lavender/3.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/zebronics-pulse-dual-connectivity-wireless-mouse-lavender/3.jpg', false, 2),
  ('72aa2a44-fdc1-4451-be04-cb5aaee5d9b1', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/zebronics-pulse-dual-connectivity-wireless-mouse-lavender/4.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/zebronics-pulse-dual-connectivity-wireless-mouse-lavender/4.jpg', false, 3),
  ('72aa2a44-fdc1-4451-be04-cb5aaee5d9b1', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/zebronics-pulse-dual-connectivity-wireless-mouse-lavender/5.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/zebronics-pulse-dual-connectivity-wireless-mouse-lavender/5.jpg', false, 4);

-- Fastrack Reflex Power 4.97cm Super AMOLED Arched Display BT Calling Smartwatch
INSERT INTO products (id, name, slug, description, short_description, sku, category_id, subcategory_id, brand_id, mrp, selling_price, discount_percent, stock_quantity, low_stock_threshold, weight_grams, length_cm, breadth_cm, height_cm, is_active, is_featured, is_deal_of_day, rating, review_count, sold_count, meta_title, meta_description) VALUES (
  'd453c9e8-d5b4-46d2-9b5c-61f3031a5464', 'Fastrack Reflex Power 4.97cm Super AMOLED Arched Display BT Calling Smartwatch', 'fastrack-reflex-power-super-amoled-smartwatch-beige', 'Fastrack Reflex Power 4.97cm Super AMOLED Arched Display BT Calling Smartwatch. 4.97cm Super AMOLED Arched, 410x502 Resolution, SingleSync BT Calling, IP68, Nitro Fast Charge, Stress & Mood Monitor, Up to 5 Days.

KEY FEATURES:
- 4.97cm Super AMOLED arched display
- Highest 410 x 502 pixel resolution
- SingleSync Bluetooth calling
- IP68 water resistance
- Nitro fast charging
- Auto stress & mood monitoring
- Up to 5 days battery life', '4.97cm Super AMOLED Arched | 410x502 Resolution | SingleSync BT Calling | IP68 | Nitro Fast Charge | Stress & Mood Monitor | Up to 5 Days', 'FT-REFLEX-POWER-BEG', '7b0b7971-dd65-4643-91c9-c9c4a943da19', NULL, (SELECT id FROM brands WHERE slug='fastrack'), 7995, 1599, 80, 10, 5, 250, 13, 15, 13, true, false, false, 4.1, 260, 0, 'Fastrack Reflex Power 4.97cm Super AMOLED Arched Display BT Calling Smartwatch at ₹1599 | BoxDeal', 'Buy Fastrack Reflex Power 4.97cm Super AMOLED Arched Display BT Calling Smartwatch at ₹1599 (MRP ₹7995). 4.97cm Super AMOLED Arched | 410x502 Resolution | SingleSync BT Calling | IP68 | Nitro Fast Charge | Stress & Mood Monitor | Up to 5 Days');
INSERT INTO product_specifications (product_id, spec_group, spec_name, spec_value, sort_order) VALUES
  ('d453c9e8-d5b4-46d2-9b5c-61f3031a5464', 'General', 'Brand', 'Fastrack', 1),
  ('d453c9e8-d5b4-46d2-9b5c-61f3031a5464', 'General', 'Model', 'Reflex Power', 2),
  ('d453c9e8-d5b4-46d2-9b5c-61f3031a5464', 'General', 'Gender', 'Unisex', 3),
  ('d453c9e8-d5b4-46d2-9b5c-61f3031a5464', 'General', 'Strap', 'Beige Silicone', 4),
  ('d453c9e8-d5b4-46d2-9b5c-61f3031a5464', 'General', 'Case Material', 'Polycarbonate', 5),
  ('d453c9e8-d5b4-46d2-9b5c-61f3031a5464', 'General', 'Glass', 'Mineral Glass', 6),
  ('d453c9e8-d5b4-46d2-9b5c-61f3031a5464', 'General', 'Case Shape', 'Rectangular', 7),
  ('d453c9e8-d5b4-46d2-9b5c-61f3031a5464', 'Display', 'Screen Size', '4.97 cm', 8),
  ('d453c9e8-d5b4-46d2-9b5c-61f3031a5464', 'Display', 'Display Type', 'Super AMOLED Arched', 9),
  ('d453c9e8-d5b4-46d2-9b5c-61f3031a5464', 'Display', 'Resolution', '410 x 502', 10),
  ('d453c9e8-d5b4-46d2-9b5c-61f3031a5464', 'Features', 'BT Calling', 'SingleSync', 11),
  ('d453c9e8-d5b4-46d2-9b5c-61f3031a5464', 'Features', 'Stress & Mood Monitor', 'Auto', 12),
  ('d453c9e8-d5b4-46d2-9b5c-61f3031a5464', 'Features', 'GPS', 'No', 13),
  ('d453c9e8-d5b4-46d2-9b5c-61f3031a5464', 'Durability', 'Water Resistance', 'IP68', 14),
  ('d453c9e8-d5b4-46d2-9b5c-61f3031a5464', 'Battery', 'Battery Life', 'Up to 5 Days', 15),
  ('d453c9e8-d5b4-46d2-9b5c-61f3031a5464', 'Battery', 'Charging', 'Nitro Fast Charge', 16),
  ('d453c9e8-d5b4-46d2-9b5c-61f3031a5464', 'In the Box', 'Contents', 'Watch, Charging Cable, User Manual, Warranty Card', 17);
INSERT INTO product_images (product_id, image_url, thumbnail_url, is_primary, sort_order) VALUES
  ('d453c9e8-d5b4-46d2-9b5c-61f3031a5464', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/fastrack-reflex-power-super-amoled-smartwatch-beige/1.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/fastrack-reflex-power-super-amoled-smartwatch-beige/1.jpg', true, 0),
  ('d453c9e8-d5b4-46d2-9b5c-61f3031a5464', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/fastrack-reflex-power-super-amoled-smartwatch-beige/2.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/fastrack-reflex-power-super-amoled-smartwatch-beige/2.jpg', false, 1),
  ('d453c9e8-d5b4-46d2-9b5c-61f3031a5464', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/fastrack-reflex-power-super-amoled-smartwatch-beige/3.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/fastrack-reflex-power-super-amoled-smartwatch-beige/3.jpg', false, 2),
  ('d453c9e8-d5b4-46d2-9b5c-61f3031a5464', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/fastrack-reflex-power-super-amoled-smartwatch-beige/4.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/fastrack-reflex-power-super-amoled-smartwatch-beige/4.jpg', false, 3),
  ('d453c9e8-d5b4-46d2-9b5c-61f3031a5464', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/fastrack-reflex-power-super-amoled-smartwatch-beige/5.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/fastrack-reflex-power-super-amoled-smartwatch-beige/5.jpg', false, 4);
