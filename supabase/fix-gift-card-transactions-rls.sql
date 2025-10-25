-- Fix RLS policy for gift_card_transactions table
-- Allow service role to insert transactions

-- Drop existing policies that might conflict
DROP POLICY IF EXISTS "Users can view their gift card transactions" ON gift_card_transactions;
DROP POLICY IF EXISTS "Service role full access gift_card_transactions" ON gift_card_transactions;

-- Create policy for users to view their own transactions
CREATE POLICY "Users can view their gift card transactions"
  ON gift_card_transactions FOR SELECT
  USING (auth.uid() = user_id);

-- Create policy for service role to do everything
CREATE POLICY "Service role full access gift_card_transactions"
  ON gift_card_transactions FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- Ensure RLS is enabled
ALTER TABLE gift_card_transactions ENABLE ROW LEVEL SECURITY;
