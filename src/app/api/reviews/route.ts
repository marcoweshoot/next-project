import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// GET /api/reviews?tourSlug=workshop-fotografia-roma
// Restituisce le recensioni approvate per un tour, normalizzate nel formato atteso da TourReviews.
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const tourSlug = searchParams.get('tourSlug')

  if (!tourSlug) {
    return NextResponse.json({ reviews: [] })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

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
    .eq('tour_slug', tourSlug)
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
