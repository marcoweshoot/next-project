-- =============================================
-- FUNZIONE PER CREARE PROFILI AUTOMATICAMENTE
-- =============================================

-- Funzione per creare un profilo utente
-- Usa SECURITY DEFINER per bypassare RLS
CREATE OR REPLACE FUNCTION public.create_user_profile(
  user_id UUID,
  user_email TEXT,
  user_first_name TEXT DEFAULT '',
  user_last_name TEXT DEFAULT ''
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER -- Esegue con i permessi del creatore (bypassando RLS)
SET search_path = public
AS $$
BEGIN
  -- Inserisci o aggiorna il profilo
  INSERT INTO public.profiles (
    id,
    email,
    first_name,
    last_name,
    full_name,
    country,
    created_at,
    updated_at
  )
  VALUES (
    user_id,
    user_email,
    user_first_name,
    user_last_name,
    TRIM(user_first_name || ' ' || user_last_name),
    'IT',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) 
  DO UPDATE SET
    email = COALESCE(NULLIF(profiles.email, ''), EXCLUDED.email),
    first_name = COALESCE(NULLIF(profiles.first_name, ''), EXCLUDED.first_name),
    last_name = COALESCE(NULLIF(profiles.last_name, ''), EXCLUDED.last_name),
    full_name = TRIM(
      COALESCE(NULLIF(profiles.first_name, ''), EXCLUDED.first_name) || ' ' || 
      COALESCE(NULLIF(profiles.last_name, ''), EXCLUDED.last_name)
    ),
    updated_at = NOW();
    
  EXCEPTION WHEN others THEN
    -- Log error ma non fallire
    RAISE WARNING 'Error creating profile for user %: %', user_id, SQLERRM;
END;
$$;

-- Grant execute permission a tutti gli utenti autenticati
GRANT EXECUTE ON FUNCTION public.create_user_profile(UUID, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_user_profile(UUID, TEXT, TEXT, TEXT) TO anon;

-- Commento per chiarezza
COMMENT ON FUNCTION public.create_user_profile IS 'Crea o aggiorna un profilo utente bypassando RLS. Usato durante la registrazione.';

