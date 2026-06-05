-- ============================================================
-- BoxDeal Seed Data
-- Run AFTER schema.sql and functions.sql
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- CATEGORY: Earbuds
-- ────────────────────────────────────────────────────────────
INSERT INTO categories (name, slug, description, is_active, sort_order)
VALUES ('Earbuds', 'earbuds', 'True wireless earbuds, sports earbuds and open-ear designs for every lifestyle', true, 1)
ON CONFLICT (slug) DO NOTHING;

-- ────────────────────────────────────────────────────────────
-- BRANDS
-- ────────────────────────────────────────────────────────────
INSERT INTO brands (name, slug, is_active) VALUES
  ('Jabra',  'jabra',  true),
  ('realme', 'realme', true),
  ('Sony',   'sony',   true),
  ('Apple',  'apple',  true)
ON CONFLICT (slug) DO NOTHING;

-- ────────────────────────────────────────────────────────────
-- COUPON: SAVE500 (flat ₹500 off on any order)
-- ────────────────────────────────────────────────────────────
INSERT INTO coupons (code, discount_type, discount_value, min_order_amount, usage_limit, is_active, expires_at)
VALUES ('SAVE500', 'flat', 500.00, 1000.00, 1000, true, '2027-01-01 00:00:00+00')
ON CONFLICT (code) DO NOTHING;


-- ============================================================
-- PRODUCT 1: Jabra Elite Active 75t
-- ============================================================
INSERT INTO products (
  name, slug, sku,
  description, short_description,
  category_id, brand_id,
  mrp, selling_price,
  stock_quantity, low_stock_threshold, weight_grams,
  is_active, is_featured, is_deal_of_day,
  meta_title, meta_description
)
SELECT
  'Jabra Elite Active 75t True Wireless Earbuds',
  'jabra-elite-active-75t',
  'JABRA-ELITE-75T-BLK',
  'Jabra Elite Active 75t True Wireless In Ear Bluetooth Sports Earbuds with Mic, Compact Design, 4th Generation, Voice Assistant Enabled, 28 Hours Battery — Unboxed.

WIRELESS EARBUDS – Jabra Elite 75t is engineered to fit. Making and taking calls is always a great experience, wherever you are, thanks to enhanced 4-microphone call technology which filters out wind and other disruptive noises around you.

COMPACT COMFORT – Designed and tested for a secure fit, the Jabra Elite 75t features a new smaller design that provides an ideal fit for every type of ear while the ergonomic shape makes them exceptionally comfortable.

NO AUDIO DROPOUTS – With Jabra 4th generation true wireless connection, your music and calls will be stable, with no wires to get in the way.

ACTIVE NOISE CANCELLATION – Filter out the world and focus on your music. Use the Sound Plus app to activate ANC and enable toggling between ANC and HearThrough via your earbud button.

LONG BATTERY LIFE – Get up to 24 hours of battery time with ANC on, and up to 28 hours without ANC, with the pocket-friendly charging case.',
  '4-mic ANC sports earbuds | 28hr battery | Bluetooth 5.0 | Sport secure fit',
  (SELECT id FROM categories WHERE slug = 'earbuds'),
  (SELECT id FROM brands WHERE slug = 'jabra'),
  16999.00, 4499.00,
  50, 5, 180,
  true, true, true,
  'Jabra Elite Active 75t Wireless Earbuds at ₹4499 | BoxDeal',
  'Buy Jabra Elite Active 75t True Wireless Earbuds at best price ₹4499. ANC, 28hr battery, 4-mic, Bluetooth 5.0. Use code SAVE500 for extra ₹500 off.'
ON CONFLICT (slug) DO NOTHING;

