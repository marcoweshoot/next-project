-- Script per aggiornare i profili esistenti creati con Google senza consensi
-- Da eseguire manualmente su Supabase SQL Editor

-- Aggiorna il profilo dell'utente che si è registrato per primo (probabilmente Marco)
-- Imposta privacy_accepted = TRUE e la data di accettazione
-- NOTA: Esegui questo solo per gli utenti che hanno già dato il consenso verbale o implicito

UPDATE public.profiles
SET 
  privacy_accepted = TRUE,
  privacy_accepted_at = NOW(),
  marketing_accepted = FALSE,  -- Lasciamo FALSE per sicurezza, se vuoi ricevere newsletter cambia in TRUE
  marketing_accepted_at = NULL,
  updated_at = NOW()
WHERE 
  -- Filtra per i profili che non hanno ancora i campi consenso impostati
  privacy_accepted IS NULL OR privacy_accepted = FALSE;

-- Per vedere i profili aggiornati:
SELECT 
  id,
  email,
  first_name,
  last_name,
  privacy_accepted,
  privacy_accepted_at,
  marketing_accepted,
  marketing_accepted_at,
  created_at,
  updated_at
FROM public.profiles
ORDER BY created_at DESC
LIMIT 10;

