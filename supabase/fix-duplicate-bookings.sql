-- Fix duplicate bookings issue
-- Add unique constraint to prevent duplicate bookings

-- First, let's check for existing duplicates
SELECT 
    user_id, 
    tour_id, 
    session_id, 
    gift_card_code,
    COUNT(*) as duplicate_count,
    array_agg(id) as booking_ids
FROM bookings 
WHERE gift_card_code IS NOT NULL
GROUP BY user_id, tour_id, session_id, gift_card_code
HAVING COUNT(*) > 1;

-- Remove duplicate bookings (keep the first one)
WITH duplicates AS (
    SELECT 
        id,
        ROW_NUMBER() OVER (
            PARTITION BY user_id, tour_id, session_id, gift_card_code 
            ORDER BY created_at ASC
        ) as rn
    FROM bookings 
    WHERE gift_card_code IS NOT NULL
)
DELETE FROM bookings 
WHERE id IN (
    SELECT id FROM duplicates WHERE rn > 1
);

-- Add unique constraint to prevent future duplicates
-- This will prevent the same user from booking the same tour/session multiple times
-- But allows different gift cards for the same user/tour/session combination
ALTER TABLE bookings 
ADD CONSTRAINT unique_booking_user_tour_session 
UNIQUE (user_id, tour_id, session_id);

-- Add comment
COMMENT ON CONSTRAINT unique_booking_user_tour_session ON bookings 
IS 'Prevents duplicate bookings for the same user, tour, and session combination (allows different gift cards)';
