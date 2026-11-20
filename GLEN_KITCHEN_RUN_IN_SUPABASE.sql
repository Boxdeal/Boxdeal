-- New brand Glen (idempotent)
INSERT INTO brands (id, name, slug, is_active) SELECT 'f9765c3f-54c2-4e10-8f78-f2dfee5efc3a', 'Glen', 'glen', true WHERE NOT EXISTS (SELECT 1 FROM brands WHERE slug='glen');

-- New category: Kitchen Appliances (idempotent)
INSERT INTO categories (id, name, slug, description, is_active, sort_order) SELECT 'a7f3e9c1-2d84-4b6f-9e05-7c1a8f3d6b24', 'Kitchen Appliances', 'kitchen-appliances', 'Kettles, air fryers, juicers, cookers & more', true, 15 WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug='kitchen-appliances');

-- Glen Electric Kettle 1.8L 1500W SS304 Auto Shut-Off with 360 Degree Base
INSERT INTO products (id, name, slug, description, short_description, sku, category_id, subcategory_id, brand_id, mrp, selling_price, discount_percent, stock_quantity, low_stock_threshold, weight_grams, length_cm, breadth_cm, height_cm, is_active, is_featured, is_deal_of_day, rating, review_count, sold_count, meta_title, meta_description) VALUES (
  '659f8b2e-dead-4fed-8db0-2cfe630f61d0', 'Glen Electric Kettle 1.8L 1500W SS304 Auto Shut-Off with 360 Degree Base', 'glen-electric-kettle-1-8l-1500w-sa9007', 'Glen Electric Kettle 1.8L 1500W SS304 Auto Shut-Off with 360 Degree Base. 1.8L, 1500W, SS 304 Inner Body, Auto Shut-Off, Cool Touch Double-Layer Body, Wider Mouth, 360 Degree Base, 2Yr Warranty.

KEY FEATURES:
- 1.8L capacity with auto shut-off
- Powerful 1500W fast boiling
- Food-grade SS 304 inner body
- Double-layered cool-touch outer body
- Concealed heating element
- 360 degree rotational base
- Wider mouth for easy cleaning
- 2 years warranty', '1.8L | 1500W | SS 304 Inner Body | Auto Shut-Off | Cool Touch Double-Layer Body | Wider Mouth | 360 Degree Base | 2Yr Warranty', 'GLEN-SA9007-KETTLE', 'a7f3e9c1-2d84-4b6f-9e05-7c1a8f3d6b24', NULL, (SELECT id FROM brands WHERE slug='glen'), 2995, 1150, 61.6, 50, 5, 2000, 24, 24, 29, true, false, false, 4, 120, 0, 'Glen Electric Kettle 1.8L 1500W SS304 Auto Shut-Off with 360 Degree Base at ₹1150 | BoxDeal', 'Buy Glen Electric Kettle 1.8L 1500W SS304 Auto Shut-Off with 360 Degree Base at ₹1150 (MRP ₹2995). 1.8L | 1500W | SS 304 Inner Body | Auto Shut-Off | Cool Touch Double-Layer Body | Wider Mouth | 360 Degree Base | 2Yr Warranty');
INSERT INTO product_specifications (product_id, spec_group, spec_name, spec_value, sort_order) VALUES
  ('659f8b2e-dead-4fed-8db0-2cfe630f61d0', 'General', 'Brand', 'Glen', 1),
  ('659f8b2e-dead-4fed-8db0-2cfe630f61d0', 'General', 'Model', 'SA-9007', 2),
  ('659f8b2e-dead-4fed-8db0-2cfe630f61d0', 'General', 'Type', 'Electric Kettle', 3),
  ('659f8b2e-dead-4fed-8db0-2cfe630f61d0', 'General', 'Colour', 'Black', 4),
  ('659f8b2e-dead-4fed-8db0-2cfe630f61d0', 'General', 'Material', 'Stainless Steel (SS 304)', 5),
  ('659f8b2e-dead-4fed-8db0-2cfe630f61d0', 'Capacity', 'Capacity', '1.8 Litres', 6),
  ('659f8b2e-dead-4fed-8db0-2cfe630f61d0', 'Power', 'Wattage', '1500 W', 7),
  ('659f8b2e-dead-4fed-8db0-2cfe630f61d0', 'Power', 'Voltage', '230 V AC', 8),
  ('659f8b2e-dead-4fed-8db0-2cfe630f61d0', 'Features', 'Auto Shut-Off', 'Yes', 9),
  ('659f8b2e-dead-4fed-8db0-2cfe630f61d0', 'Features', 'Base', '360 Degree Rotational', 10),
  ('659f8b2e-dead-4fed-8db0-2cfe630f61d0', 'Features', 'Heating Element', 'Concealed', 11),
  ('659f8b2e-dead-4fed-8db0-2cfe630f61d0', 'Warranty', 'Warranty', '2 Years', 12),
  ('659f8b2e-dead-4fed-8db0-2cfe630f61d0', 'In the Box', 'Contents', 'Electric Kettle', 13);
INSERT INTO product_images (product_id, image_url, thumbnail_url, is_primary, sort_order) VALUES
  ('659f8b2e-dead-4fed-8db0-2cfe630f61d0', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/glen-electric-kettle-1-8l-1500w-sa9007/1.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/glen-electric-kettle-1-8l-1500w-sa9007/1.jpg', true, 0),
  ('659f8b2e-dead-4fed-8db0-2cfe630f61d0', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/glen-electric-kettle-1-8l-1500w-sa9007/2.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/glen-electric-kettle-1-8l-1500w-sa9007/2.jpg', false, 1),
  ('659f8b2e-dead-4fed-8db0-2cfe630f61d0', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/glen-electric-kettle-1-8l-1500w-sa9007/3.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/glen-electric-kettle-1-8l-1500w-sa9007/3.jpg', false, 2),
  ('659f8b2e-dead-4fed-8db0-2cfe630f61d0', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/glen-electric-kettle-1-8l-1500w-sa9007/4.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/glen-electric-kettle-1-8l-1500w-sa9007/4.jpg', false, 3),
  ('659f8b2e-dead-4fed-8db0-2cfe630f61d0', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/glen-electric-kettle-1-8l-1500w-sa9007/5.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/glen-electric-kettle-1-8l-1500w-sa9007/5.jpg', false, 4);

-- Glen Electric Coffee Mug Warmer Plate 16W with Auto Shut-Off Black
INSERT INTO products (id, name, slug, description, short_description, sku, category_id, subcategory_id, brand_id, mrp, selling_price, discount_percent, stock_quantity, low_stock_threshold, weight_grams, length_cm, breadth_cm, height_cm, is_active, is_featured, is_deal_of_day, rating, review_count, sold_count, meta_title, meta_description) VALUES (
  'c97a3ed1-b8af-4299-90ef-9671b9212dec', 'Glen Electric Coffee Mug Warmer Plate 16W with Auto Shut-Off Black', 'glen-electric-coffee-mug-warmer-plate-sa3000wp', 'Glen Electric Coffee Mug Warmer Plate 16W with Auto Shut-Off Black. 16W, Auto Shut-Off, Up to 100 Degrees Celsius, 400ml Capacity, Keeps Tea/Coffee Warm, Compact Desk Warmer, Black.

KEY FEATURES:
- 16W electric mug warmer plate
- Auto shut-off function for safety
- Heats up to 100 degrees Celsius
- Keeps coffee, tea & beverages warm
- Compact desk-friendly design
- Easy single-button operation', '16W | Auto Shut-Off | Up to 100 Degrees Celsius | 400ml Capacity | Keeps Tea/Coffee Warm | Compact Desk Warmer | Black', 'GLEN-SA3000WP-WARMER', 'a7f3e9c1-2d84-4b6f-9e05-7c1a8f3d6b24', NULL, (SELECT id FROM brands WHERE slug='glen'), 1595, 700, 56.11, 100, 5, 1500, 24, 18, 21, true, false, false, 4, 98, 0, 'Glen Electric Coffee Mug Warmer Plate 16W with Auto Shut-Off Black at ₹700 | BoxDeal', 'Buy Glen Electric Coffee Mug Warmer Plate 16W with Auto Shut-Off Black at ₹700 (MRP ₹1595). 16W | Auto Shut-Off | Up to 100 Degrees Celsius | 400ml Capacity | Keeps Tea/Coffee Warm | Compact Desk Warmer | Black');
INSERT INTO product_specifications (product_id, spec_group, spec_name, spec_value, sort_order) VALUES
  ('c97a3ed1-b8af-4299-90ef-9671b9212dec', 'General', 'Brand', 'Glen', 1),
  ('c97a3ed1-b8af-4299-90ef-9671b9212dec', 'General', 'Model', 'SA3000WP', 2),
  ('c97a3ed1-b8af-4299-90ef-9671b9212dec', 'General', 'Type', 'Coffee Mug Warmer', 3),
  ('c97a3ed1-b8af-4299-90ef-9671b9212dec', 'General', 'Colour', 'Black', 4),
  ('c97a3ed1-b8af-4299-90ef-9671b9212dec', 'Power', 'Wattage', '16 W', 5),
  ('c97a3ed1-b8af-4299-90ef-9671b9212dec', 'Features', 'Auto Shut-Off', 'Yes', 6),
  ('c97a3ed1-b8af-4299-90ef-9671b9212dec', 'Features', 'Max Temperature', '100 Degrees Celsius', 7),
  ('c97a3ed1-b8af-4299-90ef-9671b9212dec', 'Capacity', 'Output Capacity', '400 ml', 8),
  ('c97a3ed1-b8af-4299-90ef-9671b9212dec', 'In the Box', 'Contents', 'Mug Warmer Plate', 9);
INSERT INTO product_images (product_id, image_url, thumbnail_url, is_primary, sort_order) VALUES
  ('c97a3ed1-b8af-4299-90ef-9671b9212dec', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/glen-electric-coffee-mug-warmer-plate-sa3000wp/1.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/glen-electric-coffee-mug-warmer-plate-sa3000wp/1.jpg', true, 0),
  ('c97a3ed1-b8af-4299-90ef-9671b9212dec', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/glen-electric-coffee-mug-warmer-plate-sa3000wp/2.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/glen-electric-coffee-mug-warmer-plate-sa3000wp/2.jpg', false, 1),
  ('c97a3ed1-b8af-4299-90ef-9671b9212dec', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/glen-electric-coffee-mug-warmer-plate-sa3000wp/3.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/glen-electric-coffee-mug-warmer-plate-sa3000wp/3.jpg', false, 2),
  ('c97a3ed1-b8af-4299-90ef-9671b9212dec', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/glen-electric-coffee-mug-warmer-plate-sa3000wp/4.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/glen-electric-coffee-mug-warmer-plate-sa3000wp/4.jpg', false, 3),
  ('c97a3ed1-b8af-4299-90ef-9671b9212dec', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/glen-electric-coffee-mug-warmer-plate-sa3000wp/5.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/glen-electric-coffee-mug-warmer-plate-sa3000wp/5.jpg', false, 4);

-- Glen Multi Electric Cooker & Food Steamer 500W 0.8L for Rice Noodles Vegetables Soup White
INSERT INTO products (id, name, slug, description, short_description, sku, category_id, subcategory_id, brand_id, mrp, selling_price, discount_percent, stock_quantity, low_stock_threshold, weight_grams, length_cm, breadth_cm, height_cm, is_active, is_featured, is_deal_of_day, rating, review_count, sold_count, meta_title, meta_description) VALUES (
  'dd0ff078-7a2c-48a5-8fa0-029a61931199', 'Glen Multi Electric Cooker & Food Steamer 500W 0.8L for Rice Noodles Vegetables Soup White', 'glen-multi-electric-cooker-steamer-500w-0-8l', 'Glen Multi Electric Cooker & Food Steamer 500W 0.8L for Rice Noodles Vegetables Soup White. 0.8L, 500W, Multi Cooker + Steamer, Rice/Noodles/Pasta/Vegetables/Soup, See-Through Glass Lid, Detachable Cord, White.

KEY FEATURES:
- 0.8L multi electric cooker & steamer
- 500W power for quick cooking
- Cooks rice, noodles, pasta, vegetables & soup
- See-through glass top lid
- Detachable power cord
- Soup making & steaming functions
- Compact design for home use', '0.8L | 500W | Multi Cooker + Steamer | Rice/Noodles/Pasta/Vegetables/Soup | See-Through Glass Lid | Detachable Cord | White', 'GLEN-MULTICOOKER-0-8L', 'a7f3e9c1-2d84-4b6f-9e05-7c1a8f3d6b24', NULL, (SELECT id FROM brands WHERE slug='glen'), 3295, 1400, 57.51, 50, 5, 1500, 23, 23, 21, true, false, false, 4, 85, 0, 'Glen Multi Electric Cooker & Food Steamer 500W 0.8L for Rice Noodles Vegetables Soup White at ₹1400 | BoxDeal', 'Buy Glen Multi Electric Cooker & Food Steamer 500W 0.8L for Rice Noodles Vegetables Soup White at ₹1400 (MRP ₹3295). 0.8L | 500W | Multi Cooker + Steamer | Rice/Noodles/Pasta/Vegetables/Soup | See-Through Glass Lid | Detachable Cord | White');
INSERT INTO product_specifications (product_id, spec_group, spec_name, spec_value, sort_order) VALUES
  ('dd0ff078-7a2c-48a5-8fa0-029a61931199', 'General', 'Brand', 'Glen', 1),
  ('dd0ff078-7a2c-48a5-8fa0-029a61931199', 'General', 'Model', 'Multi Electric Cooker', 2),
  ('dd0ff078-7a2c-48a5-8fa0-029a61931199', 'General', 'Type', 'Food Steamer / Cooker', 3),
  ('dd0ff078-7a2c-48a5-8fa0-029a61931199', 'General', 'Colour', 'White', 4),
  ('dd0ff078-7a2c-48a5-8fa0-029a61931199', 'Capacity', 'Capacity', '0.8 Litres', 5),
  ('dd0ff078-7a2c-48a5-8fa0-029a61931199', 'Power', 'Wattage', '500 W', 6),
  ('dd0ff078-7a2c-48a5-8fa0-029a61931199', 'Power', 'Power Requirement', '230 V', 7),
  ('dd0ff078-7a2c-48a5-8fa0-029a61931199', 'Features', 'Steaming', 'Yes', 8),
  ('dd0ff078-7a2c-48a5-8fa0-029a61931199', 'Features', 'Soup Making', 'Yes', 9),
  ('dd0ff078-7a2c-48a5-8fa0-029a61931199', 'Features', 'Glass Lid', 'See-Through', 10),
  ('dd0ff078-7a2c-48a5-8fa0-029a61931199', 'Features', 'Power Cord', 'Detachable', 11),
  ('dd0ff078-7a2c-48a5-8fa0-029a61931199', 'In the Box', 'Contents', 'Electric Cooker', 12);
INSERT INTO product_images (product_id, image_url, thumbnail_url, is_primary, sort_order) VALUES
  ('dd0ff078-7a2c-48a5-8fa0-029a61931199', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/glen-multi-electric-cooker-steamer-500w-0-8l/1.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/glen-multi-electric-cooker-steamer-500w-0-8l/1.jpg', true, 0),
  ('dd0ff078-7a2c-48a5-8fa0-029a61931199', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/glen-multi-electric-cooker-steamer-500w-0-8l/2.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/glen-multi-electric-cooker-steamer-500w-0-8l/2.jpg', false, 1),
  ('dd0ff078-7a2c-48a5-8fa0-029a61931199', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/glen-multi-electric-cooker-steamer-500w-0-8l/3.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/glen-multi-electric-cooker-steamer-500w-0-8l/3.jpg', false, 2),
  ('dd0ff078-7a2c-48a5-8fa0-029a61931199', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/glen-multi-electric-cooker-steamer-500w-0-8l/4.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/glen-multi-electric-cooker-steamer-500w-0-8l/4.jpg', false, 3),
  ('dd0ff078-7a2c-48a5-8fa0-029a61931199', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/glen-multi-electric-cooker-steamer-500w-0-8l/5.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/glen-multi-electric-cooker-steamer-500w-0-8l/5.jpg', false, 4);

-- Glen Cold Press Slow Juicer 150W 87 RPM with Reverse Function for Home Brown
INSERT INTO products (id, name, slug, description, short_description, sku, category_id, subcategory_id, brand_id, mrp, selling_price, discount_percent, stock_quantity, low_stock_threshold, weight_grams, length_cm, breadth_cm, height_cm, is_active, is_featured, is_deal_of_day, rating, review_count, sold_count, meta_title, meta_description) VALUES (
  'b20b1ab8-0cfd-46eb-b166-0783fcbf6360', 'Glen Cold Press Slow Juicer 150W 87 RPM with Reverse Function for Home Brown', 'glen-cold-press-juicer-150w-sa4017cpj', 'Glen Cold Press Slow Juicer 150W 87 RPM with Reverse Function for Home Brown. 150W, 87 RPM Slow Juicer, Cold Press, Up to 30% More Juice, Reverse Function, Anti-Drip Lever, BPA-Free, Dishwasher Safe, 2Yr Warranty.

KEY FEATURES:
- Cold press tech extracts up to 30% more juice
- Slow 87 RPM for minimal oxidation & less foam
- Powerful 150W motor with reverse function
- Durable polycarbonate juicing screw, BPA-free
- Anti-drip lever & simple lock mechanism
- Detachable dishwasher-safe parts
- Low-noise operation
- 2 years manufacturer warranty', '150W | 87 RPM Slow Juicer | Cold Press | Up to 30% More Juice | Reverse Function | Anti-Drip Lever | BPA-Free | Dishwasher Safe | 2Yr Warranty', 'GLEN-SA4017CPJ-JUICER', 'a7f3e9c1-2d84-4b6f-9e05-7c1a8f3d6b24', NULL, (SELECT id FROM brands WHERE slug='glen'), 20995, 7200, 65.71, 50, 5, 4500, 47, 38, 25, true, false, false, 4, 60, 0, 'Glen Cold Press Slow Juicer 150W 87 RPM with Reverse Function for Home Brown at ₹7200 | BoxDeal', 'Buy Glen Cold Press Slow Juicer 150W 87 RPM with Reverse Function for Home Brown at ₹7200 (MRP ₹20995). 150W | 87 RPM Slow Juicer | Cold Press | Up to 30% More Juice | Reverse Function | Anti-Drip Lever | BPA-Free | Dishwasher Safe | 2Yr Warranty');
INSERT INTO product_specifications (product_id, spec_group, spec_name, spec_value, sort_order) VALUES
  ('b20b1ab8-0cfd-46eb-b166-0783fcbf6360', 'General', 'Brand', 'Glen', 1),
  ('b20b1ab8-0cfd-46eb-b166-0783fcbf6360', 'General', 'Model', 'SA4017CPJ', 2),
  ('b20b1ab8-0cfd-46eb-b166-0783fcbf6360', 'General', 'Type', 'Cold Press Slow Juicer', 3),
  ('b20b1ab8-0cfd-46eb-b166-0783fcbf6360', 'General', 'Colour', 'Brown', 4),
  ('b20b1ab8-0cfd-46eb-b166-0783fcbf6360', 'General', 'Material', 'ABS / Polycarbonate', 5),
  ('b20b1ab8-0cfd-46eb-b166-0783fcbf6360', 'Power', 'Wattage', '150 W', 6),
  ('b20b1ab8-0cfd-46eb-b166-0783fcbf6360', 'Power', 'Voltage', '230 V', 7),
  ('b20b1ab8-0cfd-46eb-b166-0783fcbf6360', 'Performance', 'Speed', '87 RPM (Single Speed)', 8),
  ('b20b1ab8-0cfd-46eb-b166-0783fcbf6360', 'Performance', 'Reverse Function', 'Yes', 9),
  ('b20b1ab8-0cfd-46eb-b166-0783fcbf6360', 'Capacity', 'Capacity', '0.5 Litres', 10),
  ('b20b1ab8-0cfd-46eb-b166-0783fcbf6360', 'Features', 'Anti-Drip Lever', 'Yes', 11),
  ('b20b1ab8-0cfd-46eb-b166-0783fcbf6360', 'Features', 'Dishwasher Safe', 'Yes', 12),
  ('b20b1ab8-0cfd-46eb-b166-0783fcbf6360', 'Warranty', 'Warranty', '2 Years', 13),
  ('b20b1ab8-0cfd-46eb-b166-0783fcbf6360', 'In the Box', 'Contents', 'Juicer, Anti-Drip Lever', 14);
INSERT INTO product_images (product_id, image_url, thumbnail_url, is_primary, sort_order) VALUES
  ('b20b1ab8-0cfd-46eb-b166-0783fcbf6360', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/glen-cold-press-juicer-150w-sa4017cpj/1.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/glen-cold-press-juicer-150w-sa4017cpj/1.jpg', true, 0),
  ('b20b1ab8-0cfd-46eb-b166-0783fcbf6360', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/glen-cold-press-juicer-150w-sa4017cpj/2.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/glen-cold-press-juicer-150w-sa4017cpj/2.jpg', false, 1),
  ('b20b1ab8-0cfd-46eb-b166-0783fcbf6360', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/glen-cold-press-juicer-150w-sa4017cpj/3.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/glen-cold-press-juicer-150w-sa4017cpj/3.jpg', false, 2),
  ('b20b1ab8-0cfd-46eb-b166-0783fcbf6360', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/glen-cold-press-juicer-150w-sa4017cpj/4.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/glen-cold-press-juicer-150w-sa4017cpj/4.jpg', false, 3),
  ('b20b1ab8-0cfd-46eb-b166-0783fcbf6360', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/glen-cold-press-juicer-150w-sa4017cpj/5.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/glen-cold-press-juicer-150w-sa4017cpj/5.jpg', false, 4);

-- Glen Electric Rapid Air Fryer 3.8L 1350W with Temperature Control & 30-Min Timer Black
INSERT INTO products (id, name, slug, description, short_description, sku, category_id, subcategory_id, brand_id, mrp, selling_price, discount_percent, stock_quantity, low_stock_threshold, weight_grams, length_cm, breadth_cm, height_cm, is_active, is_featured, is_deal_of_day, rating, review_count, sold_count, meta_title, meta_description) VALUES (
  'ff6de92c-1fbb-40a4-8bf3-270b0552a2b5', 'Glen Electric Rapid Air Fryer 3.8L 1350W with Temperature Control & 30-Min Timer Black', 'glen-electric-rapid-air-fryer-3-8l-1350w-3049', 'Glen Electric Rapid Air Fryer 3.8L 1350W with Temperature Control & 30-Min Timer Black. 3.8L, 1350W, Air Fryer, Temperature Control (180-200 Degrees C), Removable Basket, Vapour Steam, 30-Min Timer, Fry/Grill/Roast/Bake, 2Yr Warranty.

KEY FEATURES:
- 3.8L capacity air fryer
- 1350W with rapid air circulation
- Fry, grill, roast & bake with less/no oil
- Preset temperature control 180-200 Degrees C
- Removable frying basket
- Vapour steam for crispier frying
- 30-minute timer with end-of-cycle alarm
- 2 years warranty', '3.8L | 1350W | Air Fryer | Temperature Control (180-200 Degrees C) | Removable Basket | Vapour Steam | 30-Min Timer | Fry/Grill/Roast/Bake | 2Yr Warranty', 'GLEN-SA3049-AIRFRYER', 'a7f3e9c1-2d84-4b6f-9e05-7c1a8f3d6b24', NULL, (SELECT id FROM brands WHERE slug='glen'), 9395, 4000, 57.42, 50, 5, 4500, 35, 36, 38, true, false, false, 4, 459, 0, 'Glen Electric Rapid Air Fryer 3.8L 1350W with Temperature Control & 30-Min Timer Black at ₹4000 | BoxDeal', 'Buy Glen Electric Rapid Air Fryer 3.8L 1350W with Temperature Control & 30-Min Timer Black at ₹4000 (MRP ₹9395). 3.8L | 1350W | Air Fryer | Temperature Control (180-200 Degrees C) | Removable Basket | Vapour Steam | 30-Min Timer | Fry/Grill/Roast/Bake | 2Yr Warranty');
INSERT INTO product_specifications (product_id, spec_group, spec_name, spec_value, sort_order) VALUES
  ('ff6de92c-1fbb-40a4-8bf3-270b0552a2b5', 'General', 'Brand', 'Glen', 1),
  ('ff6de92c-1fbb-40a4-8bf3-270b0552a2b5', 'General', 'Model', 'SA3049 (3049BL)', 2),
  ('ff6de92c-1fbb-40a4-8bf3-270b0552a2b5', 'General', 'Type', 'Air Fryer', 3),
  ('ff6de92c-1fbb-40a4-8bf3-270b0552a2b5', 'General', 'Colour', 'Black', 4),
  ('ff6de92c-1fbb-40a4-8bf3-270b0552a2b5', 'General', 'Size', 'Medium', 5),
  ('ff6de92c-1fbb-40a4-8bf3-270b0552a2b5', 'Capacity', 'Capacity', '3.8 Litres', 6),
  ('ff6de92c-1fbb-40a4-8bf3-270b0552a2b5', 'Power', 'Wattage', '1350 W', 7),
  ('ff6de92c-1fbb-40a4-8bf3-270b0552a2b5', 'Features', 'Temperature Control', '180-200 Degrees C', 8),
  ('ff6de92c-1fbb-40a4-8bf3-270b0552a2b5', 'Features', 'Timer', '30 Minutes', 9),
  ('ff6de92c-1fbb-40a4-8bf3-270b0552a2b5', 'Features', 'Technology', 'Rapid Air Circulation', 10),
  ('ff6de92c-1fbb-40a4-8bf3-270b0552a2b5', 'Features', 'Functions', 'Fry, Grill, Roast, Bake', 11),
  ('ff6de92c-1fbb-40a4-8bf3-270b0552a2b5', 'Features', 'Vapour Steam', 'Yes', 12),
  ('ff6de92c-1fbb-40a4-8bf3-270b0552a2b5', 'Features', 'Nonstick Coating', 'Yes', 13),
  ('ff6de92c-1fbb-40a4-8bf3-270b0552a2b5', 'Warranty', 'Warranty', '2 Years', 14),
  ('ff6de92c-1fbb-40a4-8bf3-270b0552a2b5', 'In the Box', 'Contents', 'Air Fryer, Removable Frying Basket', 15);
INSERT INTO product_images (product_id, image_url, thumbnail_url, is_primary, sort_order) VALUES
  ('ff6de92c-1fbb-40a4-8bf3-270b0552a2b5', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/glen-electric-rapid-air-fryer-3-8l-1350w-3049/1.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/glen-electric-rapid-air-fryer-3-8l-1350w-3049/1.jpg', true, 0),
  ('ff6de92c-1fbb-40a4-8bf3-270b0552a2b5', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/glen-electric-rapid-air-fryer-3-8l-1350w-3049/2.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/glen-electric-rapid-air-fryer-3-8l-1350w-3049/2.jpg', false, 1),
  ('ff6de92c-1fbb-40a4-8bf3-270b0552a2b5', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/glen-electric-rapid-air-fryer-3-8l-1350w-3049/3.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/glen-electric-rapid-air-fryer-3-8l-1350w-3049/3.jpg', false, 2),
  ('ff6de92c-1fbb-40a4-8bf3-270b0552a2b5', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/glen-electric-rapid-air-fryer-3-8l-1350w-3049/4.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/glen-electric-rapid-air-fryer-3-8l-1350w-3049/4.jpg', false, 3),
  ('ff6de92c-1fbb-40a4-8bf3-270b0552a2b5', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/glen-electric-rapid-air-fryer-3-8l-1350w-3049/5.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/glen-electric-rapid-air-fryer-3-8l-1350w-3049/5.jpg', false, 4);

-- Glen Electric Air Fryer 2L 800W with Preset Temperature Control Black & Silver
INSERT INTO products (id, name, slug, description, short_description, sku, category_id, subcategory_id, brand_id, mrp, selling_price, discount_percent, stock_quantity, low_stock_threshold, weight_grams, length_cm, breadth_cm, height_cm, is_active, is_featured, is_deal_of_day, rating, review_count, sold_count, meta_title, meta_description) VALUES (
  '841a6cf9-d5bb-418b-ba84-df945f76e304', 'Glen Electric Air Fryer 2L 800W with Preset Temperature Control Black & Silver', 'glen-electric-air-fryer-2l-800w-sa3043', 'Glen Electric Air Fryer 2L 800W with Preset Temperature Control Black & Silver. 2L, 800W, Air Fryer, Up to 80% Less Fat, Preset Temperature (180-200 Degrees C), Vapour Steam, 30-Min Timer, Fry/Grill/Roast/Bake, 2Yr Warranty.

KEY FEATURES:
- 2L compact capacity air fryer
- 800W hot air circulation
- Up to 80% less fat vs conventional frying
- Fry, grill, roast & bake with little/no oil
- Preset temperature control 180-200 Degrees C
- Vapour steam for crispier frying
- 30-minute timer with end-of-cycle alarm
- 2 years warranty', '2L | 800W | Air Fryer | Up to 80% Less Fat | Preset Temperature (180-200 Degrees C) | Vapour Steam | 30-Min Timer | Fry/Grill/Roast/Bake | 2Yr Warranty', 'GLEN-SA3043-AIRFRYER', 'a7f3e9c1-2d84-4b6f-9e05-7c1a8f3d6b24', NULL, (SELECT id FROM brands WHERE slug='glen'), 9395, 2500, 73.39, 50, 5, 3500, 30, 29, 36, true, false, false, 4.1, 47, 0, 'Glen Electric Air Fryer 2L 800W with Preset Temperature Control Black & Silver at ₹2500 | BoxDeal', 'Buy Glen Electric Air Fryer 2L 800W with Preset Temperature Control Black & Silver at ₹2500 (MRP ₹9395). 2L | 800W | Air Fryer | Up to 80% Less Fat | Preset Temperature (180-200 Degrees C) | Vapour Steam | 30-Min Timer | Fry/Grill/Roast/Bake | 2Yr Warranty');
INSERT INTO product_specifications (product_id, spec_group, spec_name, spec_value, sort_order) VALUES
  ('841a6cf9-d5bb-418b-ba84-df945f76e304', 'General', 'Brand', 'Glen', 1),
  ('841a6cf9-d5bb-418b-ba84-df945f76e304', 'General', 'Model', 'SA-3043 (3045)', 2),
  ('841a6cf9-d5bb-418b-ba84-df945f76e304', 'General', 'Type', 'Air Fryer', 3),
  ('841a6cf9-d5bb-418b-ba84-df945f76e304', 'General', 'Colour', 'Black & Silver', 4),
  ('841a6cf9-d5bb-418b-ba84-df945f76e304', 'General', 'Size', '2L', 5),
  ('841a6cf9-d5bb-418b-ba84-df945f76e304', 'Capacity', 'Capacity', '2 Litres', 6),
  ('841a6cf9-d5bb-418b-ba84-df945f76e304', 'Power', 'Wattage', '800 W', 7),
  ('841a6cf9-d5bb-418b-ba84-df945f76e304', 'Features', 'Temperature Control', '180-200 Degrees C', 8),
  ('841a6cf9-d5bb-418b-ba84-df945f76e304', 'Features', 'Timer', '30 Minutes', 9),
  ('841a6cf9-d5bb-418b-ba84-df945f76e304', 'Features', 'Technology', 'Hot Air Circulation', 10),
  ('841a6cf9-d5bb-418b-ba84-df945f76e304', 'Features', 'Functions', 'Fry, Grill, Roast, Bake', 11),
  ('841a6cf9-d5bb-418b-ba84-df945f76e304', 'Features', 'Vapour Steam', 'Yes', 12),
  ('841a6cf9-d5bb-418b-ba84-df945f76e304', 'Features', 'Nonstick Coating', 'Yes', 13),
  ('841a6cf9-d5bb-418b-ba84-df945f76e304', 'Warranty', 'Warranty', '2 Years', 14),
  ('841a6cf9-d5bb-418b-ba84-df945f76e304', 'In the Box', 'Contents', 'Air Fryer, Frying Basket', 15);
INSERT INTO product_images (product_id, image_url, thumbnail_url, is_primary, sort_order) VALUES
  ('841a6cf9-d5bb-418b-ba84-df945f76e304', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/glen-electric-air-fryer-2l-800w-sa3043/1.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/glen-electric-air-fryer-2l-800w-sa3043/1.jpg', true, 0),
  ('841a6cf9-d5bb-418b-ba84-df945f76e304', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/glen-electric-air-fryer-2l-800w-sa3043/2.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/glen-electric-air-fryer-2l-800w-sa3043/2.jpg', false, 1),
  ('841a6cf9-d5bb-418b-ba84-df945f76e304', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/glen-electric-air-fryer-2l-800w-sa3043/3.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/glen-electric-air-fryer-2l-800w-sa3043/3.jpg', false, 2),
  ('841a6cf9-d5bb-418b-ba84-df945f76e304', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/glen-electric-air-fryer-2l-800w-sa3043/4.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/glen-electric-air-fryer-2l-800w-sa3043/4.jpg', false, 3),
  ('841a6cf9-d5bb-418b-ba84-df945f76e304', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/glen-electric-air-fryer-2l-800w-sa3043/5.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/glen-electric-air-fryer-2l-800w-sa3043/5.jpg', false, 4);
