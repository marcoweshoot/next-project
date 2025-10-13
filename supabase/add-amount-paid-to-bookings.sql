-- Aggiungi campo amount_paid alla tabella bookings
-- Per tracciare l'importo effettivamente pagato dal cliente

-- Aggiungi la colonna amount_paid se non esiste
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS amount_paid INTEGER DEFAULT 0;

-- Aggiungi commento per chiarezza
COMMENT ON COLUMN bookings.amount_paid IS 'Importo effettivamente pagato dal cliente in centesimi (per calcoli di saldi e crediti)';

-- Aggiorna i record esistenti con valori di default basati sullo stato
-- Se lo status è 'fully_paid', amount_paid = total_amount
-- Se lo status è 'deposit_paid', amount_paid = deposit_amount  
-- Altrimenti amount_paid = 0
UPDATE bookings 
SET amount_paid = CASE 
  WHEN status = 'fully_paid' THEN total_amount
  WHEN status = 'deposit_paid' THEN deposit_amount
  ELSE 0
END
WHERE amount_paid = 0 OR amount_paid IS NULL;

-- Crea indice per performance
CREATE INDEX IF NOT EXISTS idx_bookings_amount_paid ON bookings(amount_paid);

-- Verifica che la colonna sia stata aggiunta correttamente
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'bookings' 
AND column_name = 'amount_paid';
