# 🎁 Implementazione Sistema Gift Card - WeShoot

## 📋 Panoramica

Sistema completo di gift card che permette agli utenti di:
- ✅ Acquistare gift card di diversi importi
- ✅ Ricevere codici univoci via email
- ✅ Applicare le gift card durante il checkout
- ✅ Visualizzare le gift card possedute nella dashboard
- ✅ Utilizzare gift card su più prenotazioni (utilizzo parziale)

---

## 🗂️ File Creati/Modificati

### **Nuovi File**

1. **Migration Database**
   - `supabase/migrations/0002_add_gift_cards_table.sql`
   - Crea tabelle `gift_cards` e `gift_card_transactions`
   - Include RLS policies e funzioni per generazione codici

2. **Utilities Gift Card**
   - `src/lib/giftCards.ts`
   - Funzioni per generazione, validazione e applicazione gift card
   - Export tipi TypeScript per GiftCard e GiftCardTransaction

3. **API Routes**
   - `src/app/api/gift-cards/validate/route.ts` - Valida codici
   - `src/app/api/gift-cards/apply/route.ts` - Applica gift card
   - `src/app/api/gift-cards/user/route.ts` - Lista gift card utente

4. **Componenti React**
   - `src/components/gift-card/GiftCardInput.tsx` - Campo input gift card
   - `src/components/dashboard/UserGiftCards.tsx` - Lista gift card dashboard

### **File Modificati**

1. **Webhook Stripe**
   - `src/app/api/webhook-stripe/route.ts`
   - Aggiunta gestione pagamenti gift card
   - Applicazione automatica gift card ai booking
   - Invio email con codice

2. **Checkout Session**
   - `src/app/api/stripe/create-checkout-session/route.ts`
   - Validazione gift card pre-checkout
   - Calcolo importo scontato
   - Passaggio dati nei metadata Stripe

3. **Booking Form**
   - `src/components/booking/BookingForm.tsx`
   - Integrazione campo gift card
   - Calcolo importo finale
   - Gestione caso gift card che copre tutto l'importo

4. **Stripe Checkout Button**
   - `src/components/payment/StripeCheckoutButton.tsx`
   - Supporto parametro `giftCardCode`

5. **Email Service**
   - `src/lib/email.ts`
   - Aggiunta funzione `sendGiftCardEmail()`
   - Template HTML/Text per gift card

---

## 🏗️ Architettura

### **Database Schema**

```sql
gift_cards
  - id (UUID, PK)
  - code (VARCHAR, UNIQUE) - Formato: XXXX-XXXX-XXXX
  - amount (INTEGER) - Importo in centesimi
  - remaining_balance (INTEGER) - Credito residuo
  - purchaser_user_id (UUID, FK)
  - recipient_email (VARCHAR)
  - status (VARCHAR) - active, used, expired, cancelled
  - expires_at (TIMESTAMP) - Scadenza (2 anni)
  - stripe_session_id (VARCHAR)
  - stripe_payment_intent_id (VARCHAR)
  - created_at, updated_at

gift_card_transactions
  - id (UUID, PK)
  - gift_card_id (UUID, FK)
  - booking_id (UUID, FK)
  - user_id (UUID, FK)
  - amount_used (INTEGER)
  - created_at
```

### **Flusso Acquisto Gift Card**

```
1. Utente acquista gift card su /gift-card
   ↓
2. Supabase Edge Function crea sessione Stripe
   ↓
3. Pagamento completato → Webhook Stripe
   ↓
4. Webhook genera codice univoco
   ↓
5. Salva gift card nel database
   ↓
6. Invia email con codice al cliente
```

### **Flusso Utilizzo Gift Card**

```
1. Utente inserisce codice nel BookingForm
   ↓
2. API /validate verifica validità
   ↓
3. Frontend mostra sconto applicato
   ↓
4. Create-checkout-session calcola importo finale
   ↓
5. Stripe processa pagamento ridotto
   ↓
6. Webhook applica gift card al booking
   ↓
7. Database aggiorna remaining_balance e crea transaction
```

---

## 🧪 Test Plan

### **1. Test Acquisto Gift Card**

**Setup:**
- Vai su `/gift-card`
- Scegli un importo (es. €50)

