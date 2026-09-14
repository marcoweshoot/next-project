# Meta Pixel — `InitiateCheckout` e `AddToCart`: stato attuale

Aggiornato: 14 settembre 2026. Sostituisce la versione precedente, che descriveva il
tracciamento di `InitiateCheckout` in un `useEffect` all'apertura del modale (rimosso
nel commit `232e966`, 30 luglio 2026).

## Dove sparano gli eventi

| Evento | Trigger | File | Browser | CAPI |
|---|---|---|---|---|
| `AddToCart` | click "PRENOTA ORA" (`SessionCard`) o "Prenota" (`TourStickyNav`) | `src/utils/facebook.ts` → `trackAddToCart` | ✅ | ✅ |
| `InitiateCheckout` | click "Continua" allo step 1 di `SimpleCheckoutModal` (`handleStartPayment`) | `src/utils/facebook.ts` → `trackInitiateCheckout` | ✅ | ✅ |

- Entrambi passano un `eventID` generato con `crypto.randomUUID()` al pixel browser e lo
  stesso `event_id` a `POST /api/track-fb-event`, che lo inoltra alla Conversions API
  (`src/lib/facebook-capi.ts`). Meta deduplica la coppia browser+server.
- `InitiateCheckout` spara **una sola volta per sessione di checkout**: `handleStartPayment`
  lo emette solo se `hasCommitted` è `false`; lo stato viene azzerato da `resetModal` alla
  chiusura. Continua → Indietro → Continua non genera un secondo evento.
- Nessun evento è emesso da `useEffect`, all'apertura del modale o su re-render.
- L'Automatic Event Tracking del pixel è disattivato in `FacebookPixel.tsx`
  (`fbq('set','autoConfig',false)`). Attenzione: `autoConfig=false` **non** disattiva le
  regole no-code dell'Event Setup Tool (Events Manager → pixel → Impostazioni → Eventi),
  che il pixel scarica da `connect.facebook.net/signals/config/<pixel_id>` e applica ai
  click con `eid=ob3_plugin-set_…`, senza `value` e senza `event_id`.
- La CSP in `middleware.ts` include `https://www.facebook.com` e `https://connect.facebook.net`
  in `connect-src`, così `fbevents.js` può usare `sendBeacon`/`fetch` oltre al fallback `<img>`.

## Perché AddToCart ha anche il gemello CAPI (fix del 14/09/2026)

Prima del fix `AddToCart` era solo browser. Per il traffico da inserzioni (in-app browser
Meta, iOS/ATT, ad-blocker) il pixel browser è spesso bloccato: il base code definisce lo
stub `window.fbq` prima di caricare `fbevents.js`, quindi l'evento finiva in una coda mai
inviata. `InitiateCheckout`, avendo la copia server con `fbc`/`fbp`/IP/UA, veniva invece
attribuito. Risultato in Ads Manager: 85 `InitiateCheckout` contro 9 `AddToCart`, mentre
sul pixel il rapporto reale era ~1:1. Con il gemello CAPI `AddToCart` ha la stessa
copertura di `InitiateCheckout`.

## Regole no-code rimosse da Events Manager (14/09/2026)

Il pixel aveva 41 regole Event Setup Tool attive, create tra novembre 2024 e febbraio 2025
per il vecchio sito (una usava il selettore CSS `index-module--card_price--IRivT`). Tra queste:

- `InitiateCheckout` ← click su "vedi partenze" (bottone di scroll nell'hero di ogni tour,
  senza value): era la fonte degli `InitiateCheckout` "sporchi".
- `Purchase` ← click su "scrivici ora" e "richiedi info" (acquisti finti dai bottoni contatto).
- `CompleteRegistration` ← "crea account" / "continua con google"; `Lead` ← "parla con noi"
  (duplicati non deduplicabili degli eventi già emessi dal codice).
- 35 × `FindLocation` ← "vedi viaggio".

Sono state cancellate tutte via API (`ads_pixel_event_delete`); `ads_pixel_event_read` sul
pixel ora restituisce una lista vuota. La config del pixel è in CDN con `max-age=1200`,
quindi i browser possono applicare le vecchie regole per al massimo 20 minuti dopo la
cancellazione. **Non ricreare regole no-code**: tutti gli eventi standard sono tracciati dal
codice con `value`, `currency` ed `event_id`.

