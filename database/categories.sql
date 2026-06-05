-- ============================================================
-- BoxDeal Categories & Subcategories
-- Run AFTER schema.sql — Earbuds already in DB via seed.sql
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- CATEGORIES
-- ────────────────────────────────────────────────────────────
INSERT INTO categories (name, slug, description, is_active, sort_order) VALUES
  ('Earbuds',               'earbuds',               'True wireless & sports earbuds',                          true,  1),
  ('Headphone',             'headphone',              'Over-ear, on-ear & gaming headphones',                    true,  2),
  ('Charger',               'charger',                'Fast chargers for mobiles, laptops & more',               true,  3),
  ('NeckBand',              'neckband',               'Wireless neckband earphones',                             true,  4),
  ('Camera Accessories',    'camera-accessories',     'Security cameras, WiFi cameras & DVR systems',            true,  5),
  ('RingLight & Tripods',   'ringlight-and-tripods',  'Ring lights, tripods & microphones for creators',         true,  6),
  ('Speaker',               'speaker',                'Portable speakers, soundbars & party speakers',           true,  7),
  ('Tablet',                'tablet',                 'Android & iOS tablets for work and entertainment',        true,  8),
  ('Smart Watches',         'smart-watches',          'Fitness bands & smart watches for every lifestyle',       true,  9),
  ('Computer Accessories',  'computer-accessories',   'Keyboards, mouse, hubs & more for your setup',           true, 10),
  ('Cables',                'cables',                 'USB, HDMI, Type-C & all charging cables',                 true, 11)
ON CONFLICT (slug) DO NOTHING;

-- ────────────────────────────────────────────────────────────
-- SUBCATEGORIES
-- ────────────────────────────────────────────────────────────

-- Headphone
INSERT INTO subcategories (category_id, name, slug, is_active, sort_order)
SELECT c.id, s.name, s.slug, true, s.ord
FROM categories c
JOIN (VALUES
  ('Gaming Headphone', 'gaming-headphone', 1),
  ('Normal Headphone', 'normal-headphone', 2)
) AS s(name, slug, ord) ON true
WHERE c.slug = 'headphone'
ON CONFLICT (slug) DO NOTHING;

-- Charger
INSERT INTO subcategories (category_id, name, slug, is_active, sort_order)
SELECT c.id, s.name, s.slug, true, s.ord
FROM categories c
JOIN (VALUES
  ('Mobile Charger', 'mobile-charger', 1),
  ('Laptop Charger', 'laptop-charger', 2)
) AS s(name, slug, ord) ON true
WHERE c.slug = 'charger'
ON CONFLICT (slug) DO NOTHING;

-- Camera Accessories
INSERT INTO subcategories (category_id, name, slug, is_active, sort_order)
SELECT c.id, s.name, s.slug, true, s.ord
FROM categories c
JOIN (VALUES
  ('WiFi Camera', 'wifi-camera', 1),
  ('DVR',         'dvr',         2)
) AS s(name, slug, ord) ON true
WHERE c.slug = 'camera-accessories'
ON CONFLICT (slug) DO NOTHING;

-- RingLight & Tripods
INSERT INTO subcategories (category_id, name, slug, is_active, sort_order)
SELECT c.id, s.name, s.slug, true, s.ord
FROM categories c
JOIN (VALUES
  ('Mic',        'mic',        1),
  ('Ring Light', 'ring-light', 2),
  ('Tripods',    'tripods',    3)
) AS s(name, slug, ord) ON true
WHERE c.slug = 'ringlight-and-tripods'
ON CONFLICT (slug) DO NOTHING;

-- Speaker
INSERT INTO subcategories (category_id, name, slug, is_active, sort_order)
SELECT c.id, s.name, s.slug, true, s.ord
FROM categories c
JOIN (VALUES
  ('Portable', 'portable-speaker', 1),
  ('Soundbar', 'soundbar',         2),
  ('PartyBox', 'partybox',         3)
) AS s(name, slug, ord) ON true
WHERE c.slug = 'speaker'
ON CONFLICT (slug) DO NOTHING;

-- Computer Accessories (Mouse deduplicated)
INSERT INTO subcategories (category_id, name, slug, is_active, sort_order)
SELECT c.id, s.name, s.slug, true, s.ord
FROM categories c
JOIN (VALUES
  ('Graphic Pads', 'graphic-pads', 1),
  ('Stands',       'stands',       2),
  ('Mouse',        'mouse',        3),
  ('Keyboard',     'keyboard',     4),
  ('USB Hub',      'usb-hub',      5),
  ('Mouse Pads',   'mouse-pads',   6)
) AS s(name, slug, ord) ON true
WHERE c.slug = 'computer-accessories'
ON CONFLICT (slug) DO NOTHING;
