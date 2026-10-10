-- JBL PartyBox Encore Essential 2 (brand JBL already exists)
INSERT INTO products (id, name, slug, description, short_description, sku, category_id, subcategory_id, brand_id, mrp, selling_price, discount_percent, stock_quantity, low_stock_threshold, weight_grams, length_cm, breadth_cm, height_cm, is_active, is_featured, is_deal_of_day, rating, review_count, sold_count, meta_title, meta_description) VALUES (
  '5aa797fd-837d-4585-a96c-b2e8257c07ff', 'JBL PartyBox Encore Essential 2 100W Bluetooth Party Speaker with Mic Black', 'jbl-partybox-encore-essential-2-black', 'JBL PartyBox Encore Essential 2 100W Bluetooth Party Speaker with Mic Black. A powerful 100W wireless party speaker with AI Sound Boost, up to 15 hours of playtime, Auracast multi-speaker pairing and mic + guitar inputs for karaoke and live play. Bluetooth 5.4, outdoor-ready, with a 4722mAh battery. Comes with a microphone.

KEY FEATURES:
- 100W powerful output with AI Sound Boost
- Up to 15 hours playtime on a single charge
- Auracast multi-speaker connection - pair two for true stereo
- Mic & guitar inputs for live singing and playing
- Bluetooth 5.4 (A2DP V1.4, AVRCP V1.6)
- 4722mAh Li-ion battery, 3.5hr charge time
- Outdoor-ready wireless party speaker
- Includes wired microphone in box', '100W | Stereo | 15Hr Playtime | AI Sound Boost | Auracast | Mic + Guitar Inputs | BT 5.4 | Outdoor | Includes Mic', 'JBL-PBENCOREESS2-BLK', '91b8a207-2b75-4fac-bcbb-bfe47474acec', '7ca820a6-6aec-4d30-8753-53b11f5f8ca4', (SELECT id FROM brands WHERE slug='jbl'), 29999, 14999, 50, 10, 3, 8000, 42, 40, 38, true, false, false, 4.4, 1500, 0, 'JBL PartyBox Encore Essential 2 100W Bluetooth Party Speaker with Mic Black at ₹14999 | BoxDeal', 'Buy JBL PartyBox Encore Essential 2 100W Bluetooth Party Speaker with Mic Black at ₹14999 (MRP ₹29999). 100W | Stereo | 15Hr Playtime | AI Sound Boost | Auracast | Mic + Guitar Inputs | BT 5.4 | Outdoor | Includes Mic');
INSERT INTO product_specifications (product_id, spec_group, spec_name, spec_value, sort_order) VALUES
  ('5aa797fd-837d-4585-a96c-b2e8257c07ff', 'General', 'Brand', 'JBL', 1),
  ('5aa797fd-837d-4585-a96c-b2e8257c07ff', 'General', 'Model', 'PartyBox Encore Essential 2', 2),
  ('5aa797fd-837d-4585-a96c-b2e8257c07ff', 'General', 'Type', 'Party Speaker', 3),
  ('5aa797fd-837d-4585-a96c-b2e8257c07ff', 'General', 'Configuration', 'Stereo', 4),
  ('5aa797fd-837d-4585-a96c-b2e8257c07ff', 'General', 'Colour', 'Black', 5),
  ('5aa797fd-837d-4585-a96c-b2e8257c07ff', 'General', 'Weight', '8 kg', 6),
  ('5aa797fd-837d-4585-a96c-b2e8257c07ff', 'General', 'Outdoor Usage', 'Yes', 7),
  ('5aa797fd-837d-4585-a96c-b2e8257c07ff', 'Audio', 'Output Power (RMS)', '100 W', 8),
  ('5aa797fd-837d-4585-a96c-b2e8257c07ff', 'Audio', 'Frequency Response', '60 - 20000 Hz', 9),
  ('5aa797fd-837d-4585-a96c-b2e8257c07ff', 'Audio', 'AI Sound Boost', 'Yes', 10),
  ('5aa797fd-837d-4585-a96c-b2e8257c07ff', 'Technical', 'Bluetooth', '5.4 (A2DP V1.4, AVRCP V1.6)', 11),
  ('5aa797fd-837d-4585-a96c-b2e8257c07ff', 'Technical', 'Auracast', 'Yes (multi-speaker)', 12),
  ('5aa797fd-837d-4585-a96c-b2e8257c07ff', 'Technical', 'Inputs', 'Mic + Guitar', 13),
  ('5aa797fd-837d-4585-a96c-b2e8257c07ff', 'Technical', 'Power Input', '100-240V, 50/60Hz', 14),
  ('5aa797fd-837d-4585-a96c-b2e8257c07ff', 'Battery', 'Capacity', '4722 mAh (Li-ion)', 15),
  ('5aa797fd-837d-4585-a96c-b2e8257c07ff', 'Battery', 'Playtime', 'Up to 15 hours', 16),
  ('5aa797fd-837d-4585-a96c-b2e8257c07ff', 'Battery', 'Charge Time', '3.5 hours', 17),
  ('5aa797fd-837d-4585-a96c-b2e8257c07ff', 'In the Box', 'Contents', 'Speaker, Microphone, Safety Sheet, Quick Start Guide, Warranty Card', 18);
INSERT INTO product_images (product_id, image_url, thumbnail_url, is_primary, sort_order) VALUES
  ('5aa797fd-837d-4585-a96c-b2e8257c07ff', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/jbl-partybox-encore-essential-2-black/1.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/jbl-partybox-encore-essential-2-black/1.jpg', true, 0),
  ('5aa797fd-837d-4585-a96c-b2e8257c07ff', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/jbl-partybox-encore-essential-2-black/2.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/jbl-partybox-encore-essential-2-black/2.jpg', false, 1),
  ('5aa797fd-837d-4585-a96c-b2e8257c07ff', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/jbl-partybox-encore-essential-2-black/3.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/jbl-partybox-encore-essential-2-black/3.jpg', false, 2),
  ('5aa797fd-837d-4585-a96c-b2e8257c07ff', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/jbl-partybox-encore-essential-2-black/4.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/jbl-partybox-encore-essential-2-black/4.jpg', false, 3),
  ('5aa797fd-837d-4585-a96c-b2e8257c07ff', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/jbl-partybox-encore-essential-2-black/5.jpg', 'https://fhyfxchcgnsvjhagpcrj.supabase.co/storage/v1/object/public/product-images/jbl-partybox-encore-essential-2-black/5.jpg', false, 4);