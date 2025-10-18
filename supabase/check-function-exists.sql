-- Script per verificare se la funzione create_user_profile esiste e ha i parametri corretti

-- Controlla se la funzione esiste
SELECT 
  proname as function_name,
  prokind as function_kind,
  pg_get_function_arguments(oid) as arguments,
  pg_get_function_result(oid) as return_type
FROM pg_proc
WHERE proname = 'create_user_profile'
  AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

-- Se non vedi risultati, la funzione NON esiste!
-- In quel caso devi eseguire: supabase/create-profile-function.sql

