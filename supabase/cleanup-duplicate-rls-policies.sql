-- Script per rimuovere le RLS policies duplicate e ottimizzare le performance
-- Esegui questo script su Supabase SQL Editor

-- ==============================================
-- STEP 1: Rimuovi policy duplicate su BOOKINGS
-- ==============================================

-- Rimuovi le versioni "own" (teniamo le versioni "their own")
DROP POLICY IF EXISTS "Users can insert own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can update own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can view own bookings" ON public.bookings;

-- ==============================================
-- STEP 2: Rimuovi policy duplicate su PROFILES
-- ==============================================

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

-- ==============================================
-- STEP 3: Rimuovi policy duplicate su REVIEWS
-- ==============================================

DROP POLICY IF EXISTS "Users can insert own reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can update own reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can view own reviews" ON public.reviews;

-- ==============================================
-- STEP 4: Rimuovi policy duplicate su USER_ROLES
-- ==============================================

DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;

-- ==============================================
-- STEP 5: Ottimizza le policy rimaste per performance
-- ==============================================

-- PROFILES: Ottimizza usando (select auth.uid()) invece di auth.uid()
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT
  TO public, anon
  WITH CHECK ((select auth.uid()) = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE
  TO public, anon
  USING ((select auth.uid()) = id)
  WITH CHECK ((select auth.uid()) = id);

CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT
  TO public, anon
  USING ((select auth.uid()) = id);

-- BOOKINGS: Ottimizza usando (select auth.uid())
DROP POLICY IF EXISTS "Users can insert their own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can update their own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can view their own bookings" ON public.bookings;

CREATE POLICY "Users can insert their own bookings" ON public.bookings
  FOR INSERT
  TO public, anon
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update their own bookings" ON public.bookings
  FOR UPDATE
  TO public, anon
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can view their own bookings" ON public.bookings
  FOR SELECT
  TO public, anon
  USING ((select auth.uid()) = user_id);

-- REVIEWS: Ottimizza usando (select auth.uid())
DROP POLICY IF EXISTS "Users can insert their own reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can update their own reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can view their own reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can delete their own reviews" ON public.reviews;

CREATE POLICY "Users can insert their own reviews" ON public.reviews
  FOR INSERT
  TO public, anon
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update their own reviews" ON public.reviews
  FOR UPDATE
  TO public, anon
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can view their own reviews" ON public.reviews
  FOR SELECT
  TO public, anon
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete their own reviews" ON public.reviews
  FOR DELETE
  TO public, anon
  USING ((select auth.uid()) = user_id);

-- USER_ROLES: Ottimizza usando (select auth.uid())
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;

CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT
  TO public, anon
  USING ((select auth.uid()) = user_id);

-- ==============================================
-- STEP 6: Verifica le policy rimaste
-- ==============================================

-- Query per verificare tutte le policy attive
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('bookings', 'profiles', 'reviews', 'user_roles')
ORDER BY tablename, cmd, policyname;

-- Fine dello script

