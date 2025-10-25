-- Add gift_card_code and payment_method columns to bookings table
-- This will track which gift card was used and the payment method

-- Add the columns
ALTER TABLE bookings 
ADD COLUMN gift_card_code VARCHAR(12),
ADD COLUMN payment_method VARCHAR(50),
ADD COLUMN tour_title VARCHAR(255),
ADD COLUMN tour_destination VARCHAR(255),
ADD COLUMN session_date TIMESTAMP,
ADD COLUMN session_end_date TIMESTAMP,
ADD COLUMN session_price DECIMAL(10,2),
ADD COLUMN session_deposit DECIMAL(10,2);

-- Add comments to document the purpose
COMMENT ON COLUMN bookings.gift_card_code IS 'Gift card code used for this booking payment';
COMMENT ON COLUMN bookings.payment_method IS 'Payment method used: stripe, gift_card, bank_transfer, etc.';

-- Create indexes for better performance when querying by gift card and payment method
CREATE INDEX IF NOT EXISTS idx_bookings_gift_card_code ON bookings(gift_card_code);
CREATE INDEX IF NOT EXISTS idx_bookings_payment_method ON bookings(payment_method);

-- Update RLS policy to allow users to view their own bookings with gift card info
-- (This should already be covered by existing policies, but let's make sure)
-- The existing policies should already allow users to view their own bookings
