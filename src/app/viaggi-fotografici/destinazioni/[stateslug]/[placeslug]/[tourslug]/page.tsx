// src/app/viaggi-fotografici/destinazioni/[stateslug]/[placeslug]/[tourslug]/page.tsx
import fs from 'node:fs/promises'
import path from 'node:path'
import { permanentRedirect } from 'next/navigation'
import dynamicImport from 'next/dynamic'
import { unstable_cache as nextCache } from 'next/cache'
import Script from 'next/script'                       // <-- SEO
import type { Metadata } from 'next'                  // <-- SEO
import { getClient } from '@/lib/graphqlClient'
import { GET_TOUR_BY_SLUG, GET_ALL_TOUR_SLUGS } from '@/graphql/queries/tour-detail'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import SocialProofSection from '@/components/SocialProofSection'

// SSG: forziamo il rendering statico
export const dynamic = 'force-static'
// Consenti fallback stile "blocking" per slug non pre-renderizzati
export const dynamicParams = true

const SITE_URL = 'https://www.weshoot.it'            // <-- SEO
const CANONICAL_BASE = '/viaggi-fotografici/destinazioni'
const SNAPSHOT_DIR = path.join(process.cwd(), 'public', 'snapshots')

type Params = { stateslug: string; placeslug: string; tourslug: string }
type Props = { params: Promise<Params> }

interface TourDetailResponse { tours: any[] }

const TourDetailHeaderClient = dynamicImport(
  () => import('@/components/tour-detail/TourDetailHeaderClient'),
  { loading: () => <div className="h-20 bg-muted animate-pulse" /> }
)
const TourDetailContentClient = dynamicImport(
  () => import('@/components/tour-detail/TourDetailContentClient'),
  { loading: () => <div className="h-64 bg-muted animate-pulse" /> }
)

function toList<T = any>(v: any): T[] {
  return v == null ? [] : (Array.isArray(v) ? v : [v])
}
const mapSlugs = (v: any) => toList(v).map((x: any) => x?.slug).filter(Boolean)

function makeCoachKey(user: any) {
  const first = (user?.firstName || '').trim()
  const last = (user?.lastName || '').trim()
  return first || last ? `${first.toLowerCase()}|${last.toLowerCase()}` : JSON.stringify(user)
}
const parseSessionDate = (s: any): Date | null => {
  const d = new Date(s?.start || '')
  return isNaN(d.getTime()) ? null : d
}
function extractUpcomingCoaches(sessions: any[] = []) {
  const now = Date.now()
  
  const upcomingSessions = sessions.filter((s) => { 
    const dt = parseSessionDate(s); 
    return dt && dt.getTime() >= now 
  })
  
  const allUsers = upcomingSessions.flatMap((s) => s.users || [])
  
  const coachUsers = allUsers.filter((u) => {
    const roleName = u.role?.name;
    const userLevel = u.level;
    return roleName === 'coach' || userLevel === 'coach';
  })
  
  const uniqueCoaches = Array.from(
    new Map(coachUsers.map((u) => [makeCoachKey(u), u])).values()
  )
  
  return uniqueCoaches
}
function extractPastCoaches(sessions: any[] = []) {
  const now = Date.now()
  
  const pastSessions = sessions.filter((s) => { 
    const dt = parseSessionDate(s); 
    return dt && dt.getTime() < now 
  })
  
  const allUsers = pastSessions
    .sort((a, b) => parseSessionDate(b)!.getTime() - parseSessionDate(a)!.getTime())
    .flatMap((s) => s.users || [])
  
  const coachUsers = allUsers.filter((u) => {
    const roleName = u.role?.name;
    const userLevel = u.level;
    return roleName === 'coach' || userLevel === 'coach';
  })
  
  const uniqueCoaches = Array.from(
    new Map(coachUsers.map((u) => [makeCoachKey(u), u])).values()
  )
  
  return uniqueCoaches
}

