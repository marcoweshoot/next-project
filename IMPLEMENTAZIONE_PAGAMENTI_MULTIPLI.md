# Implementazione Pagamenti Multipli - Riepilogo

## 📋 Cosa è stato implementato

Hai richiesto un sistema per suddividere i pagamenti del sito tra:
- **3 tour** → Pagamenti diretti al tuo account Stripe (platform)
- **27 tour** → Pagamenti all'account dell'agenzia di viaggi

È stato implementato un sistema completo basato su **Stripe Connect** che permette di:
- ✅ Instradare automaticamente i pagamenti al beneficiario corretto
- ✅ Gestire tutto da un'unica piattaforma
- ✅ Opzionalmente trattenere una fee della piattaforma
- ✅ Mantenere il controllo completo su tutti i pagamenti

## 🔧 Modifiche al Codice

### 1. **Tipi TypeScript** (`src/types/tour.ts`)
Aggiunto il campo `payment_recipient` all'interfaccia `Tour`:
```typescript
payment_recipient?: 'weshoot' | 'agency';
```

### 2. **Query GraphQL** (`src/graphql/queries/tour-base.ts`)
Aggiunto `payment_recipient` alla query GraphQL per recuperare questo campo dal CMS.

### 3. **API Checkout** (`src/app/api/stripe/create-checkout-session/route.ts`)
Implementata la logica di routing dei pagamenti:
- Recupera `payment_recipient` dal CMS per ogni tour
- Se `payment_recipient = 'weshoot'`: pagamento diretto al tuo account
- Se `payment_recipient = 'agency'`: pagamento instradato all'account dell'agenzia usando Stripe Connect
- Supporto opzionale per platform fee

### 4. **Script Snapshot** (`src/scripts/snapshot.mjs`)
Aggiunto `payment_recipient` alla query dei tour nello script di snapshot.

## 📚 Documentazione Creata

### 1. **STRIPE_CONNECT_SETUP.md**
Guida completa per:
- Configurare Stripe Connect
- Creare l'account connesso per l'agenzia
- Configurare le variabili d'ambiente
- Aggiungere il campo al CMS Strapi
- FAQ e troubleshooting

### 2. **STRIPE_CONNECT_TESTING.md**
Guida passo-passo per testare:
- Pagamenti platform
- Pagamenti agency
- Platform fee
- Webhook
- Carte di test
- Passaggio a produzione

### 3. **Questo file** - Riepilogo e prossimi passi

## 🚀 Prossimi Passi (In Ordine)

### Step 1: Configurazione Stripe Connect (30 minuti)

