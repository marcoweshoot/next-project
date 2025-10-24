-- Add gift_card_code column to bookings table
-- This will track which gift card was used for the booking

-- Add the column
ALTER TABLE bookings 
ADD COLUMN gift_card_code VARCHAR(12);

-- Add a comment to document the purpose
COMMENT ON COLUMN bookings.gift_card_code IS 'Gift card code used for this booking payment';

-- Create an index for better performance when querying by gift card
CREATE INDEX IF NOT EXISTS idx_bookings_gift_card_code ON bookings(gift_card_code);

-- Update RLS policy to allow users to view their own bookings with gift card info
-- (This should already be covered by existing policies, but let's make sure)
-- The existing policies should already allow users to view their own bookings
