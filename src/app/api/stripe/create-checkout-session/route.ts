import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

// Funzione per ottenere l'URL del sito in base all'ambiente
function getSiteUrl() {
  // In produzione/staging, usa la variabile d'ambiente
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL
  }
  
  // In Vercel, usa VERCEL_URL
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  
  // Fallback per sviluppo locale
  return 'http://localhost:3000'
}

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Creating checkout session...')
    const body = await request.json()
    console.log('📊 Request body:', JSON.stringify(body, null, 2))
    
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
      sessionDeposit
    } = body

    // Validate required fields (userId can be 'anonymous' for guest checkout)
    if (!amount || !tourId || !sessionId || (!userId && userId !== 'anonymous')) {
      console.error('❌ Missing required fields:', { amount, tourId, sessionId, userId })
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Note: Data comes from Strapi via the client
    // The webhook will validate the payment and create the booking

    // Create Stripe Checkout Session with billing address collection
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: currency.toLowerCase(),
            product_data: {
              name: `${tourTitle || `Tour ${tourId}`} - ${paymentType === 'deposit' ? 'Acconto' : 'Saldo'}`,
              description: `${sessionDate ? new Date(sessionDate).toLocaleDateString('it-IT') : `Sessione ${sessionId}`}${quantity > 1 ? ` (${quantity} persone)` : ''}`,
            },
            unit_amount: amount, // Already in cents
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
          key: 'pec_email',
          label: {
            type: 'custom',
            custom: 'Email PEC (opzionale)',
          },
          type: 'text',
          optional: true,
        },
      ],
      // Personalizziamo i messaggi per l'Italia
      locale: 'it',
      success_url: `${getSiteUrl()}/dashboard?payment=success`,
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
      },
    })

    console.log('✅ Checkout session created:', {
      id: checkoutSession.id,
      url: checkoutSession.url,
      metadata: checkoutSession.metadata
    })

    return NextResponse.json({
      url: checkoutSession.url,
    })

  } catch (error) {
    console.error('❌ Error creating checkout session:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
