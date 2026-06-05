-- ============================================================
-- BoxDeal — Gaming Headphones (5 Products)
-- Run AFTER schema.sql and categories.sql
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- BRANDS
-- ────────────────────────────────────────────────────────────
INSERT INTO brands (name, slug, is_active) VALUES
  ('JBL',          'jbl',          true),
  ('ZEBRONICS',    'zebronics',    true),
  ('FRONTECH',     'frontech',     true),
  ('Ant Esports',  'ant-esports',  true)
ON CONFLICT (slug) DO NOTHING;


-- ============================================================
-- PRODUCT 1: JBL Quantum 100M2
-- ============================================================
INSERT INTO products (
  name, slug, sku,
  description, short_description,
  category_id, subcategory_id, brand_id,
  mrp, selling_price,
  stock_quantity, low_stock_threshold, weight_grams,
  is_active, is_featured, is_deal_of_day,
  rating, review_count,
  meta_title, meta_description
)
SELECT
  'JBL Quantum 100M2 Wired Gaming Headphones',
  'jbl-quantum-100m2-white',
  'JBL-QTUM100M2-WHT',
  'JBL Quantum 100M2 Wired Gaming Headphones with Windows Sonic Spatial Audio support, 40mm Realistic Dynamic Drivers, Omnidirectional Detachable Microphone, and Breathable Memory Foam ear cushions. Compatible with PC, Xbox, PS4/PS5, Nintendo Switch, Mobile Phones, and VR via 3.5mm jack. Features tangle-free cable and memory foam cushions for long gaming sessions.

KEY FEATURES:
- 40mm Dynamic Drivers for immersive realistic audio
- Windows Sonic Spatial Audio support for positional gaming sound
- Detachable omnidirectional microphone for clear in-game communication
- Breathable memory foam ear cushions for extended comfort
- Universal 3.5mm connectivity — PC, Mac, Xbox, PS4/PS5, Switch, Mobile, VR
- Tangle-free cable design
- In-line remote with volume control
- 1 Year JBL Warranty

SPECIFICATIONS:
Impedance: 32 Ohms | Frequency Response: 20 Hz – 20,000 Hz | Driver: 40mm Dynamic | Connectivity: Wired 3.5mm | Color: White',
  '40mm Dynamic Drivers | Windows Sonic Spatial Audio | Detachable Mic | Memory Foam | 3.5mm | PC/Xbox/PS/Switch',
  (SELECT id FROM categories   WHERE slug = 'headphone'),
  (SELECT id FROM subcategories WHERE slug = 'gaming-headphone'),
  (SELECT id FROM brands        WHERE slug = 'jbl'),
  4499.00, 1800.00,
  50, 5, 250,
  true, true, false,
  4.10, 5432,
  'JBL Quantum 100M2 Gaming Headphones White at ₹1800 | BoxDeal',
  'Buy JBL Quantum 100M2 Wired Gaming Headphones at ₹1800 (MRP ₹4499). 40mm drivers, detachable mic, Windows Sonic, memory foam cushions. Free shipping on BoxDeal.'
ON CONFLICT (slug) DO NOTHING;

-- JBL Quantum 100M2 Specifications
INSERT INTO product_specifications (product_id, spec_group, spec_name, spec_value, sort_order)
SELECT p.id, s.grp, s.name, s.val, s.ord
FROM products p
JOIN (VALUES
  ('General',      'Brand',               'JBL',                                         1),
  ('General',      'Model Number',        'JBLQTUM100M2WHT',                             2),
  ('General',      'Model Name',          'JBL Quantum 100M2',                           3),
  ('General',      'Color',               'White',                                        4),
  ('General',      'Country of Origin',   'China',                                        5),
  ('General',      'Warranty',            '1 Year',                                       6),
  ('General',      'Item Weight',         '250 g',                                        7),
  ('General',      'ASIN',                'B0D6NK3C9P',                                   8),
  ('Audio',        'Driver Type',         'Dynamic Driver',                               9),
  ('Audio',        'Driver Size',         '40mm',                                        10),
  ('Audio',        'Impedance',           '32 Ohms',                                     11),
  ('Audio',        'Frequency Range',     '20 Hz – 20,000 Hz',                           12),
  ('Audio',        'Noise Control',       'None',                                        13),
  ('Design',       'Form Factor',         'Over Ear',                                    14),
  ('Design',       'Ear Placement',       'Over Ear',                                    15),
  ('Design',       'Enclosure Material',  'Plastic',                                     16),
  ('Connectivity', 'Headphone Jack',      '3.5 mm Jack',                                 17),
  ('Connectivity', 'Technology',          'Wired',                                       18),
  ('Connectivity', 'Compatible Devices',  'PC, Mac, Xbox, PS4/PS5, Nintendo Switch, Mobile, VR', 19),
  ('Features',     'Microphone',          'Omnidirectional Detachable Mic',              20),
  ('Features',     'Special Feature',     'Windows Sonic Spatial Audio, Memory Foam Cushions, Tangle-Free Cable', 21),
  ('Features',     'Control Type',        'Remote / App',                                22),
  ('Box Contents', 'Includes',            'JBL Quantum 100M2, User Manual',              23)
) AS s(grp, name, val, ord) ON true
WHERE p.slug = 'jbl-quantum-100m2-white'
ON CONFLICT DO NOTHING;


