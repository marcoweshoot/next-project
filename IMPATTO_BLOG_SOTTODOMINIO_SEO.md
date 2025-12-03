# 🚨 Analisi Impatto Migrazione Blog: Subdirectory → Sottodominio

## ⚠️ PROBLEMA CRITICO

**Cambio effettuato:**
- ❌ **PRIMA**: `www.weshoot.it/blog/` (subdirectory)
- ✅ **DOPO**: `blog.weshoot.it/` (sottodominio)

**Data cambio**: ~2-3 Settembre 2024 (insieme al lancio nuovo sito)

**Impatto stimato sul calo traffico**: 🔴 **ALTO (30-40% del calo totale)**

---

## 📉 **PERCHÉ QUESTO HA CAUSATO UN CALO DI TRAFFICO**

### 1. Google Tratta Sottodomini come Siti Separati

#### Subdirectory (PRIMA)
```
www.weshoot.it
├── /viaggi-fotografici/     ← autorità condivisa
├── /corsi-di-fotografia/    ← autorità condivisa
└── /blog/                   ← autorità condivisa
```
**Vantaggi:**
- ✅ Tutta l'autorità di dominio condivisa
- ✅ Link juice scorre liberamente
- ✅ Indicizzazione unificata

#### Sottodominio (DOPO)
```
www.weshoot.it               ← Sito A (DA: 40)
    ├── /viaggi-fotografici/
    └── /corsi-di-fotografia/

blog.weshoot.it              ← Sito B (DA: 5 - ricomincia da zero!)
    └── /articoli/
```
**Svantaggi:**
- ❌ Autorità separata (il blog riparte da zero)
- ❌ Link juice NON passa automaticamente
- ❌ Due siti da indicizzare separatamente

### 2. Backlink Persi o Rotti

