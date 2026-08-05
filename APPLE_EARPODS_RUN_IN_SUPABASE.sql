-- ===== 1. APPLE-EARPODS-LIGHTNING =====
INSERT INTO products (id, name, slug, description, short_description, sku, category_id, subcategory_id, brand_id, mrp, selling_price, discount_percent, stock_quantity, low_stock_threshold, weight_grams, length_cm, breadth_cm, height_cm, is_active, is_featured, is_deal_of_day, rating, review_count, sold_count, meta_title, meta_description) VALUES (
  'f40333fe-f8ff-4ab7-bb19-d9feacfa873a', 'Apple EarPods with Lightning Connector White', 'apple-earpods-lightning-white', 'Apple EarPods with Lightning Connector White.

KEY FEATURES:
- Ergonomic design shaped to the geometry of your ear
- High-quality audio - engineered to maximise output & minimise loss
- Lightning connector (for iPhone/iPad without headphone jack)
- Built-in remote - volume, playback & call controls
- Comfortable for long listening', 'Wired In-Ear | Lightning Connector | Built-in Remote & Mic | Volume & Playback Control | Designed by Apple', 'APPLE-EARPODS-LIGHTNING', 'b1832a09-4562-484f-8fd3-ad0c885d154a', '0ef6dafa-c3f4-4f58-bc8a-f894ee56c568', (SELECT id FROM brands WHERE slug='apple'), 2000, 1099, 45.05, 2, 1, 100, 7, 7, 3, true, false, false, 4.3, 12063, 0, 'Apple EarPods with Lightning Connector White at ₹1099 | BoxDeal', 'Buy Apple EarPods with Lightning Connector White at ₹1099 (MRP ₹2000). Wired In-Ear | Lightning Connector | Built-in Remote & Mic | Volume & Playback Control | Designed by Apple');
INSERT INTO product_specifications (product_id, spec_group, spec_name, spec_value, sort_order) VALUES
  ('f40333fe-f8ff-4ab7-bb19-d9feacfa873a', 'General', 'Brand', 'Apple', 1),
  ('f40333fe-f8ff-4ab7-bb19-d9feacfa873a', 'General', 'Model', 'MWTY3ZM/A', 2),
  ('f40333fe-f8ff-4ab7-bb19-d9feacfa873a', 'General', 'Colour', 'White', 3),
  ('f40333fe-f8ff-4ab7-bb19-d9feacfa873a', 'General', 'Form Factor', 'In Ear (Wired)', 4),
  ('f40333fe-f8ff-4ab7-bb19-d9feacfa873a', 'General', 'Weight', '50 g', 5),
  ('f40333fe-f8ff-4ab7-bb19-d9feacfa873a', 'General', 'Country of Origin', 'China', 6),
  ('f40333fe-f8ff-4ab7-bb19-d9feacfa873a', 'Technical', 'Connector', 'Lightning', 7),
  ('f40333fe-f8ff-4ab7-bb19-d9feacfa873a', 'Technical', 'Connectivity', 'Wired', 8),
  ('f40333fe-f8ff-4ab7-bb19-d9feacfa873a', 'Technical', 'Controls', 'Remote (Volume, Playback, Call)', 9),
  ('f40333fe-f8ff-4ab7-bb19-d9feacfa873a', 'In the Box', 'Contents', 'Apple EarPods with Lightning Connector', 10);
INSERT INTO product_images (product_id, image_url, thumbnail_url, is_primary, sort_order) VALUES
  ('f40333fe-f8ff-4ab7-bb19-d9feacfa873a', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/apple-earpods-lightning-white/1.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/apple-earpods-lightning-white/1.jpg', true, 0),
  ('f40333fe-f8ff-4ab7-bb19-d9feacfa873a', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/apple-earpods-lightning-white/2.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/apple-earpods-lightning-white/2.jpg', false, 1),
  ('f40333fe-f8ff-4ab7-bb19-d9feacfa873a', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/apple-earpods-lightning-white/3.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/apple-earpods-lightning-white/3.jpg', false, 2),
  ('f40333fe-f8ff-4ab7-bb19-d9feacfa873a', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/apple-earpods-lightning-white/4.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/apple-earpods-lightning-white/4.jpg', false, 3),
  ('f40333fe-f8ff-4ab7-bb19-d9feacfa873a', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/apple-earpods-lightning-white/5.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/apple-earpods-lightning-white/5.jpg', false, 4);

-- ===== 2. APPLE-EARPODS-35MM =====
INSERT INTO products (id, name, slug, description, short_description, sku, category_id, subcategory_id, brand_id, mrp, selling_price, discount_percent, stock_quantity, low_stock_threshold, weight_grams, length_cm, breadth_cm, height_cm, is_active, is_featured, is_deal_of_day, rating, review_count, sold_count, meta_title, meta_description) VALUES (
  'b6b70e1d-1cc7-48cb-8ad9-ce760c3adb86', 'Apple EarPods with 3.5mm Headphone Plug White', 'apple-earpods-3-5mm-white', 'Apple EarPods with 3.5mm Headphone Plug White.

KEY FEATURES:
- Ergonomic design shaped to the geometry of your ear
- High-quality audio - engineered to maximise output & minimise loss
- 3.5mm headphone jack - works with all 3.5mm devices
- Built-in remote & mic - volume, playback & call controls
- Comfortable universal fit', 'Wired In-Ear | 3.5mm Jack | Built-in Remote & Mic | Volume & Playback Control | Universal Compatibility', 'APPLE-EARPODS-35MM', 'b1832a09-4562-484f-8fd3-ad0c885d154a', '0ef6dafa-c3f4-4f58-bc8a-f894ee56c568', (SELECT id FROM brands WHERE slug='apple'), 2000, 750, 62.5, 2, 1, 100, 7, 7, 3, true, false, false, 4.1, 2919, 0, 'Apple EarPods with 3.5mm Headphone Plug White at ₹750 | BoxDeal', 'Buy Apple EarPods with 3.5mm Headphone Plug White at ₹750 (MRP ₹2000). Wired In-Ear | 3.5mm Jack | Built-in Remote & Mic | Volume & Playback Control | Universal Compatibility');
INSERT INTO product_specifications (product_id, spec_group, spec_name, spec_value, sort_order) VALUES
  ('b6b70e1d-1cc7-48cb-8ad9-ce760c3adb86', 'General', 'Brand', 'Apple', 1),
  ('b6b70e1d-1cc7-48cb-8ad9-ce760c3adb86', 'General', 'Model', 'MWU53ZM/A', 2),
  ('b6b70e1d-1cc7-48cb-8ad9-ce760c3adb86', 'General', 'Colour', 'White', 3),
  ('b6b70e1d-1cc7-48cb-8ad9-ce760c3adb86', 'General', 'Form Factor', 'In Ear (Wired)', 4),
  ('b6b70e1d-1cc7-48cb-8ad9-ce760c3adb86', 'General', 'Weight', '50 g', 5),
  ('b6b70e1d-1cc7-48cb-8ad9-ce760c3adb86', 'Technical', 'Connector', '3.5mm Jack', 6),
  ('b6b70e1d-1cc7-48cb-8ad9-ce760c3adb86', 'Technical', 'Connectivity', 'Wired', 7),
  ('b6b70e1d-1cc7-48cb-8ad9-ce760c3adb86', 'Technical', 'Controls', 'Remote + Mic (Volume, Playback, Call)', 8),
  ('b6b70e1d-1cc7-48cb-8ad9-ce760c3adb86', 'Technical', 'Compatible', 'All 3.5mm jack devices', 9),
  ('b6b70e1d-1cc7-48cb-8ad9-ce760c3adb86', 'In the Box', 'Contents', 'Apple EarPods with 3.5mm Headphone Plug', 10);
INSERT INTO product_images (product_id, image_url, thumbnail_url, is_primary, sort_order) VALUES
  ('b6b70e1d-1cc7-48cb-8ad9-ce760c3adb86', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/apple-earpods-3-5mm-white/1.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/apple-earpods-3-5mm-white/1.jpg', true, 0),
  ('b6b70e1d-1cc7-48cb-8ad9-ce760c3adb86', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/apple-earpods-3-5mm-white/2.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/apple-earpods-3-5mm-white/2.jpg', false, 1),
  ('b6b70e1d-1cc7-48cb-8ad9-ce760c3adb86', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/apple-earpods-3-5mm-white/3.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/apple-earpods-3-5mm-white/3.jpg', false, 2),
  ('b6b70e1d-1cc7-48cb-8ad9-ce760c3adb86', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/apple-earpods-3-5mm-white/4.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/apple-earpods-3-5mm-white/4.jpg', false, 3),
  ('b6b70e1d-1cc7-48cb-8ad9-ce760c3adb86', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/apple-earpods-3-5mm-white/5.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/apple-earpods-3-5mm-white/5.jpg', false, 4);
