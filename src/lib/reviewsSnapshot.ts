import fs from 'node:fs/promises'
import path from 'node:path'
import { cache } from 'react'
import { getClient } from '@/lib/apolloClient'
import { GET_REVIEWS } from '@/graphql/queries'

export type SnapshotReview = {
  id: string
  title?: string
  description: string
  rating: number
  created_at: string
  user: {
    firstName?: string
    lastName?: string
    profilePicture?: { url: string; alternativeText?: string } | null
  }
  tour?: { title: string; slug: string } | null
}

/**
 * Recensioni globali (Strapi + Supabase) già unite e ordinate dallo snapshot statico.
 * Fallback a GraphQL, che però restituisce le sole recensioni Strapi.
 */
export const getAllReviews = cache(async (): Promise<SnapshotReview[]> => {
  try {
    const snapshotFile = path.join(process.cwd(), 'public', 'snapshots', 'reviews.json')
    const raw = await fs.readFile(snapshotFile, 'utf8')
    const reviews = JSON.parse(raw)
    if (Array.isArray(reviews) && reviews.length > 0) {
      console.log(`[REVIEWS] ✅ Caricate ${reviews.length} recensioni da snapshot`)
      return reviews
    }
  } catch (err) {
    console.warn(
      '[REVIEWS] ⚠️  Snapshot non disponibile, fallback a GraphQL:',
      err instanceof Error ? err.message : err
    )
  }

  const client = getClient()
  const { data } = await client.query({
    query: GET_REVIEWS,
    variables: { limit: 50 },
    fetchPolicy: 'no-cache',
  })
  return data?.reviews || []
})
