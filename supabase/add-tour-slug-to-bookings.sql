-- Add tour_slug column to bookings table
-- This will help match reviews with correct tour slugs

-- Add column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'bookings' AND column_name = 'tour_slug'
    ) THEN
        ALTER TABLE bookings ADD COLUMN tour_slug TEXT;
        COMMENT ON COLUMN bookings.tour_slug IS 'Slug del tour per matching con recensioni';
    END IF;
END $$;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_bookings_tour_slug ON bookings(tour_slug);

