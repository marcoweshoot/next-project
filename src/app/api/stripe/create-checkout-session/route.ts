import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import Stripe from 'stripe'
import { getClient } from '@/lib/graphqlClient'
import { gql } from 'graphql-request'

// Funzione per formattare la data della sessione in modo sicuro
function formatSessionDate(sessionDate: string | undefined, sessionId: string): string {
  if (!sessionDate) {
    return `Sessione ${sessionId}`;
  }

  try {
    const date = new Date(sessionDate);
    if (isNaN(date.getTime())) {
      return `Sessione ${sessionId}`;
    }
    return date.toLocaleDateString('it-IT');
  } catch {
    return `Sessione ${sessionId}`;
  }
}

// Funzione per ottenere l'URL del sito in base all'ambiente
function getSiteUrl() {
  // In produzione/staging, usa la variabile d'ambiente
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL
  }
  
  // Per preview, usa URL fisso per evitare problemi di sessione
  if (process.env.VERCEL_ENV === 'preview') {
    return 'https://next-project-rho-teal.vercel.app'
  }
  
  // In Vercel production, usa VERCEL_URL
  if (process.env.VERCEL_URL && process.env.VERCEL_ENV === 'production') {
    return `https://${process.env.VERCEL_URL}`
  }
  
  // Fallback per sviluppo locale
  return 'http://localhost:3000'
}

// Query GraphQL per recuperare il payment_recipient del tour
const GET_TOUR_PAYMENT_RECIPIENT = gql`
  query GetTourPaymentRecipient($id: ID!) {
    tour(id: $id) {
      id
      PaymentRecipient
    }
  }
`