-- Jabra Specifications
INSERT INTO product_specifications (product_id, spec_group, spec_name, spec_value, sort_order)
SELECT p.id, s.grp, s.name, s.val, s.ord
FROM products p
JOIN (VALUES
  ('General',    'Brand',              'Jabra',                                       1),
  ('General',    'Model Name',         'Elite 75t',                                   2),
  ('General',    'Color',              'Titanium Black',                              3),
  ('General',    'Form Factor',        'In Ear (True Wireless)',                      4),
  ('General',    'Country of Origin',  'China',                                       5),
  ('General',    'Item Weight',        '180 g',                                       6),
  ('General',    'Dimensions',         '6.2 × 3.7 × 2.7 cm',                         7),
  ('Technical',  'Connectivity',       'Bluetooth 5.0',                               8),
  ('Technical',  'Bluetooth Profiles', 'HSP v1.2, HFP v1.7, A2DP v1.3, AVRCP v1.6', 9),
  ('Technical',  'Microphone',         '4-mic built-in (wind & noise filter)',        10),
  ('Technical',  'Noise Cancellation', 'Active Noise Cancellation (ANC)',             11),
  ('Technical',  'Connector Type',     'Wireless (no cable)',                         12),
  ('Technical',  'Material',           'Titanium',                                    13),
  ('Technical',  'Voice Assistant',    'Yes (Alexa, Google, Siri)',                   14),
  ('Battery',    'Earbud Battery',     'Up to 7.5 hrs (ANC off) / 5.5 hrs (ANC on)', 15),
  ('Battery',    'Total with Case',    'Up to 28 hrs (ANC off) / 24 hrs (ANC on)',   16),
  ('Battery',    'Battery Type',       'Lithium Ion (included)',                      17),
  ('Battery',    'Rechargeable',       'Yes',                                         18),
  ('In the Box', 'Package Contents',   'Earbuds × 2, Charging Case, USB-C Cable, Ear Tips (3 sizes)', 19)
) AS s(grp, name, val, ord) ON true
WHERE p.slug = 'jabra-elite-active-75t';

-- Jabra Images
-- Upload: product-images/jabra-elite-active-75t/1.jpg through 5.jpg in Supabase Storage
INSERT INTO product_images (product_id, image_url, thumbnail_url, is_primary, sort_order)
SELECT p.id, img.url, img.url, img.is_pri, img.ord
FROM products p
JOIN (VALUES
  ('https://rsalkgadgpdtjngwvcet.supabase.co/storage/v1/object/public/product-images/jabra-elite-active-75t/1.jpg', true,  0),
  ('https://rsalkgadgpdtjngwvcet.supabase.co/storage/v1/object/public/product-images/jabra-elite-active-75t/2.jpg', false, 1),
  ('https://rsalkgadgpdtjngwvcet.supabase.co/storage/v1/object/public/product-images/jabra-elite-active-75t/3.jpg', false, 2),
  ('https://rsalkgadgpdtjngwvcet.supabase.co/storage/v1/object/public/product-images/jabra-elite-active-75t/4.jpg', false, 3),
  ('https://rsalkgadgpdtjngwvcet.supabase.co/storage/v1/object/public/product-images/jabra-elite-active-75t/5.jpg', false, 4)
) AS img(url, is_pri, ord) ON true
WHERE p.slug = 'jabra-elite-active-75t';


-- ============================================================
-- PRODUCT 2: realme Buds Air Neo
-- ============================================================
INSERT INTO products (
  name, slug, sku,
  description, short_description,
  category_id, brand_id,
  mrp, selling_price,
  stock_quantity, low_stock_threshold, weight_grams,
  is_active, is_featured, is_deal_of_day,
  meta_title, meta_description
)
SELECT
  'realme Buds Air Neo True Wireless Earbuds',
  'realme-buds-air-neo',
  'REALME-BUDS-AIR-NEO',
  'True Wireless. Real Choice. realme Buds Air Neo powered by the R1 True Wireless Chip.

INSTANT AUTO CONNECTION – R1 Chip uses a new generation of dual-channel transmission technology. Open the case and the earbuds connect instantly to your phone via Google Fast Pair.

13MM LARGE BASS BOOST DRIVER – High-quality polyurethane and titanium driver delivers deep powerful bass and clear treble. Dynamic Bass Boost (DBB) adds further dynamism to your music.

SUPER LOW LATENCY GAMING MODE – 119.2ms latency with Super Low Latency Mode — 51% lower than standard. Perfect sync between video and audio while gaming or watching movies.

17 HOURS TOTAL BATTERY LIFE – 3 hours single playback, 17 hours total with charging case. Charged via Micro USB.

INTELLIGENT TOUCH CONTROLS – Double-tap to play/pause or answer calls. Triple-tap for next song. Press and hold for voice assistant. All controls customizable via realme Link app.

IPX4 WATER RESISTANT – Splash and sweat resistant for active use.

