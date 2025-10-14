-- =============================================
-- FUNZIONE RPC PER CERCARE UTENTI PER EMAIL
-- =============================================

-- Prima elimina la funzione esistente se presente
DROP FUNCTION IF EXISTS find_user_by_email(TEXT);

-- Crea una funzione RPC che permette di cercare utenti per email
-- Questa funzione può essere chiamata solo dal service role o da super admin
CREATE OR REPLACE FUNCTION find_user_by_email(user_email TEXT)
RETURNS TABLE (
  id UUID,
  email VARCHAR,
  first_name TEXT,
  last_name TEXT
) AS $$
BEGIN
  -- Verifica che l'utente corrente abbia i permessi necessari
  -- Solo super_admin possono chiamare questa funzione
  IF NOT EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role = 'super_admin'
  ) AND auth.role() != 'service_role' THEN
    RAISE EXCEPTION 'Access denied. Only super_admin users can search for users by email.';
  END IF;

  -- Cerca l'utente per email e restituisci i dati del profilo
  RETURN QUERY
  SELECT 
    u.id,
    u.email::VARCHAR,
    COALESCE(p.first_name, '')::TEXT,
    COALESCE(p.last_name, '')::TEXT
  FROM auth.users u
  LEFT JOIN profiles p ON p.id = u.id
  WHERE u.email = user_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Commento per chiarezza
COMMENT ON FUNCTION find_user_by_email(TEXT) IS 'Funzione per cercare utenti per email. Accessibile solo a super_admin e service_role.';

-- Test della funzione (opzionale)
-- SELECT * FROM find_user_by_email('test@example.com');