// Funzione per recuperare il payment_recipient del tour
async function getTourPaymentRecipient(tourId: string): Promise<'weshoot' | 'agency'> {
  try {
    const client = getClient()
    const data = await client.request<{ tour: { PaymentRecipient?: string } }>(
      GET_TOUR_PAYMENT_RECIPIENT,
      { id: tourId }
    )
    
    // Default to 'agency' if not specified
    return (data.tour?.PaymentRecipient as 'weshoot' | 'agency') || 'agency'
  } catch (error) {
    console.error('Error fetching tour payment recipient:', error)
    // Default to 'agency' in case of error
    return 'agency'
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const { 
      amount, 
      currency = 'eur', 
      tourId, 
      sessionId, 
      userId, 
      paymentType = 'deposit', 
      quantity = 1,
      tourTitle,
      tourDestination,
      sessionDate,
      sessionEndDate,
      sessionPrice,
      sessionDeposit,
      giftCardCode,
      fbc,
      fbp,
    } = body

    // Debug logging
    console.log('🔍 [CHECKOUT] Received parameters:', {
      amount,
      tourId,
      sessionId,
      userId,
      giftCardCode,
      hasUserId: !!userId,
      userIdType: typeof userId,
      userIdLength: userId?.length
    })

    // Validate required fields (userId is required - no more anonymous users)
    // Allow amount to be 0 if gift card covers everything
    if (amount === undefined || amount === null || !tourId || !sessionId || !userId) {
      console.error('❌ [CHECKOUT] Missing required fields:', {
        amount: amount,
        tourId: !!tourId,
        sessionId: !!sessionId,
        userId: !!userId,
        userIdValue: userId
      })
      return NextResponse.json(
        { error: 'Missing required fields - user must be registered' },
        { status: 400 }
      )
    }

    // Verifica disponibilità posti in Supabase prima di procedere
    // I pagamenti di saldo (balance) saltano il check: la prenotazione esiste già e il posto è già conteggiato
    if (paymentType !== 'balance' && sessionId && quantity) {
      const { createClient: createSupabaseClient } = await import('@supabase/supabase-js')
      const supabaseCheck = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { autoRefreshToken: false, persistSession: false } }
      )

      // Recupera maxPax dalla sessione (via GraphQL) e i posti già prenotati (via Supabase)
      const [sessionData, bookingsData] = await Promise.allSettled([
        (async () => {
          const { gql } = await import('graphql-request')
          const GET_SESSION_MAX_PAX = gql`
            query GetSessionMaxPax($id: ID!) {
              session(id: $id) {
                id
                maxPax
                status
              }
            }
          `
          const client = getClient()
          return client.request<{ session: { id: string; maxPax?: number; status?: string } }>(
            GET_SESSION_MAX_PAX,
            { id: sessionId }
          )
        })(),
        supabaseCheck
          .from('bookings')
          .select('quantity')
          .eq('session_id', sessionId)
          .not('status', 'in', '("cancelled","refunded")')
      ])

      const cmsSession = sessionData.status === 'fulfilled' ? sessionData.value?.session : null
      const bookings = bookingsData.status === 'fulfilled' ? bookingsData.value?.data : null

      // Blocca se il CMS segna la sessione come sold-out/waitinglist/closed
      const soldOutStatuses = ['soldout', 'sold_out', 'closed', 'waitinglist', 'waiting_list']
      if (cmsSession?.status && soldOutStatuses.includes((cmsSession.status).toLowerCase())) {
        console.warn(`⛔ [CHECKOUT] Session ${sessionId} is marked as sold-out in CMS (status: ${cmsSession.status})`)
        return NextResponse.json(
          { error: 'Questa sessione non è più disponibile per la prenotazione.' },
          { status: 409 }
        )
      }

      // Blocca se i posti in Supabase sono esauriti
      if (cmsSession?.maxPax != null && bookings) {
        const totalBooked = bookings.reduce((sum: number, b: any) => sum + (b.quantity ?? 1), 0)
        const remainingSpots = cmsSession.maxPax - totalBooked
        if (remainingSpots < quantity) {
          console.warn(`⛔ [CHECKOUT] Not enough spots for session ${sessionId}: requested ${quantity}, available ${remainingSpots}`)
          return NextResponse.json(
            { error: `Posti insufficienti: richiesti ${quantity}, disponibili ${Math.max(0, remainingSpots)}.` },
            { status: 409 }
          )
        }
      }
    }

    // Handle gift card if provided
    // Calculate the actual discount that was applied
    let giftCardDiscount = 0
    let originalAmount = amount
    
    if (giftCardCode) {
      try {
        // Validate gift card code (read-only operation)
        const { supabase } = await import('@/integrations/supabase/client')
        const { validateGiftCardCode } = await import('@/lib/giftCards')
        
        // Use the imported supabase client
        const validation = await validateGiftCardCode(giftCardCode, supabase as any)
        
        if (!validation.valid || !validation.giftCard) {
          return NextResponse.json(
            { error: validation.error || 'Gift card non valida' },
            { status: 400 }
          )
        }
        
        // Calculate the original amount before gift card (need to get this from session price/deposit)
        // For deposit: original amount is sessionDeposit * quantity
        // For balance: original amount is (sessionPrice - sessionDeposit) * quantity
        // For full: original amount is sessionPrice * quantity
        const sessionPriceValue = sessionPrice ? parseFloat(sessionPrice) : 0
        const sessionDepositValue = sessionDeposit ? parseFloat(sessionDeposit) : 0
        
        if (paymentType === 'deposit' && sessionDepositValue > 0) {
          originalAmount = sessionDepositValue * 100 * quantity // Convert to cents
        } else if (paymentType === 'balance') {
          originalAmount = (sessionPriceValue - sessionDepositValue) * 100 * quantity // Convert to cents
        } else {
          originalAmount = sessionPriceValue * 100 * quantity // Convert to cents
        }
        
        // Calculate the discount that was applied
        giftCardDiscount = originalAmount - amount
        
        console.log(`✅ Gift card validated: ${giftCardCode}, original: ${originalAmount}, final: ${amount}, discount: ${giftCardDiscount}`)
      } catch (error) {
        console.error('Error validating gift card:', error)
        return NextResponse.json(
          { error: 'Errore nella validazione della gift card' },
          { status: 400 }
        )
      }
    }

    // If amount is 0, we can't create a Stripe session (should use zero-payment API instead)
    if (amount === 0) {
      return NextResponse.json(
        { 
          error: 'Amount is zero - use zero-payment API instead',
          fullyCovered: true
        },
        { status: 400 }
      )
    }

    // Use the amount as-is (already discounted from frontend)
    const finalAmount = amount

    // Note: Data comes from Strapi via the client
    // The webhook will validate the payment and create the booking
    
    // Fetch tour payment recipient from CMS
    const paymentRecipient = await getTourPaymentRecipient(tourId)
    console.log(`💳 [CHECKOUT] Payment recipient for tour ${tourId}: ${paymentRecipient}`)

    // Create Stripe Checkout Session with billing address collection
    // finalAmount is already the total for all people, so we need to divide by quantity for unit_amount
    const unitAmount = Math.round(finalAmount / quantity)
    
    // Both platform and connected agency accounts have card, Klarna, SEPA, and Link enabled
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ['card', 'klarna', 'sepa_debit', 'link'],
      line_items: [
        {
          price_data: {
            currency: currency.toLowerCase(),
            product_data: {
              name: `${tourTitle || `Tour ${tourId}`}`,
              description: `${formatSessionDate(sessionDate, sessionId)}${quantity > 1 ? ` (${quantity} persone)` : ''}`,
            },
            unit_amount: unitAmount, // Amount per person in cents
          },
          quantity: quantity,
        },
      ],
      mode: 'payment',
      // Raccogliamo i dati di fatturazione per la legislazione italiana
      billing_address_collection: 'required',
      // Aggiungiamo campi personalizzati per i dati fiscali italiani
      custom_fields: [
        {
          key: 'fiscal_code',
          label: {
            type: 'custom',
            custom: 'Codice Fiscale',
          },
          type: 'text',
          optional: false,
        },
        {
          key: 'vat_number',
          label: {
            type: 'custom',
            custom: 'Partita IVA (opzionale)',
          },
          type: 'text',
          optional: true,
        },
        {
          key: 'phone_number',
          label: {
            type: 'custom',
            custom: 'Numero di cellulare',
          },
          type: 'text',
          optional: false,
        },
      ],
      // Personalizziamo i messaggi per l'Italia
      locale: 'it',
      success_url: `${getSiteUrl()}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${getSiteUrl()}/dashboard?payment=cancelled`,
      metadata: {
        userId,
        tourId,
        sessionId,
        paymentType,
        quantity: quantity.toString(),
        tourTitle: tourTitle || '',
        tourDestination: tourDestination || '',
        sessionDate: sessionDate || '',
        sessionEndDate: sessionEndDate || '',
        sessionPrice: sessionPrice?.toString() || '',
        sessionDeposit: sessionDeposit?.toString() || '',
        giftCardCode: giftCardCode || '',
        giftCardDiscount: giftCardDiscount.toString(),
        originalAmount: amount.toString(),
        paymentRecipient,
        fbc: fbc || '',
        fbp: fbp || '',
      },
    }
    
    // Add Stripe Connect parameters if payment goes to agency
    if (paymentRecipient === 'agency') {
      const agencyAccountId = process.env.STRIPE_CONNECT_AGENCY_ACCOUNT_ID
      
      if (!agencyAccountId) {
        console.error('❌ [CHECKOUT] STRIPE_CONNECT_AGENCY_ACCOUNT_ID not configured')
        return NextResponse.json(
          { error: 'Payment configuration error' },
          { status: 500 }
        )
      }
      
      // Calculate platform fee if configured (optional)
      const platformFeePercent = parseFloat(process.env.STRIPE_PLATFORM_FEE_PERCENT || '0')
      const platformFeeAmount = platformFeePercent > 0 
        ? Math.round(finalAmount * (platformFeePercent / 100))
        : 0
      
      console.log(`🏢 [CHECKOUT] Routing to agency account: ${agencyAccountId}`)
      if (platformFeeAmount > 0) {
        console.log(`💰 [CHECKOUT] Platform fee: ${platformFeeAmount / 100}€ (${platformFeePercent}%)`)
      }
      
      // Add payment_intent_data for Stripe Connect
      sessionParams.payment_intent_data = {
        on_behalf_of: agencyAccountId,
        transfer_data: {
          destination: agencyAccountId,
        },
        ...(platformFeeAmount > 0 && {
          application_fee_amount: platformFeeAmount,
        }),
      }
    } else {
      console.log(`📸 [CHECKOUT] Payment stays on WeShoot account`)
    }

    const checkoutSession = await stripe.checkout.sessions.create(sessionParams)

    return NextResponse.json({
      url: checkoutSession.url,
    })

  } catch (error) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