HALF IN-EAR DESIGN – Optimized curvature for comfortable fit. Single earbud weighs just 4.1g.',
  'R1 chip | 13mm Bass driver | 119ms low latency | 17hr battery | IPX4',
  (SELECT id FROM categories WHERE slug = 'earbuds'),
  (SELECT id FROM brands WHERE slug = 'realme'),
  2999.00, 1999.00,
  80, 10, 35,
  true, false, false,
  'realme Buds Air Neo True Wireless Earbuds at ₹1999 | BoxDeal',
  'Buy realme Buds Air Neo at best price ₹1999. R1 chip, 13mm bass driver, gaming mode 119ms, IPX4, 17hr battery. Use SAVE500 for ₹500 off.'
ON CONFLICT (slug) DO NOTHING;

-- realme Specifications
INSERT INTO product_specifications (product_id, spec_group, spec_name, spec_value, sort_order)
SELECT p.id, s.grp, s.name, s.val, s.ord
FROM products p
JOIN (VALUES
  ('General',    'Brand',              'realme',                                1),
  ('General',    'Model Name',         'Buds Air Neo',                          2),
  ('General',    'Colors Available',   'Pop White, Punk Green, Rock Red',        3),
  ('General',    'Form Factor',        'Half In-Ear (True Wireless)',            4),
  ('General',    'Waterproof Level',   'IPX4 (earphones)',                      5),
  ('General',    'Earphone Weight',    '4.1g (single) | Case: 30.5g',           6),
  ('General',    'Dimensions',         'Earphone: 40.5×16.59×17.70mm | Case: 51.3×45.25×25.3mm', 7),
  ('Technical',  'Chip',               'realme R1 True Wireless Chip',          8),
  ('Technical',  'Connectivity',       'Bluetooth 5.0',                         9),
  ('Technical',  'Wireless Range',     '10m (30ft)',                            10),
  ('Technical',  'Audio Codec',        'SBC, AAC',                              11),
  ('Technical',  'Frequency Range',    '20Hz – 20000Hz',                        12),
  ('Technical',  'Sensitivity',        '-88 dB',                                13),
  ('Technical',  'Driver Size',        '13mm Bass Boost Driver',                14),
  ('Technical',  'Charging Interface', 'Micro USB',                             15),
  ('Technical',  'Latency (Gaming)',   '119.2ms (Super Low Latency Mode)',      16),
  ('Technical',  'Voice Assistant',    'Google Assistant (via realme Link app)',17),
  ('Battery',    'Single Playback',    '3 hrs (music) | 1.5 hrs (calls)',       18),
  ('Battery',    'Total with Case',    '17 hours',                              19),
  ('In the Box', 'Package Contents',   'Earbuds × 2 (L+R), Charging Case, Micro USB Cable, User Guide', 20)
) AS s(grp, name, val, ord) ON true
WHERE p.slug = 'realme-buds-air-neo';

-- realme Images
-- Upload: product-images/realme-buds-air-neo/1.jpg through 5.jpg in Supabase Storage
INSERT INTO product_images (product_id, image_url, thumbnail_url, is_primary, sort_order)
SELECT p.id, img.url, img.url, img.is_pri, img.ord
FROM products p
JOIN (VALUES
  ('https://rsalkgadgpdtjngwvcet.supabase.co/storage/v1/object/public/product-images/realme-buds-air-neo/1.jpg', true,  0),
  ('https://rsalkgadgpdtjngwvcet.supabase.co/storage/v1/object/public/product-images/realme-buds-air-neo/2.jpg', false, 1),
  ('https://rsalkgadgpdtjngwvcet.supabase.co/storage/v1/object/public/product-images/realme-buds-air-neo/3.jpg', false, 2),
  ('https://rsalkgadgpdtjngwvcet.supabase.co/storage/v1/object/public/product-images/realme-buds-air-neo/4.jpg', false, 3),
  ('https://rsalkgadgpdtjngwvcet.supabase.co/storage/v1/object/public/product-images/realme-buds-air-neo/5.jpg', false, 4)
) AS img(url, is_pri, ord) ON true
WHERE p.slug = 'realme-buds-air-neo';


