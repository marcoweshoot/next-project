import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Received request to create booking from Stripe session...')
    const body = await request.json()
    const { stripeSessionId } = body

    if (!stripeSessionId) {
      console.error('❌ Missing stripeSessionId in request body')
      return NextResponse.json({ error: 'Missing Stripe Session ID' }, { status: 400 })
    }

    // Recupera i dettagli della sessione da Stripe
    const session = await stripe.checkout.sessions.retrieve(stripeSessionId)

    if (!session) {
      console.error('❌ Stripe session not found for ID:', stripeSessionId)
      return NextResponse.json({ error: 'Stripe session not found' }, { status: 404 })
    }

    console.log('📊 Retrieved Stripe Session:', {
      id: session.id,
      status: session.status,
      payment_status: session.payment_status,
      metadata: session.metadata,
      customer_details: session.customer_details,
      amount_total: session.amount_total,
      currency: session.currency,
    })

    if (session.payment_status !== 'paid') {
      console.error('❌ Payment not successful for session:', stripeSessionId)
      return NextResponse.json({ error: 'Payment not successful' }, { status: 400 })
    }

    const {
      userId,
      tourId,
      sessionId: tourSessionId, // Rinominato per evitare conflitto con stripeSessionId
      paymentType,
      quantity,
      tourTitle,
      tourDestination,
      sessionDate,
      sessionEndDate,
      sessionPrice,
      sessionDeposit,
    } = session.metadata || {}

    if (!userId || !tourId || !tourSessionId || !paymentType) {
      console.error('❌ Missing essential metadata in Stripe session:', session.metadata)
      return NextResponse.json({ error: 'Missing essential payment metadata' }, { status: 400 })
    }

    // Inizializza Supabase con Service Role Key
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Calcola gli importi
    const parsedQuantity = parseInt(quantity || '1')
    const paidAmount = session.amount_total || 0 // in cents
    const totalSessionPrice = parseFloat(sessionPrice || '0') * 100 * parsedQuantity // in cents
    const sessionDepositAmount = parseFloat(sessionDeposit || '0') * 100 * parsedQuantity // in cents

    console.log('💰 Amount calculations:', {
      parsedQuantity,
      paidAmount,
      totalSessionPrice,
      sessionDepositAmount,
      paymentType
    })

    let depositAmount = 0
    let totalAmount = 0
    let bookingStatus = 'pending'

    if (paymentType === 'deposit') {
      depositAmount = paidAmount
      totalAmount = totalSessionPrice // Il totale è il prezzo pieno della sessione
      bookingStatus = 'deposit_paid'
    } else if (paymentType === 'balance') {
      // Questo caso dovrebbe essere per il pagamento completo, quindi paidAmount è il totale
      depositAmount = sessionDepositAmount // L'acconto originale
      totalAmount = paidAmount // Il pagamento completo
      bookingStatus = 'fully_paid'
    } else {
      // Fallback per pagamento completo se paymentType non è specificato o è 'full'
      depositAmount = paidAmount
      totalAmount = paidAmount
      bookingStatus = 'fully_paid'
    }

    console.log('📊 Final amounts:', {
      depositAmount,
      totalAmount,
      bookingStatus
    })

    // Crea o aggiorna il booking (stesso formato del webhook che funziona)
    const bookingData = {
      user_id: userId,
      tour_id: tourId,
      session_id: tourSessionId,
      quantity: parsedQuantity,
      status: bookingStatus,
      deposit_amount: depositAmount,
      total_amount: totalAmount,
      stripe_payment_intent_id: session.payment_intent as string,
      deposit_due_date: new Date().toISOString(), // Data di pagamento dell'acconto (oggi)
      balance_due_date: sessionDate ? 
        new Date(new Date(sessionDate).getTime() - 30 * 24 * 60 * 60 * 1000).toISOString() : // 30 giorni prima della partenza
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // Fallback se non abbiamo la data
      tour_title: tourTitle || '',
      tour_destination: tourDestination || '',
      session_date: sessionDate || '',         // ← CORRETTO: come nel webhook
      session_end_date: sessionEndDate || '',  // ← CORRETTO: come nel webhook
    }

    console.log('📊 Booking data to insert:', bookingData)

    try {
      const { error: bookingError } = await supabase
        .from('bookings')
        .upsert(bookingData, { onConflict: 'stripe_payment_intent_id' }) // Usa upsert per evitare duplicati

      if (bookingError) {
        console.error('❌ Error creating/updating booking:', bookingError)
        console.error('❌ Full booking error details:', JSON.stringify(bookingError, null, 2))
        return NextResponse.json({ error: 'Booking creation/update failed' }, { status: 500 })
      }
      console.log('✅ Booking created/updated successfully for user:', userId)
    } catch (dbError) {
      console.error('❌ Database operation failed:', dbError)
      console.error('❌ Database error details:', JSON.stringify(dbError, null, 2))
      return NextResponse.json({ error: 'Database operation failed' }, { status: 500 })
    }

    // Aggiorna il profilo con i dati di fatturazione
    if (session.customer_details) {
      const customerDetails = session.customer_details
      const billingAddress = customerDetails.address
      
      const profileUpdate: any = {
        email: customerDetails.email || null,
        address: billingAddress?.line1 || null,
        city: billingAddress?.city || null,
        postal_code: billingAddress?.postal_code || null,
        country: billingAddress?.country || null,
      }
      
      if (session.custom_fields) {
        session.custom_fields.forEach((field: any) => {
          if (field.key === 'fiscal_code' && field.text?.value) {
            profileUpdate.fiscal_code = field.text.value
          }
          if (field.key === 'vat_number' && field.text?.value) {
            profileUpdate.vat_number = field.text.value
          }
          if (field.key === 'pec_email' && field.text?.value) {
            profileUpdate.pec_email = field.text.value
          }
        })
      }
      
      Object.keys(profileUpdate).forEach(key => {
        if (profileUpdate[key] === null) {
          delete profileUpdate[key]
        }
      })
      
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          ...profileUpdate,
        }, { onConflict: 'id' })
      
      if (profileError) {
        console.error('❌ Error updating user profile with billing data:', profileError)
      } else {
        console.log('✅ User profile updated with billing data')
      }
    }

    return NextResponse.json({ success: true, message: 'Booking created and profile updated' })

  } catch (error) {
    console.error('❌ Error in create-booking-from-stripe-session API:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