// ---------- SNAPSHOT HELPERS ----------
async function readSnapshotTour(slug: string) {
  try {
    const file = path.join(SNAPSHOT_DIR, `tour.${slug}.json`)
    const raw = await fs.readFile(file, 'utf8')
    const data = JSON.parse(raw)
    return data ?? null
  } catch {
    return null
  }
}
async function readSnapshotList(): Promise<any[]> {
  try {
    const file = path.join(SNAPSHOT_DIR, 'tours.json')
    const raw = await fs.readFile(file, 'utf8')
    const data = JSON.parse(raw)
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}
// -------------------------------------

async function fetchTourOnce(slug: string) {
  // 1) snapshot-first (file di dettaglio se presente)
  const snap = await readSnapshotTour(slug)
  if (snap) return snap

  // 1-bis) usa la lista snapshot se esiste
  const list = await readSnapshotList()
  const fromList = list.find((t: any) => t?.slug === slug)
  if (fromList) return fromList

  // 2) fallback al CMS
  const client = getClient()
  let data = await client.request<TourDetailResponse>(GET_TOUR_BY_SLUG, { slug, locale: 'it' })
  let tours = data?.tours ?? []
  if (!tours.length) {
    data = await client.request<TourDetailResponse>(GET_TOUR_BY_SLUG, { slug })
    tours = data?.tours ?? []
  }
  return tours.find((t: any) => t?.slug === slug) ?? null
}

function getTourCached(slug: string) {
  const runner = nextCache(() => fetchTourOnce(slug), [`tour:${slug}`], {
    revalidate: false,
    tags: [`tour:${slug}`],
  })
  return runner()
}

/* ===== SEO helpers (no UI) ===== */
const absUrl = (u?: string) =>
  !u ? '' : (u.startsWith('http') ? u : `${SITE_URL}${u.startsWith('/') ? '' : '/'}${u}`)
const humanize = (slug?: string) =>
  (slug || '').replace(/[-_]+/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase())
const pick = <T,>(...vals: (T | undefined | null | '')[]) =>
  vals.find(v => v != null && String(v).trim() !== '') as T | undefined
const toNumber = (val: any): number | null => {
  if (val == null) return null
  const n = Number(String(val).replace(/[^\d.,]/g, '').replace(',', '.'))
  return isFinite(n) && n > 0 ? n : null
}
const readSessionPrice = (s: any) =>
  s?.price ?? s?.priceFrom ?? s?.quota ?? s?.cost ?? s?.amount ?? null
function getSeoFromStrapi(tour: any) {
  const s = tour?.SEO || tour?.seo || {}
  const metaTitle = pick<string>(s.metaTitle, s.title)
  const metaDescription = pick<string>(s.metaDescription, s.description)
  const share = s.shareImage || s.ogImage || {}
  return {
    metaTitle,
    metaDescription,
    shareImage: {
      url: share?.url as string | undefined,
      width: share?.width as number | undefined,
      height: share?.height as number | undefined,
      alt: (share?.alternativeText as string | undefined) || 'Condivisione',
    },
  }
}

/* ===== generateMetadata (per-tour, nessun cambiamento UI) ===== */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { stateslug, placeslug, tourslug } = await params
  const tour = await getTourCached(tourslug)
  if (!tour) return {}

  const { metaTitle, metaDescription, shareImage } = getSeoFromStrapi(tour)

  const title = metaTitle ?? tour.title ?? `${humanize(tourslug)} – Viaggio fotografico`
  const description =
    metaDescription ??
    tour.summary ??
    tour.description ??
    'Viaggio fotografico e workshop con coach esperti. Itinerario, date e informazioni utili.'
  const canonical = `${SITE_URL}${CANONICAL_BASE}/${stateslug}/${placeslug}/${tourslug}`

  const fallbackImg =
    tour?.image?.url || tour?.cover?.url || (Array.isArray(tour?.gallery) ? tour.gallery[0]?.url : '')
  const ogImageUrl = absUrl(shareImage?.url || fallbackImg) || `${SITE_URL}/og-default.jpg`
  const ogImage = {
    url: ogImageUrl,
    width: shareImage?.width ?? 1200,
    height: shareImage?.height ?? 630,
    alt: shareImage?.alt ?? title,
  }

  return {
    title, // il brand lo aggiunge il layout via template "%s | WeShoot"
    description,
    alternates: { canonical },
    openGraph: {
      type: 'website',
      siteName: 'WeShoot',
      url: canonical,
      title,
      description,
      images: [ogImage],
    },
    twitter: { card: 'summary_large_image', title, description, images: [ogImageUrl] },
    robots: { index: true, follow: true },
  }
}

export async function generateStaticParams(): Promise<Params[]> {
  // 1) snapshot-first
  let tours: any[] = await readSnapshotList()

  // 2) fallback al CMS
  if (!tours.length) {
    try {
      const client = getClient()
      const data = (await client.request(GET_ALL_TOUR_SLUGS, { locale: 'it' })) as { tours: any[] }
      tours = data?.tours ?? []
    } catch {
      tours = []
    }
  }

  const params: Params[] = []
  const seen = new Set<string>()

  for (const tour of tours) {
    const stateSlugs = mapSlugs(tour.states)
    const placeSlugs = mapSlugs(tour.places)
    const canonicalState = stateSlugs[0] || 'nessuno-stato'
    const canonicalPlace = placeSlugs[0] || 'nessuna-location'
    const key = `${canonicalState}__${canonicalPlace}__${tour.slug}`
    if (seen.has(key)) continue
    seen.add(key)
    params.push({ stateslug: canonicalState, placeslug: canonicalPlace, tourslug: tour.slug })
  }

  const LIMIT = Number(process.env.SSG_TOUR_LIMIT ?? '120')
  return params.slice(0, LIMIT)
}