-- ============================================================
-- PRODUCT 3: Sony WF-L900 LinkBuds
-- ============================================================
INSERT INTO products (
  name, slug, sku,
  description, short_description,
  category_id, brand_id,
  mrp, selling_price,
  stock_quantity, low_stock_threshold, weight_grams,
  is_active, is_featured, is_deal_of_day,
  meta_title, meta_description
)
SELECT
  'Sony WF-L900 LinkBuds True Wireless Open Earbuds (Dark Gray)',
  'sony-wf-l900-linkbuds',
  'SONY-WF-L900-GRAY',
  'Sony LinkBuds — Never off. Always on.

12MM OPEN-RING DRIVER – The unique donut-shaped open-ring driver sits just outside your ear canal. You stay connected to your surroundings while enjoying clear audio — no pressure, no isolation.

V1 PROCESSOR – Sony''s V1 processor balances playback with clear mids and highs, supports DSEE audio enhancement, and powers stable direct Bluetooth transmission to each earbud.

PRECISE VOICE PICKUP – Noise reduction algorithm trained on 500 million+ voice samples focuses on your voice during calls, filtering out ambient noise for crystal-clear conversations.

WIDE AREA TAP – Control music by tapping the skin in front of your ears — no need to touch the earbuds themselves. Double-tap or triple-tap for playback controls.

SPEAK TO CHAT – Automatically pauses music when you speak and resumes when you stop. Combined with the open design, conversations feel completely natural.

ADAPTIVE VOLUME CONTROL – Automatically adjusts volume based on ambient noise levels around you.

UP TO 17.5 HOURS TOTAL BATTERY – 5.5 hours in earbuds + 12 hours from charging case. Quick charge: 10 minutes = 90 minutes of playback.

IPX4 WATER RESISTANT – Safe for rain, sweat, and active use.

ECO-FRIENDLY – Constructed from recycled plastic sourced from automobile parts. Plastic-free packaging.

EASY PAIRING – Supports Google Fast Pair (Android) and Windows Swift Pair (Windows 10/11).',
  'Open-ring driver | Always-on awareness | V1 chip | Wide Area Tap | IPX4 | Eco-friendly',
  (SELECT id FROM categories WHERE slug = 'earbuds'),
  (SELECT id FROM brands WHERE slug = 'sony'),
  19999.00, 10499.00,
  30, 5, 34,
  true, true, false,
  'Sony WF-L900 LinkBuds Open Earbuds at ₹10499 | BoxDeal',
  'Buy Sony WF-L900 LinkBuds True Wireless Open Earbuds at ₹10499. Open-ring driver, V1 processor, Wide Area Tap, IPX4, 17.5hr total battery. Use SAVE500 for ₹500 off.'
ON CONFLICT (slug) DO NOTHING;

-- Sony Specifications
INSERT INTO product_specifications (product_id, spec_group, spec_name, spec_value, sort_order)
SELECT p.id, s.grp, s.name, s.val, s.ord
FROM products p
JOIN (VALUES
  ('General',    'Brand',              'Sony',                                  1),
  ('General',    'Model Name',         'WF-L900 LinkBuds',                     2),
  ('General',    'Color',              'Dark Gray',                             3),
  ('General',    'Form Factor',        'Open-Ear (Intra-Concha, Open-Back)',    4),
  ('General',    'Material',           'Recycled Plastic',                      5),
  ('General',    'Earphone Weight',    '4.1g (each) | Case: 34g',              6),
  ('General',    'Case Dimensions',    '48.5 × 41.4 × 30.9 mm',               7),
  ('General',    'Country',           'Japan (Sony)',                           8),
  ('Technical',  'Driver Type',        'Dynamic Open-Ring Driver',              9),
  ('Technical',  'Driver Size',        '12mm',                                  10),
  ('Technical',  'Magnet Type',        'Neodymium',                             11),
  ('Technical',  'Connectivity',       'Bluetooth 5.2',                         12),
  ('Technical',  'Audio Codec',        'SBC, AAC',                              13),
  ('Technical',  'Bluetooth Profiles', 'A2DP, AVRCP, HFP, HSP',               14),
  ('Technical',  'Wireless Range',     '10m (32.8ft)',                          15),
  ('Technical',  'Frequency Response', '20Hz – 20kHz',                          16),
  ('Technical',  'Voice Mics',         '2 per side',                            17),
  ('Technical',  'Active Noise Cancel','No (open-ear design)',                   18),
  ('Technical',  'Water Resistance',   'IPX4',                                  19),
  ('Technical',  'Charging Port',      'USB-C',                                 20),
  ('Features',   'Wide Area Tap',      'Control music by tapping skin near ear',21),
  ('Features',   'Speak to Chat',      'Auto-pauses on speech detection',       22),
  ('Features',   'Adaptive Volume',    'Auto-adjusts based on ambient noise',   23),
  ('Features',   'Voice Assistant',    'Google Assistant, Amazon Alexa',        24),
  ('Features',   'Fast Pairing',       'Google Fast Pair, Windows Swift Pair',  25),
  ('Battery',    'Earbuds Playback',   '5.5 hours (music) | 2.5 hours (calls)',26),
  ('Battery',    'Total with Case',    '17.5 hours (music)',                    27),
  ('Battery',    'Quick Charge',       '10 min charge = 90 min playback',       28),
  ('Battery',    'Wireless Charging',  'No',                                    29),
  ('In the Box', 'Package Contents',   'Earbuds × 2, Charging Case, USB-C Cable, 5 pairs Ear Supporters', 30)
) AS s(grp, name, val, ord) ON true
WHERE p.slug = 'sony-wf-l900-linkbuds';

