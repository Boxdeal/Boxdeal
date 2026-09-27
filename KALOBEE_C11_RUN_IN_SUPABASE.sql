-- Kalobee C11 Vlogging Camera (brand & Action Camera subcategory already exist)
INSERT INTO products (id, name, slug, description, short_description, sku, category_id, subcategory_id, brand_id, mrp, selling_price, discount_percent, stock_quantity, low_stock_threshold, weight_grams, length_cm, breadth_cm, height_cm, is_active, is_featured, is_deal_of_day, rating, review_count, sold_count, meta_title, meta_description) VALUES (
  '288b4720-00bd-46ca-8790-cc39d8d0bd78', 'Kalobee C11 Vlogging Camera with 180° Rotating Lens & 32GB Card Black', 'kalobee-c11-vlogging-camera', 'Kalobee C11 Vlogging Camera with 180° Rotating Lens & 32GB Card Black. A compact pocket vlogging & POV camera with a 180° rotating lens, 1080P audio + video recording, 1.97" display, WiFi, night vision and up to 7 hours of battery. Comes with a 32GB card and one-button recording - perfect for travel and daily life.

KEY FEATURES:
- 180° rotating lens for flexible POV & selfie shots
- 1080P HD video + 3M/2M/1M photo recording
- 1.97 inch display screen
- Built-in WiFi - connect to phone app (DV11)
- Night vision lamp for low-light recording
- Up to 7-hour battery life
- Loop recording, motion detection & time-stamp
- Easy one-button recording
- 32GB TF card included - great for travel & vlogging
- Pocket-size handheld body', '180° Rotating Lens | 1080P Video | 1.97" Display | WiFi | Night Vision | 7Hr Battery | 32GB Card | One-Button Recording', 'KALOBEE-C11', '0e92eb22-430e-4db6-b54c-ce0f2b76bf4d', (SELECT id FROM subcategories WHERE slug='action-camera'), (SELECT id FROM brands WHERE slug='kalobee'), 49999, 3499, 93, 2, 1, 500, 16, 9, 5, true, false, false, 4.5, 180, 0, 'Kalobee C11 Vlogging Camera with 180° Rotating Lens & 32GB Card Black at ₹3499 | BoxDeal', 'Buy Kalobee C11 Vlogging Camera with 180° Rotating Lens & 32GB Card Black at ₹3499 (MRP ₹49999). 180° Rotating Lens | 1080P Video | 1.97" Display | WiFi | Night Vision | 7Hr Battery | 32GB Card | One-Button Recording');
INSERT INTO product_specifications (product_id, spec_group, spec_name, spec_value, sort_order) VALUES
  ('288b4720-00bd-46ca-8790-cc39d8d0bd78', 'General', 'Brand', 'Kalobee', 1),
  ('288b4720-00bd-46ca-8790-cc39d8d0bd78', 'General', 'Model', 'C11 (DV11)', 2),
  ('288b4720-00bd-46ca-8790-cc39d8d0bd78', 'General', 'Type', 'Vlogging / Action Camera', 3),
  ('288b4720-00bd-46ca-8790-cc39d8d0bd78', 'General', 'Colour', 'Black', 4),
  ('288b4720-00bd-46ca-8790-cc39d8d0bd78', 'General', 'Lens', '314A, 180° Rotating', 5),
  ('288b4720-00bd-46ca-8790-cc39d8d0bd78', 'Video', 'Recording', '1080P / 720P', 6),
  ('288b4720-00bd-46ca-8790-cc39d8d0bd78', 'Video', 'Format', 'AVI', 7),
  ('288b4720-00bd-46ca-8790-cc39d8d0bd78', 'Video', 'Loop Recording', 'Off / 3 / 5 / 10 min', 8),
  ('288b4720-00bd-46ca-8790-cc39d8d0bd78', 'Photo', 'Resolution', '3M / 2M / 1M', 9),
  ('288b4720-00bd-46ca-8790-cc39d8d0bd78', 'Photo', 'Format', 'JPG', 10),
  ('288b4720-00bd-46ca-8790-cc39d8d0bd78', 'Display', 'Screen Size', '1.97 inch', 11),
  ('288b4720-00bd-46ca-8790-cc39d8d0bd78', 'Audio', 'Format', 'WAV', 12),
  ('288b4720-00bd-46ca-8790-cc39d8d0bd78', 'Technical', 'WiFi', 'Yes (app control)', 13),
  ('288b4720-00bd-46ca-8790-cc39d8d0bd78', 'Technical', 'Night Vision', 'Yes (IR lamp)', 14),
  ('288b4720-00bd-46ca-8790-cc39d8d0bd78', 'Technical', 'Motion Detection', 'Yes', 15),
  ('288b4720-00bd-46ca-8790-cc39d8d0bd78', 'Technical', 'Storage', 'TF Card (32GB included)', 16),
  ('288b4720-00bd-46ca-8790-cc39d8d0bd78', 'Technical', 'Interface', 'USB Type-C', 17),
  ('288b4720-00bd-46ca-8790-cc39d8d0bd78', 'Battery', 'Type', '3.7V Lithium (USB 5V charging)', 18),
  ('288b4720-00bd-46ca-8790-cc39d8d0bd78', 'Battery', 'Life', 'Up to 7 hours', 19),
  ('288b4720-00bd-46ca-8790-cc39d8d0bd78', 'In the Box', 'Contents', 'Camera, 32GB TF Card, USB Cable, User Manual', 20);
INSERT INTO product_images (product_id, image_url, thumbnail_url, is_primary, sort_order) VALUES
  ('288b4720-00bd-46ca-8790-cc39d8d0bd78', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/kalobee-c11-vlogging-camera/1.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/kalobee-c11-vlogging-camera/1.jpg', true, 0),
  ('288b4720-00bd-46ca-8790-cc39d8d0bd78', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/kalobee-c11-vlogging-camera/2.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/kalobee-c11-vlogging-camera/2.jpg', false, 1),
  ('288b4720-00bd-46ca-8790-cc39d8d0bd78', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/kalobee-c11-vlogging-camera/3.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/kalobee-c11-vlogging-camera/3.jpg', false, 2),
  ('288b4720-00bd-46ca-8790-cc39d8d0bd78', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/kalobee-c11-vlogging-camera/4.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/kalobee-c11-vlogging-camera/4.jpg', false, 3),
  ('288b4720-00bd-46ca-8790-cc39d8d0bd78', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/kalobee-c11-vlogging-camera/5.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/kalobee-c11-vlogging-camera/5.jpg', false, 4);