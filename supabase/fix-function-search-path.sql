-- =====================================================
-- FIX: Function Search Path Mutable Warning
-- =====================================================
-- 
-- PROBLEMA:
-- Le funzioni update_gift_card_updated_at e generate_gift_card_code
-- non hanno il search_path impostato, il che può causare problemi
-- di sicurezza se un utente malintenzionato manipola il percorso 
-- di ricerca per eseguire codice malevolo.
--
-- SOLUZIONE:
-- Aggiungere SET search_path alle funzioni per bloccare il percorso
-- di ricerca a 'public' (o altri schema sicuri).
--
-- SECURITY IMPACT:
-- Previene SQL injection attacks tramite search_path manipulation
--
-- =====================================================

-- Fix 1: update_gift_card_updated_at
CREATE OR REPLACE FUNCTION update_gift_card_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Fix 2: generate_gift_card_code
CREATE OR REPLACE FUNCTION generate_gift_card_code()
RETURNS TEXT 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; -- Removed ambiguous chars
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..12 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN result;
END;
$$;

-- =====================================================
-- VERIFICA
-- =====================================================
-- Dopo aver eseguito questo script, verifica che:
-- 1. I trigger funzionino ancora correttamente
-- 2. Il codice gift card venga generato correttamente
-- 3. I warning "Function Search Path Mutable" siano scomparsi

COMMENT ON FUNCTION update_gift_card_updated_at() IS 
'Funzione sicura con search_path bloccato per prevenire SQL injection';

COMMENT ON FUNCTION generate_gift_card_code() IS 
'Funzione sicura con search_path bloccato per prevenire SQL injection';

