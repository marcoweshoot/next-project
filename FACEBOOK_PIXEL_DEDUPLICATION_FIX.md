# 🔧 Fix: Facebook Meta - Deduplicazione Eventi "Inizio Acquisto"

## 🔍 Problemi Identificati

Dal pannello Facebook Meta, abbiamo riscontrato questi problemi per l'evento "Inizio di acquisto":

1. **Copertura degli eventi: 12%** ❌
   - Solo il 12% degli eventi viene ricevuto lato server
   - L'88% degli eventi viene perso

2. **Qualità dell'associazione degli eventi: 6.1/10** ⚠️
   - La qualità del matching dei dati utente è bassa
   - Mancano parametri fondamentali per l'identificazione

3. **Deduplicazione: Mancato rispetto delle best practice** ❌
   - Gli eventi non vengono deduplicati correttamente
   - Facebook riceve eventi duplicati da browser e server

4. **Aggiornamento dei dati: Non disponibile** ❌

---

## 🐛 Cause Root dei Problemi

### 1. Eventi Server-Side Non Attenduti (CRITICO)

**File:** `src/app/api/track-fb-event/route.ts`

**Problema:**
```typescript
// ❌ PRIMA - Non attendeva la risposta di Facebook
sendServerEvent({
  event_name,
  event_id,
  event_source_url,
  user_data: userData,
  custom_data,
})

return NextResponse.json({ success: true })
```

L'API chiamava `sendServerEvent()` senza `await`, causando:
- L'API rispondeva immediatamente al client
- L'evento potrebbe non essere mai inviato a Facebook
- Nessuna gestione degli errori
- **Facebook riceveva solo una minima parte degli eventi → 12% di copertura**

**Soluzione Implementata:**
```typescript
// ✅ DOPO - Attende e gestisce gli errori
const success = await sendServerEvent({
  event_name,
  event_id,
  event_source_url,
  user_data: userData,
  custom_data,
})

if (!success) {
  console.error('❌ Failed to send event to Facebook CAPI')
}
```

---

### 2. Cookie fbp e fbc Non Letti Correttamente

**Problema:**
I cookie `_fbp` (Facebook Browser ID) e `_fbc` (Facebook Click ID) sono fondamentali per:
- Identificare univocamente il browser
- Deduplicare eventi browser/server
- Migliorare il matching degli eventi

La lettura dei cookie poteva fallire silenziosamente.

**Soluzione Implementata:**
```typescript
// ✅ Lettura robusta con fallback
try {
  const cookies = getCookies({ req: request });
  fbp = cookies['_fbp'] || undefined;
  fbc = cookies['_fbc'] || undefined;
} catch (error) {
  // Fallback: parsing manuale dall'header Cookie
  const cookieHeader = request.headers.get('cookie')
  if (cookieHeader) {
    const fbpMatch = cookieHeader.match(/_fbp=([^;]+)/)
    if (fbpMatch) fbp = fbpMatch[1]
    
    const fbcMatch = cookieHeader.match(/_fbc=([^;]+)/)
    if (fbcMatch) fbc = fbcMatch[1]
  }
}
```

---

### 3. Mancanza di Logging e Monitoraggio

**Problema:**
Non c'era visibilità su:
- Quali dati utente vengono inviati
- Qualità del matching
- Successo/fallimento degli invii

**Soluzione Implementata:**

**A. Logging dei Cookie:**
```typescript
console.log('📊 [API /track-fb-event] Cookies received:', {
  hasFbp: !!fbp,
  hasFbc: !!fbc,
  fbpValue: fbp ? `${fbp.substring(0, 10)}...` : 'missing',
  fbcValue: fbc ? `${fbc.substring(0, 10)}...` : 'missing'
})
```

