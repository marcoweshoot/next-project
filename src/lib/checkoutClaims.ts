import type Stripe from 'stripe'
import type { SupabaseClient } from '@supabase/supabase-js'

export interface StripeGuestData {
  email: string
  firstName: string
  lastName: string
  fiscalCode: string | null
  vatNumber: string | null
  phoneNumber: string | null
  addressLine1: string | null
  city: string | null
  postalCode: string | null
  country: string | null
}

export const parseCustomerName = (name?: string | null): { firstName: string; lastName: string } => {
  if (!name?.trim()) return { firstName: '', lastName: '' }
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return { firstName: parts[0], lastName: '' }
  return { firstName: parts[0], lastName: parts.slice(1).join(' ') }
}

export const extractStripeGuestData = (session: Stripe.Checkout.Session): StripeGuestData | null => {
  const email = session.customer_details?.email?.trim().toLowerCase()
  if (!email) return null

  const customFields = session.custom_fields || []
  const fiscalCodeField = customFields.find((f) => f.key === 'fiscal_code')
  const vatNumberField = customFields.find((f) => f.key === 'vat_number')
  const phoneNumberField = customFields.find((f) => f.key === 'phone_number')

  const billingAddress = session.customer_details?.address
  const { firstName, lastName } = parseCustomerName(session.customer_details?.name)

  return {
    email,
    firstName,
    lastName,
    fiscalCode: fiscalCodeField?.text?.value?.trim().toUpperCase() || null,
    vatNumber: vatNumberField?.text?.value?.trim() || null,
    phoneNumber: phoneNumberField?.text?.value?.trim() || null,
    addressLine1: billingAddress?.line1?.trim() || null,
    city: billingAddress?.city?.trim() || null,
    postalCode: billingAddress?.postal_code?.trim() || null,
    country: billingAddress?.country?.trim() || null,
  }
}

export const isGuestMetadataUserId = (userId?: string | null): boolean =>
  !userId || userId === 'guest' || userId === 'anonymous'

/** Returns a UUID for DB writes, or null for guest/anonymous checkout metadata. */
export const toBookingUserId = (userId?: string | null): string | null =>
  isGuestMetadataUserId(userId) ? null : userId!

export const lookupProfileByEmail = async (
  supabase: SupabaseClient,
  email: string
): Promise<{ id: string; email: string } | null> => {
  const normalized = email.trim().toLowerCase()
  const { data } = await supabase
    .from('profiles')
    .select('id, email')
    .ilike('email', normalized)
    .maybeSingle()

  return data ?? null
}

export const buildProfileUpdateFromGuestData = (guest: StripeGuestData): Record<string, string> => {
  const update: Record<string, string> = { email: guest.email }
  if (guest.firstName) update.first_name = guest.firstName
  if (guest.lastName) update.last_name = guest.lastName
  if (guest.fiscalCode && /^[A-Z0-9]{16}$/.test(guest.fiscalCode)) {
    update.fiscal_code = guest.fiscalCode
  }
  if (guest.vatNumber) update.vat_number = guest.vatNumber
  if (guest.phoneNumber) update.phone_number = guest.phoneNumber
  if (guest.addressLine1) update.address = guest.addressLine1
  if (guest.city) update.city = guest.city
  if (guest.postalCode) update.postal_code = guest.postalCode
  if (guest.country) update.country = guest.country
  return update
}

export const createCheckoutClaim = async (
  supabase: SupabaseClient,
  params: {
    stripeSessionId: string
    bookingId: string
    guest: StripeGuestData
  }
) => {
  const { stripeSessionId, bookingId, guest } = params
  return supabase.from('checkout_claims').insert({
    stripe_session_id: stripeSessionId,
    booking_id: bookingId,
    email: guest.email,
    first_name: guest.firstName,
    last_name: guest.lastName,
    fiscal_code: guest.fiscalCode,
    phone_number: guest.phoneNumber,
    address_line1: guest.addressLine1,
    city: guest.city,
    postal_code: guest.postalCode,
    country: guest.country,
  })
}

export const linkBookingToUser = async (
  supabase: SupabaseClient,
  params: { bookingId: string; userId: string; stripeSessionId?: string }
) => {
  const { bookingId, userId, stripeSessionId } = params
  return supabase
    .from('bookings')
    .update({
      user_id: userId,
      ...(stripeSessionId ? { stripe_checkout_session_id: stripeSessionId } : {}),
    })
    .eq('id', bookingId)
}

/**
 * Ricollega all'utente le prenotazioni guest rimaste senza user_id
 * (es. account cancellato e ricreato con la stessa email).
 * Chiamare solo con un'email verificata dell'utente autenticato.
 */
