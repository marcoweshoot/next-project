-- Checkout claims: store Stripe guest data until account is created post-payment

CREATE TABLE IF NOT EXISTS public.checkout_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_session_id TEXT UNIQUE NOT NULL,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  fiscal_code TEXT,
  phone_number TEXT,
  address_line1 TEXT,
  city TEXT,
  postal_code TEXT,
  country TEXT,
  claimed_at TIMESTAMPTZ,
  claimed_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_checkout_claims_email ON public.checkout_claims(email);
CREATE INDEX IF NOT EXISTS idx_checkout_claims_booking_id ON public.checkout_claims(booking_id);

ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS stripe_checkout_session_id TEXT;

CREATE INDEX IF NOT EXISTS idx_bookings_stripe_checkout_session_id
  ON public.bookings(stripe_checkout_session_id);

ALTER TABLE public.checkout_claims ENABLE ROW LEVEL SECURITY;

-- No public policies: access only via service role from API routes
