# 🚀 Stripe Connect - Quick Start

Guida veloce per iniziare subito. Per dettagli completi, vedi `IMPLEMENTAZIONE_PAGAMENTI_MULTIPLI.md`.

## ⚡ Setup in 4 Steps (45 minuti)

### 1️⃣ Stripe Connect (15 min)

```bash
# 1. Vai su Stripe Dashboard in TEST mode
# 2. Connect → Accounts → + New → Express
# 3. Completa onboarding con dati fittizi
# 4. Copia Account ID: acct_xxxxxxxxxxxxx
```

### 2️⃣ Environment Variables (5 min)

**`.env.local`** (locale):
```bash
STRIPE_CONNECT_AGENCY_ACCOUNT_ID=acct_xxxxxxxxxxxxx
STRIPE_PLATFORM_FEE_PERCENT=0
```

**Vercel** (produzione):
- Settings → Environment Variables
- Aggiungi le stesse due variabili
- Applica a: Preview + Production

### 3️⃣ Strapi CMS (15 min)

```bash
# 1. Content-Type Builder → Tour → Add field
# 2. Tipo: Enumeration
# 3. Nome: payment_recipient
# 4. Valori (uno per riga):
#    weshoot
#    agency
# 5. Default: agency
# 6. Required: true
# 7. Salva e RIAVVIA Strapi
```

Poi:
```bash
# 8. Content Manager → Tours
# 9. Imposta payment_recipient per ogni tour:
#    - "weshoot" per i tuoi 3 tour
#    - "agency" per gli altri 27
```

### 4️⃣ Test (10 min)

```bash
npm run dev
```

**Tour WeShoot:**
- Vai al tour con `payment_recipient = "weshoot"`
- Prenota con carta `4242 4242 4242 4242`
- Verifica pagamento su tuo account Stripe

**Tour Agency:**
- Vai al tour con `payment_recipient = "agency"`
- Prenota con carta `4242 4242 4242 4242`
- Verifica transfer su account agenzia

## 📋 Checklist Rapida

Prima di andare LIVE:

- [ ] Account Connect creato (test + production)
- [ ] `.env.local` configurato
- [ ] Vercel env vars configurate
- [ ] Campo `payment_recipient` aggiunto in Strapi
- [ ] 3 tour = "weshoot"
- [ ] 27 tour = "agency"
- [ ] Test locale OK
- [ ] Deploy staging OK
- [ ] Account LIVE agenzia completato e verificato
- [ ] Test produzione con 1€ OK

## 🆘 Problemi Comuni

| Errore | Fix Veloce |
|--------|------------|
| `STRIPE_CONNECT_AGENCY_ACCOUNT_ID not configured` | Aggiungi env var e riavvia server |
| Pagamento va su account sbagliato | Controlla `payment_recipient` in Strapi (deve essere `weshoot` o `agency`) |
| Campo non appare in Strapi | Riavvia server Strapi dopo aver creato il campo |
| Account agenzia non riceve | Verifica account sia verificato in Stripe |

## 📚 Documentazione Completa

- 📖 **Setup completo**: `STRIPE_CONNECT_SETUP.md`
- 🧪 **Testing dettagliato**: `STRIPE_CONNECT_TESTING.md`
- 📋 **Riepilogo e prossimi passi**: `IMPLEMENTAZIONE_PAGAMENTI_MULTIPLI.md`
- 🔧 **Riferimento tecnico**: `STRIPE_CONNECT_TECHNICAL_REFERENCE.md`

## 💡 Tips

- **Fee opzionale**: Imposta `STRIPE_PLATFORM_FEE_PERCENT=2.5` per trattenere 2.5%
- **Multi-agency**: Facile estendere a più agenzie in futuro
- **Rimborsi**: Sempre gestiti da te (platform), anche per pagamenti agency
- **Test mode**: Testa tutto PRIMA con le test keys

## 🎯 Risultato

✅ **3 tour** → I tuoi pagamenti  
✅ **27 tour** → Pagamenti agenzia  
✅ **1 checkout** unificato  
✅ **Controllo totale**

---

**Tempo totale stimato**: 45 minuti + 1h per onboarding agenzia in produzione

Buon lavoro! 🚀