1. **Crea l'account Connect per l'agenzia**
   - Accedi a [Stripe Dashboard](https://dashboard.stripe.com)
   - Attiva "Viewing test data" (interruttore in alto a destra)
   - Vai su **Connect** → **Accounts** → **+ New**
   - Scegli **Express** account
   - Segui l'onboarding (puoi usare dati fittizi per il test)
   - Copia l'**Account ID** (formato: `acct_xxxxxxxxxxxxx`)

2. **Configura le variabili d'ambiente**
   
   Nel tuo `.env.local` (per sviluppo):
   ```bash
   # Stripe Connect - Account Agenzia
   STRIPE_CONNECT_AGENCY_ACCOUNT_ID=acct_xxxxxxxxxxxxx
   
   # Platform Fee (opzionale, 0 = nessuna fee)
   STRIPE_PLATFORM_FEE_PERCENT=0
   ```
   
   In **Vercel** (per produzione):
   - Vai su Settings → Environment Variables
   - Aggiungi:
     - `STRIPE_CONNECT_AGENCY_ACCOUNT_ID` = `acct_xxxxxxxxxxxxx`
     - `STRIPE_PLATFORM_FEE_PERCENT` = `0` (o il valore che preferisci)

### Step 2: Configurazione CMS Strapi (15 minuti)

1. **Aggiungi il campo al Content Type Tour**
   - Accedi al tuo Strapi Admin
   - Vai su **Content-Type Builder** → **Tour**
   - Clicca **Add another field**
   - Seleziona **Enumeration**
   - Nome: `payment_recipient`
   - Valori (uno per riga):
     ```
     weshoot
     agency
     ```
   - Imposta **Default value**: `agency`
   - Spunta **Required**
   - Salva
   - **Importante**: Riavvia il server Strapi

2. **Configura i tour**
   - Vai su **Content Manager** → **Tours**
   - Per i tuoi **3 tour personali**:
     - Apri il tour
     - Imposta `payment_recipient = "weshoot"`
     - Pubblica
   - Per i **27 tour dell'agenzia**:
     - Apri ciascun tour
     - Imposta `payment_recipient = "agency"`
     - Pubblica
   
   💡 **Tip**: Se hai tanti tour, potresti chiedere al team Strapi di aggiungere un'opzione "Bulk Edit" o fare una migration SQL diretta.

### Step 3: Test in Locale (30 minuti)

Segui la guida completa in **STRIPE_CONNECT_TESTING.md**, in sintesi:

1. **Avvia il server**
   ```bash
   npm run dev
   ```

2. **Testa un tour "weshoot"**
   - Vai al tour con `payment_recipient = "weshoot"`
   - Prenota una sessione
   - Usa carta: `4242 4242 4242 4242`
   - Verifica che il pagamento arrivi sul tuo account principale

3. **Testa un tour "agency"**
   - Vai al tour con `payment_recipient = "agency"`
   - Prenota una sessione
   - Usa carta: `4242 4242 4242 4242`
   - Verifica che il pagamento sia instradato all'account agenzia

4. **Controlla i log**
   Nel terminale dovresti vedere:
   ```
   💳 [CHECKOUT] Payment recipient for tour xxx: weshoot
   📸 [CHECKOUT] Payment stays on WeShoot account
   ```
   Oppure:
   ```
   💳 [CHECKOUT] Payment recipient for tour xxx: agency
   🏢 [CHECKOUT] Routing to agency account: acct_xxxxxxxxxxxxx
   ```

### Step 4: Deploy e Test in Staging (15 minuti)

1. **Commit e push delle modifiche**
   ```bash
   git add .
   git commit -m "Implementa routing pagamenti con Stripe Connect"
   git push
   ```

2. **Configura le variabili in Vercel**
   - Vai su Vercel Dashboard → Settings → Environment Variables
   - Aggiungi `STRIPE_CONNECT_AGENCY_ACCOUNT_ID` e `STRIPE_PLATFORM_FEE_PERCENT`
   - Seleziona **Preview** e **Production**

3. **Testa in staging**
   - Vai sul tuo URL di preview Vercel
   - Ripeti i test del Step 3

### Step 5: Produzione (1 ora)

1. **Crea l'account Connect LIVE**
   - In Stripe Dashboard, disattiva "Viewing test data"
   - Vai su **Connect** → **Accounts** → **+ New**
   - Crea un **Express** account per l'agenzia
   - L'agenzia dovrà completare l'onboarding con:
     - Dati fiscali reali
     - IBAN per ricevere i pagamenti
     - Documenti di identità
     - Informazioni sulla società/attività
   - Questo processo può richiedere 24-48h per l'approvazione

2. **Aggiorna le variabili di produzione**
   - In Vercel, aggiorna `STRIPE_CONNECT_AGENCY_ACCOUNT_ID` con l'account ID LIVE
   - Verifica che `STRIPE_SECRET_KEY` sia la chiave LIVE (inizia con `sk_live_`)

3. **Test con importo reale piccolo**
   - Fai un test con 1€ su un tour platform
   - Fai un test con 1€ su un tour agency
   - Verifica tutto funzioni
   - Fai rimborso dei test

## 💰 Gestione Platform Fee (Opzionale)

Se vuoi trattenere una commissione sui pagamenti che vanno all'agenzia:

1. **Imposta la percentuale**
   ```bash
   STRIPE_PLATFORM_FEE_PERCENT=2.5  # Per 2.5%
   ```

2. **Come funziona**
   - Cliente paga 100€
   - Agenzia riceve 97.50€
   - Tu ricevi 2.50€ come application fee
   - Commissioni Stripe (~1.5% + 0.25€) pagate dall'agenzia

3. **Dove vedi le fee**
   - Stripe Dashboard → **Connect** → **Application fees**

## 🔍 Monitoraggio e Dashboard

### Dashboard Piattaforma (tuo account)
- Vedi **tutti** i pagamenti (platform + agency)
- Gestisci rimborsi per entrambi i tipi
- Vedi le application fee trattenute
- **URL**: https://dashboard.stripe.com

### Dashboard Agenzia (account connesso)
- Vede **solo** i suoi pagamenti
- Gestisce i suoi payout (quando riceve i soldi sul conto)
- **URL**: https://dashboard.stripe.com (con le sue credenziali)

### Supabase Dashboard
- Tutte le prenotazioni sono salvate normalmente
- Il campo `metadata` della prenotazione contiene `paymentRecipient`
- Puoi filtrare le prenotazioni per beneficiario se necessario

## ⚠️ Note Importanti

### Sicurezza
- ✅ L'account ID dell'agenzia è server-side (sicuro)
- ✅ Il client non sa quale account riceve i soldi
- ✅ Solo tu (piattaforma) puoi modificare il routing

### Compliance
- ✅ PSD2/SCA gestito automaticamente da Stripe
- ✅ L'agenzia deve essere una società registrata per Stripe Connect
- ✅ Tutti i pagamenti sono tracciabili e conformi

### Rimborsi
- I rimborsi vengono gestiti dalla **piattaforma** (tu)
- Anche i pagamenti dell'agenzia possono essere rimborsati da te
- L'agenzia NON può fare rimborsi autonomamente (solo tu)

### Dispute
- Le dispute sono gestite dalla **piattaforma**
- Stripe ti notificherà per qualsiasi chargeback
- Dovrai gestire le dispute anche per i pagamenti dell'agenzia

## 🆘 Troubleshooting Rapido

| Problema | Soluzione |
|----------|-----------|
| "STRIPE_CONNECT_AGENCY_ACCOUNT_ID not configured" | Aggiungi la variabile d'ambiente e riavvia |
| Pagamento va su account sbagliato | Verifica `payment_recipient` nel CMS Strapi (deve essere `weshoot` o `agency`) |
| Platform fee non appare | Imposta `STRIPE_PLATFORM_FEE_PERCENT > 0` |
| Account agenzia non riceve pagamenti | Verifica che l'account sia verificato e attivo |
| Webhook non funziona | Controlla `STRIPE_WEBHOOK_SECRET` in produzione |

## 📞 Supporto

Se hai problemi:

1. **Consulta la documentazione**:
   - `STRIPE_CONNECT_SETUP.md` - Setup e configurazione
   - `STRIPE_CONNECT_TESTING.md` - Testing e debug

2. **Stripe Support**:
   - Dashboard → Help → Contact Support
   - https://support.stripe.com
   - Molto reattivi e competenti

3. **Stripe Docs**:
   - https://stripe.com/docs/connect
   - https://stripe.com/docs/connect/destination-charges

## ✅ Checklist Finale

Prima di considerare completo:

- [ ] Account Connect creato e verificato (test E production)
- [ ] Variabili d'ambiente configurate (local E Vercel)
- [ ] Campo `payment_recipient` aggiunto al CMS Strapi
- [ ] 3 tour impostati come `weshoot`
- [ ] 27 tour impostati come `agency`
- [ ] Test in locale completati con successo
- [ ] Test in staging completati con successo
- [ ] Test in produzione con importi piccoli completati
- [ ] Webhook configurato e funzionante
- [ ] Email di conferma funzionano per entrambi i tipi
- [ ] Dashboard monitorate e funzionanti

## 🎉 Risultato Finale

Quando tutto è configurato:

- ✅ **I tuoi 3 tour** → Pagamenti diretti a te
- ✅ **I 27 tour dell'agenzia** → Pagamenti automatici all'agenzia
- ✅ **Un solo checkout** unificato per tutti
- ✅ **Gestione centralizzata** di tutto
- ✅ **Opzionale fee** della piattaforma
- ✅ **Scalabile** facilmente a più agenzie

Buon lavoro! 🚀

