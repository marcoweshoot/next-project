# Configurazione Stripe Connect per Suddivisione Pagamenti

Questo documento spiega come configurare Stripe Connect per gestire pagamenti verso due account diversi: il tuo account principale e l'account dell'agenzia di viaggi.

## Architettura della Soluzione

Utilizziamo **Stripe Connect** con il modello **Destination Charges**:
- **Account Piattaforma** (tuo): Riceve tutti i pagamenti inizialmente
- **Account Connesso** (agenzia): Riceve automaticamente i pagamenti per i suoi tour

### Vantaggi
- ✅ Un solo checkout unificato per tutti i tour
- ✅ Gestione centralizzata dei pagamenti
- ✅ Routing automatico basato sul tour
- ✅ Possibilità di trattenere fee dalla piattaforma
- ✅ Compliance PSD2/SCA gestita automaticamente

## Step 1: Configurare Stripe Connect

### 1.1 Creare l'Account Connect per l'Agenzia

1. Accedi alla tua **Dashboard Stripe** (account piattaforma)
2. Vai su **Connect** → **Accounts**
3. Clicca su **+ New** per creare un nuovo account connesso
4. Scegli **Express** account (più semplice per l'agenzia)
5. Completa l'onboarding dell'agenzia (dati fiscali, IBAN, etc.)

### 1.2 Ottenere l'Account ID

Dopo aver creato l'account connesso:
1. Vai su **Connect** → **Accounts**
2. Clicca sull'account dell'agenzia
3. Copia l'**Account ID** (formato: `acct_xxxxxxxxxxxxx`)

### 1.3 Configurare le Variabili d'Ambiente

Aggiungi queste variabili al tuo `.env.local` e Vercel:

```bash
# Stripe - Account Principale (tuo)
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx

# Stripe Connect - Account Agenzia
STRIPE_CONNECT_AGENCY_ACCOUNT_ID=acct_xxxxxxxxxxxxx

# Opzionale: Fee della piattaforma (in percentuale)
STRIPE_PLATFORM_FEE_PERCENT=0  # Imposta a 0 se non vuoi fee, o 2.5 per 2.5%
```

## Step 2: Aggiornare il CMS Strapi

Nel tuo CMS Strapi, aggiungi un nuovo campo al Content Type **Tour**:

### Campo: `payment_recipient`

- **Tipo**: Enumeration
- **Nome**: `payment_recipient`
- **Valori**:
  - `weshoot` (i tuoi 3 tour)
  - `agency` (i 27 tour dell'agenzia)
- **Default**: `agency`
- **Required**: true

### Come aggiungerlo in Strapi:

1. Vai su **Content-Type Builder** → **Tour**
2. Clicca su **Add another field**
3. Seleziona **Enumeration**
4. Inserisci questi valori:
   ```
   weshoot
   agency
   ```
5. Salva e fai **Restart** del server Strapi

### Configurare i Tour

Dopo aver aggiunto il campo, vai su **Content Manager** → **Tours** e:
- Imposta `payment_recipient = "weshoot"` per i tuoi 3 tour
- Imposta `payment_recipient = "agency"` per gli altri 27 tour

## Step 3: Come Funziona il Routing dei Pagamenti

### Tour con `payment_recipient = "weshoot"`
```javascript
// Pagamento diretto sul tuo account WeShoot
stripe.checkout.sessions.create({
  // ... parametri standard
  // Nessun parametro aggiuntivo - va direttamente al tuo account
})
```

### Tour con `payment_recipient = "agency"`
```javascript
// Pagamento sul conto dell'agenzia con opzionale fee piattaforma
stripe.checkout.sessions.create({
  // ... parametri standard
  payment_intent_data: {
    on_behalf_of: 'acct_xxxxxxxxxxxxx', // Account agenzia
    transfer_data: {
      destination: 'acct_xxxxxxxxxxxxx', // Account agenzia
    },
    // Opzionale: application_fee_amount per trattenere una fee
  }
})
```

## Step 4: Test in Modalità Test

Prima di andare in produzione, testa tutto in modalità **test**:

1. Usa le **test keys** di Stripe
2. Crea un **test Connect account** per l'agenzia
3. Usa le carte di test Stripe:
   - `4242 4242 4242 4242` - Successo
   - `4000 0025 0000 3155` - Richiede autenticazione 3D Secure

## Step 5: Monitoraggio e Dashboard

### Dashboard Piattaforma (tuo account)
- Vedi **tutti** i pagamenti (tuoi + agenzia)
- Gestisci rimborsi e dispute
- Monitora le fee della piattaforma

### Dashboard Agenzia (account connesso)
- Vede **solo** i suoi pagamenti
- Gestisce i suoi payout
- Riceve notifiche per i suoi ordini

## FAQ

### Posso cambiare il beneficiario di un tour in qualsiasi momento?
Sì, basta modificare il campo `payment_recipient` nel CMS Strapi. I pagamenti futuri useranno la nuova configurazione.

### Chi gestisce i rimborsi?
I rimborsi devono essere gestiti dalla **piattaforma** (tuo account). Hai controllo completo su tutti i pagamenti.

### Come funzionano le fee della piattaforma?
Se imposti `STRIPE_PLATFORM_FEE_PERCENT=2.5`, trattienerai il 2.5% di ogni pagamento che va all'agenzia. Esempio:
- Cliente paga 100€
- Agenzia riceve 97.50€
- Tu ricevi 2.50€

Se imposti a `0`, l'agenzia riceve il 100% (meno le commissioni Stripe).

### Quali sono le commissioni Stripe?
- **Commissioni standard Stripe**: 1.5% + 0.25€ per transazione (pagate dall'account che riceve il pagamento)
- **Fee piattaforma** (opzionale): Percentuale configurabile che trattienialla piattaforma

### Cosa succede se l'account dell'agenzia ha problemi?
Il pagamento fallirà e il cliente vedrà un errore. È importante che l'account dell'agenzia sia sempre in buono stato (IBAN valido, verificato, etc.).

## Sicurezza

- ✅ L'account ID dell'agenzia è in variabili d'ambiente (sicuro)
- ✅ Solo il server può creare checkout sessions
- ✅ Il client non sa quale account riceve i soldi
- ✅ Tutti i pagamenti passano attraverso il tuo controllo

## Documentazione Stripe

- [Stripe Connect - Getting Started](https://stripe.com/docs/connect)
- [Destination Charges](https://stripe.com/docs/connect/destination-charges)
- [Platform Fees](https://stripe.com/docs/connect/direct-charges#collecting-fees)

## Supporto

Per problemi o domande:
- 📧 Stripe Support: https://support.stripe.com
- 📚 Stripe Docs: https://stripe.com/docs

