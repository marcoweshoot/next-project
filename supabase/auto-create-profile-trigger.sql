-- =============================================
-- TRIGGER PER CREAZIONE AUTOMATICA PROFILO UTENTE
-- =============================================

-- Funzione che crea automaticamente un profilo quando viene creato un utente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Inserisci automaticamente un profilo per il nuovo utente
  INSERT INTO public.profiles (
    id,
    email,
    first_name,
    last_name,
    full_name,
    avatar_url,
    country,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    -- Estrai first_name e last_name dai metadata
    COALESCE(
      NEW.raw_user_meta_data->>'first_name',
      NEW.raw_user_meta_data->>'given_name',
      split_part(COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''), ' ', 1)
    ),
    COALESCE(
      NEW.raw_user_meta_data->>'last_name',
      NEW.raw_user_meta_data->>'family_name',
      split_part(COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''), ' ', 2)
    ),
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      ''
    ),
    COALESCE(
      NEW.raw_user_meta_data->>'avatar_url',
      NEW.raw_user_meta_data->>'picture',
      ''
    ),
    'IT', -- Default country
    NOW(),
    NOW()
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Crea il trigger che si attiva quando viene inserito un nuovo utente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Commenti per chiarezza
COMMENT ON FUNCTION public.handle_new_user() IS 'Crea automaticamente un profilo quando viene creato un nuovo utente';
COMMENT ON TRIGGER on_auth_user_created ON auth.users IS 'Trigger che crea automaticamente il profilo per nuovi utenti';
