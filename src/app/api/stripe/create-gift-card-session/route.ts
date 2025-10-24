import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { amount } = body

    // Validate required fields
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Amount is required and must be greater than 0' },
        { status: 400 }
      )
    }

    const siteUrl = getSiteUrl()
    const origin = request.headers.get('origin') || siteUrl

    console.log(`Creating gift card payment session for amount: €${amount}`)

    // Create Stripe Checkout Session for gift card
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `WeShoot Gift Card - €${amount}`,
              description: 'Carta regalo valida per tutti i viaggi fotografici WeShoot',
            },
            unit_amount: amount * 100, // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${origin}/thank-you?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/gift-card`,
      metadata: {
        type: 'gift_card',
        amount: amount.toString(),
        userId: 'anonymous', // Gift cards can be purchased anonymously
      },
      // Raccogliamo i dati di fatturazione per la legislazione italiana
      billing_address_collection: 'required',
      // Aggiungiamo campi personalizzati per i dati fiscali italiani
      custom_fields: [
        {
          key: 'fiscal_code',
          label: {
            type: 'custom',
            custom: 'Codice Fiscale (opzionale)',
          },
          type: 'text',
          optional: true,
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
      ],
    })

    console.log(`Gift card payment session created successfully: ${session.id}`)

    return NextResponse.json({ url: session.url })

  } catch (error) {
    console.error('Error creating gift card payment session:', error)
    return NextResponse.json(
      { error: 'Failed to create payment session' },
      { status: 500 }
    )
  }
}
