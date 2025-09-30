-- =============================================
-- AGGIORNAMENTO RLS POLICIES PER UTENTI ANONIMI
-- =============================================

-- 1. AGGIORNA POLICY PER TABELLA BOOKINGS
-- Permetti agli utenti autenticati (inclusi anonimi) di vedere le loro prenotazioni
DROP POLICY IF EXISTS "Users can view their own bookings" ON bookings;
CREATE POLICY "Users can view their own bookings" ON bookings
FOR SELECT USING (
  auth.uid() = user_id OR 
  (auth.jwt() ->> 'is_anonymous')::boolean = true
);

-- Permetti agli utenti autenticati (inclusi anonimi) di inserire prenotazioni
DROP POLICY IF EXISTS "Users can insert their own bookings" ON bookings;
CREATE POLICY "Users can insert their own bookings" ON bookings
FOR INSERT WITH CHECK (
  auth.uid() = user_id OR 
  (auth.jwt() ->> 'is_anonymous')::boolean = true
);

-- Permetti agli utenti autenticati (inclusi anonimi) di aggiornare le loro prenotazioni
DROP POLICY IF EXISTS "Users can update their own bookings" ON bookings;
CREATE POLICY "Users can update their own bookings" ON bookings
FOR UPDATE USING (
  auth.uid() = user_id OR 
  (auth.jwt() ->> 'is_anonymous')::boolean = true
);

-- 2. AGGIORNA POLICY PER TABELLA PROFILES
-- Permetti agli utenti autenticati (inclusi anonimi) di vedere il loro profilo
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
CREATE POLICY "Users can view their own profile" ON profiles
FOR SELECT USING (
  auth.uid() = id OR 
  (auth.jwt() ->> 'is_anonymous')::boolean = true
);

-- Permetti agli utenti autenticati (inclusi anonimi) di inserire il loro profilo
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
CREATE POLICY "Users can insert their own profile" ON profiles
FOR INSERT WITH CHECK (
  auth.uid() = id OR 
  (auth.jwt() ->> 'is_anonymous')::boolean = true
);

-- Permetti agli utenti autenticati (inclusi anonimi) di aggiornare il loro profilo
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile" ON profiles
FOR UPDATE USING (
  auth.uid() = id OR 
  (auth.jwt() ->> 'is_anonymous')::boolean = true
);

-- 3. AGGIORNA POLICY PER TABELLA USER_ROLES
-- Permetti agli utenti autenticati (inclusi anonimi) di vedere i loro ruoli
DROP POLICY IF EXISTS "Users can view their own roles" ON user_roles;
CREATE POLICY "Users can view their own roles" ON user_roles
FOR SELECT USING (
  auth.uid() = user_id OR 
  (auth.jwt() ->> 'is_anonymous')::boolean = true
);

-- 4. AGGIORNA POLICY PER TABELLA REVIEWS
-- Permetti agli utenti autenticati (inclusi anonimi) di vedere le loro recensioni
DROP POLICY IF EXISTS "Users can view their own reviews" ON reviews;
CREATE POLICY "Users can view their own reviews" ON reviews
FOR SELECT USING (
  auth.uid() = user_id OR 
  (auth.jwt() ->> 'is_anonymous')::boolean = true
);

-- Permetti agli utenti autenticati (inclusi anonimi) di inserire recensioni
DROP POLICY IF EXISTS "Users can insert their own reviews" ON reviews;
CREATE POLICY "Users can insert their own reviews" ON reviews
FOR INSERT WITH CHECK (
  auth.uid() = user_id OR 
  (auth.jwt() ->> 'is_anonymous')::boolean = true
);

-- Permetti agli utenti autenticati (inclusi anonimi) di aggiornare le loro recensioni
DROP POLICY IF EXISTS "Users can update their own reviews" ON reviews;
CREATE POLICY "Users can update their own reviews" ON reviews
FOR UPDATE USING (
  auth.uid() = user_id OR 
  (auth.jwt() ->> 'is_anonymous')::boolean = true
);

-- Permetti agli utenti autenticati (inclusi anonimi) di eliminare le loro recensioni
DROP POLICY IF EXISTS "Users can delete their own reviews" ON reviews;
CREATE POLICY "Users can delete their own reviews" ON reviews
FOR DELETE USING (
  auth.uid() = user_id OR 
  (auth.jwt() ->> 'is_anonymous')::boolean = true
);

-- 4. POLICY PER TABELLE PUBBLICHE (se necessario)
-- Permetti a tutti (inclusi utenti anonimi) di leggere tour e sessioni
-- (Questo potrebbe già essere configurato come pubblico)

-- 5. VERIFICA CHE LE TABELLE ABBIANO RLS ABILITATO
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- 6. COMMENTI PER CHIAREZZA
COMMENT ON POLICY "Users can view their own bookings" ON bookings IS 'Permette agli utenti autenticati e anonimi di vedere le loro prenotazioni';
COMMENT ON POLICY "Users can insert their own bookings" ON bookings IS 'Permette agli utenti autenticati e anonimi di inserire prenotazioni';
COMMENT ON POLICY "Users can update their own bookings" ON bookings IS 'Permette agli utenti autenticati e anonimi di aggiornare le loro prenotazioni';

COMMENT ON POLICY "Users can view their own profile" ON profiles IS 'Permette agli utenti autenticati e anonimi di vedere il loro profilo';
COMMENT ON POLICY "Users can insert their own profile" ON profiles IS 'Permette agli utenti autenticati e anonimi di inserire il loro profilo';
COMMENT ON POLICY "Users can update their own profile" ON profiles IS 'Permette agli utenti autenticati e anonimi di aggiornare il loro profilo';

COMMENT ON POLICY "Users can view their own roles" ON user_roles IS 'Permette agli utenti autenticati e anonimi di vedere i loro ruoli';

COMMENT ON POLICY "Users can view their own reviews" ON reviews IS 'Permette agli utenti autenticati e anonimi di vedere le loro recensioni';
COMMENT ON POLICY "Users can insert their own reviews" ON reviews IS 'Permette agli utenti autenticati e anonimi di inserire recensioni';
COMMENT ON POLICY "Users can update their own reviews" ON reviews IS 'Permette agli utenti autenticati e anonimi di aggiornare le loro recensioni';
COMMENT ON POLICY "Users can delete their own reviews" ON reviews IS 'Permette agli utenti autenticati e anonimi di eliminare le loro recensioni';
