-- =============================================
-- AGGIUNGI CAMPI PER CONSENSI PRIVACY E MARKETING
-- =============================================

-- Aggiungi campi per gestire i consensi GDPR
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS privacy_accepted BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS privacy_accepted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS marketing_accepted BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS marketing_accepted_at TIMESTAMP WITH TIME ZONE;

-- Commenti per chiarezza
COMMENT ON COLUMN profiles.privacy_accepted IS 'Accettazione Privacy Policy e Terms & Conditions (obbligatorio GDPR)';
COMMENT ON COLUMN profiles.privacy_accepted_at IS 'Data e ora accettazione privacy';
COMMENT ON COLUMN profiles.marketing_accepted IS 'Consenso ricezione comunicazioni marketing (opzionale)';
COMMENT ON COLUMN profiles.marketing_accepted_at IS 'Data e ora accettazione marketing';

-- Crea indici per performance
CREATE INDEX IF NOT EXISTS idx_profiles_privacy_accepted ON profiles(privacy_accepted);
CREATE INDEX IF NOT EXISTS idx_profiles_marketing_accepted ON profiles(marketing_accepted);

-- Per utenti esistenti, imposta privacy_accepted a true (assumendo abbiano già accettato)
-- e imposta la data al momento della creazione del profilo
UPDATE profiles 
SET 
  privacy_accepted = true,
  privacy_accepted_at = COALESCE(created_at, NOW())
WHERE privacy_accepted IS NULL OR privacy_accepted = false;

