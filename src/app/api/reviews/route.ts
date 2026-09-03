import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// I valori finiscono in un filtro `or` PostgREST, dove virgole e virgolette hanno significato
const isSafeFilterValue = (value: string | null): value is string =>
  !!value && /^[a-zA-Z0-9._-]+$/.test(value)

// GET /api/reviews?tourSlug=workshop-fotografia-roma&tourId=32
// Restituisce le recensioni approvate per un tour, normalizzate nel formato atteso da TourReviews.
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const tourSlug = searchParams.get('tourSlug')
  const tourId = searchParams.get('tourId')

  if (!tourSlug && !tourId) {
    return NextResponse.json({ reviews: [] })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  // tour_id è la chiave canonica: alcune recensioni storiche hanno tour_slug valorizzato con l'id
  const filters = [
    isSafeFilterValue(tourSlug) ? `tour_slug.eq.${tourSlug}` : null,
    isSafeFilterValue(tourId) ? `tour_id.eq.${tourId}` : null,
  ].filter(Boolean)

  if (filters.length === 0) {
    return NextResponse.json({ reviews: [] })
  }

  const { data, error } = await supabase
    .from('reviews')
    .select(`
      id,
      rating,
      comment,
      created_at,
      profiles (
        first_name,
        last_name,
        profile_picture_url
      )
    `)
    .or(filters.join(','))
    .eq('status', 'approved')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[/api/reviews] Supabase error:', error)
    return NextResponse.json({ reviews: [] })
  }

  // Normalizza nel formato atteso da TourReviews (stesso schema di normalizeSupabaseReview in snapshot.mjs)
  const reviews = (data ?? []).map((r: any) => {
    const profile = r.profiles
    const firstName = profile?.first_name || 'Utente'
    const lastName = profile?.last_name || ''
    const profilePictureUrl = profile?.profile_picture_url || null

    return {
      id: `supabase-${r.id}`,
      title: '',
      description: r.comment || '',
      rating: Number.isFinite(r.rating) ? r.rating : 5,
      created_at: r.created_at,
      user: {
        firstName,
        lastName,
        profilePicture: profilePictureUrl
          ? { url: profilePictureUrl, alternativeText: `${firstName} ${lastName}`.trim() }
          : null,
      },
    }
  })

  return NextResponse.json({ reviews })
}