**Passi:**
1. Click su "Acquista Ora"
2. Completa pagamento Stripe (usa carta test: `4242 4242 4242 4242`)
3. Verifica redirect a `/thank-you`

**Verifica:**
- [ ] Gift card creata nel database
- [ ] Codice univoco generato (formato XXXX-XXXX-XXXX)
- [ ] Email ricevuta con codice
- [ ] Status = 'active'
- [ ] Remaining_balance = amount
- [ ] Expires_at = +2 anni

**Query DB:**
```sql
SELECT * FROM gift_cards 
WHERE recipient_email = 'tua-email@test.com'
ORDER BY created_at DESC 
LIMIT 1;
```

---

### **2. Test Validazione Gift Card**

**Setup:**
- Prendi un codice gift card valido dal test precedente
- Vai su una pagina tour e click "Prenota"

**Passi:**
1. Espandi sezione "Hai una Gift Card?"
2. Inserisci codice (es. `ABCD-EFGH-IJKL`)
3. Click "Applica"

**Verifica:**
- [ ] Box verde "Gift Card applicata" appare
- [ ] Sconto mostrato nel riepilogo
- [ ] Importo "Da pagare ora" ridotto
- [ ] Codice copiabile

**Test Negativi:**
- [ ] Codice inesistente → Errore "Codice non trovato"
- [ ] Codice già usato → Errore "Gift card già utilizzata"
- [ ] Formato invalido → Errore "Formato codice non valido"

---

### **3. Test Pagamento con Gift Card**

**Scenario A: Gift Card Parziale**
- Gift card: €50
- Acconto tour: €200
- Importo finale: €150

**Passi:**
1. Applica gift card
2. Verifica importo = €150
3. Completa pagamento Stripe
4. Verifica booking creato

**Verifica:**
- [ ] Booking.amount_paid = €200 (200 pagati con Stripe + 50 gift card)
- [ ] Gift card remaining_balance = 0
- [ ] Gift card status = 'used'
- [ ] Transaction creata in gift_card_transactions

**Scenario B: Gift Card che copre tutto**
- Gift card: €500
- Acconto tour: €200
- Importo finale: €0

**Passi:**
1. Applica gift card
2. Verifica messaggio "copre l'intero importo"
3. Nessun pagamento Stripe

**Verifica:**
- [ ] Pulsante pagamento nascosto
- [ ] Messaggio informativo mostrato
- [ ] (Richiede gestione manuale admin)

---

### **4. Test Dashboard Gift Cards**

**Setup:**
- Login con utente che ha gift card
- Vai su `/dashboard`

**Verifica:**
- [ ] Componente UserGiftCards mostra lista
- [ ] Ogni card mostra:
  - Codice gift card
  - Importo residuo
  - Status badge
  - Data creazione e scadenza
  - Barra progresso (se usata parzialmente)
- [ ] Pulsante "Copia codice" funziona
- [ ] Link "Acquista gift card" se lista vuota

---

### **5. Test Email Gift Card**

**Verifica email ricevuta:**
- [ ] Subject: "🎁 La tua Gift Card WeShoot di €XX"
- [ ] Codice ben visibile (grande, grassetto)
- [ ] Importo mostrato
- [ ] Istruzioni utilizzo chiare
- [ ] Data scadenza indicata
- [ ] Link a viaggi fotografici funzionante
- [ ] Footer con contatti

**Test sviluppo:**
Se `BREVO_API_KEY` non configurato, email viene loggata in console.

---

### **6. Test Webhook Stripe**

**Verifica log webhook:**
```bash
# Filtra per gift card
grep "🎁 \[WEBHOOK\]" logs/webhook.log
```

**Verifica:**
- [ ] `Processing gift card purchase...`
- [ ] `Gift card created successfully: XXXX-XXXX-XXXX`
- [ ] `Sending gift card email to: xxx@xxx.com`
- [ ] `Gift card email sent successfully!`

**Test applicazione gift card:**
```bash
# Filtra per applicazione
grep "Applying gift card" logs/webhook.log
```

- [ ] `Applying gift card XXXX-XXXX-XXXX with discount XXXX`
- [ ] `Gift card applied successfully. Remaining balance: XXXX`

---

### **7. Test Utilizzo Multiplo**

**Scenario:** Gift card da €500 usata su più booking

