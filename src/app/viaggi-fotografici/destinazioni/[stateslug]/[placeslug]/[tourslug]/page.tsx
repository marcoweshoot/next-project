// src/app/viaggi-fotografici/destinazioni/[stateslug]/[placeslug]/[tourslug]/page.tsx
import fs from 'node:fs/promises'
import path from 'node:path'
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
// Consenti fallback stile "blocking" per slug non pre-renderizzati
export const dynamicParams = true

const CANONICAL_BASE = '/viaggi-fotografici/destinazioni'

// Percorsi snapshot (compat: vecchio formato per-tour + nuovo snapshot unico)
const SNAPSHOT_DIR = path.join(process.cwd(), 'public', 'snapshots')
const SNAPSHOT_FILE = path.join(process.cwd(), 'public', 'snapshot.json')

type Params = { stateslug: string; placeslug: string; tourslug: string }
type Props = { params: Params }
interface TourDetailResponse { tours: any[] }

// Dynamic imports client
const TourDetailHeaderClient = dynamicImport(
  () => import('@/components/tour-detail/TourDetailHeaderClient'),
  { loading: () => <div className="h-20 bg-gray-100 animate-pulse" /> }
)
const TourDetailContentClient = dynamicImport(
  () => import('@/components/tour-detail/TourDetailContentClient'),
  { loading: () => <div className="h-64 bg-gray-100 animate-pulse" /> }
)

// ---------- piccoli helper ----------
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
        .flatMap((s) => s?.users || [])
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
        .flatMap((s) => s?.users || [])
        .map((u) => [makeCoachKey(u), u])
    ).values()
  )
}

// ---------- SNAPSHOT HELPERS ----------
// (1) vecchio formato per-tour: public/snapshots/tour.{slug}.json
async function readSnapshotTourFile(slug: string) {
  try {
    const file = path.join(SNAPSHOT_DIR, `tour.${slug}.json`)
    const raw = await fs.readFile(file, 'utf8')
    const data = JSON.parse(raw)
    return data ?? null
  } catch {
    return null
  }
}

// (2) nuovo formato unico: public/snapshot.json { tours: [...], pictures: [...] }
async function readSnapshotAll(): Promise<{ tours?: any[] } | null> {
  try {
    const raw = await fs.readFile(SNAPSHOT_FILE, 'utf8')
    const data = JSON.parse(raw)
    return data && typeof data === 'object' ? data : null
  } catch {
    return null
  }
}

async function readSnapshotList(): Promise<any[]> {
  // prova nuovo formato
  const all = await readSnapshotAll()
  if (all?.tours && Array.isArray(all.tours)) {
    return all.tours
  }
  // fallback vecchio formato aggregato (se mai esistito)
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
  // 1) snapshot-first (file di dettaglio se presente - vecchio formato)
  const snapOld = await readSnapshotTourFile(slug)
  if (snapOld) return snapOld

  // 1-bis) snapshot unico: cerca il tour nello snapshot.json
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
  // In sviluppo: niente cache → leggi sempre gli snapshot aggiornati
  if (process.env.NODE_ENV === 'development') {
    return fetchTourOnce(slug);
  }

  // In produzione: cache soft (es. 1 minuto)
  const runner = nextCache(() => fetchTourOnce(slug), [`tour:${slug}`], {
    revalidate: 60, // 60s; evita il "per sempre" che avevi con false
    tags: [`tour:${slug}`],
  });
  return runner();
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
    const stateSlugs = mapSlugs(tour?.states)
    const placeSlugs = mapSlugs(tour?.places)
    const canonicalState = stateSlugs[0] || 'nessuno-stato'
    const canonicalPlace = placeSlugs[0] || 'nessuna-location'
    if (!tour?.slug) continue
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

        <TourDetailHeaderClient
          tour={tour}
          reviewsCount={reviewsCount}
          averageRating={averageRating}
          stateSlug={stateslug}
          placeSlug={placeslug}
        />

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
