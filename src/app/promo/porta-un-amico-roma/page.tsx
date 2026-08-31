// src/app/promo/porta-un-amico-roma/page.tsx
// Landing promo "Porta un Amico" per il workshop di fotografia a Roma.
import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { unstable_cache as nextCache } from 'next/cache'
import { getClient } from '@/lib/graphqlClient'
import {
  GET_PROMO_ROMA_TOUR,
  PROMO_FULL_PRICE,
  PROMO_PARTY_SIZE,
  PROMO_PRICE_PER_PERSON,
  PROMO_ROMA_SESSION_IDS,
  PROMO_ROMA_TOUR_ID,
} from '@/graphql/queries/promo-roma'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import TourReviews from '@/components/tour-detail/TourReviews'
import TourFAQ from '@/components/tour-detail/TourFAQ'
import { PromoSessions } from '@/components/promo/PromoSessions'
import { PromoViewTracker } from '@/components/promo/PromoViewTracker'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Camera, Check, Star, UserPlus, Wallet } from 'lucide-react'

export const revalidate = 3600
// Il client GraphQL usa cache: 'no-store', quindi senza unstable_cache la pagina
// verrebbe renderizzata a ogni richiesta invece che servita statica dalla CDN.
export const dynamic = 'force-static'

const SITE_URL = 'https://www.weshoot.it'
const CANONICAL = `${SITE_URL}/promo/porta-un-amico-roma`
const PROMO_TOTAL = PROMO_PRICE_PER_PERSON * PROMO_PARTY_SIZE
const FULL_TOTAL = PROMO_FULL_PRICE * PROMO_PARTY_SIZE
const FALLBACK_IMAGE =
  'https://s3.eu-west-1.amazonaws.com/mars.weshoot.it/Ponte_Umberto_I_al_tramonto_ab229677c3.jpg'

const META_TITLE = `Porta un Amico: workshop di fotografia a Roma a ${PROMO_PRICE_PER_PERSON}€ a testa`
const META_DESCRIPTION = `Prenota in due il workshop di fotografia a Roma e pagate ${PROMO_PRICE_PER_PERSON}€ a testa invece di ${PROMO_FULL_PRICE}€. Un pomeriggio di scatti con un fotografo professionista, massimo 8 persone.`

