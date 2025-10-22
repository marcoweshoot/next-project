-- Create gift_cards table
CREATE TABLE IF NOT EXISTS gift_cards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code VARCHAR(12) UNIQUE NOT NULL,
  amount INTEGER NOT NULL, -- Amount in cents
  remaining_balance INTEGER NOT NULL, -- Remaining balance in cents
  purchaser_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  recipient_email VARCHAR(255),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'used', 'expired', 'cancelled')),
  expires_at TIMESTAMP WITH TIME ZONE,
  stripe_session_id VARCHAR(255),
  stripe_payment_intent_id VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on code for fast lookups
CREATE INDEX idx_gift_cards_code ON gift_cards(code);
CREATE INDEX idx_gift_cards_purchaser ON gift_cards(purchaser_user_id);
CREATE INDEX idx_gift_cards_status ON gift_cards(status);

-- Create gift_card_transactions table to track usage
CREATE TABLE IF NOT EXISTS gift_card_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  gift_card_id UUID REFERENCES gift_cards(id) ON DELETE CASCADE NOT NULL,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  amount_used INTEGER NOT NULL, -- Amount in cents
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for transactions
CREATE INDEX idx_gift_card_transactions_gift_card ON gift_card_transactions(gift_card_id);
CREATE INDEX idx_gift_card_transactions_booking ON gift_card_transactions(booking_id);

-- RLS Policies for gift_cards

-- Enable RLS
ALTER TABLE gift_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE gift_card_transactions ENABLE ROW LEVEL SECURITY;

-- Users can view their own purchased gift cards
CREATE POLICY "Users can view purchased gift cards"
  ON gift_cards FOR SELECT
  USING (auth.uid() = purchaser_user_id);

-- Users can view gift cards by code (for redemption)
CREATE POLICY "Anyone can view gift card by valid code"
  ON gift_cards FOR SELECT
  USING (code IS NOT NULL AND status = 'active' AND (expires_at IS NULL OR expires_at > NOW()));

-- Service role can do everything
CREATE POLICY "Service role full access gift_cards"
  ON gift_cards FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- Users can view their own transactions
CREATE POLICY "Users can view their transactions"
  ON gift_card_transactions FOR SELECT
  USING (auth.uid() = user_id);

-- Service role can do everything on transactions
CREATE POLICY "Service role full access gift_card_transactions"
  ON gift_card_transactions FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_gift_card_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_gift_cards_updated_at
  BEFORE UPDATE ON gift_cards
  FOR EACH ROW
  EXECUTE FUNCTION update_gift_card_updated_at();

-- Function to generate unique gift card code
CREATE OR REPLACE FUNCTION generate_gift_card_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; -- Removed ambiguous chars
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..12 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

