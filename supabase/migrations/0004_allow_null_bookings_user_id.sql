-- Guest checkout: bookings may exist before account is created (user_id linked later via checkout_claims)

ALTER TABLE public.bookings
  ALTER COLUMN user_id DROP NOT NULL;