-- ============================================================
-- PRODUCT 2: ZEBRONICS Zeb-Jet PRO Premium
-- ============================================================
INSERT INTO products (
  name, slug, sku,
  description, short_description,
  category_id, subcategory_id, brand_id,
  mrp, selling_price,
  stock_quantity, low_stock_threshold, weight_grams,
  is_active, is_featured, is_deal_of_day,
  rating, review_count,
  meta_title, meta_description
)
SELECT
  'ZEBRONICS Zeb-Jet PRO Premium Gaming Headphone',
  'zebronics-zeb-jet-pro-premium',
  'ZEB-JET-PRO-BB',
  'ZEBRONICS Zeb-Jet PRO Premium Gaming Headphone featuring LED lighting on Headband and Ear Cups, 40mm Neodymium Drivers, 2 Meter Braided Cable for durability, Flexible Microphone, Suspension Design for comfort, and dual 3.5mm + USB connectivity with in-line controller.

KEY FEATURES:
- 40mm Neodymium Dynamic Drivers for powerful bass
- LED Lights on both headband and ear cups for gaming ambience
- 2 Meter braided cable — tangle-resistant and durable
- Flexible microphone for in-game communication
- Suspension headband design for all-day comfort
- Dual connectivity: 3.5mm audio + USB (for LED power)
- In-line controller for volume and mic control
- Extra soft ear cushions for extended gaming sessions
- 1 Year Carry-in Warranty

COMPATIBILITY: Laptops, Mobile Phones, Tablets, PC, all 3.5mm Jack devices, iOS, Android, Audio Players',
  '40mm Neodymium Drivers | LED Headband & Earcups | 2M Braided Cable | Flexible Mic | 3.5mm + USB',
  (SELECT id FROM categories    WHERE slug = 'headphone'),
  (SELECT id FROM subcategories WHERE slug = 'gaming-headphone'),
  (SELECT id FROM brands         WHERE slug = 'zebronics'),
  4499.00, 550.00,
  50, 5, 480,
  true, false, false,
  3.90, 3444,
  'ZEBRONICS Zeb-Jet PRO Gaming Headphone at ₹550 | BoxDeal',
  'Buy ZEBRONICS Zeb-Jet PRO Premium Gaming Headphone at ₹550 (MRP ₹4499). LED lights, 40mm drivers, braided cable, flexible mic. Free shipping on BoxDeal.'
ON CONFLICT (slug) DO NOTHING;

-- ZEBRONICS Jet PRO Specifications
INSERT INTO product_specifications (product_id, spec_group, spec_name, spec_value, sort_order)
SELECT p.id, s.grp, s.name, s.val, s.ord
FROM products p
JOIN (VALUES
  ('General',      'Brand',               'ZEBRONICS',                                   1),
  ('General',      'Model Number',        'Zeb-JET PRO',                                 2),
  ('General',      'Model Name',          'Zeb-JET PRO',                                 3),
  ('General',      'Color',               'Black + Blue',                                4),
  ('General',      'Country of Origin',   'China',                                        5),
  ('General',      'Warranty',            '1 Year Carry-in Service Center',              6),
  ('General',      'Item Weight',         '480 g',                                        7),
  ('General',      'ASIN',                'B0B5RMKMJL',                                   8),
  ('Audio',        'Driver Type',         'Dynamic Driver',                               9),
  ('Audio',        'Driver Size',         '40mm Neodymium',                              10),
  ('Audio',        'Impedance',           '32 Ohms',                                     11),
  ('Audio',        'Sensitivity',         '120 dB',                                      12),
  ('Audio',        'Frequency Range',     '20 Hz – 30,000 Hz',                           13),
  ('Audio',        'Noise Control',       'None',                                        14),
  ('Design',       'Form Factor',         'On Ear',                                      15),
  ('Design',       'Ear Placement',       'Over Ear',                                    16),
  ('Design',       'Enclosure Material',  'Plastic',                                     17),
  ('Connectivity', 'Headphone Jack',      '3.5 mm Jack + USB',                           18),
  ('Connectivity', 'Technology',          'Wired',                                       19),
  ('Connectivity', 'Compatible Devices',  'Laptops, Mobile, Tablets, PC, iOS, Android', 20),
  ('Features',     'Lighting',            'LED Headband + LED Ear Cups',                 21),
  ('Features',     'Cable',               '2 Meter Braided Cable',                       22),
  ('Features',     'Microphone',          'Flexible Mic',                                23),
  ('Features',     'Control Type',        'Volume Control, In-line Push Button',         24),
  ('Box Contents', 'Includes',            '1x Headphone, 1x Extra Ear Tips, 1x User Manual, 1x Warranty Card', 25)
) AS s(grp, name, val, ord) ON true
WHERE p.slug = 'zebronics-zeb-jet-pro-premium'
ON CONFLICT DO NOTHING;


