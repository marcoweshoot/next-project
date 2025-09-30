import { getClient } from '@/lib/graphqlClient'

export interface Tour {
  id: string
  title: string
  slug: string
  description?: string
  difficulty?: string
  image?: {
    url: string
    alternativeText?: string
  }
  places?: Array<{
    id: string
    name: string
    slug: string
  }>
  states?: Array<{
    id: string
    name: string
    slug: string
  }>
  sessions?: Session[]
}

export interface Session {
  id: string
  start: string
  end: string
  price: number
  maxPax: number
  status: string
  users?: any[]
}

// Query semplificata per la pagina di test
const SIMPLE_TOURS_QUERY = `
  query GetTours($limit: Int = 50) {
    tours(limit: $limit, sort: "title:asc") {
      id
      title
      slug
      description
      difficulty
      image {
        url
        alternativeText
      }
      sessions {
        id
        start
        end
        price
        maxPax
        status
      }
    }
  }
`

export async function getTours(): Promise<Tour[]> {
  try {
    const client = getClient()
    const data = await client.request(SIMPLE_TOURS_QUERY, {
      limit: 50
    }) as { tours?: Tour[] }

    return data?.tours || []
  } catch (error) {
    console.error('Error fetching tours:', error)
    return []
  }
}

// Query semplificata per ottenere un tour per slug
const SIMPLE_TOUR_BY_SLUG_QUERY = `
  query GetTourBySlug($slug: String!) {
    tours(where: { slug: $slug }) {
      id
      title
      slug
      description
      difficulty
      image {
        url
        alternativeText
      }
      places {
        id
        name
        slug
      }
      states {
        id
        name
        slug
      }
      sessions {
        id
        start
        end
        price
        maxPax
        status
      }
    }
  }
`

export async function getTourBySlug(slug: string): Promise<Tour | null> {
  try {
    const client = getClient()
    const data = await client.request(SIMPLE_TOUR_BY_SLUG_QUERY, { slug }) as { tours?: Tour[] }

    return data?.tours?.[0] || null
  } catch (error) {
    console.error('Error fetching tour by slug:', error)
    return null
  }
}

// Query semplificata per le sessioni di un tour
const SIMPLE_TOUR_SESSIONS_QUERY = `
  query GetTourSessions($tourId: ID!) {
    tour(id: $tourId) {
      sessions {
        id
        start
        end
        price
        maxPax
        status
      }
    }
  }
`

export async function getTourSessions(tourId: string): Promise<Session[]> {
  try {
    const client = getClient()
    const data = await client.request(SIMPLE_TOUR_SESSIONS_QUERY, { tourId }) as { tour?: { sessions?: Session[] } }

    return data?.tour?.sessions || []
  } catch (error) {
    console.error('Error fetching tour sessions:', error)
    return []
  }
}
