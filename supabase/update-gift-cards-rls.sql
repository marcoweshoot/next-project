-- Update RLS policy for gift_cards table
-- Allows users to view gift cards they purchased OR redeemed

-- Drop existing policies that might conflict
DROP POLICY IF EXISTS "Users can view purchased gift cards" ON gift_cards;
DROP POLICY IF EXISTS "Users can view redeemed gift cards" ON gift_cards;
DROP POLICY IF EXISTS "Service role full access gift_cards" ON gift_cards;

-- Create comprehensive policy that covers both cases
CREATE POLICY "Users can view their purchased or redeemed gift cards"
  ON gift_cards FOR SELECT
  USING (auth.uid() = purchaser_user_id OR auth.uid() = redeemed_by_user_id);

-- Ensure service role can still do everything
CREATE POLICY "Service role full access gift_cards"
  ON gift_cards FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');
