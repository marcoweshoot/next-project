/**
 * Utility condivise per le recensioni.
 *
 * Le recensioni arrivano da due fonti: Strapi (id numerico) e Supabase (id `supabase-<uuid>`).
 * Lo snapshot statico contiene già il merge delle due, ma la pagina tour rifà il fetch delle
 * Supabase per avere dati freschi: senza dedup la stessa recensione comparirebbe due volte.
 */

type ReviewLike = {
  id?: string | number
  rating?: number
  created_at?: string | number | Date
  createdAt?: string | number | Date
  publishedAt?: string | number | Date
}

const timestampOf = (review: ReviewLike): number => {
  const raw = review.created_at ?? review.createdAt ?? review.publishedAt
  if (!raw) return 0
  const time = new Date(raw as string | number | Date).getTime()
  return Number.isNaN(time) ? 0 : time
}

/**
 * Unisce le recensioni dello snapshot con quelle fresche, deduplicando per id.
 * A parità di id vince la versione fresca (nomi utente e testo aggiornati).
 * Il risultato è ordinato dalla più recente alla più vecchia.
 */
export const mergeReviews = <T extends ReviewLike>(snapshot: T[], fresh: T[]): T[] => {
  const byId = new Map<string, T>()

  snapshot.concat(fresh).forEach((review, index) => {
    const key = review?.id != null ? String(review.id) : `no-id-${index}`
    byId.set(key, review)
  })

  return [...byId.values()].sort((a, b) => timestampOf(b) - timestampOf(a))
}

/** Numero di recensioni e voto medio calcolati su una lista già deduplicata. */
export const summarizeReviews = (reviews: ReviewLike[]) => {
  const ratings = reviews
    .map((review) => review?.rating)
    .filter((rating): rating is number => Number.isFinite(rating))

  return {
    reviewsCount: reviews.length,
    averageRating: ratings.length
      ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
      : 0,
  }
}
