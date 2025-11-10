-- URGENTE: Sicurezza profili - Espone solo campi pubblici necessari per recensioni
-- PROBLEMA: Attualmente TUTTI i campi di profiles sono pubblici (email, codice fiscale, telefono, indirizzo)
-- SOLUZIONE: Vista pubblica con SOLO i campi necessari per le recensioni

-- 1. Crea vista SICURA con SOLO campi pubblici necessari per recensioni
CREATE OR REPLACE VIEW public_profiles AS
SELECT 
    id,
    first_name,
    last_name,
    profile_picture_url,
    full_name
FROM profiles;

-- 2. Permetti lettura pubblica SOLO della vista (non della tabella originale)
GRANT SELECT ON public_profiles TO anon, authenticated;

-- 3. RIMUOVI la policy pericolosa che espone tutti i campi
DROP POLICY IF EXISTS "Public can view basic profile info" ON profiles;

-- 4. Aggiungi policy per lettura autenticata (solo il proprio profilo)
-- Gli utenti loggati possono leggere SOLO il proprio profilo completo
CREATE POLICY "Users can read their own profile" ON profiles
FOR SELECT USING (auth.uid() = id);

-- Commento per documentazione
COMMENT ON VIEW public_profiles IS 'Vista pubblica sicura dei profili: espone SOLO first_name, last_name, profile_picture_url, full_name per le recensioni pubbliche. Protegge dati sensibili come email, telefono, codice fiscale, indirizzo.';

