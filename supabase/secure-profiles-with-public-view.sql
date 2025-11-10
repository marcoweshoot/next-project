-- =====================================================
-- SICUREZZA COMPLETA TABELLA PROFILES
-- =====================================================
-- PROBLEMA CRITICO: TUTTI i campi di profiles erano pubblici
-- (email, codice fiscale, telefono, indirizzo, data nascita)
-- 
-- SOLUZIONE COMPLETA con tutte le policy necessarie per:
-- - Recensioni pubbliche (vista sicura)
-- - Utenti loggati (proprio profilo)
-- - Admin (tutti i profili)
-- - Protezione dati sensibili

-- =====================================================
-- STEP 1: RIMUOVI POLICY PERICOLOSE ESISTENTI
-- =====================================================

DROP POLICY IF EXISTS "Public can view basic profile info" ON profiles;
DROP POLICY IF EXISTS "Users can read their own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Only super admins can delete profiles" ON profiles;

-- =====================================================
-- STEP 2: CREA VISTA PUBBLICA SICURA
-- =====================================================

CREATE OR REPLACE VIEW public_profiles AS
SELECT 
    id,
    first_name,
    last_name,
    profile_picture_url,
    full_name
FROM profiles;

GRANT SELECT ON public_profiles TO anon, authenticated;

-- =====================================================
-- STEP 3: POLICY PER LETTURA (SELECT)
-- =====================================================

-- Policy 1: Gli utenti possono leggere il PROPRIO profilo completo
CREATE POLICY "Users can read their own profile" ON profiles
FOR SELECT 
USING (auth.uid() = id);

-- Policy 2: Gli ADMIN possono leggere TUTTI i profili
CREATE POLICY "Admins can read all profiles" ON profiles
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role IN ('admin', 'super_admin')
  )
);

-- =====================================================
-- STEP 4: POLICY PER AGGIORNAMENTO (UPDATE)
-- =====================================================

CREATE POLICY "Users can update their own profile" ON profiles
FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- =====================================================
-- STEP 5: POLICY PER INSERIMENTO (INSERT)
-- =====================================================

CREATE POLICY "Users can insert their own profile" ON profiles
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- =====================================================
-- STEP 6: POLICY PER CANCELLAZIONE (DELETE)
-- =====================================================

CREATE POLICY "Only super admins can delete profiles" ON profiles
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'super_admin'
  )
);

-- =====================================================
-- DOCUMENTAZIONE
-- =====================================================

COMMENT ON VIEW public_profiles IS 
'Vista pubblica sicura: espone SOLO first_name, last_name, profile_picture_url, full_name. Protegge email, telefono, codice fiscale, indirizzo.';

COMMENT ON POLICY "Users can read their own profile" ON profiles IS 
'Utenti leggono solo il proprio profilo completo';

COMMENT ON POLICY "Admins can read all profiles" ON profiles IS 
'Admin leggono tutti i profili per gestione e statistiche';

COMMENT ON POLICY "Users can update their own profile" ON profiles IS 
'Utenti aggiornano solo il proprio profilo';

COMMENT ON POLICY "Users can insert their own profile" ON profiles IS 
'Utenti creano il proprio profilo alla registrazione';

COMMENT ON POLICY "Only super admins can delete profiles" ON profiles IS 
'Solo super admin cancellano profili';

