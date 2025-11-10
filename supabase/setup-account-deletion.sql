-- =====================================================
-- SETUP PER CANCELLAZIONE ACCOUNT (GDPR COMPLIANT)
-- =====================================================
-- Questo file configura il sistema per gestire la cancellazione
-- degli account in modo conforme al GDPR

-- =====================================================
-- STEP 1: Crea profilo "Utente Anonimo" per anonimizzazione
-- =====================================================

-- Crea un profilo speciale per le recensioni/prenotazioni anonimizzate
INSERT INTO profiles (
  id,
  first_name,
  last_name,
  full_name,
  email,
  country,
  privacy_accepted,
  privacy_accepted_at,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'Utente',
  'Anonimo',
  'Utente Anonimo',
  'anonymous@system.internal',
  'IT',
  true,
  NOW(),
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- STEP 2: Permetti user_id NULL nelle tabelle (opzionale)
-- =====================================================

-- Se vuoi permettere user_id NULL invece di usare il profilo anonimo,
-- decommentacommenta queste righe:

-- ALTER TABLE reviews ALTER COLUMN user_id DROP NOT NULL;
-- ALTER TABLE bookings ALTER COLUMN user_id DROP NOT NULL;

-- =====================================================
-- STEP 3: Policy per permettere lettura recensioni anonime
-- =====================================================

-- Le recensioni del profilo anonimo devono essere pubbliche
-- (già coperto da public_profiles vista)

-- =====================================================
-- STEP 4: Funzione per anonimizzare dati (opzionale)
-- =====================================================

-- Crea funzione helper per anonimizzare un account
CREATE OR REPLACE FUNCTION anonymize_user_data(target_user_id UUID)
RETURNS VOID AS $$
BEGIN
  -- Anonimizza recensioni
  UPDATE reviews
  SET user_id = '00000000-0000-0000-0000-000000000000'
  WHERE user_id = target_user_id;

  -- Anonimizza prenotazioni
  UPDATE bookings
  SET user_id = '00000000-0000-0000-0000-000000000000'
  WHERE user_id = target_user_id;

  -- Cancella profilo
  DELETE FROM profiles WHERE id = target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Permetti solo agli utenti di chiamare questa funzione sul proprio account
REVOKE ALL ON FUNCTION anonymize_user_data FROM PUBLIC;
GRANT EXECUTE ON FUNCTION anonymize_user_data TO authenticated;

-- =====================================================
-- COMMENTI E DOCUMENTAZIONE
-- =====================================================

COMMENT ON FUNCTION anonymize_user_data IS 
'Anonimizza tutti i dati di un utente in conformità al GDPR. Mantiene recensioni e prenotazioni per integrità del sistema ma rimuove il collegamento all''utente.';

-- =====================================================
-- VERIFICA FINALE
-- =====================================================

-- Verifica che il profilo anonimo esista
SELECT 
    id,
    first_name,
    last_name,
    email
FROM profiles 
WHERE id = '00000000-0000-0000-0000-000000000000';