-- ============================================================
-- PRODUCT 3: FRONTECH Gaming Headset HF-0015
-- ============================================================
INSERT INTO products (
  name, slug, sku,
  description, short_description,
  category_id, subcategory_id, brand_id,
  mrp, selling_price,
  stock_quantity, low_stock_threshold, weight_grams,
  is_active, is_featured, is_deal_of_day,
  rating, review_count,
  meta_title, meta_description
)
SELECT
  'FRONTECH Gaming Headset with RGB Lights HF-0015',
  'frontech-gaming-headset-hf-0015',
  'FRONTECH-HF-0015-BLK',
  'FRONTECH HF-0015 Gaming Headset with vibrant RGB lighting, 50mm Dynamic Drivers for immersive audio, Noise-Cancelling Microphone for clear voice chat, and dual 3.5mm + USB connectivity. Features leather ear cups and soft cushions for comfort during extended gaming sessions.

KEY FEATURES:
- 50mm Dynamic Drivers for powerful, immersive gaming audio
- RGB backlighting on ear cups and headband
- Noise-Cancelling Microphone for clear in-game communication
- Leather ear cup cushions for comfort
- Dual connectivity: 3.5mm for audio + USB for RGB lighting
- Volume control on the headset
- Compatible with PCs, Laptops, Gaming Consoles and other 3.5mm devices
- 1 Year Manufacturer Warranty

ENCLOSURE: Leather ear cups, Fabric/Plastic headband and outer shell',
  '50mm Driver | RGB Lights | Noise-Cancelling Mic | Volume Control | 3.5mm + USB | Leather Cushions',
  (SELECT id FROM categories    WHERE slug = 'headphone'),
  (SELECT id FROM subcategories WHERE slug = 'gaming-headphone'),
  (SELECT id FROM brands         WHERE slug = 'frontech'),
  1800.00, 462.00,
  50, 5, 283,
  true, false, false,
  5.00, 4,
  'FRONTECH HF-0015 RGB Gaming Headset at ₹462 | BoxDeal',
  'Buy FRONTECH HF-0015 Gaming Headset with RGB lights at ₹462 (MRP ₹1800). 50mm driver, noise-cancelling mic, leather cushions. Free shipping on BoxDeal.'
ON CONFLICT (slug) DO NOTHING;

-- FRONTECH HF-0015 Specifications
INSERT INTO product_specifications (product_id, spec_group, spec_name, spec_value, sort_order)
SELECT p.id, s.grp, s.name, s.val, s.ord
FROM products p
JOIN (VALUES
  ('General',      'Brand',               'FRONTECH',                                    1),
  ('General',      'Model Number',        'HF-0015',                                     2),
  ('General',      'Model Name',          'Frontech Gaming Headset with RGB Lights',     3),
  ('General',      'Color',               'Black',                                        4),
  ('General',      'Country of Origin',   'China',                                        5),
  ('General',      'Warranty',            '1 Year',                                       6),
  ('General',      'Item Weight',         '283 g',                                        7),
  ('General',      'ASIN',                'B0FJS3QC7G',                                   8),
  ('Audio',        'Driver Type',         'Dynamic Driver',                               9),
  ('Audio',        'Driver Size',         '50mm',                                        10),
  ('Design',       'Form Factor',         'Over Ear',                                    11),
  ('Design',       'Ear Placement',       'Over Ear',                                    12),
  ('Design',       'Ear Cup Material',    'Leather',                                     13),
  ('Design',       'Headband Material',   'Fabric / Plastic',                            14),
  ('Connectivity', 'Headphone Jack',      '3.5 mm Jack + USB (for RGB)',                 15),
  ('Connectivity', 'Technology',          'Wired',                                       16),
  ('Connectivity', 'Compatible Devices',  'PCs, Laptops, Gaming Consoles',               17),
  ('Features',     'Microphone',          'Noise-Cancelling Mic',                        18),
  ('Features',     'Lighting',            'RGB Backlighting',                            19),
  ('Features',     'Control Type',        'Button Control (Push Button)',                20),
  ('Box Contents', 'Includes',            'Headset, Silicon Earcups',                    21)
) AS s(grp, name, val, ord) ON true
WHERE p.slug = 'frontech-gaming-headset-hf-0015'
ON CONFLICT DO NOTHING;


