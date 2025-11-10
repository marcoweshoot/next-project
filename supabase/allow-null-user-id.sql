-- =====================================================
-- PERMETTI user_id NULL PER ANONIMIZZAZIONE GDPR
-- =====================================================
-- Questo permette di anonimizzare recensioni e prenotazioni
-- impostando user_id a NULL quando un utente cancella l'account

-- =====================================================
-- STEP 1: Permetti NULL in reviews.user_id
-- =====================================================

-- Rimuovi NOT NULL constraint da reviews.user_id
ALTER TABLE reviews 
ALTER COLUMN user_id DROP NOT NULL;

-- =====================================================
-- STEP 2: Permetti NULL in bookings.user_id
-- =====================================================

-- Rimuovi NOT NULL constraint da bookings.user_id
ALTER TABLE bookings 
ALTER COLUMN user_id DROP NOT NULL;

-- =====================================================
-- STEP 3: Aggiorna normalizeSupabaseReview per gestire NULL
-- =====================================================

-- Nello snapshot.mjs, quando user_id è NULL, mostrare "Utente Anonimo"
-- Questo è già gestito dal codice:
-- const firstName = r.public_profiles?.first_name || "Utente";
-- const lastName = r.public_profiles?.last_name || "";

-- =====================================================
-- VERIFICA FINALE
-- =====================================================

-- Verifica che i constraint siano stati rimossi
SELECT 
    column_name,
    is_nullable,
    data_type
FROM information_schema.columns
WHERE table_name IN ('reviews', 'bookings')
AND column_name = 'user_id';

-- Dovrebbe mostrare is_nullable = 'YES' per entrambi