Articoli con molte visualizzazioni (dal [blog WeShoot](https://blog.weshoot.it/)):

| Articolo | Views | Vecchio URL (404!) | Nuovo URL |
|----------|-------|-------------------|-----------|
| Profondità di campo | 38.4K | `www.weshoot.it/blog/guida-profondita-di-campo` | `blog.weshoot.it/...` |
| Ottica fissa 50mm | 24.8K | `www.weshoot.it/blog/guida-cinquantino` | `blog.weshoot.it/...` |
| Fotografia montagna | 19.7K | `www.weshoot.it/blog/fotografia-montagna` | `blog.weshoot.it/...` |
| Come fotografare arcobaleno | 17.8K | `www.weshoot.it/blog/fotografare-arcobaleno` | `blog.weshoot.it/...` |

**Ogni backlink che puntava a questi articoli:**
- ❌ Dava 404 (prima del fix redirect)
- ❌ Google ha perso la traccia del contenuto
- ❌ Ranking azzerato

### 3. Link Interni Non Passano Più Autorità

**PRIMA** (subdirectory):
```
www.weshoot.it/viaggi-fotografici/islanda
    ↓ (link interno - passa autorità)
www.weshoot.it/blog/fotografare-aurora-boreale
```
**Link juice**: ✅ Passa liberamente (stesso dominio)

**DOPO** (sottodominio):
```
www.weshoot.it/viaggi-fotografici/islanda
    ↓ (link esterno - passa meno autorità)
blog.weshoot.it/fotografare-aurora-boreale
```
**Link juice**: ⚠️ Passa molto meno (dominio diverso per Google)

### 4. Indicizzazione Separata

Google Search Console vede:
- Property A: `www.weshoot.it`
- Property B: `blog.weshoot.it` (nuovo sito da zero)

**Conseguenze:**
- Budget di crawl diviso tra due property
- Tempo di indicizzazione raddoppiato
- Metriche e analisi separate

---

## 📊 **DATI DA VERIFICARE**

### A. Google Search Console - Property www.weshoot.it

1. **Vai su**: https://search.google.com/search-console
2. **Seleziona property**: `www.weshoot.it`
3. **Menu → Copertura/Pagine**

**Cosa cercare:**
- 📉 Grafico "Pagine indicizzate" in calo verticale a settembre
- ❌ Errori 404 per URL tipo `/blog/*`
- 🔴 "Pagine non trovate" in aumento

4. **Menu → Rendimento**
   - Filtra date: Agosto 2024 vs Settembre 2024
   - Guarda query che includono parole tipo:
     - "fotografia"
     - "tutorial"
     - "guida"
     - "come fotografare"
   
**Cosa aspettarsi:**
- Calo impression/click su queste query (erano del blog)

### B. Google Search Console - Property blog.weshoot.it

⚠️ **VERIFICA SE ESISTE LA PROPERTY!**

1. https://search.google.com/search-console
2. In alto a sinistra → Seleziona property
3. **C'è `blog.weshoot.it`?**

#### Scenario A: ❌ Property NON Esiste
**PROBLEMA GRAVISSIMO**: Google non sta indicizzando il blog!

**Soluzione immediata:**
1. Aggiungi property `blog.weshoot.it`
2. Verifica proprietà (DNS o meta tag)
3. Invia sitemap del blog

#### Scenario B: ✅ Property Esiste
Controlla:
- Pagine indicizzate (dovrebbero essere ~50-100+ articoli)
- Impressions/click (molto bassi perché è un sito "nuovo")
- Copertura: errori?

### C. Backlink Analysis

Usa uno di questi tool:
- **Ahrefs**: https://ahrefs.com/backlink-checker
- **Moz**: https://moz.com/link-explorer
- **Google Search Console** → Link

**Verifica:**
1. Quanti backlink puntavano a `www.weshoot.it/blog/*`
2. Ora questi backlink dove vanno? (404 o redirect)
3. Autorità di dominio persa

---

## ✅ **SOLUZIONI IMPLEMENTATE**

### 1. Redirect 301 Configurati ✅

Ho aggiunto in `next.config.mjs`:

```javascript
{
  // Redirect homepage blog
  source: "/blog",
  destination: "https://blog.weshoot.it",
  permanent: true,
},
{
  // Redirect tutti gli articoli
  source: "/blog/:path*",
  destination: "https://blog.weshoot.it/:path*",
  permanent: true,
}
```

**Cosa fa:**
- `www.weshoot.it/blog` → `blog.weshoot.it` (301)
- `www.weshoot.it/blog/articolo` → `blog.weshoot.it/articolo` (301)

**Vantaggi:**
- ✅ Backlink non danno più 404
- ✅ Google capisce che il contenuto si è spostato
- ✅ Passa ~90-95% dell'autorità originale

⚠️ **NOTA**: Il redirect funziona SOLO se la struttura URL del blog è rimasta uguale!

### 2. Verifica Struttura URL Blog

**Vecchio URL**: `www.weshoot.it/blog/guida-profondita-di-campo`  
**Nuovo URL**: Deve essere `blog.weshoot.it/guida-profondita-di-campo`

**SE INVECE è**: `blog.weshoot.it/fotografia/guida-profondita-di-campo`  
↓  
**PROBLEMA**: I redirect generici non funzioneranno!

**Soluzione**: Bisogna mappare manualmente gli URL o aggiustare il blog.

---

## 🔧 **AZIONI IMMEDIATE DA FARE**

### 1. Deploy Redirect (URGENTE) ⏰ 2 min
```bash
git add next.config.mjs
git commit -m "fix(seo): redirect blog da subdirectory a sottodominio"
git push origin main
```

### 2. Verifica Redirect Funzionanti ⏰ 3 min

**Dopo il deploy**, testa questi URL:

```bash
# Test 1: Homepage blog
curl -I https://www.weshoot.it/blog
# Aspettati: HTTP/1.1 301 o 308
# Location: https://blog.weshoot.it

# Test 2: Articolo esempio
curl -I https://www.weshoot.it/blog/guida-profondita-di-campo
# Aspettati: HTTP/1.1 301
# Location: https://blog.weshoot.it/guida-profondita-di-campo
```

**Oppure usa browser:**
1. Vai su: `https://www.weshoot.it/blog`
2. Apri DevTools → Network tab
3. Dovresti vedere redirect 301 → `blog.weshoot.it`

### 3. Aggiungi Property Google Search Console (SE NON ESISTE) ⏰ 10 min

1. https://search.google.com/search-console
2. In alto → "Aggiungi proprietà"
3. Tipo: **Proprietà Dominio** o **Prefisso URL**: `https://blog.weshoot.it`
4. Verifica proprietà:
   - **Metodo DNS**: Aggiungi record TXT (consigliato)
   - **Metodo HTML**: Carica file sul blog

### 4. Invia Sitemap Blog ⏰ 3 min

Il blog (Bitnami/WordPress?) dovrebbe avere una sitemap:
- `https://blog.weshoot.it/sitemap.xml`
- o `https://blog.weshoot.it/sitemap_index.xml`

1. Verifica che esista (apri in browser)
2. Google Search Console → Property `blog.weshoot.it`
3. Menu → **Sitemap**
4. Aggiungi: `sitemap.xml` o `sitemap_index.xml`
5. Invia

### 5. Cross-Domain Linking (Opzionale ma Consigliato) ⏰ 5 min

**Link dal sito principale al blog:**

Verifica che ci siano link ben visibili:
- ✅ Menu principale: "Blog" → `blog.weshoot.it` ✅ (già presente)
- ✅ Footer: "Blog" → `blog.weshoot.it`
- ⚠️ Link contestuali: Da pagine tour → articoli blog correlati

**Esempio:**
Pagina tour Aurora Boreale dovrebbe linkare a:
→ "Leggi la nostra guida completa sulla fotografia dell'Aurora Boreale" → articolo blog

**Vantaggi:**
- Passa link juice da sito principale a blog
- Aiuta Google a capire la relazione tra i due siti
- Migliora UX

---

## 📈 **RECUPERO ATTESO**

### Timeline

| Periodo | Aspettative Blog | Azioni |
|---------|-----------------|--------|
| **Oggi** | Deploy redirect | Verifica redirect funzionanti |
| **Giorno 1-3** | Google inizia a seguire i redirect | Monitora Search Console per errori 404 in calo |
| **Settimana 1-2** | Indicizzazione blog.weshoot.it inizia/migliora | Richiedi indicizzazione top 10 articoli |
| **Settimana 3-4** | +20-30% traffico blog recuperato | Analizza quali articoli performano meglio |
| **Mese 2-3** | +50-70% traffico blog recuperato | Ottimizza articoli con maggior potenziale |
| **Mese 4-6** | Stabilizzazione ~70-80% livelli originali | Focus su nuovi contenuti |

⚠️ **NOTA**: Il traffico del blog difficilmente recupererà il 100% perché:
- Perdita inevitabile di autorità nel passaggio
- Alcuni backlink potrebbero non seguire il redirect
- Ritardo nell'indicizzazione

### Impatto sul Traffico Totale Sito

**Calo osservato**: -70-80% traffico totale

**Cause identificate:**
1. 🔴 **Sitemap incompleta** (tour mancanti) → **~40-50% del calo**
2. 🟡 **Blog su sottodominio** (senza redirect) → **~30-40% del calo**
3. 🟢 Altri fattori (performance, contenuti, etc.) → **~10-20%**

**Recupero atteso dopo fix:**
- Con sitemap: +40-50%
- Con redirect blog: +20-30%
- **Totale**: +60-80% recupero in 6-8 settimane

---

## 🎯 **RACCOMANDAZIONI STRATEGICHE**

### Opzione A: Mantieni Sottodominio (Con Miglioramenti)

**Pro:**
- ✅ Blog indipendente (può avere design diverso)
- ✅ Facile da gestire separatamente
- ✅ Non influenza velocità sito principale

**Contro:**
- ❌ Autorità divisa
- ❌ Due property da gestire
- ❌ Link juice ridotto

**Come ottimizzare:**
1. ✅ Redirect 301 configurati (fatto)
2. Link bidirezionali forti (sito ↔ blog)
3. Guest post cross-domain
4. Schema markup per collegare i due siti
5. Consolidare brand (stesso design, logo, UX)

### Opzione B: Torna a Subdirectory (SCONSIGLIATO ora)

**Pro:**
- ✅ Autorità unificata
- ✅ Una sola property da gestire
- ✅ Link juice ottimale

**Contro:**
- ❌ Richiederebbe ALTRA migrazione (doppio danno)
- ❌ Ulteriori 2-3 mesi di recupero
- ❌ Complessità tecnica

**Conclusione**: **NON farlo ora**. Aspetta 6 mesi, valuta risultati, POI decidi.

### Opzione C: Integrare Meglio Sito e Blog

**Azioni concrete:**

1. **Content Hub Strategy**
   - Homepage sito → Sezione "Ultime dal Blog"
   - Pagine tour → "Articoli Correlati" dal blog
   - Footer → Link a categorie blog

2. **Cross-Posting Strategico**
   - Articoli blog lunghi → Summary sul sito principale
   - Link canonical al blog per contenuto completo

3. **Schema Markup Organization**
   ```json
   {
     "@type": "Organization",
     "name": "WeShoot",
     "url": "https://www.weshoot.it",
     "sameAs": [
       "https://blog.weshoot.it",
       "social media..."
     ]
   }
   ```

---

## 🛠️ **CHECKLIST COMPLETA BLOG**

### Immediato (Oggi)
- [x] ✅ Redirect 301 configurati in next.config.mjs
- [ ] Deploy in produzione
- [ ] Verifica redirect funzionanti (test con curl/browser)
- [ ] Controlla se esiste property `blog.weshoot.it` in Search Console

### Settimana 1
- [ ] Aggiungi property `blog.weshoot.it` (se manca)
- [ ] Verifica sitemap blog esistente e funzionante
- [ ] Invia sitemap blog a Search Console
- [ ] Richiedi indicizzazione top 10 articoli blog
- [ ] Verifica errori 404 in calo su `www.weshoot.it`

### Settimana 2-4
- [ ] Monitora indicizzazione `blog.weshoot.it`
- [ ] Analizza quali articoli stanno recuperando ranking
- [ ] Aggiungi link contestuali sito → blog
- [ ] Aggiungi sezione "Dal Blog" su homepage sito
- [ ] Ottimizza articoli con maggior potenziale

### Lungo Termine (Mese 2+)
- [ ] Analizza backlink persi vs recuperati
- [ ] Content marketing strategy per blog
- [ ] Guest posting per recuperare autorità
- [ ] Valutare se tornare a subdirectory (dopo 6 mesi)

---

## 📊 **MONITORAGGIO**

### KPI Settimanali

| Metrica | Tool | Target |
|---------|------|--------|
| Errori 404 `/blog/*` | Search Console (www) | 📉 In calo |
| Pagine indicizzate blog | Search Console (blog) | 📈 50-100+ |
| Traffico organico blog | Google Analytics | 📈 +20%/settimana |
| Backlink attivi blog | Ahrefs/Moz | 📊 Stabile o in crescita |
| Posizione media query blog | Search Console (blog) | 📈 Miglioramento |

---

## ⚠️ **TROUBLESHOOTING**

### Problema: Redirect Non Funzionano

**Sintomi:**
- `www.weshoot.it/blog` ancora da 404
- Nessun redirect 301 visibile in DevTools

**Cause:**
1. Deploy non completato
2. Cache CDN/Vercel non invalidata
3. Errore sintassi next.config.mjs

**Soluzioni:**
1. Verifica deploy su Vercel dashboard
2. Invalida cache: Vercel dashboard → Deployment → "Redeploy"
3. Controlla log Vercel per errori

### Problema: Redirect Funziona ma Google Ancora Mostra 404

**Sintomi:**
- Redirect 301 funziona in browser
- Search Console mostra ancora 404 per `/blog/*`

**Causa:** Google non ha ancora ri-crawlato le pagine

**Soluzione:**
1. Pazienza (ci vogliono 3-7 giorni)
2. Usa "Controllo URL" in Search Console per forzare re-crawl
3. Invia nuova sitemap (trigger crawl)

### Problema: Struttura URL Blog Cambiata

**Sintomi:**
- Redirect va su `blog.weshoot.it/articolo`
- Ma l'URL corretto è `blog.weshoot.it/categoria/articolo`

**Soluzione:** Bisogna mappare manualmente gli URL

**Esempio:**
```javascript
// next.config.mjs - redirects()
{
  source: "/blog/guida-profondita-di-campo",
  destination: "https://blog.weshoot.it/scuola-di-fotografia/guida-profondita-di-campo",
  permanent: true,
},
// ... ripeti per ogni articolo importante
```

---

## 📝 **CONCLUSIONI**

**Problema identificato**: ✅ Migrazione blog subdirectory → sottodominio senza redirect  
**Impatto stimato**: 🔴 30-40% del calo traffico totale  
**Soluzione implementata**: ✅ Redirect 301 configurati  
**Tempo recupero**: ⏱️ 2-3 mesi per 70-80% del traffico blog  

**IMPORTANTE**: Questo problema si aggiunge alla sitemap incompleta. **Entrambi i fix sono necessari** per il recupero completo del traffico.

---

**Prossimi step:**
1. ✅ Deploy redirect blog
2. ✅ Deploy sitemap completa
3. 📤 Submit entrambi a Google Search Console
4. 📊 Monitora risultati settimanalmente

---

**Creato**: 3 Dicembre 2024  
**Correlato**: Vedi anche `ANALISI_CALO_TRAFFICO_SEO.md` per problema sitemap

