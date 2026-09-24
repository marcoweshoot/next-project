import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { stripe } from '@/lib/stripe'
import { checkoutClaimRegistration, rateLimits } from '@/lib/rateLimit'
import {
  buildProfileUpdateFromGuestData,
  extractStripeGuestData,
  linkBookingToUser,
  lookupProfileByEmail,
} from '@/lib/checkoutClaims'
import { sendServerEvent } from '@/lib/facebook-capi'

const getServiceSupabase = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const rateLimitResponse = await rateLimits.api(request)
  if (rateLimitResponse) return rateLimitResponse

  try {
    const { sessionId } = await params
    if (!sessionId?.startsWith('cs_')) {
      return NextResponse.json({ error: 'Invalid session ID' }, { status: 400 })
    }

    const stripeSession = await stripe.checkout.sessions.retrieve(sessionId)
    if (stripeSession.payment_status !== 'paid') {
      return NextResponse.json({ error: 'Payment not completed' }, { status: 400 })
    }

    const supabase = getServiceSupabase()

    const { data: claim } = await supabase
      .from('checkout_claims')
      .select('*')
      .eq('stripe_session_id', sessionId)
      .maybeSingle()

    const { data: booking } = await supabase
      .from('bookings')
      .select('id, user_id, tour_title')
      .eq('stripe_checkout_session_id', sessionId)
      .maybeSingle()

    if (claim?.claimed_at) {
      return NextResponse.json({
        status: 'claimed',
        email: claim.email,
      })
    }

    if (booking?.user_id) {
      return NextResponse.json({
        status: 'auto_linked',
        email: claim?.email || stripeSession.customer_details?.email,
        bookingId: booking.id,
      })
    }

    if (claim) {
      return NextResponse.json({
        status: 'pending',
        guest: {
          email: claim.email,
          firstName: claim.first_name,
          lastName: claim.last_name,
          fiscalCode: claim.fiscal_code,
          phoneNumber: claim.phone_number,
          addressLine1: claim.address_line1,
          city: claim.city,
          postalCode: claim.postal_code,
          country: claim.country,
        },
        bookingId: claim.booking_id,
      })
    }

    const guestData = extractStripeGuestData(stripeSession)
    if (guestData) {
      return NextResponse.json({
        status: 'pending',
        guest: {
          email: guestData.email,
          firstName: guestData.firstName,
          lastName: guestData.lastName,
          fiscalCode: guestData.fiscalCode,
          phoneNumber: guestData.phoneNumber,
          addressLine1: guestData.addressLine1,
          city: guestData.city,
          postalCode: guestData.postalCode,
          country: guestData.country,
        },
        bookingId: booking?.id ?? null,
      })
    }

    return NextResponse.json({ error: 'Claim not found' }, { status: 404 })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const rateLimitResponse = await checkoutClaimRegistration.check(request)
  if (rateLimitResponse) return rateLimitResponse

  const returnWithRateLimitFailure = (response: NextResponse) => {
    if (response.status >= 400) {
      checkoutClaimRegistration.recordFailure(request)
    }
    return response
  }

  try {
    const { sessionId } = await params
    const body = await request.json()
    const { password, privacyAccepted, marketingAccepted = false, fbEventId, fbc, fbp } = body
    const cleanName = (value: unknown) =>
      typeof value === 'string' ? value.trim().slice(0, 100) : ''
    const overrideFirstName = cleanName(body.firstName)
    const overrideLastName = cleanName(body.lastName)

    if (!sessionId?.startsWith('cs_')) {
      return returnWithRateLimitFailure(
        NextResponse.json({ error: 'Invalid session ID' }, { status: 400 })
      )
    }

    if (!password || password.length < 6) {
      return returnWithRateLimitFailure(
        NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
      )
    }

    if (!privacyAccepted) {
      return returnWithRateLimitFailure(
        NextResponse.json({ error: 'Privacy policy must be accepted' }, { status: 400 })
      )
    }

    const stripeSession = await stripe.checkout.sessions.retrieve(sessionId)
    if (stripeSession.payment_status !== 'paid') {
      return returnWithRateLimitFailure(
        NextResponse.json({ error: 'Payment not completed' }, { status: 400 })
      )
    }

    const supabase = getServiceSupabase()

    const { data: claim } = await supabase
      .from('checkout_claims')
      .select('*')
      .eq('stripe_session_id', sessionId)
      .maybeSingle()

    const baseGuestData = claim
      ? {
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
        }
      : extractStripeGuestData(stripeSession)

    // Il partecipante può differire da chi ha pagato (es. regalo)
    const guestData = baseGuestData && overrideFirstName
      ? { ...baseGuestData, firstName: overrideFirstName, lastName: overrideLastName }
      : baseGuestData

    if (!guestData?.email) {
      return returnWithRateLimitFailure(
        NextResponse.json({ error: 'Email not found in payment data' }, { status: 400 })
      )
    }

    const existingProfile = await lookupProfileByEmail(supabase, guestData.email)
    let userId = existingProfile?.id ?? null

    if (claim?.claimed_at && userId) {
      return NextResponse.json({ status: 'claimed', email: guestData.email, userId })
    }

    if (!userId) {
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: guestData.email,
        password,
        email_confirm: true,
        user_metadata: {
          first_name: guestData.firstName,
          last_name: guestData.lastName,
          full_name: `${guestData.firstName} ${guestData.lastName}`.trim(),
        },
      })

      if (authError || !authData.user) {
        return returnWithRateLimitFailure(
          NextResponse.json(
            { error: authError?.message || 'Account creation failed' },
            { status: 400 }
          )
        )
      }

      userId = authData.user.id

      const { error: rpcError } = await supabase.rpc('create_user_profile', {
        user_id: userId,
        user_email: guestData.email,
        user_first_name: guestData.firstName,
        user_last_name: guestData.lastName,
        user_privacy_accepted: privacyAccepted,
        user_marketing_accepted: marketingAccepted,
      })

      if (rpcError) {
        console.error('Profile RPC error:', rpcError)
      }

      await supabase
        .from('profiles')
        .update({ ...buildProfileUpdateFromGuestData(guestData), updated_at: new Date().toISOString() })
        .eq('id', userId)

      const eventId = fbEventId || `registration_${userId}_${Date.now()}`
      await sendServerEvent({
        event_name: 'CompleteRegistration',
        event_id: eventId,
        event_source_url: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/complete-account`,
        user_data: {
          external_id: userId,
          em: guestData.email,
          fn: guestData.firstName || undefined,
          ln: guestData.lastName || undefined,
          fbc,
          fbp,
        },
        custom_data: { currency: 'EUR' },
      })
    }

    const bookingId = claim?.booking_id
    if (bookingId && userId) {
      await linkBookingToUser(supabase, {
        bookingId,
        userId,
        stripeSessionId: sessionId,
      })
    } else {
      await supabase
        .from('bookings')
        .update({ user_id: userId })
        .eq('stripe_checkout_session_id', sessionId)
        .is('user_id', null)
    }

    if (claim && userId) {
      await supabase
        .from('checkout_claims')
        .update({
          claimed_at: new Date().toISOString(),
          claimed_user_id: userId,
        })
        .eq('stripe_session_id', sessionId)
    }

    if (existingProfile && userId) {
      await supabase
        .from('profiles')
        .update({ ...buildProfileUpdateFromGuestData(guestData), updated_at: new Date().toISOString() })
        .eq('id', userId)

      return NextResponse.json({
        status: 'linked_existing',
        email: guestData.email,
        userId,
        needsLogin: true,
      })
    }

    return NextResponse.json({
      status: 'created',
      email: guestData.email,
      userId,
    })
  } catch (error) {
    console.error('Claim POST error:', error)
    return returnWithRateLimitFailure(
      NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    )
  }
}
