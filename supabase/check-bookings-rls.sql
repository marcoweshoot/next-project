-- Verifica e aggiorna le policy RLS per la tabella bookings

-- Rimuovi le vecchie policy se esistono
DROP POLICY IF EXISTS "Users can insert their own bookings" ON bookings;
DROP POLICY IF EXISTS "Service role can manage all bookings" ON bookings;

-- Policy per permettere agli utenti di inserire le loro prenotazioni
CREATE POLICY "Users can insert their own bookings" ON bookings
FOR INSERT WITH CHECK (
  auth.uid() = user_id OR 
  (auth.jwt() ->> 'is_anonymous')::boolean = true
);

-- Policy per permettere al service role (webhook) di inserire prenotazioni
CREATE POLICY "Service role can manage all bookings" ON bookings
FOR ALL USING (
  auth.role() = 'service_role'
);

-- Verifica che RLS sia abilitato
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Mostra tutte le policy attuali
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd, 
  qual, 
  with_check
FROM pg_policies
WHERE tablename = 'bookings';

