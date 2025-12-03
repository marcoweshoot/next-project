# Test FAQ Schema Implementation

## ✅ Modifiche Implementate

### File Modificato
- `src/app/viaggi-fotografici/destinazioni/[stateslug]/[placeslug]/[tourslug]/page.tsx`

### Cosa è stato aggiunto

1. **Funzione `stripHtml`** per rimuovere i tag HTML dalle risposte FAQ
2. **FAQ JSON-LD Schema** che genera automaticamente lo schema.org FAQPage
3. **Script tag condizionale** che renderizza il JSON-LD solo se ci sono FAQ

## 🧪 Come Testare

### Opzione 1: Dev Server
```bash
npm run dev
```

Poi apri: `http://localhost:3000/viaggi-fotografici/destinazioni/olanda/amsterdam/tulipani-e-mulini-a-vento`

### Opzione 2: Production Build (già fatto)
```bash
npm run build
npm run start
```

Poi apri: `http://localhost:3000/viaggi-fotografici/destinazioni/islanda/reykjavik/aurora-boreale`

### Opzione 3: Test con Google Rich Results
1. Vai su https://search.google.com/test/rich-results
2. Inserisci l'URL di una pagina tour (dev o production)
3. Verifica che appaia "FAQPage" nei risultati

## 🔍 Cosa Cercare nell'HTML

Nel "View Source" della pagina dovresti vedere:

```html
<script id="ld-faq" type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Pagamento",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Per riservare il posto è sufficiente..."
      }
    },
    ...
  ]
}
</script>
```

## 📊 Benefici SEO Attesi

1. **Featured Snippets**: Le FAQ possono apparire direttamente nei risultati di ricerca
2. **Rich Results**: Google mostrerà un'anteprima espansa con le FAQ
3. **AI/GEO**: Google AI e SGE possono leggere e citare le FAQ strutturate
4. **Voice Search**: Ottimizzazione per ricerche vocali tipo "Domande su viaggio fotografico Islanda"

## 🛠️ Struttura del Codice

```typescript
// Strip HTML dai contenuti FAQ
const stripHtml = (html: string) => 
  html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim()

// Genera FAQ Schema solo se ci sono FAQ
const faqJsonLd = Array.isArray(tour.faqs) && tour.faqs.length > 0
  ? {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: tour.faqs.map((faq: any) => ({
        '@type': 'Question',
        name: faq.question || '',
        acceptedAnswer: {
          '@type': 'Answer',
          text: stripHtml(faq.answer || ''),
        },
      })),
    }
  : null

// Rendering condizionale
{faqJsonLd && (
  <Script id="ld-faq" type="application/ld+json"
    dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
)}
```

## ✨ Tour con FAQ da Testare

Tutti i tour negli snapshot hanno FAQ. Esempi:
- `/viaggi-fotografici/destinazioni/olanda/amsterdam/tulipani-e-mulini-a-vento` (17 FAQ)
- `/viaggi-fotografici/destinazioni/islanda/reykjavik/aurora-boreale` (18+ FAQ)

## 📝 Prossimi Passi (Opzionali)

1. **Itinerary Schema**: Aggiungere schema per TravelGuide/TouristTrip
2. **Review Schema**: Aggiungere aggregateRating per le recensioni (già presente in Product)
3. **Event Schema**: Se i tour hanno date specifiche, schema Event potrebbe essere utile

## ⚡ Note Tecniche

- Il FAQ Schema viene generato **server-side** durante SSG
- Zero impatto sulle performance (già nel build)
- Compatibile con tutti i tour esistenti
- Fallback graceful: se non ci sono FAQ, il tag non viene renderizzato

