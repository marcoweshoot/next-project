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

-- Se la funzione validate_fiscal_code esiste, ricreala con search_path fisso
CREATE OR REPLACE FUNCTION public.validate_fiscal_code(fiscal_code text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public  -- FIX: Imposta search_path fisso
AS $$
BEGIN
  -- Validazione base: lunghezza 16 caratteri, formato alfanumerico
  IF fiscal_code IS NULL OR length(fiscal_code) != 16 THEN
    RETURN FALSE;
  END IF;
  
  -- Verifica che sia alfanumerico maiuscolo
  IF fiscal_code !~ '^[A-Z0-9]{16}$' THEN
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$;

-- Commento sulla funzione
COMMENT ON FUNCTION public.validate_fiscal_code(text) IS 
  'Validates Italian fiscal code format';

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