-- ============================================================
-- PRODUCT 4: Ant Esports H520W Smartchoice Gaming Headset
-- ============================================================
INSERT INTO products (
  name, slug, sku,
  description, short_description,
  category_id, subcategory_id, brand_id,
  mrp, selling_price,
  stock_quantity, low_stock_threshold, weight_grams,
  is_active, is_featured, is_deal_of_day,
  rating, review_count,
  meta_title, meta_description
)
SELECT
  'Ant Esports H520W Smartchoice Gaming Headset with Mic',
  'ant-esports-h520w-black',
  'ANT-H520W-BLK',
  'Ant Esports H520W Smartchoice Gaming Headset featuring 50mm Bass Drivers, Noise Isolating design, lightweight build for multi-platform use. Connect via universal 3.5mm jack to PC, PS4, PS5, Xbox, Nintendo Switch, and mobile devices.

KEY FEATURES:
- 50mm Bass Drivers for deep, immersive gaming audio
- Noise Isolating design blocks out external distractions
- Lightweight and ergonomic for all-day gaming comfort
- Optimized clamp force design for secure fit
- Zero audio lag wired performance
- Wired 3.5mm universal connectivity
- Multi-platform: PC, PS4, PS5, Xbox, Nintendo Switch, Mobile
- Cross-platform voice chat ready
- 1 Year Warranty (register at www.acrorma.com)

ENCLOSURE: Leather ear cups for comfort and passive noise isolation',
  '50mm Bass Drivers | Noise Isolating | Lightweight | 3.5mm | PC/PS4/PS5/Xbox/Switch/Mobile',
  (SELECT id FROM categories    WHERE slug = 'headphone'),
  (SELECT id FROM subcategories WHERE slug = 'gaming-headphone'),
  (SELECT id FROM brands         WHERE slug = 'ant-esports'),
  2499.00, 600.00,
  50, 5, 449,
  true, false, false,
  3.80, 3969,
  'Ant Esports H520W Gaming Headset at ₹600 | BoxDeal',
  'Buy Ant Esports H520W Smartchoice Gaming Headset at ₹600 (MRP ₹2499). 50mm drivers, noise isolating, multi-platform. Free shipping on BoxDeal.'
ON CONFLICT (slug) DO NOTHING;

-- Ant Esports H520W Specifications
INSERT INTO product_specifications (product_id, spec_group, spec_name, spec_value, sort_order)
SELECT p.id, s.grp, s.name, s.val, s.ord
FROM products p
JOIN (VALUES
  ('General',      'Brand',               'Ant Esports',                                 1),
  ('General',      'Model Number',        'H520W',                                       2),
  ('General',      'Model Name',          'H520W Smartchoice',                           3),
  ('General',      'Color',               'Black',                                        4),
  ('General',      'Country of Origin',   'China',                                        5),
  ('General',      'Warranty',            '1 Year (register at acrorma.com)',            6),
  ('General',      'Item Weight',         '449 g',                                        7),
  ('General',      'ASIN',                'B081Q85RTF',                                   8),
  ('Audio',        'Driver Type',         'Dynamic Driver',                               9),
  ('Audio',        'Driver Size',         '50mm',                                        10),
  ('Audio',        'Noise Control',       'Sound Isolation',                             11),
  ('Design',       'Form Factor',         'Over Ear',                                    12),
  ('Design',       'Ear Placement',       'Over Ear',                                    13),
  ('Design',       'Enclosure Material',  'Leather',                                     14),
  ('Connectivity', 'Headphone Jack',      '3.5 mm Jack',                                 15),
  ('Connectivity', 'Technology',          'Wired',                                       16),
  ('Connectivity', 'Compatible Devices',  'PC, PS4, PS5, Xbox, Nintendo Switch, Mobile', 17),
  ('Features',     'Key Features',        'Noise Isolating, Lightweight, Optimized Clamp Force, Zero Audio Lag', 18),
  ('Features',     'Control Type',        'Touch / Noise Control',                       19),
  ('Box Contents', 'Includes',            '1x Headset, 1x User Manual',                  20)
) AS s(grp, name, val, ord) ON true
WHERE p.slug = 'ant-esports-h520w-black'
ON CONFLICT DO NOTHING;


