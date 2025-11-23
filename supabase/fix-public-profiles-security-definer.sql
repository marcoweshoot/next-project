-- =====================================================
-- FIX: Security Definer Warning per public_profiles
-- =====================================================
-- 
-- PROBLEMA:
-- La view public_profiles è creata con SECURITY DEFINER (default)
-- che esegue la view con i privilegi del creatore anziché 
-- dell'utente che la interroga.
--
-- SOLUZIONE:
-- Ricreare la view con SECURITY INVOKER per eseguire
-- con i privilegi dell'utente che fa la query.
-- Questo è più sicuro e risolve il warning di Supabase.
--
-- =====================================================

-- Ricreare la view con SECURITY INVOKER
CREATE OR REPLACE VIEW public_profiles 
WITH (security_invoker = true)
AS
SELECT 
    id,
    first_name,
    last_name,
    profile_picture_url,
    full_name
FROM profiles;

-- Assicurarsi che i permessi siano ancora corretti
GRANT SELECT ON public_profiles TO anon, authenticated;

-- =====================================================
-- VERIFICA
-- =====================================================
-- Dopo aver eseguito questo script, verifica che:
-- 1. La view funzioni ancora correttamente
-- 2. Il warning di Security Advisor sia scomparso
-- 3. Gli utenti anonimi possano vedere solo i campi pubblici
-- 4. Gli utenti autenticati possano vedere il proprio profilo completo

COMMENT ON VIEW public_profiles IS 
'Vista pubblica sicura con SECURITY INVOKER: espone SOLO first_name, last_name, profile_picture_url, full_name. Protegge email, telefono, codice fiscale, indirizzo. Esegue con i permessi dell''utente che interroga.';

