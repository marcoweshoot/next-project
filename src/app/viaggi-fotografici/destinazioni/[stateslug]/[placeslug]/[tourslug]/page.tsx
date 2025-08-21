import { permanentRedirect } from 'next/navigation'
import dynamicImport from 'next/dynamic'
import { unstable_cache as nextCache } from 'next/cache'
import { getClient } from '@/lib/graphqlClient'
import { GET_TOUR_BY_SLUG, GET_ALL_TOUR_SLUGS } from '@/graphql/queries/tour-detail'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import SocialProofSection from '@/components/SocialProofSection'

// SSG: forziamo il rendering statico
export const dynamic = 'force-static'
// Consenti fallback stile "blocking" per gli slug non pre-renderizzati
export const dynamicParams = true

const CANONICAL_BASE = '/viaggi-fotografici/destinazioni'

type Params = { stateslug: string; placeslug: string; tourslug: string }
type Props = { params: Params }
interface TourDetailResponse { tours: any[] }

const TourDetailHeaderClient = dynamicImport(
  () => import('@/components/tour-detail/TourDetailHeaderClient'),
  { loading: () => <div className="h-20 bg-gray-100 animate-pulse" /> }
)
const TourDetailContentClient = dynamicImport(
  () => import('@/components/tour-detail/TourDetailContentClient'),
  { loading: () => <div className="h-64 bg-gray-100 animate-pulse" /> }
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
  return Array.from(
    new Map(
      sessions
        .filter((s) => { const dt = parseSessionDate(s); return dt && dt.getTime() >= now })
        .flatMap((s) => s.users || [])
        .map((u) => [makeCoachKey(u), u])
    ).values()
  )
}
function extractPastCoaches(sessions: any[] = []) {
  const now = Date.now()
  return Array.from(
    new Map(
      sessions
        .filter((s) => { const dt = parseSessionDate(s); return dt && dt.getTime() < now })
        .sort((a, b) => parseSessionDate(b)!.getTime() - parseSessionDate(a)!.getTime())
        .flatMap((s) => s.users || [])
        .map((u) => [makeCoachKey(u), u])
    ).values()
  )
}

async function fetchTourOnce(slug: string) {
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
  // Nessuna revalidazione: resta statico
  const runner = nextCache(() => fetchTourOnce(slug), [`tour:${slug}`], {
    revalidate: false,
    tags: [`tour:${slug}`],
  })
  return runner()
}

export async function generateStaticParams(): Promise<Params[]> {
  const client = getClient()
  try {
    const data = (await client.request(GET_ALL_TOUR_SLUGS, { locale: 'it' })) as { tours: any[] }
    const tours: any[] = data?.tours ?? []

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

    // Pre-renderizza solo i primi N per evitare timeouts in build
    const LIMIT = Number(process.env.SSG_TOUR_LIMIT ?? '120')
    return params.slice(0, LIMIT)
  } catch {
    return []
  }
}

export default async function TourDetailPage({ params }: Props) {
  try {
    const { stateslug, placeslug, tourslug } = params
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

    return (
      <div className="min-h-screen bg-white">
        <Header />

        {/* H1 dovrebbe stare dentro questo componente */}
        <TourDetailHeaderClient
          tour={tour}
          reviewsCount={reviewsCount}
          averageRating={averageRating}
          stateSlug={stateslug}
          placeSlug={placeslug}
        />

        <SocialProofSection /> {/* idealmente usa h2 al suo interno */}

        {/* 👇 Aggiungiamo l'H2 di sezione prima degli step/itinerario */}
        <section aria-labelledby="itinerary-heading" className="mt-8">
          <h2 id="itinerary-heading" className="sr-only">
            Itinerario giorno per giorno
          </h2>

          {/* Dentro questo componente mantieni: Step=h3, Location=h4, Card=h5 */}
          <TourDetailContentClient tour={tour} coaches={coaches} isFallbackPast={isFallbackPast} />
        </section>

        <Footer />
      </div>
    )
  } catch {
    return permanentRedirect(CANONICAL_BASE)
  }
}
