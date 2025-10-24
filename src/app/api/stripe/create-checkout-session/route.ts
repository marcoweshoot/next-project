import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import Stripe from 'stripe'

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
      giftCardCode
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

    // Handle gift card if provided
    let finalAmount = amount
    let giftCardDiscount = 0
    
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
        
        // Calculate discount (can't exceed amount to pay or remaining balance)
        giftCardDiscount = Math.min(validation.giftCard.remaining_balance, amount)
        finalAmount = Math.max(0, amount - giftCardDiscount)
        
        console.log(`Gift card applied: ${giftCardCode}, discount: ${giftCardDiscount}, final amount: ${finalAmount}`)
      } catch (error) {
        console.error('Error validating gift card:', error)
        return NextResponse.json(
          { error: 'Errore nella validazione della gift card' },
          { status: 400 }
        )
      }
    }

    // If gift card covers the full amount, we can't create a Stripe session
    if (finalAmount === 0) {
      return NextResponse.json(
        { 
          error: 'Gift card covers full amount',
          fullyCovered: true,
          giftCardCode
        },
        { status: 400 }
      )
    }

    // Note: Data comes from Strapi via the client
    // The webhook will validate the payment and create the booking

    // Create Stripe Checkout Session with billing address collection
    // finalAmount is already the total for all people, so we need to divide by quantity for unit_amount
    const unitAmount = Math.round(finalAmount / quantity)
    
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ['card', 'klarna', 'sepa_debit'],
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
      },
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
