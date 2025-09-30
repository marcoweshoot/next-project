-- =============================================
-- TABELLA TEMPORANEA PER MAGIC LINKS
-- =============================================

-- Crea la tabella per memorizzare temporaneamente i magic link
CREATE TABLE IF NOT EXISTS temp_magic_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  magic_link TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  used_at TIMESTAMPTZ NULL
);

-- Crea un indice per le ricerche rapide
CREATE INDEX IF NOT EXISTS idx_temp_magic_links_user_id ON temp_magic_links(user_id);
CREATE INDEX IF NOT EXISTS idx_temp_magic_links_email ON temp_magic_links(email);
CREATE INDEX IF NOT EXISTS idx_temp_magic_links_expires_at ON temp_magic_links(expires_at);

-- Abilita RLS
ALTER TABLE temp_magic_links ENABLE ROW LEVEL SECURITY;

-- Policy per permettere l'accesso ai magic link dell'utente
CREATE POLICY "Users can access their own magic links" ON temp_magic_links
FOR ALL USING (auth.uid() = user_id);

-- Policy per permettere l'accesso ai magic link per il service role (webhook)
CREATE POLICY "Service role can manage all magic links" ON temp_magic_links
FOR ALL USING (auth.role() = 'service_role');

-- Funzione per pulire automaticamente i magic link scaduti
CREATE OR REPLACE FUNCTION cleanup_expired_magic_links()
RETURNS void AS $$
BEGIN
  DELETE FROM temp_magic_links 
  WHERE expires_at < NOW() OR used_at IS NOT NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Crea un job per pulire automaticamente i magic link scaduti ogni ora
-- (Opzionale: richiede pg_cron extension)
-- SELECT cron.schedule('cleanup-magic-links', '0 * * * *', 'SELECT cleanup_expired_magic_links();');

-- Commenti per chiarezza
COMMENT ON TABLE temp_magic_links IS 'Tabella temporanea per memorizzare magic link per auto-login dopo pagamenti anonimi';
COMMENT ON COLUMN temp_magic_links.magic_link IS 'Link magico generato da Supabase Auth per auto-login';
COMMENT ON COLUMN temp_magic_links.expires_at IS 'Data di scadenza del magic link (15 minuti dalla creazione)';
COMMENT ON COLUMN temp_magic_links.used_at IS 'Data di utilizzo del magic link (NULL se non ancora usato)';