-- Sony Images
-- Upload: product-images/sony-wf-l900-linkbuds/1.jpg through 5.jpg in Supabase Storage
INSERT INTO product_images (product_id, image_url, thumbnail_url, is_primary, sort_order)
SELECT p.id, img.url, img.url, img.is_pri, img.ord
FROM products p
JOIN (VALUES
  ('https://rsalkgadgpdtjngwvcet.supabase.co/storage/v1/object/public/product-images/sony-wf-l900-linkbuds/1.jpg', true,  0),
  ('https://rsalkgadgpdtjngwvcet.supabase.co/storage/v1/object/public/product-images/sony-wf-l900-linkbuds/2.jpg', false, 1),
  ('https://rsalkgadgpdtjngwvcet.supabase.co/storage/v1/object/public/product-images/sony-wf-l900-linkbuds/3.jpg', false, 2),
  ('https://rsalkgadgpdtjngwvcet.supabase.co/storage/v1/object/public/product-images/sony-wf-l900-linkbuds/4.jpg', false, 3),
  ('https://rsalkgadgpdtjngwvcet.supabase.co/storage/v1/object/public/product-images/sony-wf-l900-linkbuds/5.jpg', false, 4)
) AS img(url, is_pri, ord) ON true
WHERE p.slug = 'sony-wf-l900-linkbuds';


-- ============================================================
-- PRODUCT 4: Apple AirPods (1st Generation)
-- ============================================================
INSERT INTO products (
  name, slug, sku,
  description, short_description,
  category_id, brand_id,
  mrp, selling_price,
  stock_quantity, low_stock_threshold, weight_grams,
  is_active, is_featured, is_deal_of_day,
  meta_title, meta_description
)
SELECT
  'Apple AirPods (1st Generation) with Charging Case',
  'apple-airpods-1',
  'APPLE-AIRPODS-1ST-GEN',
  'Wireless. Effortless. Magical.

AirPods forever changed the way you use headphones. Pull them out of the charging case and they instantly turn on and connect to your iPhone, Apple Watch, iPad, or Mac. Audio automatically plays as soon as you put them in your ears and pauses when you take them out.

APPLE W1 CHIP – The custom W1 chip manages battery life with extreme efficiency and delivers a fast, stable wireless connection. Dual beamforming microphones and motion-detecting accelerometers ensure calls are crystal clear.

AUTOMATIC EAR DETECTION – Optical sensors and a motion accelerometer detect when AirPods are in your ears. Audio routes automatically whether you use both AirPods or just one.

5 HOURS LISTENING + 24 HOURS TOTAL – AirPods deliver 5 hours of listening time on a single charge. The charging case holds multiple additional charges for more than 24 hours total listening time. Just 15 minutes in the case gives you 3 hours of listening time.

QUICK SIRI ACCESS – Double-tap either AirPod to activate Siri. Adjust volume, change songs, make calls, get directions — all hands-free.

