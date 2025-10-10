# Configurazione Email con Brevo

Questo progetto utilizza **Brevo** (ex Sendinblue) per l'invio di email transazionali e notifiche admin.

## Setup Brevo

### 1. Crea un Account Brevo
1. Vai su [https://www.brevo.com/](https://www.brevo.com/)
2. Registrati per un account gratuito (300 email/giorno)
3. Verifica il tuo account email

### 2. Ottieni la API Key
1. Accedi al tuo account Brevo
2. Vai su **Settings** → **SMTP & API** → **API Keys**
3. Clicca su **Generate a new API key**
4. Copia la chiave generata

### 3. Configura le Variabili d'Ambiente

Aggiungi queste variabili al tuo file `.env.local`:

```bash
# Brevo Email Service
BREVO_API_KEY=xkeysib-your_api_key_here
BREVO_FROM_EMAIL=noreply@weshoot.it
BREVO_FROM_NAME=WeShoot
ADMIN_EMAIL=admin@weshoot.it
```

### 4. Verifica il Dominio (Opzionale ma Raccomandato)

Per migliorare la deliverability:

1. Vai su **Settings** → **Senders & IP**
2. Aggiungi il tuo dominio
3. Configura i record DNS (SPF, DKIM, DMARC) come indicato da Brevo

## Notifiche Email Implementate

### Per l'Admin

1. **Nuova Prenotazione**
   - Inviata quando un cliente completa il pagamento dell'acconto
   - Include: dati cliente, tour, importo, numero partecipanti

2. **Saldo Completato**
   - Inviata quando un cliente completa il pagamento del saldo
   - Include: dati cliente, tour, importo finale

3. **Promemoria Acconto in Scadenza**
   - Inviata 3 e 1 giorno prima della scadenza dell'acconto
   - Include: dati cliente, tour, giorni rimanenti

4. **Promemoria Saldo in Scadenza**
   - Inviata 7, 3 e 1 giorno prima della scadenza del saldo
   - Include: dati cliente, tour, importo da pagare, giorni rimanenti

### Per i Clienti

1. **Conferma Prenotazione** (già implementata)
   - Inviata dopo il pagamento dell'acconto
   - Include: dettagli tour, importo pagato, link dashboard

2. **Conferma Pagamento Saldo** (già implementata)
   - Inviata dopo il pagamento del saldo
   - Include: conferma pagamento completo, dettagli viaggio

## Cron Job per Promemoria Automatici

### Setup Vercel Cron

Il file `vercel.cron.json` configura un cron job che viene eseguito ogni giorno alle 9:00 AM:

```json
{
  "crons": [
    {
      "path": "/api/cron/payment-reminders",
      "schedule": "0 9 * * *"
    }
  ]
}
```

### Sicurezza Cron Job

Aggiungi questa variabile al tuo `.env.local` e su Vercel:

```bash
CRON_SECRET=your_random_secret_string_here
```

Genera un secret sicuro:
```bash
openssl rand -base64 32
```

### Test Manuale del Cron

Puoi testare il cron job manualmente:

```bash
curl -H "Authorization: Bearer your_cron_secret" \
  https://your-domain.com/api/cron/payment-reminders
```

## Sviluppo Locale

In modalità sviluppo (senza `BREVO_API_KEY` configurata), le email vengono solo loggat e nella console invece di essere inviate.

Per testare l'invio reale in locale:
1. Aggiungi `BREVO_API_KEY` al tuo `.env.local`
2. Le email verranno inviate anche in development

## Monitoraggio

### Dashboard Brevo

Monitora l'invio delle email su:
- **Statistics** → **Email** per vedere tassi di apertura e click
- **Logs** → **Email logs** per vedere lo stato di ogni email

### Logs Vercel

Controlla i logs dei cron job su Vercel:
1. Vai al tuo progetto su Vercel
2. **Deployments** → seleziona deployment
3. **Functions** → cerca `/api/cron/payment-reminders`

## Troubleshooting

### Email non ricevute

1. **Controlla i logs Vercel** per errori
2. **Verifica la API key** su Brevo
3. **Controlla lo spam** nella casella email
4. **Verifica il dominio** su Brevo (se configurato)

### Cron Job non eseguito

1. **Verifica `vercel.cron.json`** sia nel root del progetto
2. **Controlla il CRON_SECRET** sia configurato su Vercel
3. **Verifica i logs** su Vercel Functions

### Rate Limits

Piano gratuito Brevo:
- **300 email/giorno**
- Se superi il limite, considera l'upgrade o ottimizza le notifiche

## Best Practices

1. **Non inviare email duplicate**: il sistema è configurato per inviare reminder solo in giorni specifici (7, 3, 1 giorno prima)
2. **Monitora i bounce**: rimuovi email invalide dalla lista
3. **Personalizza i template**: modifica i template in `src/lib/email.ts`
4. **Test prima del deploy**: testa sempre le email in staging

## Support

- **Brevo Docs**: https://developers.brevo.com/
- **Vercel Cron Docs**: https://vercel.com/docs/cron-jobs

