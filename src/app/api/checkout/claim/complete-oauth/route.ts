import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerClientSupabase } from '@/lib/supabase/server'
import {
  buildProfileUpdateFromGuestData,
  linkBookingToUser,
  lookupProfileByEmail,
} from '@/lib/checkoutClaims'

const getServiceSupabase = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sessionId } = body

    if (!sessionId?.startsWith('cs_')) {
      return NextResponse.json({ error: 'Invalid session ID' }, { status: 400 })
    }

    const authSupabase = await createServerClientSupabase()
    const { data: { user }, error: authError } = await authSupabase.auth.getUser()

    if (authError || !user?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const supabase = getServiceSupabase()

    const { data: claim } = await supabase
      .from('checkout_claims')
      .select('*')
      .eq('stripe_session_id', sessionId)
      .maybeSingle()

    if (!claim) {
      return NextResponse.json({ error: 'Claim not found' }, { status: 404 })
    }

    if (claim.email.toLowerCase() !== user.email.toLowerCase()) {
      return NextResponse.json(
        { error: 'Usa lo stesso account Google dell\'email usata per il pagamento Stripe' },
        { status: 400 }
      )
    }

    const existingProfile = await lookupProfileByEmail(supabase, user.email)
    if (!existingProfile) {
      const nameParts = (user.user_metadata?.full_name || user.user_metadata?.name || '').trim().split(/\s+/)
      await supabase.rpc('create_user_profile', {
        user_id: user.id,
        user_email: user.email,
        user_first_name: nameParts[0] || '',
        user_last_name: nameParts.slice(1).join(' ') || '',
        user_privacy_accepted: true,
        user_marketing_accepted: false,
      })
    }

    await supabase
      .from('profiles')
      .update({
        ...buildProfileUpdateFromGuestData({
          email: claim.email,
          firstName: claim.first_name || '',
          lastName: claim.last_name || '',
          fiscalCode: claim.fiscal_code,
          vatNumber: null,
          phoneNumber: claim.phone_number,
          addressLine1: claim.address_line1,
          city: claim.city,
          postalCode: claim.postal_code,
          country: claim.country,
        }),
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    if (claim.booking_id) {
      await linkBookingToUser(supabase, {
        bookingId: claim.booking_id,
        userId: user.id,
        stripeSessionId: sessionId,
      })
    }

    await supabase
      .from('checkout_claims')
      .update({
        claimed_at: new Date().toISOString(),
        claimed_user_id: user.id,
      })
      .eq('stripe_session_id', sessionId)

    return NextResponse.json({ status: 'claimed', userId: user.id })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