export default async function TourDetailPage({ params }: Props) {
  try {
    const { stateslug, placeslug, tourslug } = await params

    if (!tourslug) {
      return permanentRedirect(CANONICAL_BASE)
    }

    const tour = await getTourCached(tourslug)
    if (!tour) {
      return permanentRedirect(CANONICAL_BASE)
    }

    const stateSlugs = mapSlugs(tour.states)
    const placeSlugs = mapSlugs(tour.places)
    const canonicalState = stateSlugs[0] || 'nessuno-stato'
    const canonicalPlace = placeSlugs[0] || 'nessuna-location'
    if (
      (stateSlugs.length && !stateSlugs.includes(stateslug)) ||
      (placeSlugs.length && !placeSlugs.includes(placeslug))
    ) {
      return permanentRedirect(`${CANONICAL_BASE}/${canonicalState}/${canonicalPlace}/${tourslug}`)
    }

    const upcoming = extractUpcomingCoaches(tour.sessions)
    const past = extractPastCoaches(tour.sessions)
    const isFallbackPast = upcoming.length === 0 && past.length > 0
    const coaches = upcoming.length > 0 ? upcoming : past

    const reviewsCount = Array.isArray(tour.reviews) ? tour.reviews.length : 0
    const averageRating = reviewsCount
      ? tour.reviews.reduce((sum: number, r: any) => sum + (r?.rating ?? 0), 0) / reviewsCount
      : 0

    /* ===== SOLO SEO: Product + Breadcrumbs (niente UI) ===== */
    const nowTs = Date.now()
    const futureSessions: any[] = Array.isArray(tour.sessions)
      ? tour.sessions.filter((s: any) => {
          const d = new Date(s?.start || '')
          return !isNaN(d.getTime()) && d.getTime() >= nowTs
        })
      : []
    const prices = futureSessions
      .map((s) => toNumber(readSessionPrice(s)))
      .filter((n): n is number => n != null)
    const lowPrice =
      prices.length
        ? Math.min(...prices)
        : toNumber(tour?.priceFrom ?? tour?.price ?? tour?.startingPrice)
    const highPrice =
      prices.length
        ? Math.max(...prices)
        : lowPrice
    const offerCount =
      futureSessions.length || (Array.isArray(tour.sessions) ? tour.sessions.length : 0)

    const pageUrl = `${SITE_URL}${CANONICAL_BASE}/${stateslug}/${placeslug}/${tourslug}`
    const mainImg =
      tour?.image?.url || tour?.cover?.url || (Array.isArray(tour?.gallery) ? tour.gallery[0]?.url : '')
    const gallery = Array.isArray(tour?.gallery) ? tour.gallery.map((g: any) => g?.url).filter(Boolean) : []

    const { metaDescription: seoDesc } = getSeoFromStrapi(tour)
    const productJsonLd: Record<string, any> = {
      '@context': 'https://schema.org',
      '@type': ['Product', 'Service'],  // Servizio/esperienza, non prodotto fisico
      name: tour?.SEO?.metaTitle ?? tour?.title ?? 'Viaggio fotografico',
      description: seoDesc ?? tour?.summary ?? tour?.description ?? '',
      image: [absUrl(mainImg), ...gallery.map(absUrl)].filter(Boolean).slice(0, 6),
      sku: (tour?.sku ?? tourslug)?.toString().toUpperCase(),
      brand: { '@type': 'Brand', name: 'WeShoot' },
      category: 'Tour fotografico',
    }

    // Aggiungi offers (obbligatorio per Google Product Schema)
    // Se abbiamo un prezzo, usalo; altrimenti usa un'offerta base
    if (lowPrice && lowPrice > 0) {
      if (highPrice && highPrice !== lowPrice) {
        productJsonLd.offers = {
          '@type': 'AggregateOffer',
          priceCurrency: 'EUR',
          lowPrice: lowPrice.toFixed(2),
          highPrice: highPrice.toFixed(2),
          offerCount: String(offerCount || 1),
          availability: 'https://schema.org/InStock',
          url: pageUrl,
          // Link ai termini di servizio con politica di cancellazione variabile
          termsOfService: `${SITE_URL}/terms`,
          // Nessuna spedizione fisica - è un servizio/esperienza
          shippingDetails: {
            '@type': 'OfferShippingDetails',
            shippingDestination: {
              '@type': 'DefinedRegion',
              addressCountry: 'IT',
            },
            deliveryTime: {
              '@type': 'ShippingDeliveryTime',
              handlingTime: {
                '@type': 'QuantitativeValue',
                minValue: 0,
                maxValue: 0,
                unitCode: 'DAY',
              },
              transitTime: {
                '@type': 'QuantitativeValue',
                minValue: 0,
                maxValue: 0,
                unitCode: 'DAY',
              },
            },
            shippingRate: {
              '@type': 'MonetaryAmount',
              value: '0',
              currency: 'EUR',
            },
          },
        }
      } else {
        productJsonLd.offers = {
          '@type': 'Offer',
          priceCurrency: 'EUR',
          price: lowPrice.toFixed(2),
          availability: 'https://schema.org/InStock',
          url: pageUrl,
          // Link ai termini di servizio con politica di cancellazione variabile
          termsOfService: `${SITE_URL}/terms`,
          // Nessuna spedizione fisica - è un servizio/esperienza
          shippingDetails: {
            '@type': 'OfferShippingDetails',
            shippingDestination: {
              '@type': 'DefinedRegion',
              addressCountry: 'IT',
            },
            deliveryTime: {
              '@type': 'ShippingDeliveryTime',
              handlingTime: {
                '@type': 'QuantitativeValue',
                minValue: 0,
                maxValue: 0,
                unitCode: 'DAY',
              },
              transitTime: {
                '@type': 'QuantitativeValue',
                minValue: 0,
                maxValue: 0,
                unitCode: 'DAY',
              },
            },
            shippingRate: {
              '@type': 'MonetaryAmount',
              value: '0',
              currency: 'EUR',
            },
          },
        }
      }
    } else {
      // Fallback: se non c'è prezzo, indica che il prodotto richiede un contatto
      // Questo è valido secondo schema.org per prodotti su richiesta
      productJsonLd.offers = {
        '@type': 'Offer',
        priceCurrency: 'EUR',
        price: '0',
        availability: 'https://schema.org/PreOrder',
        priceSpecification: {
          '@type': 'PriceSpecification',
          price: '0',
          priceCurrency: 'EUR',
        },
        url: pageUrl,
        termsOfService: `${SITE_URL}/terms`,
      }
    }

    // Aggiungi aggregateRating se ci sono recensioni
    if (reviewsCount > 0) {
      productJsonLd.aggregateRating = {
        '@type': 'AggregateRating',
        ratingValue: Math.max(1, Math.min(5, averageRating)).toFixed(1),
        reviewCount: String(reviewsCount),
      }
    }

    const breadcrumbJsonLd = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: 'Viaggi fotografici', item: `${SITE_URL}/viaggi-fotografici` },
        { '@type': 'ListItem', position: 3, name: humanize(stateslug), item: `${SITE_URL}${CANONICAL_BASE}/${stateslug}` },
        { '@type': 'ListItem', position: 4, name: humanize(placeslug), item: `${SITE_URL}${CANONICAL_BASE}/${stateslug}/${placeslug}` },
        { '@type': 'ListItem', position: 5, name: humanize(tourslug), item: pageUrl },
      ],
    }

    // FAQ Schema (JSON-LD) per Google Rich Results
    const stripHtml = (html: string) => html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim()
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

    return (
      <div className="min-h-screen bg-background">
        <Header />

        <TourDetailHeaderClient
          tour={tour}
          reviewsCount={reviewsCount}
          averageRating={averageRating}
          stateSlug={stateslug}
          placeSlug={placeslug}
        />

        {/* JSON-LD (non influisce sull'interfaccia) */}
        <Script id="ld-product-tour" type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }} />
        <Script id="ld-breadcrumbs" type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
        {faqJsonLd && (
          <Script id="ld-faq" type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
        )}

        <SocialProofSection />

        <section aria-labelledby="itinerary-heading" className="mt-8">
          <h2 id="itinerary-heading" className="sr-only">
            Itinerario giorno per giorno
          </h2>
          <TourDetailContentClient tour={tour} coaches={coaches} isFallbackPast={isFallbackPast} />
        </section>

        <Footer />
      </div>
    )
  } catch {
    return permanentRedirect(CANONICAL_BASE)
  }
}