export const metadata: Metadata = {
  title: `${META_TITLE} | WeShoot.it`,
  description: META_DESCRIPTION,
  alternates: { canonical: CANONICAL },
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    title: META_TITLE,
    description: META_DESCRIPTION,
    url: CANONICAL,
    siteName: 'WeShoot.it',
    locale: 'it_IT',
    images: [{ url: FALLBACK_IMAGE, alt: 'Workshop di fotografia a Roma' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: META_TITLE,
    description: META_DESCRIPTION,
    images: [FALLBACK_IMAGE],
  },
}

interface PromoTour {
  id: string
  title: string
  excerpt?: string
  image?: { url?: string; alternativeText?: string } | null
  sessions?: Array<{
    id: string
    start: string
    end: string
    price: number
    deposit: number
    maxPax: number
    status: string
  }> | null
  faqs?: Array<{ id?: string; question: string; answer: string }> | null
  reviews?: Array<any> | null
}

/** FAQ specifiche della promo, mostrate prima di quelle del CMS. */
const PROMO_FAQS = [
  {
    id: 'promo-1',
    question: 'Posso partecipare da solo con questa offerta?',
    answer:
      "<p>No: la promo <strong>Porta un Amico</strong> vale solo per due persone che prenotano insieme, ed è per questo che il prezzo scende da 69€ a 50€ a testa. Se vuoi venire da solo puoi prenotare il posto singolo a 69€ dalla <a href=\"/viaggi-fotografici/destinazioni/italia/lazio/workshop-fotografia-roma\">pagina del workshop</a>.</p>",
  },
  {
    id: 'promo-2',
    question: 'Il mio amico deve pagare separatamente?',
    answer:
      '<p>No. Con un unico pagamento da 100€ prenoti entrambi i posti: poi vi mettete d’accordo tra voi. Dopo il pagamento ti scriviamo su WhatsApp per farci sapere il nome del tuo amico e aggiungervi al gruppo dei corsisti.</p>',
  },
  {
    id: 'promo-3',
    question: 'Vale anche se ho già prenotato una data?',
    answer:
      '<p>La promo si applica alle nuove prenotazioni doppie fatte da questa pagina. Se hai già un posto confermato e vuoi aggiungere un amico, scrivici su WhatsApp e troviamo insieme la soluzione migliore.</p>',
  },
]

const HOW_IT_WORKS = [
  {
    icon: UserPlus,
    title: 'Scegli la data e trova un amico',
    text: 'Un amico, il partner, un collega: chiunque abbia voglia di passare un pomeriggio diverso con una fotocamera in mano.',
  },
  {
    icon: Wallet,
    title: `Prenotate in due a ${PROMO_TOTAL}€`,
    text: `Un solo pagamento per entrambi i posti: ${PROMO_PRICE_PER_PERSON}€ a testa invece di ${PROMO_FULL_PRICE}€. Nessun codice da inserire.`,
  },
  {
    icon: Camera,
    title: 'Ci vediamo a Roma',
    text: 'Sei ore per le strade della Città Eterna con un fotografo professionista. Vi aggiungiamo subito al gruppo WhatsApp dei corsisti.',
  },
]

const WHAT_YOU_LEARN = [
  'Uscire finalmente dalla modalità automatica',
  'Usare tempi, diaframmi e ISO con più sicurezza',
  'Leggere la luce in ambiente urbano',
  'Comporre immagini pulite e d’impatto',
  'Raccontare davvero la città con i tuoi scatti',
]

const AFTER_THE_WORKSHOP = [
  'Uno sconto sul prossimo workshop o viaggio fotografico',
  'Un estratto del nostro PDF sulla pianificazione dell’uscita fotografica',
  'Accesso a 3 video corsi introduttivi di post-produzione con Photoshop',
]

const fetchPromoTour = nextCache(
  () =>
    getClient().request<{ tour: PromoTour | null }>(GET_PROMO_ROMA_TOUR, {
      id: PROMO_ROMA_TOUR_ID,
    }),
  ['promo-roma-tour'],
  { revalidate: 3600, tags: [`tour:${PROMO_ROMA_TOUR_ID}`] }
)

export default async function PortaUnAmicoRomaPage() {
  const { tour } = await fetchPromoTour()

  const now = Date.now()
  const promoSessions = (tour?.sessions ?? [])
    .filter((s) => PROMO_ROMA_SESSION_IDS.includes(s.id))
    .filter((s) => new Date(s.start).getTime() >= now)
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
    .map((s) => ({
      id: s.id,
      start: s.start,
      end: s.end,
      maxPax: s.maxPax ?? 8,
      status: s.status,
    }))

  const reviews = tour?.reviews ?? []
  const ratingValue =
    reviews.length > 0
      ? reviews.reduce((sum: number, r: any) => sum + (r.rating ?? 0), 0) / reviews.length
      : 0
  const heroImage = tour?.image?.url || FALLBACK_IMAGE
  const heroAlt = tour?.image?.alternativeText || 'Workshop di fotografia a Roma'
  const faqs = [...PROMO_FAQS, ...(tour?.faqs ?? [])]

  const eventsJsonLd = promoSessions.map((session) => ({
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: 'Porta un Amico — Workshop di fotografia a Roma',
    description: META_DESCRIPTION,
    startDate: session.start,
    endDate: session.end,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    image: [heroImage],
    location: {
      '@type': 'Place',
      name: 'Roma',
      address: { '@type': 'PostalAddress', addressLocality: 'Roma', addressCountry: 'IT' },
    },
    organizer: { '@type': 'Organization', name: 'WeShoot', url: SITE_URL },
    offers: {
      '@type': 'Offer',
      url: CANONICAL,
      price: PROMO_PRICE_PER_PERSON,
      priceCurrency: 'EUR',
      availability: 'https://schema.org/InStock',
    },
  }))

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer.replace(/<[^>]+>/g, '').trim(),
      },
    })),
  }

  return (
    <>
      <Header />
      <PromoViewTracker />

      <main className="min-h-screen bg-background transition-colors">
        {/* Hero */}
        <section className="relative overflow-hidden text-white">
          <Image
            src={heroImage}
            alt={heroAlt}
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
            unoptimized
          />
          <div className="absolute inset-0 bg-black/65" />

          <div className="relative z-10 mx-auto max-w-4xl px-4 py-20 text-center md:py-28">
            <Badge className="mb-5 bg-white/15 text-white hover:bg-white/25">
              Offerta Porta un Amico
            </Badge>
            <h1 className="text-balance text-3xl font-bold leading-tight md:text-5xl">
              Sabato pomeriggio: centro commerciale
              <span className="mt-1 block text-primary">o Roma al tramonto?</span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg text-white/85">
              Porta la fotocamera e un amico. Sei ore in giro per la città con un fotografo
              professionista, {PROMO_PRICE_PER_PERSON}€ a testa invece di {PROMO_FULL_PRICE}€.
            </p>

            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <Button asChild size="lg">
                <a href="#date">Scegli la vostra data</a>
              </Button>
              <span className="text-sm text-white/80">
                <span className="line-through">{FULL_TOTAL}€</span>{' '}
                <strong className="text-base text-white">{PROMO_TOTAL}€ in due</strong>
              </span>
            </div>

            {reviews.length > 0 && (
              <p className="mt-6 flex items-center justify-center gap-2 text-sm text-white/85">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span>
                  {ratingValue.toFixed(1)} su 5 — {reviews.length} recensioni di chi c’è già stato
                </span>
              </p>
            )}
          </div>
        </section>

        {/* Come funziona */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="mb-10 text-center text-3xl font-bold text-foreground">
              Come funziona
            </h2>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-3">
              {HOW_IT_WORKS.map((step, index) => (
                <div key={step.title} className="text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                    <step.icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="mb-2 font-semibold text-foreground">
                    {index + 1}. {step.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">{step.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Date */}
        <section id="date" className="scroll-mt-24 bg-muted/40 py-16">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-3xl font-bold text-foreground">Le date in promozione</h2>
              <p className="mt-3 text-muted-foreground">
                L’offerta vale su queste uscite. Ogni prenotazione include{' '}
                <strong>due posti</strong>: paghi {PROMO_TOTAL}€ in tutto, {PROMO_PRICE_PER_PERSON}€
                a testa.
              </p>
            </div>

            <div className="mx-auto mt-10 max-w-4xl">
              {promoSessions.length > 0 ? (
                <PromoSessions sessions={promoSessions} />
              ) : (
                <p className="text-center text-muted-foreground">
                  Al momento non ci sono date in promozione. Scrivici su WhatsApp e ti avvisiamo
                  appena apriamo le prossime.
                </p>
              )}
            </div>

            <p className="mx-auto mt-8 max-w-2xl text-center text-sm text-muted-foreground">
              Dopo il pagamento ti scriviamo su WhatsApp per il nome del tuo amico e per
              aggiungervi al gruppo riservato ai corsisti.
            </p>
          </div>
        </section>

        {/* Cosa impari */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-12 md:grid-cols-2">
              <div>
                <h2 className="mb-6 text-3xl font-bold text-foreground">Cosa imparerete</h2>
                <ul className="space-y-3">
                  {WHAT_YOU_LEARN.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <Check className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h2 className="mb-6 text-3xl font-bold text-foreground">E dopo il workshop</h2>
                <ul className="space-y-3">
                  {AFTER_THE_WORKSHOP.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <Check className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {reviews.length > 0 && <TourReviews reviews={reviews} />}

        <TourFAQ faqs={faqs} />

        {/* CTA finale */}
        <section className="bg-muted/40 py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-foreground">
              Chiama il tuo amico, il posto è per due
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
              Solo 8 posti per uscita: quando una data si riempie, si riempie davvero.
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <Button asChild size="lg">
                <a href="#date">Prenota in due a {PROMO_TOTAL}€</a>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/viaggi-fotografici/destinazioni/italia/lazio/workshop-fotografia-roma">
                  Vedi tutti i dettagli del workshop
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* JSON-LD come <script> nativo: cosi finisce nell'HTML statico e i crawler
            lo leggono senza dover eseguire JS (next/script lo inietta lato client). */}
        {eventsJsonLd.map((event, index) => (
          <script
            key={promoSessions[index].id}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(event) }}
          />
        ))}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      </main>

      <Footer />
    </>
  )
}