## `POST /api/track-fb-event` è un endpoint validato (14/09/2026)

L'endpoint inoltra eventi alla Conversions API con `FB_CAPI_ACCESS_TOKEN`, quindi il body è
input non fidato. Prima era un relay aperto: accettava qualsiasi `event_name`, qualsiasi
`event_source_url` e qualsiasi `custom_data`, senza controllo di origine. Ora rifiuta con
`400`:

| Controllo | Regola |
|---|---|
| `event_name` | Solo `ViewContent`, `Lead`, `AddToCart`, `InitiateCheckout`, `AddPaymentInfo`. |
| `event_source_url` | Hostname deve essere `www.weshoot.it` o `weshoot.it` (in dev anche `localhost`/`127.0.0.1`). |
| Header `Origin` | Stessa allowlist di hostname. Il browser lo manda sempre sui POST; un chiamante server-to-server di norma no. |

**`Purchase` e `CompleteRegistration` non sono in allowlist di proposito.** Partono già
server-side da `webhook-stripe/route.ts`, `zero-payment/route.ts`, `create-profile/route.ts`
e `checkout/claim/[sessionId]/route.ts`, che chiamano `sendServerEvent` direttamente senza
passare da qui. Tenerli fuori impedisce di iniettare acquisti finti con `value` arbitrario.
Se in futuro serve un nuovo evento dal browser, va aggiunto a `ALLOWED_EVENT_NAMES`.

I preview deploy `*.vercel.app` sono esclusi, così non inquinano il dataset di produzione.

`client_ip_address` prende ora solo il primo elemento di `x-forwarded-for` (può essere una
lista `"client, proxy1, proxy2"`): Meta vuole un IP singolo, e il valore incide sull'EMQ.

> **Nota sul dataset.** Il pixel `220965505676374` è condiviso fra `www.weshoot.it`,
> `accademia.weshoot.it` e `blog.weshoot.it`, quindi i pubblici "visitatori del sito"
> mescolano tre proprietà. Questa validazione protegge solo ciò che passa da Vercel: eventi
> server-side generati dalle macchine di accademia/blog non passano di qui.

## `PageView` sulle navigazioni client-side (14/09/2026)

