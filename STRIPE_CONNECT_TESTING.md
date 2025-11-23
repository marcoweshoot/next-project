# Testing Stripe Connect - Guida al Test

Questa guida ti aiuta a testare il sistema di routing dei pagamenti tra il tuo account e quello dell'agenzia.

## Pre-requisiti

Prima di iniziare, assicurati di aver completato:
- ✅ Setup di Stripe Connect (vedi `STRIPE_CONNECT_SETUP.md`)
- ✅ Aggiunto il campo `payment_recipient` al CMS Strapi
- ✅ Configurato le variabili d'ambiente
- ✅ Assegnato `payment_recipient` ai tour nel CMS

## Step 1: Configurazione Ambiente Test

### 1.1 Crea un Test Connect Account

1. Vai su [Stripe Dashboard Test Mode](https://dashboard.stripe.com/test)
2. Clicca sull'interruttore **"Viewing test data"** (in alto a destra)
3. Vai su **Connect** → **Accounts**
4. Crea un nuovo **Express** account di test
5. Copia l'**Account ID** (formato: `acct_xxxxxxxxxxxxx`)

### 1.2 Configura le Test Keys

Nel tuo `.env.local`:

```bash
# Usa le TEST keys (iniziano con sk_test_ e whsec_test_)
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_test_xxxxxxxxxxxxx
STRIPE_CONNECT_AGENCY_ACCOUNT_ID=acct_xxxxxxxxxxxxx  # Test account
STRIPE_PLATFORM_FEE_PERCENT=0  # O un valore di test
```

### 1.3 Configura i Tour nel CMS

Nel tuo Strapi:
1. Scegli **1 tour** e imposta `payment_recipient = "weshoot"`
2. Scegli **1 tour** e imposta `payment_recipient = "agency"`
3. Salva le modifiche

## Step 2: Test Pagamento WeShoot

### 2.1 Avvia il Server

```bash
npm run dev
```

### 2.2 Testa il Checkout

1. Vai sul sito in locale: `http://localhost:3000`
2. Naviga al tour con `payment_recipient = "weshoot"`
3. Seleziona una sessione e clicca su **Prenota**
4. Nel checkout Stripe, usa questa carta di test:
   - **Numero**: `4242 4242 4242 4242`
   - **Data**: Qualsiasi data futura (es. `12/25`)
   - **CVC**: Qualsiasi 3 cifre (es. `123`)
   - **Codice Fiscale**: `RSSMRA80A01H501U`
   - **Phone**: `+39 123 456 7890`

### 2.3 Verifica il Pagamento

1. Vai su [Stripe Dashboard → Payments](https://dashboard.stripe.com/test/payments)
2. Dovresti vedere il pagamento **direttamente sul tuo account**
3. Nel dettaglio del pagamento, **non** dovrebbe esserci:
   - `Connected account`
   - `Transfer`
   - `Application fee`

### 2.4 Controlla i Log

Nel terminale del server dovresti vedere:

```
💳 [CHECKOUT] Payment recipient for tour xxx: weshoot
📸 [CHECKOUT] Payment stays on WeShoot account
```

## Step 3: Test Pagamento Agency

### 3.1 Ripeti il Checkout

1. Naviga al tour con `payment_recipient = "agency"`
2. Seleziona una sessione e prenota
3. Usa la stessa carta di test: `4242 4242 4242 4242`

### 3.2 Verifica il Pagamento

1. Vai su [Stripe Dashboard → Payments](https://dashboard.stripe.com/test/payments)
2. Dovresti vedere il pagamento con:
   - ✅ **Connected account**: `acct_xxxxxxxxxxxxx` (l'account agenzia)
   - ✅ **Transfer**: Importo trasferito all'agenzia
   - ✅ **Application fee**: Solo se hai impostato `STRIPE_PLATFORM_FEE_PERCENT > 0`

### 3.3 Verifica sull'Account Agenzia

1. Vai su **Connect** → **Accounts**
2. Clicca sull'account dell'agenzia
3. Clicca su **View dashboard as account**
4. Dovresti vedere il pagamento ricevuto

### 3.4 Controlla i Log

Nel terminale dovresti vedere:

```
💳 [CHECKOUT] Payment recipient for tour xxx: agency
🏢 [CHECKOUT] Routing to agency account: acct_xxxxxxxxxxxxx
💰 [CHECKOUT] Platform fee: 0.00€ (0%)  # O il valore configurato
```

## Step 4: Test con Platform Fee

### 4.1 Abilita Platform Fee

Nel `.env.local`:

```bash
STRIPE_PLATFORM_FEE_PERCENT=2.5  # 2.5% di fee
```

### 4.2 Riavvia il Server

```bash
# Ctrl+C per fermare
npm run dev
```

### 4.3 Testa un Pagamento Agency

Ripeti il checkout per un tour `agency` e verifica:

**Esempio con pagamento di 100€:**
- Cliente paga: **100.00€**
- Agenzia riceve: **97.50€** (dopo transfer)
- Piattaforma riceve: **2.50€** (application fee)
- Commissioni Stripe: **~1.75€** (pagate dall'agenzia sul suo ricavo)

### 4.4 Verifica Platform Fee

Nella Dashboard Stripe:
1. Vai su **Connect** → **Dashboard** → **Application fees**
2. Dovresti vedere la fee del 2.5% trattenuta

## Step 5: Test Carte Speciali

### 5.1 Test 3D Secure (SCA)

Usa questa carta per testare l'autenticazione forte:
- **Numero**: `4000 0025 0000 3155`
- Richiederà autenticazione 3D Secure
- Scegli **Complete** o **Fail** nel simulatore

### 5.2 Test Carte Rifiutate

- **Carta rifiutata**: `4000 0000 0000 0002`
- **Fondi insufficienti**: `4000 0000 0000 9995`

### 5.3 Test Gift Card

Se hai gift card abilitate:
1. Crea una gift card di test in Supabase
2. Applicala durante il checkout
3. Verifica che l'importo sia corretto
4. La fee della piattaforma si calcola sull'importo **dopo lo sconto**

## Step 6: Test Webhook

### 6.1 Usa Stripe CLI

Installa Stripe CLI:

```bash
brew install stripe/stripe-cli/stripe
```

### 6.2 Forward Webhooks

```bash
stripe login
stripe listen --forward-to localhost:3000/api/webhook-stripe
```

Copia il **webhook signing secret** mostrato (inizia con `whsec_`).

### 6.3 Aggiorna .env.local

```bash
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx  # Il secret dal comando sopra
```

### 6.4 Test End-to-End

1. Fai un pagamento di test (platform o agency)
2. Nel terminale di Stripe CLI vedrai l'evento `checkout.session.completed`
3. Nel terminale del server vedrai i log di processing
4. Verifica che la prenotazione sia creata in Supabase

## Step 7: Checklist Finale

Prima di andare in produzione, verifica:

- [ ] Pagamento platform funziona correttamente
- [ ] Pagamento agency funziona correttamente
- [ ] Platform fee è calcolata correttamente (se abilitata)
- [ ] Webhook crea correttamente la prenotazione
- [ ] I dati del cliente sono salvati (nome, email, codice fiscale)
- [ ] L'email di conferma viene inviata
- [ ] Dashboard mostra correttamente le prenotazioni
- [ ] Gift card funziona con entrambi i tipi di pagamento
- [ ] Rimborsi funzionano (testare manualmente dalla dashboard)

## Step 8: Switch a Produzione

### 8.1 Crea Production Connect Account

1. Vai su [Stripe Dashboard Live Mode](https://dashboard.stripe.com)
2. Disattiva "Viewing test data"
3. Vai su **Connect** → **Accounts**
4. Crea un nuovo **Express** account per l'agenzia
5. L'agenzia dovrà completare l'onboarding (dati fiscali, IBAN, etc.)

### 8.2 Configura Production Keys

In Vercel o nel tuo `.env.production`:

```bash
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxx  # Live key
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx  # Live webhook secret
STRIPE_CONNECT_AGENCY_ACCOUNT_ID=acct_xxxxxxxxxxxxx  # Live connect account
STRIPE_PLATFORM_FEE_PERCENT=0  # O il valore concordato
```

### 8.3 Configura il Webhook in Produzione

1. Vai su **Developers** → **Webhooks** → **Add endpoint**
2. URL: `https://tuosito.com/api/webhook-stripe`
3. Eventi da ascoltare:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
4. Copia il **signing secret**
5. Aggiornalo in `STRIPE_WEBHOOK_SECRET`

### 8.4 Test in Produzione

⚠️ **ATTENZIONE**: In produzione userai carte reali e pagamenti veri!

1. Fai un test con un importo piccolo (es. 1€)
2. Verifica che tutto funzioni
3. Fai un rimborso del test

## Troubleshooting

### Errore: "STRIPE_CONNECT_AGENCY_ACCOUNT_ID not configured"

**Causa**: La variabile d'ambiente non è impostata.

**Soluzione**:
1. Verifica che `STRIPE_CONNECT_AGENCY_ACCOUNT_ID` sia nel `.env.local`
2. Riavvia il server: `npm run dev`
3. Verifica che l'account ID sia corretto (inizia con `acct_`)

### Pagamento va su WeShoot invece che Agency

**Causa**: Il campo `payment_recipient` non è configurato correttamente nel CMS.

**Soluzione**:
1. Apri Strapi → Tours
2. Modifica il tour e imposta `payment_recipient = "agency"`
3. Salva
4. Riprova il pagamento

### Platform Fee non appare

**Causa**: `STRIPE_PLATFORM_FEE_PERCENT` è 0 o non impostata.

**Soluzione**:
1. Imposta un valore > 0 nel `.env.local`
2. Riavvia il server
3. La fee verrà applicata solo ai pagamenti `agency`

### Transfer non appare nel Dashboard

**Causa**: Stai guardando il dashboard dell'agenzia invece della piattaforma.

**Soluzione**:
1. I transfer appaiono nella dashboard della **piattaforma**
2. Vai su **Connect** → **Transfers**
3. Dovresti vedere i trasferimenti all'agenzia

### Webhook non riceve eventi

**Causa**: Il webhook secret è sbagliato o l'endpoint non è raggiungibile.

**Soluzione**:
1. Usa Stripe CLI in locale: `stripe listen --forward-to localhost:3000/api/webhook-stripe`
2. In produzione, verifica che l'URL sia corretto in Stripe Dashboard → Webhooks
3. Controlla i log del webhook nella dashboard Stripe

## Domande Frequenti

**Q: Posso cambiare il payment_recipient di un tour in qualsiasi momento?**  
A: Sì, influenzerà solo i pagamenti futuri.

**Q: Cosa succede se l'account dell'agenzia non è verificato?**  
A: Il pagamento fallirà. L'agenzia deve completare l'onboarding Stripe.

**Q: Posso avere più di 2 beneficiari (es. 3 agenzie diverse)?**  
A: Sì! Puoi:
- Aggiungere più account Connect
- Cambiare il campo `payment_recipient` in un enum con più valori (es. `weshoot`, `agency1`, `agency2`)
- Modificare il codice per gestire più account

**Q: Come faccio i rimborsi?**  
A: I rimborsi vanno sempre gestiti da **WeShoot** (tuo account), anche per i pagamenti dell'agenzia.

## Risorse

- [Stripe Connect Docs](https://stripe.com/docs/connect)
- [Stripe Testing](https://stripe.com/docs/testing)
- [Stripe CLI](https://stripe.com/docs/stripe-cli)
- [Webhook Best Practices](https://stripe.com/docs/webhooks/best-practices)

## Supporto

Per problemi tecnici:
- 📧 Stripe Support: https://support.stripe.com
- 💬 Stripe Discord: https://discord.gg/stripe

