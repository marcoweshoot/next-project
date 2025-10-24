-- Add redeemed_by_user_id column to gift_cards table
ALTER TABLE gift_cards 
ADD COLUMN redeemed_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Create index for fast lookups
CREATE INDEX idx_gift_cards_redeemed_by ON gift_cards(redeemed_by_user_id);

-- Update RLS policy to allow users to view gift cards they redeemed
CREATE POLICY "Users can view redeemed gift cards"
  ON gift_cards FOR SELECT
  USING (auth.uid() = redeemed_by_user_id);
