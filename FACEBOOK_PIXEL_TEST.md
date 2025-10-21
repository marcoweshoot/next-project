# 🧪 Guida Test Facebook Pixel - Conversione Pagamento

## 📋 Prerequisiti

1. **Verifica variabile d'ambiente**
   - Controlla che `NEXT_PUBLIC_FB_PIXEL` sia configurato in `.env.local` o su Vercel
   - Il valore dovrebbe essere il tuo Facebook Pixel ID (es: `123456789012345`)

2. **Installa Facebook Pixel Helper** (Chrome Extension)
   - [Link download](https://chrome.google.com/webstore/detail/facebook-pixel-helper/fdgfkebogiimcoedlicjlajpkdmockpc)
   - Questo ti permette di vedere in tempo reale gli eventi tracciati

## 🔍 Come Testare il Flusso

### Step 1: Apri la Console del Browser
- Apri DevTools (F12 o Cmd+Option+I su Mac)
- Vai alla tab "Console"
- Filtra i log cercando "FB PIXEL" per vedere solo i messaggi rilevanti

### Step 2: Carica la Homepage
**Cosa aspettarsi nella console:**
```
🔧 [FB PIXEL INIT] FB_PIXEL_ID: 12345678...
✅ [FB PIXEL INIT] Facebook Pixel loaded successfully!
✅ [FB PIXEL INIT] window.fbq is available
```

**Se vedi questo errore:**
```
⚠️ [FB PIXEL INIT] Facebook Pixel ID is not set
💡 [FB PIXEL INIT] Set NEXT_PUBLIC_FB_PIXEL in your environment variables
```
→ Devi configurare la variabile d'ambiente

### Step 3: Inizia un Pagamento
- Vai su un tour/corso
- Clicca su "Prenota" o "Acquista"
- Compila il form e clicca sul pulsante di pagamento

**Cosa aspettarsi nella console:**
```
💾 [FB PIXEL] Saving purchase data to sessionStorage: {
  tourTitle: "Nome del Tour",
  value: 100,
  quantity: 1,
  tourDestination: "Destinazione",
  sessionDate: "2025-01-01"
}
✅ [FB PIXEL] Data saved verification: SUCCESS
```

**Se vedi FAILED** → C'è un problema con sessionStorage (browser in modalità privata?)

### Step 4: Completa il Pagamento su Stripe
- Usa la carta di test Stripe: `4242 4242 4242 4242`
- Data scadenza: qualsiasi data futura
- CVC: qualsiasi 3 cifre
- Completa il pagamento

### Step 5: Verifica la Pagina di Successo
Dopo il redirect alla pagina `/payment-success`, dovresti vedere:

**Nella console:**
```
🎯 [FB PIXEL] Payment success page loaded
🎯 [FB PIXEL] window.fbq exists: true
🎯 [FB PIXEL] Retrieved purchase data: {"tourTitle":"...","value":100,...}
🎯 [FB PIXEL] Parsed purchase data: {...}
🎯 [FB PIXEL] Tracking Purchase event with data: {
  content_name: "Nome del Tour",
  content_category: "Viaggi Fotografici",
  value: 100,
  currency: "EUR",
  num_items: 1
}
✅ [FB PIXEL] Purchase event sent successfully!
🧹 [FB PIXEL] Cleaned up sessionStorage
```

**Con Facebook Pixel Helper:**
- L'icona diventerà blu con un numero (es: "2" eventi)
- Cliccandoci sopra dovresti vedere:
  - `PageView` (caricamento pagina)
  - `Purchase` (evento conversione) con i parametri:
    - value: 100
    - currency: EUR
    - content_name: Nome del Tour
    - content_category: Viaggi Fotografici

## ❌ Problemi Comuni

### Problema 1: Pixel non inizializzato
**Sintomo:**
```
❌ [FB PIXEL] Facebook Pixel not initialized (window.fbq not found)
```

**Soluzione:**
- Verifica che `NEXT_PUBLIC_FB_PIXEL` sia impostato
- Riavvia il server di sviluppo: `npm run dev`
- Pulisci la cache del browser (Ctrl+Shift+Delete)

### Problema 2: Dati non trovati in sessionStorage
**Sintomo:**
```
⚠️ [FB PIXEL] No purchase data found in sessionStorage
```

**Possibili cause:**
1. Browser in modalità privata/incognito
2. SessionStorage non persistente tra redirect
3. Dati non salvati correttamente prima del redirect

**Debug:**
- Apri la tab "Application" in DevTools
- Vai su "Session Storage" → seleziona il tuo dominio
- Verifica se esiste la chiave `lastPurchase` dopo aver cliccato su "Paga"

### Problema 3: Evento inviato ma non visibile in Facebook
**Possibili cause:**
1. Ad blocker attivo (disabilitalo per il test)
2. Tracking prevention del browser (usa modalità normale, non privata)
3. Pixel ID errato

## 📊 Verifica Eventi su Facebook

1. Vai su [Facebook Events Manager](https://business.facebook.com/events_manager2)
2. Seleziona il tuo Pixel
3. Vai su "Test Events"
4. Dovresti vedere gli eventi in tempo reale mentre testi

## 🎯 Checklist Test Completo

- [ ] Pixel si inizializza correttamente alla home
- [ ] Dati salvati in sessionStorage prima del pagamento
- [ ] Dati recuperati correttamente dopo il pagamento
- [ ] Evento `Purchase` inviato a Facebook
- [ ] Evento visibile su Facebook Pixel Helper
- [ ] Evento visibile su Facebook Events Manager
- [ ] SessionStorage pulito dopo l'invio

## 📝 Note

- I log sono visibili solo in development/production, non in build statica
- Gli eventi test appariranno in "Test Events" su Facebook, non in "Overview"
- Per vedere le conversioni reali, attendi 24-48 ore dopo un acquisto reale