`FacebookPixel.tsx` è montato una volta nel root layout e lo snippet base spara `PageView`
solo lì, cioè sulla pagina di atterraggio. Le navigazioni dell'App Router non ricaricano la
pagina, quindi home → tour → calendario produceva **un solo PageView**. Ora un `useEffect`
su `usePathname()` spara `PageView` a ogni cambio di pathname (la prima esecuzione è saltata
perché la copre l'init). `fbq` allega da solo la URL corrente completa (`dl=`).

Serve ai pubblici filtrati per URL ("ha visitato una pagina contenente `/viaggi-fotografici`"):
senza, entrava solo chi atterrava direttamente su quelle pagine. Non cambia il numero di
visitatori unici. Il PageView resta solo browser: non passa da `/api/track-fb-event`, che
infatti non lo ammette.

## Il flusso di PageView server-side non viene da questo repo (14/09/2026)

Il dataset riceve ~400–500 `PageView`/h costanti 24h/24. Misurato il 12/09/2026 con
`ads_get_dataset_stats` (giornata senza picchi):

| Metrica | Valore |
|---|---|
| `PageView` `SERVER_ONLY` | 395–473/h, piatti giorno e notte (~9.850/giorno) |
| `PageView` `WEB_ONLY` | 1–32/h, curva umana (~230/giorno) |
| Eventi con `event_source_url` (aggregazioni `host`/`url`) | ~20–90/h (~1.060/giorno) |
| `event_total_counts` per `PageView` | 9.430 + 414 + 228 + 5 |

**9.430 PageView/giorno sono CAPI senza `event_source_url`**, un evento ogni ~9 secondi
senza variazione giorno/notte: una macchina. Il repo è escluso:

- nessun chiamante di `sendServerEvent` manda `PageView` (solo `Purchase` e
  `CompleteRegistration`);
- `/api/track-fb-event`, anche prima della validazione, rifiutava i body senza
  `event_source_url`, quindi non può produrre eventi senza URL;
- log runtime Vercel in produzione, 24h: **29 richieste** a `/api/track-fb-event`.

**Sorgente trovata (14/09/2026, ispezione via wp-admin dell'accademia, EC2 `54.76.69.98`, Apache):**

- Il PageView server-side lo manda **Meta for WooCommerce** (plugin ufficiale,
  `facebook-commerce-events-tracker.php` → `inject_page_view_event()` su `wp_head` →
  `send_api_event()`), cioè a ogni pagina renderizzata da WordPress. Il suo filtro
  anti-crawler blocca solo user-agent contenenti `crawler` o `meta-*`.
- `event_source_url` viene da `home_url()`, ma **WordPress prende il proprio indirizzo
  dall'header `Host`** (`WP_HOME` dinamico): `curl -H 'Host: test.invalid' http://54.76.69.98/`
  restituisce `<link rel="canonical" href="http://test.invalid/">`. Quindi: `Host: 54.76.69.98`
  → URL `http://54.76.69.98/`; `Host: ws.bitmex.com` (proxy-abuse) → `http://ws.bitmex.com/`;
  **HTTP/1.0 senza `Host`** (scanner, monitor, health check) → `http:///` → Meta scarta la URL
  → il bucket da 9.430/giorno senza host.
- Il server risponde `200` con tutto WordPress a qualsiasi `Host`, anche assente, e imposta
  `_fbp` con `domain=54.76.69.98`.
- Il plugin "Facebook Pixel PRO" (custom) è solo pixel browser; il tema figlio imposta cookie
  `utm_*`/`fbclid`/`ref`/`ip` ma non chiama Meta. `ViewCategory` esiste in questo repo, non è
  una firma di plugin WordPress.

**Fix, in `functions.php` del tema figlio (BuddyBoss Child) dell'accademia**, senza SSH:

1. Su `init` (priorità 0), se `HTTP_HOST` non è `accademia.weshoot.it`, rispondere `200 ok`
   in text/plain e uscire: gli health check restano verdi, ma niente pagina, niente pixel,
   niente CAPI.
2. `add_filter('wc_facebook_is_crawler_request', ...)` per trattare come crawler gli UA vuoti
   o contenenti `bot`, `spider`, `crawl`, `curl`, `wget`, `python`, `go-http`, `okhttp`,
   `healthchecker`, `uptime`, `monitor`, `headless`, `lighthouse`, `facebookexternalhit`.

Poi, con accesso al server: security group :80/:443 solo dal SG dell'ALB, vhost Apache di
default che risponde `403` a `Host` ≠ `accademia.weshoot.it`, health check dell'ALB su un file
statico. Log: `/var/log/apache2/access.log*` (non nginx).

## Come verificare

1. Impostare `FB_TEST_EVENT_CODE` in locale, aprire una pagina tour, click "PRENOTA ORA".
   In Events Manager → Test Events deve comparire `AddToCart` due volte con lo stesso
   `event_id` (Browser + Server, marcato "deduplicated").
2. Click "Continua" → `InitiateCheckout`, stesso schema. Indietro → Continua: nessun
   secondo `InitiateCheckout`.
3. Console del browser in produzione: nessun `Refused to connect to https://www.facebook.com/tr`.
   Click su "Vedi Partenze" nell'hero: nessuna richiesta a `facebook.com/tr/?ev=InitiateCheckout`.
4. Dopo 48–72h: in Events Manager la quota "Server" di `AddToCart` deve essere ≈ 50% del
   totale, come per `InitiateCheckout`.
5. Home → click su un tour → "Vedi Partenze": in Network, filtro `facebook.com/tr`, un
   `ev=PageView` per ogni navigazione con `dl=` uguale alla URL corrente. Ricaricando una
   pagina tour: un solo `PageView`.

> `FB_TEST_EVENT_CODE` **non** deve essere impostato su Vercel Production, altrimenti tutti
> gli eventi CAPI finiscono in Test Events.