-- ============================================================
-- PRODUCT 5: Ant Esports H580 Pro Gaming Headset
-- ============================================================
INSERT INTO products (
  name, slug, sku,
  description, short_description,
  category_id, subcategory_id, brand_id,
  mrp, selling_price,
  stock_quantity, low_stock_threshold, weight_grams,
  is_active, is_featured, is_deal_of_day,
  rating, review_count,
  meta_title, meta_description
)
SELECT
  'Ant Esports H580 Pro Gaming Headset with LED Light',
  'ant-esports-h580-pro-black',
  'ANT-H580PRO-BLK',
  'Ant Esports H580 Pro Gaming Headset with LED lighting, 50mm Stereo Drivers, Noise Cancelling Microphone, and 3.5mm audio jack. Designed for PC, PS4, PS5, Xbox One, Nintendo Switch, and laptops for an all-round gaming experience.

KEY FEATURES:
- 50mm Stereo Dynamic Drivers for rich, powerful sound
- Noise Cancelling Microphone for clear in-game voice chat
- LED accent lighting for gaming aesthetic
- Over-ear design for passive noise isolation
- Universal 3.5mm audio jack compatibility
- Wired for zero audio lag
- Multi-platform support: PC, PS4, PS5, Xbox One, Nintendo Switch, Laptops
- Volume control on the cable
- 1 Year Manufacturer Warranty

CONNECTIVITY: Wired 3.5mm — compatible with all gaming platforms and laptops',
  '50mm Stereo Drivers | LED Light | Noise Cancelling Mic | 3.5mm | PC/PS4/PS5/Xbox/Switch',
  (SELECT id FROM categories    WHERE slug = 'headphone'),
  (SELECT id FROM subcategories WHERE slug = 'gaming-headphone'),
  (SELECT id FROM brands         WHERE slug = 'ant-esports'),
  2099.00, 552.00,
  50, 5, 449,
  true, false, false,
  3.60, 322,
  'Ant Esports H580 Pro Gaming Headset with LED at ₹552 | BoxDeal',
  'Buy Ant Esports H580 Pro Gaming Headset at ₹552 (MRP ₹2099). 50mm drivers, LED lights, noise cancelling mic, 3.5mm multi-platform. Free shipping on BoxDeal.'
ON CONFLICT (slug) DO NOTHING;

-- Ant Esports H580 Pro Specifications
INSERT INTO product_specifications (product_id, spec_group, spec_name, spec_value, sort_order)
SELECT p.id, s.grp, s.name, s.val, s.ord
FROM products p
JOIN (VALUES
  ('General',      'Brand',               'Ant Esports',                                 1),
  ('General',      'Model Number',        'H580 Pro',                                    2),
  ('General',      'Model Name',          'H580 Pro',                                    3),
  ('General',      'Color',               'Black',                                        4),
  ('General',      'Country of Origin',   'China',                                        5),
  ('General',      'Warranty',            '1 Year',                                       6),
  ('General',      'Item Weight',         '449 g',                                        7),
  ('General',      'ASIN',                'B09FXNZ28K',                                   8),
  ('Audio',        'Driver Type',         'Dynamic Driver',                               9),
  ('Audio',        'Driver Size',         '50mm Stereo',                                 10),
  ('Audio',        'Noise Control',       'None',                                        11),
  ('Design',       'Form Factor',         'Over Ear',                                    12),
  ('Design',       'Ear Placement',       'Over Ear',                                    13),
  ('Design',       'Earpiece Shape',      'Circle',                                      14),
  ('Design',       'Enclosure Material',  'Plastic',                                     15),
  ('Connectivity', 'Headphone Jack',      '3.5 mm Jack',                                 16),
  ('Connectivity', 'Technology',          'Wired',                                       17),
  ('Connectivity', 'Compatible Devices',  'PC, PS4, PS5, Xbox One, Nintendo Switch, Laptops', 18),
  ('Features',     'Lighting',            'LED Accent Lights',                           19),
  ('Features',     'Microphone',          'Noise Cancelling Mic',                        20),
  ('Features',     'Control Type',        'Volume Control (Touch)',                      21),
  ('Box Contents', 'Includes',            'Headphones',                                  22)
) AS s(grp, name, val, ord) ON true
WHERE p.slug = 'ant-esports-h580-pro-black'
ON CONFLICT DO NOTHING;
