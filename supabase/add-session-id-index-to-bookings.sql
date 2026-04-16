-- Aggiungi indice su session_id per performance delle query di disponibilità sessioni
-- Usato da /api/sessions/availability per calcolare i posti occupati per sessione

CREATE INDEX IF NOT EXISTS idx_bookings_session_id ON public.bookings USING btree (session_id);