SEAMLESS APPLE ECOSYSTEM – One-tap setup for all your Apple devices. Instant switching between iPhone, Apple Watch, iPad, and Mac.',
  'Apple W1 chip | Auto ear-detection | 24hr total battery | Instant Siri | Seamless Apple pairing',
  (SELECT id FROM categories WHERE slug = 'earbuds'),
  (SELECT id FROM brands WHERE slug = 'apple'),
  12900.00, 5999.00,
  40, 5, 38,
  true, true, false,
  'Apple AirPods 1st Generation at ₹5999 | BoxDeal',
  'Buy Apple AirPods 1st Generation at best price ₹5999. W1 chip, 24hr total battery, auto ear-detection, instant Siri. Use SAVE500 for ₹500 off.'
ON CONFLICT (slug) DO NOTHING;

-- AirPods Specifications
INSERT INTO product_specifications (product_id, spec_group, spec_name, spec_value, sort_order)
SELECT p.id, s.grp, s.name, s.val, s.ord
FROM products p
JOIN (VALUES
  ('General',        'Brand',              'Apple',                                    1),
  ('General',        'Model Name',         'AirPods (1st Generation)',                 2),
  ('General',        'Color',              'White',                                    3),
  ('General',        'Form Factor',        'In-Ear (Open)',                            4),
  ('General',        'Connectivity',       'Bluetooth',                                5),
  ('General',        'Earphone Weight',    '4g (each) | Case: 38g',                   6),
  ('General',        'Earphone Dimensions','16.5 × 18.0 × 40.5 mm',                  7),
  ('General',        'Case Dimensions',    '44.3 × 21.3 × 53.5 mm',                  8),
  ('Technical',      'Chip',               'Apple W1',                                9),
  ('Technical',      'Microphone',         'Dual beamforming mics (built-in)',         10),
  ('Technical',      'Sensors',            'Dual optical sensors, Motion accelerometer, Speech accelerometer', 11),
  ('Technical',      'Connector (Case)',   'Lightning',                                12),
  ('Technical',      'Noise Cancellation', 'No',                                       13),
  ('Battery',        'Single Charge',      'Up to 5 hours listening',                 14),
  ('Battery',        'Total with Case',    'More than 24 hours listening',            15),
  ('Battery',        'Quick Charge',       '15 min in case = 3 hours listening',       16),
  ('Compatibility',  'iPhone / iPad',      'iOS 10 or later',                          17),
  ('Compatibility',  'Apple Watch',        'watchOS 3 or later',                       18),
  ('Compatibility',  'Mac',                'macOS Sierra or later',                    19),
  ('Compatibility',  'Requires',           'iCloud account for seamless device switching', 20),
  ('Features',       'Voice Assistant',    'Siri (double-tap activation)',             21),
  ('Features',       'Auto Ear Detection', 'Yes — pauses when removed',               22),
  ('Features',       'Accessibility',      'Live Listen, Assistive Switch Control',    23),
  ('In the Box',     'Package Contents',   'AirPods × 2, Charging Case (Lightning), Lightning to USB Cable, Documentation', 24)
) AS s(grp, name, val, ord) ON true
WHERE p.slug = 'apple-airpods-1';

-- AirPods Images
-- Upload: product-images/apple-airpods-1/1.jpg through 5.jpg in Supabase Storage
INSERT INTO product_images (product_id, image_url, thumbnail_url, is_primary, sort_order)
SELECT p.id, img.url, img.url, img.is_pri, img.ord
FROM products p
JOIN (VALUES
  ('https://rsalkgadgpdtjngwvcet.supabase.co/storage/v1/object/public/product-images/apple-airpods-1/1.jpg', true,  0),
  ('https://rsalkgadgpdtjngwvcet.supabase.co/storage/v1/object/public/product-images/apple-airpods-1/2.jpg', false, 1),
  ('https://rsalkgadgpdtjngwvcet.supabase.co/storage/v1/object/public/product-images/apple-airpods-1/3.jpg', false, 2),
  ('https://rsalkgadgpdtjngwvcet.supabase.co/storage/v1/object/public/product-images/apple-airpods-1/4.jpg', false, 3),
  ('https://rsalkgadgpdtjngwvcet.supabase.co/storage/v1/object/public/product-images/apple-airpods-1/5.jpg', false, 4)
) AS img(url, is_pri, ord) ON true
WHERE p.slug = 'apple-airpods-1';
