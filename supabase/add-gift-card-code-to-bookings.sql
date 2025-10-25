-- Add gift_card_code and payment_method columns to bookings table
-- This will track which gift card was used and the payment method

-- Add columns only if they don't exist
DO $$ 
BEGIN
    -- Add gift_card_code if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'gift_card_code') THEN
        ALTER TABLE bookings ADD COLUMN gift_card_code VARCHAR(12);
    END IF;
    
    -- Add payment_method if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'payment_method') THEN
        ALTER TABLE bookings ADD COLUMN payment_method VARCHAR(50);
    END IF;
    
    -- Add tour_title if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'tour_title') THEN
        ALTER TABLE bookings ADD COLUMN tour_title VARCHAR(255);
    END IF;
    
    -- Add tour_destination if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'tour_destination') THEN
        ALTER TABLE bookings ADD COLUMN tour_destination VARCHAR(255);
    END IF;
    
    -- Add session_date if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'session_date') THEN
        ALTER TABLE bookings ADD COLUMN session_date TIMESTAMP;
    END IF;
    
    -- Add session_end_date if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'session_end_date') THEN
        ALTER TABLE bookings ADD COLUMN session_end_date TIMESTAMP;
    END IF;
    
    -- Add session_price if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'session_price') THEN
        ALTER TABLE bookings ADD COLUMN session_price DECIMAL(10,2);
    END IF;
    
    -- Add session_deposit if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'session_deposit') THEN
        ALTER TABLE bookings ADD COLUMN session_deposit DECIMAL(10,2);
    END IF;
END $$;

-- Add comments to document the purpose
COMMENT ON COLUMN bookings.gift_card_code IS 'Gift card code used for this booking payment';
COMMENT ON COLUMN bookings.payment_method IS 'Payment method used: stripe, gift_card, bank_transfer, etc.';

-- Create indexes for better performance when querying by gift card and payment method
CREATE INDEX IF NOT EXISTS idx_bookings_gift_card_code ON bookings(gift_card_code);
CREATE INDEX IF NOT EXISTS idx_bookings_payment_method ON bookings(payment_method);

-- Update RLS policy to allow users to view their own bookings with gift card info
-- (This should already be covered by existing policies, but let's make sure)
-- The existing policies should already allow users to view their own bookings