**Test 1:**
- Booking 1: Acconto €200
- Remaining: €300

**Test 2:**
- Booking 2: Acconto €150
- Remaining: €150

**Test 3:**
- Booking 3: Acconto €150
- Remaining: €0
- Status: 'used'

**Verifica:**
- [ ] 3 transazioni create
- [ ] Somma amount_used = 500
- [ ] Gift card status cambia a 'used' dopo ultimo utilizzo

---

### **8. Test Scadenza**

**Setup manuale:**
```sql
UPDATE gift_cards 
SET expires_at = NOW() - INTERVAL '1 day'
WHERE code = 'TEST-CODE-1234';
```

**Verifica:**
- [ ] Validazione fallisce con "Gift card scaduta"
- [ ] Non applicabile al checkout

---

## 🚀 Deploy Checklist

### **1. Database Migration**

```bash
# Esegui migration su Supabase
supabase migration up
```

Oppure manualmente:
1. Vai su Supabase Dashboard
2. SQL Editor
3. Copia contenuto di `0002_add_gift_cards_table.sql`
4. Run

### **2. Environment Variables**

Verifica che siano configurate:
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `BREVO_API_KEY` (per email)
- `ADMIN_EMAIL`

### **3. Stripe Webhook**

Aggiungi endpoint webhook su Stripe Dashboard:
- URL: `https://tuodominio.com/api/webhook-stripe`
- Eventi: `checkout.session.completed`

### **4. Test Produzione**

Prima di annunciare la feature:
1. Acquista gift card di test
2. Verifica ricezione email
3. Usa gift card su booking reale
4. Controlla dashboard
5. Verifica transazioni in DB

---

## 🔧 Troubleshooting

### **Email non arriva**

1. Check logs webhook: `grep "EMAIL" logs/*.log`
2. Verifica `BREVO_API_KEY` configurato
3. Check spam/junk folder
4. Verifica email in Brevo Dashboard

### **Gift card non si applica**

1. Check formato codice: `XXXX-XXXX-XXXX`
2. Verifica status in DB: `SELECT * FROM gift_cards WHERE code = 'XXX'`
3. Check remaining_balance > 0
4. Verifica scadenza

### **Webhook fallisce**

1. Check Stripe webhook logs
2. Verifica signature Stripe
3. Check `STRIPE_WEBHOOK_SECRET`
4. Test con Stripe CLI: `stripe listen --forward-to localhost:3000/api/webhook-stripe`

---

## 📊 Queries Utili

### **Gift Cards Attive**
```sql
SELECT code, amount/100.0 as euro, remaining_balance/100.0 as remaining,
       created_at, expires_at
FROM gift_cards
WHERE status = 'active'
  AND (expires_at IS NULL OR expires_at > NOW())
ORDER BY created_at DESC;
```

### **Utilizzo Gift Cards**
```sql
SELECT 
  gc.code,
  COUNT(gct.id) as num_uses,
  SUM(gct.amount_used)/100.0 as total_used_euro
FROM gift_cards gc
LEFT JOIN gift_card_transactions gct ON gc.id = gct.gift_card_id
GROUP BY gc.id
ORDER BY total_used_euro DESC;
```

### **Gift Cards per Utente**
```sql
SELECT 
  p.email,
  COUNT(gc.id) as num_cards,
  SUM(gc.remaining_balance)/100.0 as total_credit
FROM gift_cards gc
JOIN profiles p ON gc.purchaser_user_id = p.id
GROUP BY p.id
ORDER BY total_credit DESC;
```

---

## 🎯 Feature Future

Possibili miglioramenti:
- [ ] Admin panel per gestire gift card
- [ ] Revoca/cancellazione gift card
- [ ] Invio gift card a email diversa dal purchaser
- [ ] Gift card personalizzate (messaggio)
- [ ] Report utilizzo gift card
- [ ] Notifiche scadenza
- [ ] Gift card ricorrenti/abbonamenti

---

## 📞 Supporto

Per problemi o domande:
- Backend: webhook-stripe/route.ts
- Frontend: components/gift-card/*
- Database: supabase/migrations/0002_*
- Email: lib/email.ts → sendGiftCardEmail()

---

**Implementato da:** AI Assistant  
**Data:** $(date +%Y-%m-%d)  
**Branch:** feature/gift-card-improvements

