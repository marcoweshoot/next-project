-- Script per risolvere i warning di sicurezza di Supabase
-- Esegui questo script su Supabase SQL Editor

-- ==============================================
-- FIX: Function Search Path Mutable
-- ==============================================

-- Ricrea la funzione update_updated_at_column con search_path fisso
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public  -- FIX: Imposta search_path fisso
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Commento sulla funzione
COMMENT ON FUNCTION public.update_updated_at_column() IS 
  'Trigger function to automatically update the updated_at column';

-- ==============================================
-- FIX: validate_fiscal_code search_path
-- ==============================================

-- Step 1: Rimuovi temporaneamente il constraint che dipende dalla funzione
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS check_fiscal_code;

-- Step 2: Drop la vecchia funzione
DROP FUNCTION IF EXISTS public.validate_fiscal_code(text);

-- Step 3: Ricrea la funzione con search_path fisso e nome parametro corretto
CREATE OR REPLACE FUNCTION public.validate_fiscal_code(fc text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public  -- FIX: Imposta search_path fisso
AS $$
BEGIN
  -- Validazione base: lunghezza 16 caratteri, formato alfanumerico
  IF fc IS NULL OR length(fc) != 16 THEN
    RETURN FALSE;
  END IF;
  
  -- Verifica che sia alfanumerico maiuscolo
  IF fc !~ '^[A-Z0-9]{16}$' THEN
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$;

-- Commento sulla funzione
COMMENT ON FUNCTION public.validate_fiscal_code(text) IS 
  'Validates Italian fiscal code format';

-- Step 4: Ricrea il constraint sulla tabella profiles
ALTER TABLE public.profiles 
  ADD CONSTRAINT check_fiscal_code 
  CHECK (fiscal_code IS NULL OR validate_fiscal_code(fiscal_code));

-- ==============================================
-- FIX: Altre funzioni con search_path mutabile
-- ==============================================

-- FIX: is_admin function
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = is_admin.user_id 
    AND role = 'admin'
  );
END;
$$;

-- FIX: handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, created_at, updated_at)
  VALUES (NEW.id, NEW.email, NOW(), NOW())
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- FIX: cleanup_expired_magic_links function
CREATE OR REPLACE FUNCTION public.cleanup_expired_magic_links()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.temp_magic_links
  WHERE expires_at < NOW();
END;
$$;

-- FIX: is_super_admin function
CREATE OR REPLACE FUNCTION public.is_super_admin(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = is_super_admin.user_id 
    AND role = 'super_admin'
  );
END;
$$;

-- FIX: find_user_by_email function
CREATE OR REPLACE FUNCTION public.find_user_by_email(email_param text)
RETURNS TABLE(user_id uuid, user_email text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN QUERY
  SELECT id as user_id, email as user_email
  FROM auth.users
  WHERE email = email_param
  LIMIT 1;
END;
$$;

-- ==============================================
-- Verifica che i trigger siano attivi
-- ==============================================

-- Lista tutti i trigger che usano questa funzione
SELECT 
  event_object_schema,
  event_object_table,
  trigger_name,
  event_manipulation,
  action_timing
FROM information_schema.triggers
WHERE action_statement LIKE '%update_updated_at_column%'
ORDER BY event_object_table;

-- Fine dello script