export const linkOrphanBookingsByEmail = async (
  supabase: SupabaseClient,
  params: { userId: string; email: string }
): Promise<number> => {
  const email = params.email.trim().toLowerCase()

  const { data: claims } = await supabase
    .from('checkout_claims')
    .select('booking_id')
    .eq('email', email)
    .not('booking_id', 'is', null)

  const bookingIds = (claims || []).map((c) => c.booking_id as string)
  if (bookingIds.length === 0) return 0

  const { data: linked } = await supabase
    .from('bookings')
    .update({ user_id: params.userId })
    .in('id', bookingIds)
    .is('user_id', null)
    .select('id')

  const linkedIds = (linked || []).map((b) => b.id as string)
  if (linkedIds.length === 0) return 0

  await supabase
    .from('checkout_claims')
    .update({ claimed_user_id: params.userId, claimed_at: new Date().toISOString() })
    .in('booking_id', linkedIds)

  return linkedIds.length
}

export const resolveTourCheckoutUser = async (
  supabase: SupabaseClient,
  session: Stripe.Checkout.Session,
  metadataUserId: string,
  paymentType: string
): Promise<{
  resolvedUserId: string | null
  guestData: StripeGuestData | null
}> => {
  const guestData = extractStripeGuestData(session)
  const isGuestMetadata = isGuestMetadataUserId(metadataUserId)

  if (paymentType === 'balance') {
    return { resolvedUserId: toBookingUserId(metadataUserId), guestData }
  }

  if (!isGuestMetadata) {
    return { resolvedUserId: metadataUserId, guestData }
  }

  if (guestData?.email) {
    const existing = await lookupProfileByEmail(supabase, guestData.email)
    if (existing) return { resolvedUserId: existing.id, guestData }
  }

  return { resolvedUserId: null, guestData }
}

export const afterGuestOrLinkedBooking = async (
  supabase: SupabaseClient,
  params: {
    stripeSessionId: string
    bookingId: string
    resolvedUserId: string | null
    guestData: StripeGuestData | null
  }
) => {
  const { stripeSessionId, bookingId, resolvedUserId, guestData } = params

  if (resolvedUserId && guestData) {
    await supabase
      .from('profiles')
      .update({ ...buildProfileUpdateFromGuestData(guestData), updated_at: new Date().toISOString() })
      .eq('id', resolvedUserId)
    return
  }

  if (!resolvedUserId && guestData) {
    await createCheckoutClaim(supabase, { stripeSessionId, bookingId, guest: guestData })
  }
}

export const getGuestDisplayName = (guest: StripeGuestData): string => {
  const name = `${guest.firstName} ${guest.lastName}`.trim()
  return name || guest.email.split('@')[0] || 'Cliente'
}

export const getBookingContactInfo = async (
  supabase: SupabaseClient,
  resolvedUserId: string | null,
  guestData: StripeGuestData | null
): Promise<{ userName: string; userEmail: string } | null> => {
  if (resolvedUserId) {
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('first_name, last_name, email')
      .eq('id', resolvedUserId)
      .single()

    if (userProfile?.email) {
      return {
        userName:
          `${userProfile.first_name || ''} ${userProfile.last_name || ''}`.trim() || 'Cliente',
        userEmail: userProfile.email,
      }
    }
  }

  if (guestData?.email) {
    return {
      userName: getGuestDisplayName(guestData),
      userEmail: guestData.email,
    }
  }

  return null
}

export const resolveCapiUserContext = async (
  supabase: SupabaseClient,
  session: Stripe.Checkout.Session
): Promise<{
  externalId?: string
  email?: string
  firstName?: string
  lastName?: string
  phone?: string
}> => {
  const metadataUserId = session.metadata?.userId
  const stripeEmail = session.customer_details?.email?.toLowerCase()
  const isGuestMetadata = isGuestMetadataUserId(metadataUserId)

  if (!isGuestMetadata && metadataUserId) {
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('first_name, last_name, email, mobile_phone')
      .eq('id', metadataUserId)
      .maybeSingle()

    return {
      externalId: metadataUserId,
      email: userProfile?.email || stripeEmail || undefined,
      firstName: userProfile?.first_name || undefined,
      lastName: userProfile?.last_name || undefined,
      phone: userProfile?.mobile_phone || undefined,
    }
  }

  if (stripeEmail) {
    const existing = await lookupProfileByEmail(supabase, stripeEmail)
    if (existing) {
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('first_name, last_name, email, mobile_phone')
        .eq('id', existing.id)
        .maybeSingle()

      return {
        externalId: existing.id,
        email: userProfile?.email || stripeEmail,
        firstName: userProfile?.first_name || undefined,
        lastName: userProfile?.last_name || undefined,
        phone: userProfile?.mobile_phone || undefined,
      }
    }

    const guestData = extractStripeGuestData(session)
    return {
      email: stripeEmail,
      firstName: guestData?.firstName || undefined,
      lastName: guestData?.lastName || undefined,
      phone: guestData?.phoneNumber || undefined,
    }
  }

  return {}
}
