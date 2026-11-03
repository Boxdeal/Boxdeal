-- Zebronics Storm Wired On-Ear Headphone (brand ZEBRONICS already exists)
INSERT INTO products (id, name, slug, description, short_description, sku, category_id, subcategory_id, brand_id, mrp, selling_price, discount_percent, stock_quantity, low_stock_threshold, weight_grams, length_cm, breadth_cm, height_cm, is_active, is_featured, is_deal_of_day, rating, review_count, sold_count, meta_title, meta_description) VALUES (
  '276b6994-eb73-484c-a5e5-0d51b5d9346e', 'ZEBRONICS Storm Wired On-Ear Headphone with Mic 40mm Drivers White', 'zebronics-storm-wired-on-ear-headphone-white', 'ZEBRONICS Storm Wired On-Ear Headphone with Mic 40mm Drivers White. On-Ear, 40mm Drivers, 3.5mm Jack, Built-in Mic, 1.5m Cable, Soft Ear Cushions, Adjustable & Foldable, White.

KEY FEATURES:
- Powerful 40mm drivers for crystal-clear sound
- Wired 3.5mm jack with 1.5m cable
- Built-in in-line mic for calling
- Soft ear cushions for long listening
- Adjustable headband for a custom fit
- Foldable earcups - compact & portable
- Compatible with mobiles, tablets & laptops', 'On-Ear | 40mm Drivers | 3.5mm Jack | Built-in Mic | 1.5m Cable | Soft Ear Cushions | Adjustable & Foldable | White', 'ZEB-STORM-WHT', '73a3176b-3552-435f-9d04-eb8f07439994', 'df763827-133e-4b05-be75-450eab2daf17', (SELECT id FROM brands WHERE slug='zebronics'), 799, 280, 64.96, 5, 5, 350, 24, 23, 11, true, false, false, 4.1, 5074, 0, 'ZEBRONICS Storm Wired On-Ear Headphone with Mic 40mm Drivers White at ₹280 | BoxDeal', 'Buy ZEBRONICS Storm Wired On-Ear Headphone with Mic 40mm Drivers White at ₹280 (MRP ₹799). On-Ear | 40mm Drivers | 3.5mm Jack | Built-in Mic | 1.5m Cable | Soft Ear Cushions | Adjustable & Foldable | White');
INSERT INTO product_specifications (product_id, spec_group, spec_name, spec_value, sort_order) VALUES
  ('276b6994-eb73-484c-a5e5-0d51b5d9346e', 'General', 'Brand', 'ZEBRONICS', 1),
  ('276b6994-eb73-484c-a5e5-0d51b5d9346e', 'General', 'Model', 'ZEB-Storm', 2),
  ('276b6994-eb73-484c-a5e5-0d51b5d9346e', 'General', 'Colour', 'White', 3),
  ('276b6994-eb73-484c-a5e5-0d51b5d9346e', 'General', 'Form Factor', 'On-Ear', 4),
  ('276b6994-eb73-484c-a5e5-0d51b5d9346e', 'General', 'Ear Placement', 'Over Ear', 5),
  ('276b6994-eb73-484c-a5e5-0d51b5d9346e', 'Audio', 'Driver Size', '40 mm', 6),
  ('276b6994-eb73-484c-a5e5-0d51b5d9346e', 'Audio', 'Driver Type', 'Dynamic', 7),
  ('276b6994-eb73-484c-a5e5-0d51b5d9346e', 'Audio', 'Impedance', '32 Ohms', 8),
  ('276b6994-eb73-484c-a5e5-0d51b5d9346e', 'Audio', 'Noise Control', 'Sound Isolation', 9),
  ('276b6994-eb73-484c-a5e5-0d51b5d9346e', 'Technical', 'Connectivity', 'Wired (3.5mm Jack)', 10),
  ('276b6994-eb73-484c-a5e5-0d51b5d9346e', 'Technical', 'Cable Length', '1.5 m', 11),
  ('276b6994-eb73-484c-a5e5-0d51b5d9346e', 'Technical', 'Microphone', 'Yes (In-line)', 12),
  ('276b6994-eb73-484c-a5e5-0d51b5d9346e', 'Technical', 'Foldable', 'Yes', 13),
  ('276b6994-eb73-484c-a5e5-0d51b5d9346e', 'Technical', 'Adjustable Headband', 'Yes', 14),
  ('276b6994-eb73-484c-a5e5-0d51b5d9346e', 'In the Box', 'Contents', 'Headphone', 15);
INSERT INTO product_images (product_id, image_url, thumbnail_url, is_primary, sort_order) VALUES
  ('276b6994-eb73-484c-a5e5-0d51b5d9346e', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/zebronics-storm-wired-on-ear-headphone-white/1.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/zebronics-storm-wired-on-ear-headphone-white/1.jpg', true, 0),
  ('276b6994-eb73-484c-a5e5-0d51b5d9346e', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/zebronics-storm-wired-on-ear-headphone-white/2.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/zebronics-storm-wired-on-ear-headphone-white/2.jpg', false, 1),
  ('276b6994-eb73-484c-a5e5-0d51b5d9346e', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/zebronics-storm-wired-on-ear-headphone-white/3.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/zebronics-storm-wired-on-ear-headphone-white/3.jpg', false, 2),
  ('276b6994-eb73-484c-a5e5-0d51b5d9346e', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/zebronics-storm-wired-on-ear-headphone-white/4.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/zebronics-storm-wired-on-ear-headphone-white/4.jpg', false, 3),
  ('276b6994-eb73-484c-a5e5-0d51b5d9346e', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/zebronics-storm-wired-on-ear-headphone-white/5.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/zebronics-storm-wired-on-ear-headphone-white/5.jpg', false, 4);