-- New brand Titan (idempotent)
INSERT INTO brands (id, name, slug, is_active) SELECT '736c4d7e-0c45-4810-b332-07459081b69a', 'Titan', 'titan', true WHERE NOT EXISTS (SELECT 1 FROM brands WHERE slug='titan');

-- Titan Smart Pro Smartwatch
INSERT INTO products (id, name, slug, description, short_description, sku, category_id, subcategory_id, brand_id, mrp, selling_price, discount_percent, stock_quantity, low_stock_threshold, weight_grams, length_cm, breadth_cm, height_cm, is_active, is_featured, is_deal_of_day, rating, review_count, sold_count, meta_title, meta_description) VALUES (
  '2712cc8c-52b9-40aa-8bde-71c7802ff6a4', 'Titan Smart Pro Smartwatch 1.78" AMOLED GPS SpO2 14-Day Battery 5ATM Red', 'titan-smart-pro-smartwatch-red', 'Titan Smart Pro Smartwatch 1.78" AMOLED GPS SpO2 14-Day Battery 5ATM Red. AMOLED Display, Built-in GPS, SpO2, Temperature, Stress & Sleep Monitor, Women Health, Multisport, 5 ATM, Up to 14 Days Battery.

KEY FEATURES:
- Stunning AMOLED display
- Built-in GPS for accurate tracking
- SpO2 blood oxygen monitoring
- Body temperature, stress & sleep monitor
- Women health / period tracker
- Multisport tracker with heart rate monitor
- 5 ATM (50m) water resistance
- Up to 14 days battery life
- Titanium case with silicone strap', 'AMOLED Display | Built-in GPS | SpO2 | Temperature | Stress & Sleep Monitor | Women Health | Multisport | 5 ATM | Up to 14 Days Battery', 'TITAN-SMARTPRO-RED', '7b0b7971-dd65-4643-91c9-c9c4a943da19', NULL, (SELECT id FROM brands WHERE slug='titan'), 14995, 2000, 86.66, 200, 5, 400, 18, 18, 7, true, false, false, 4.1, 252, 0, 'Titan Smart Pro Smartwatch 1.78" AMOLED GPS SpO2 14-Day Battery 5ATM Red at ₹2000 | BoxDeal', 'Buy Titan Smart Pro Smartwatch 1.78" AMOLED GPS SpO2 14-Day Battery 5ATM Red at ₹2000 (MRP ₹14995). AMOLED Display | Built-in GPS | SpO2 | Temperature | Stress & Sleep Monitor | Women Health | Multisport | 5 ATM | Up to 14 Days Battery');
INSERT INTO product_specifications (product_id, spec_group, spec_name, spec_value, sort_order) VALUES
  ('2712cc8c-52b9-40aa-8bde-71c7802ff6a4', 'General', 'Brand', 'Titan', 1),
  ('2712cc8c-52b9-40aa-8bde-71c7802ff6a4', 'General', 'Model', 'Smart Pro (90149AP04)', 2),
  ('2712cc8c-52b9-40aa-8bde-71c7802ff6a4', 'General', 'Colour', 'Red', 3),
  ('2712cc8c-52b9-40aa-8bde-71c7802ff6a4', 'General', 'Band Colour', 'Black', 4),
  ('2712cc8c-52b9-40aa-8bde-71c7802ff6a4', 'General', 'Case Material', 'Titanium', 5),
  ('2712cc8c-52b9-40aa-8bde-71c7802ff6a4', 'General', 'Band Material', 'Silicone', 6),
  ('2712cc8c-52b9-40aa-8bde-71c7802ff6a4', 'General', 'Target Audience', 'Women', 7),
  ('2712cc8c-52b9-40aa-8bde-71c7802ff6a4', 'General', 'Shape', 'Round', 8),
  ('2712cc8c-52b9-40aa-8bde-71c7802ff6a4', 'Display', 'Screen Size', '45 mm', 9),
  ('2712cc8c-52b9-40aa-8bde-71c7802ff6a4', 'Display', 'Display Type', 'AMOLED', 10),
  ('2712cc8c-52b9-40aa-8bde-71c7802ff6a4', 'Features', 'GPS', 'Built-in', 11),
  ('2712cc8c-52b9-40aa-8bde-71c7802ff6a4', 'Features', 'SpO2 Monitor', 'Yes', 12),
  ('2712cc8c-52b9-40aa-8bde-71c7802ff6a4', 'Features', 'Body Temperature', 'Yes', 13),
  ('2712cc8c-52b9-40aa-8bde-71c7802ff6a4', 'Features', 'Stress Monitor', 'Yes', 14),
  ('2712cc8c-52b9-40aa-8bde-71c7802ff6a4', 'Features', 'Sleep Monitor', 'Yes', 15),
  ('2712cc8c-52b9-40aa-8bde-71c7802ff6a4', 'Features', 'Women Health', 'Period Tracker', 16),
  ('2712cc8c-52b9-40aa-8bde-71c7802ff6a4', 'Features', 'Sensors', 'Altimeter, Barometer, Compass, Heart Rate', 17),
  ('2712cc8c-52b9-40aa-8bde-71c7802ff6a4', 'Features', 'Sport Type', 'Fitness, Multi-Sports', 18),
  ('2712cc8c-52b9-40aa-8bde-71c7802ff6a4', 'Durability', 'Water Resistance', '5 ATM / IPX8 (50m)', 19),
  ('2712cc8c-52b9-40aa-8bde-71c7802ff6a4', 'Battery', 'Battery Type', 'Lithium', 20),
  ('2712cc8c-52b9-40aa-8bde-71c7802ff6a4', 'Battery', 'Battery Life', 'Up to 14 Days', 21),
  ('2712cc8c-52b9-40aa-8bde-71c7802ff6a4', 'Connectivity', 'Bluetooth', 'Yes', 22),
  ('2712cc8c-52b9-40aa-8bde-71c7802ff6a4', 'Connectivity', 'Charging', 'USB', 23),
  ('2712cc8c-52b9-40aa-8bde-71c7802ff6a4', 'In the Box', 'Contents', 'Watch, Strap, Charger, Welcome Card', 24);
INSERT INTO product_images (product_id, image_url, thumbnail_url, is_primary, sort_order) VALUES
  ('2712cc8c-52b9-40aa-8bde-71c7802ff6a4', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/titan-smart-pro-smartwatch-red/1.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/titan-smart-pro-smartwatch-red/1.jpg', true, 0),
  ('2712cc8c-52b9-40aa-8bde-71c7802ff6a4', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/titan-smart-pro-smartwatch-red/2.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/titan-smart-pro-smartwatch-red/2.jpg', false, 1),
  ('2712cc8c-52b9-40aa-8bde-71c7802ff6a4', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/titan-smart-pro-smartwatch-red/3.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/titan-smart-pro-smartwatch-red/3.jpg', false, 2),
  ('2712cc8c-52b9-40aa-8bde-71c7802ff6a4', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/titan-smart-pro-smartwatch-red/4.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/titan-smart-pro-smartwatch-red/4.jpg', false, 3),
  ('2712cc8c-52b9-40aa-8bde-71c7802ff6a4', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/titan-smart-pro-smartwatch-red/5.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/titan-smart-pro-smartwatch-red/5.jpg', false, 4);