**B. Logging della Qualità dei Dati:**
```typescript
const dataQuality = {
  hasEmail: !!userData.em,
  hasPhone: !!userData.ph,
  hasFirstName: !!userData.fn,
  hasLastName: !!userData.ln,
  hasExternalId: !!userData.external_id,
  hasFbp: !!userData.fbp,
  hasFbc: !!userData.fbc,
  hasIp: !!userData.client_ip_address,
  hasUserAgent: !!userData.client_user_agent
}

const matchingScore = Object.values(dataQuality).filter(Boolean).length
console.log('📊 User data quality:', {
  ...dataQuality,
  matchingScore: `${matchingScore}/9`,
  quality: matchingScore >= 7 ? '✅ Excellent' : 
           matchingScore >= 5 ? '⚠️ Good' : '❌ Poor'
})
```

**C. Logging del Risultato:**
```typescript
console.log('✅ [API /track-fb-event] Event sent successfully to Facebook CAPI', {
  event_name,
  event_id
})
```

---

## 📊 Risultati Attesi

### Prima delle Fix:
- ❌ Copertura eventi: **12%**
- ❌ Qualità matching: **6.1/10**
- ❌ Deduplicazione: **Non rispettata**

### Dopo le Fix:
- ✅ Copertura eventi: **>95%** (target)
- ✅ Qualità matching: **8-9/10** (per utenti loggati)
- ✅ Deduplicazione: **Rispettata** (stesso event_id per eventi browser/server)

---

## 🧪 Come Testare le Fix

### 1. Test in Locale

**A. Avvia il server in development:**
```bash
npm run dev
```

**B. Apri DevTools (F12) → Console**

**C. Vai su un tour e inizia un checkout:**
```
1. Vai su /viaggi-fotografici/tour/[slug]
2. Clicca "Prenota"
3. Compila il form
4. Clicca "Procedi al pagamento"
```

**D. Verifica i log nella console:**

✅ **Logs Attesi nel Browser:**
```
✅ [FB PIXEL] InitiateCheckout event sent (user identified)
```

✅ **Logs Attesi nel Server (terminale):**
```
📊 [API /track-fb-event] Cookies received: {
  hasFbp: true,
  hasFbc: false,
  fbpValue: 'fb.1.1234...',
  fbcValue: 'missing'
}

📊 [API /track-fb-event] User data quality: {
  hasEmail: true,
  hasPhone: true,
  hasFirstName: true,
  hasLastName: true,
  hasExternalId: true,
  hasFbp: true,
  hasFbc: false,
  hasIp: true,
  hasUserAgent: true,
  matchingScore: '8/9',
  quality: '✅ Excellent'
}

✅ [FB CAPI] Event sent successfully to Facebook: {
  eventName: 'InitiateCheckout',
  eventId: 'a1b2c3d4-...'
}

✅ [API /track-fb-event] Event sent successfully to Facebook CAPI {
  event_name: 'InitiateCheckout',
  event_id: 'a1b2c3d4-...'
}
```

---

### 2. Test su Facebook Events Manager

**A. Vai su Facebook Events Manager:**
https://business.facebook.com/events_manager2

**B. Seleziona il tuo Pixel**

**C. Vai su "Test Events"**

**D. Esegui un checkout di test**

**E. Verifica che compaiano DUE eventi con lo STESSO event_id:**
```
Browser Event: InitiateCheckout
  - Source: Browser
  - event_id: a1b2c3d4-e5f6-...
  - Status: ✅ Received

Server Event: InitiateCheckout
  - Source: Server (Conversions API)
  - event_id: a1b2c3d4-e5f6-...  ← STESSO ID!
  - Status: ✅ Received
```

✅ **Se l'event_id è lo stesso, la deduplicazione funziona!**

---

### 3. Verifica nel Dataset Quality Dashboard

**A. Attendi 24-48 ore dopo il deploy**

**B. Vai su Events Manager → Data Sources → [Il tuo Pixel]**

**C. Clicca su "Panoramica degli eventi"**

**D. Verifica i miglioramenti:**

| Metrica | Prima | Dopo (Atteso) |
|---------|-------|---------------|
| Copertura degli eventi | 12% | >95% ✅ |
| Qualità dell'associazione | 6.1/10 | 8-9/10 ✅ |
| Deduplicazione | ❌ Non rispettata | ✅ Rispettata |

