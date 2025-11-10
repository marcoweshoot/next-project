-- Permetti lettura pubblica delle recensioni approvate
-- Necessario per permettere allo snapshot script di fetchare le recensioni
-- Lo script usa ANON_KEY che non ha auth.uid()

CREATE POLICY "Public can view approved reviews" ON reviews
FOR SELECT USING (status = 'approved');

-- Commento per documentazione
COMMENT ON POLICY "Public can view approved reviews" ON reviews 
IS 'Permette la lettura pubblica delle recensioni approvate per snapshot e pagina recensioni';

