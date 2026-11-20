-- New subcategory: Radio under Speaker (idempotent)
INSERT INTO subcategories (id, category_id, name, slug, is_active, sort_order) SELECT 'c4e1b7a2-9f68-4d35-b0a7-2c9e58d4f611', '91b8a207-2b75-4fac-bcbb-bfe47474acec', 'Radio', 'radio', true, 6 WHERE NOT EXISTS (SELECT 1 FROM subcategories WHERE slug='radio' AND category_id='91b8a207-2b75-4fac-bcbb-bfe47474acec');

-- Philips DL167/94 Portable FM/MW/SW Radio with Telescopic Antenna Silver
INSERT INTO products (id, name, slug, description, short_description, sku, category_id, subcategory_id, brand_id, mrp, selling_price, discount_percent, stock_quantity, low_stock_threshold, weight_grams, length_cm, breadth_cm, height_cm, is_active, is_featured, is_deal_of_day, rating, review_count, sold_count, meta_title, meta_description) VALUES (
  '308257ff-d735-47fb-b5e0-17b1abfef626', 'Philips DL167/94 Portable FM/MW/SW Radio with Telescopic Antenna Silver', 'philips-dl167-94-portable-fm-mw-sw-radio-silver', 'Philips DL167/94 Portable FM/MW/SW Radio with Telescopic Antenna Silver. FM/MW/SW Bands, Built-in Loudspeaker, Telescopic Antenna, Dual Power (2xR20 Battery / 3V DC), LCD, Hand Carry, Silver.

KEY FEATURES:
- MW, SW & FM bands for a variety of stations
- Built-in loudspeaker for clear, powerful audio
- Telescopic aerial for enhanced signal reception
- Dual power - 2x R20 batteries or 3V DC external
- Compact hand-carry portable design
- Easy controls for tuning & band selection
- LCD display', 'FM/MW/SW Bands | Built-in Loudspeaker | Telescopic Antenna | Dual Power (2xR20 Battery / 3V DC) | LCD | Hand Carry | Silver', 'PHILIPS-DL167-SLV', '91b8a207-2b75-4fac-bcbb-bfe47474acec', 'c4e1b7a2-9f68-4d35-b0a7-2c9e58d4f611', (SELECT id FROM brands WHERE slug='philips'), 1499, 750, 49.97, 100, 5, 500, 25, 19, 12, true, false, false, 4, 10208, 0, 'Philips DL167/94 Portable FM/MW/SW Radio with Telescopic Antenna Silver at ₹750 | BoxDeal', 'Buy Philips DL167/94 Portable FM/MW/SW Radio with Telescopic Antenna Silver at ₹750 (MRP ₹1499). FM/MW/SW Bands | Built-in Loudspeaker | Telescopic Antenna | Dual Power (2xR20 Battery / 3V DC) | LCD | Hand Carry | Silver');
INSERT INTO product_specifications (product_id, spec_group, spec_name, spec_value, sort_order) VALUES
  ('308257ff-d735-47fb-b5e0-17b1abfef626', 'General', 'Brand', 'Philips', 1),
  ('308257ff-d735-47fb-b5e0-17b1abfef626', 'General', 'Model', 'DL167/94', 2),
  ('308257ff-d735-47fb-b5e0-17b1abfef626', 'General', 'Type', 'Portable Radio', 3),
  ('308257ff-d735-47fb-b5e0-17b1abfef626', 'General', 'Colour', 'Silver', 4),
  ('308257ff-d735-47fb-b5e0-17b1abfef626', 'General', 'Material', 'Plastic', 5),
  ('308257ff-d735-47fb-b5e0-17b1abfef626', 'Audio', 'Bands', 'FM / MW / SW', 6),
  ('308257ff-d735-47fb-b5e0-17b1abfef626', 'Audio', 'Speaker', 'Built-in Loudspeaker', 7),
  ('308257ff-d735-47fb-b5e0-17b1abfef626', 'Technical', 'Antenna', 'Telescopic Aerial', 8),
  ('308257ff-d735-47fb-b5e0-17b1abfef626', 'Technical', 'Display', 'LCD', 9),
  ('308257ff-d735-47fb-b5e0-17b1abfef626', 'Technical', 'Water Resistance', 'Water Resistant', 10),
  ('308257ff-d735-47fb-b5e0-17b1abfef626', 'Power', 'Power Source', '2x R20 Batteries / 3V DC', 11),
  ('308257ff-d735-47fb-b5e0-17b1abfef626', 'Power', 'Voltage', '3 V', 12),
  ('308257ff-d735-47fb-b5e0-17b1abfef626', 'In the Box', 'Contents', 'Radio', 13);
INSERT INTO product_images (product_id, image_url, thumbnail_url, is_primary, sort_order) VALUES
  ('308257ff-d735-47fb-b5e0-17b1abfef626', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/philips-dl167-94-portable-fm-mw-sw-radio-silver/1.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/philips-dl167-94-portable-fm-mw-sw-radio-silver/1.jpg', true, 0),
  ('308257ff-d735-47fb-b5e0-17b1abfef626', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/philips-dl167-94-portable-fm-mw-sw-radio-silver/2.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/philips-dl167-94-portable-fm-mw-sw-radio-silver/2.jpg', false, 1),
  ('308257ff-d735-47fb-b5e0-17b1abfef626', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/philips-dl167-94-portable-fm-mw-sw-radio-silver/3.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/philips-dl167-94-portable-fm-mw-sw-radio-silver/3.jpg', false, 2),
  ('308257ff-d735-47fb-b5e0-17b1abfef626', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/philips-dl167-94-portable-fm-mw-sw-radio-silver/4.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/philips-dl167-94-portable-fm-mw-sw-radio-silver/4.jpg', false, 3),
  ('308257ff-d735-47fb-b5e0-17b1abfef626', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/philips-dl167-94-portable-fm-mw-sw-radio-silver/5.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/philips-dl167-94-portable-fm-mw-sw-radio-silver/5.jpg', false, 4);

-- Philips RL191/94 Portable FM/MW Radio 180mW with Telescopic Antenna Black
INSERT INTO products (id, name, slug, description, short_description, sku, category_id, subcategory_id, brand_id, mrp, selling_price, discount_percent, stock_quantity, low_stock_threshold, weight_grams, length_cm, breadth_cm, height_cm, is_active, is_featured, is_deal_of_day, rating, review_count, sold_count, meta_title, meta_description) VALUES (
  'b7d9d609-27af-44d2-973a-d51d90a4c997', 'Philips RL191/94 Portable FM/MW Radio 180mW with Telescopic Antenna Black', 'philips-rl191-94-portable-fm-mw-radio-black', 'Philips RL191/94 Portable FM/MW Radio 180mW with Telescopic Antenna Black. AM/FM Bands, 180mW RMS Output, Telescopic Antenna, Dual Power (2xR20 Battery / 3V DC), Compact & Portable, Black.

KEY FEATURES:
- Clear & powerful 180mW RMS sound output
- Dual band - AM (520-1605 kHz) & FM (88-108 kHz)
- Extendable telescopic aerial for strong reception
- Dual power - 2x R20 batteries or 3V DC external
- Lightweight, compact & portable design
- Ideal for home, office or travel', 'AM/FM Bands | 180mW RMS Output | Telescopic Antenna | Dual Power (2xR20 Battery / 3V DC) | Compact & Portable | Black', 'PHILIPS-RL191-BLK', '91b8a207-2b75-4fac-bcbb-bfe47474acec', 'c4e1b7a2-9f68-4d35-b0a7-2c9e58d4f611', (SELECT id FROM brands WHERE slug='philips'), 1399, 650, 53.54, 100, 5, 500, 15, 9, 21, true, false, false, 4, 4994, 0, 'Philips RL191/94 Portable FM/MW Radio 180mW with Telescopic Antenna Black at ₹650 | BoxDeal', 'Buy Philips RL191/94 Portable FM/MW Radio 180mW with Telescopic Antenna Black at ₹650 (MRP ₹1399). AM/FM Bands | 180mW RMS Output | Telescopic Antenna | Dual Power (2xR20 Battery / 3V DC) | Compact & Portable | Black');
INSERT INTO product_specifications (product_id, spec_group, spec_name, spec_value, sort_order) VALUES
  ('b7d9d609-27af-44d2-973a-d51d90a4c997', 'General', 'Brand', 'Philips', 1),
  ('b7d9d609-27af-44d2-973a-d51d90a4c997', 'General', 'Model', 'RL191/94', 2),
  ('b7d9d609-27af-44d2-973a-d51d90a4c997', 'General', 'Type', 'Portable Radio', 3),
  ('b7d9d609-27af-44d2-973a-d51d90a4c997', 'General', 'Colour', 'Black', 4),
  ('b7d9d609-27af-44d2-973a-d51d90a4c997', 'Audio', 'Bands', 'AM / FM', 5),
  ('b7d9d609-27af-44d2-973a-d51d90a4c997', 'Audio', 'Output Power', '180 mW RMS', 6),
  ('b7d9d609-27af-44d2-973a-d51d90a4c997', 'Audio', 'AM Frequency', '520-1605 kHz', 7),
  ('b7d9d609-27af-44d2-973a-d51d90a4c997', 'Audio', 'FM Frequency', '88-108 kHz', 8),
  ('b7d9d609-27af-44d2-973a-d51d90a4c997', 'Technical', 'Antenna', 'Telescopic Aerial', 9),
  ('b7d9d609-27af-44d2-973a-d51d90a4c997', 'Technical', 'Display', 'LED', 10),
  ('b7d9d609-27af-44d2-973a-d51d90a4c997', 'Power', 'Power Source', '2x R20 (UM1) Batteries / 3V DC', 11),
  ('b7d9d609-27af-44d2-973a-d51d90a4c997', 'Power', 'Voltage', '3 V', 12),
  ('b7d9d609-27af-44d2-973a-d51d90a4c997', 'In the Box', 'Contents', 'Radio, Owner Manual, Quick Start Guide', 13);
INSERT INTO product_images (product_id, image_url, thumbnail_url, is_primary, sort_order) VALUES
  ('b7d9d609-27af-44d2-973a-d51d90a4c997', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/philips-rl191-94-portable-fm-mw-radio-black/1.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/philips-rl191-94-portable-fm-mw-radio-black/1.jpg', true, 0),
  ('b7d9d609-27af-44d2-973a-d51d90a4c997', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/philips-rl191-94-portable-fm-mw-radio-black/2.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/philips-rl191-94-portable-fm-mw-radio-black/2.jpg', false, 1),
  ('b7d9d609-27af-44d2-973a-d51d90a4c997', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/philips-rl191-94-portable-fm-mw-radio-black/3.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/philips-rl191-94-portable-fm-mw-radio-black/3.jpg', false, 2),
  ('b7d9d609-27af-44d2-973a-d51d90a4c997', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/philips-rl191-94-portable-fm-mw-radio-black/4.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/philips-rl191-94-portable-fm-mw-radio-black/4.jpg', false, 3),
  ('b7d9d609-27af-44d2-973a-d51d90a4c997', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/philips-rl191-94-portable-fm-mw-radio-black/5.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/philips-rl191-94-portable-fm-mw-radio-black/5.jpg', false, 4);