---

## 🚀 Deployment

### 1. Verifica le Variabili d'Ambiente

Assicurati che siano configurate:

```bash
# .env.local (locale)
NEXT_PUBLIC_FB_PIXEL=123456789012345
FB_CAPI_ACCESS_TOKEN=EAAxxxxx...
FB_TEST_EVENT_CODE=TEST12345  # Solo per testing
```

Su Vercel:
1. Vai su Settings → Environment Variables
2. Verifica che `FB_CAPI_ACCESS_TOKEN` sia configurato per Production
3. Rimuovi `FB_TEST_EVENT_CODE` in production (usalo solo per test)

### 2. Deploy su Vercel

```bash
git add .
git commit -m "fix: Facebook Pixel server-side events deduplication"
git push origin main
```

### 3. Monitora i Log su Vercel

```bash
# Dopo il deploy, monitora i log
vercel logs --follow
```

Cerca questi log:
```
✅ [API /track-fb-event] Event sent successfully to Facebook CAPI
📊 [API /track-fb-event] User data quality: { matchingScore: '8/9', quality: '✅ Excellent' }
```

---

## 📝 Checklist Pre-Deploy

- [ ] Variabili d'ambiente configurate (`FB_CAPI_ACCESS_TOKEN`)
- [ ] Test in locale eseguiti con successo
- [ ] Log di qualità dei dati verificati (matching score >7)
- [ ] Eventi visibili su Facebook Test Events
- [ ] Event_id identici per eventi browser/server
- [ ] Nessun errore nei log del server

---

## 🔍 Troubleshooting

### Problema: "Failed to send event to Facebook CAPI"

**Cause possibili:**
1. `FB_CAPI_ACCESS_TOKEN` non configurato o errato
2. Pixel ID non valido
3. Problemi di rete

**Soluzione:**
```bash
# Verifica il token
echo $FB_CAPI_ACCESS_TOKEN

# Verifica che inizi con "EAA"
# Se mancante, genera un nuovo token su:
# https://business.facebook.com/settings/system-users
```

### Problema: "Cookie _fbp missing"

**Cause possibili:**
1. Ad blocker attivo
2. Tracking prevention del browser
3. Pixel non inizializzato correttamente

**Soluzione:**
1. Disabilita ad blocker per il test
2. Usa un browser senza tracking prevention
3. Verifica che il Pixel sia inizializzato alla home

### Problema: Qualità matching bassa (<5/9)

**Cause possibili:**
1. Utente non loggato
2. Dati del profilo incompleti (nome, telefono mancanti)
3. Cookie fbp/fbc mancanti

**Soluzione:**
1. Testa con un utente loggato
2. Assicurati che il profilo sia completo
3. Verifica che i cookie vengano letti correttamente

---

## 📚 Documentazione Facebook

- [Conversions API](https://developers.facebook.com/docs/marketing-api/conversions-api)
- [Event Deduplication](https://developers.facebook.com/docs/marketing-api/conversions-api/deduplicate-pixel-and-server-events)
- [Advanced Matching](https://developers.facebook.com/docs/facebook-pixel/advanced/advanced-matching)
- [Event Quality Score](https://www.facebook.com/business/help/765081237991954)

---

## ✅ Summary

Le modifiche implementate risolvono i problemi di:
1. ✅ **Copertura eventi bassa**: Ora gli eventi server vengono attenduti e inviati correttamente
2. ✅ **Deduplicazione**: Eventi browser/server con stesso event_id vengono deduplicati
3. ✅ **Qualità matching**: Logging dettagliato per monitorare e migliorare i dati
4. ✅ **Monitoraggio**: Log completi per debugging e analisi

**Prossimi step:**
1. Deploy su production
2. Attendere 24-48h per vedere i risultati nel dashboard
3. Monitorare i log per assicurarsi che tutto funzioni correttamente


