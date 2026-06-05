-- Add banner_type column to banners table
-- Allows distinguishing between hero banners and deal of the day banners

-- Create ENUM type for banner types
CREATE TYPE banner_type AS ENUM ('hero', 'deal_of_day');

-- Add column to banners table
ALTER TABLE banners
ADD COLUMN banner_type banner_type NOT NULL DEFAULT 'hero';

-- Create index for faster filtering
CREATE INDEX idx_banners_type ON banners (banner_type, is_active);

-- Update existing banners to 'hero' type (they're already hero banners)
UPDATE banners SET banner_type = 'hero' WHERE banner_type IS NULL;
