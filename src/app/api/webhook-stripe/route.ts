import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

// Stripe consiglia Node.js runtime per i webhook
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  const timestamp = new Date().toISOString()
  console.log('🔔 Webhook received at:', timestamp)
  
  try {
    // Leggi il body come stringa raw
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      return NextResponse.json({ 
        error: 'No signature',
        timestamp,
        bodyLength: body.length 
      }, { status: 400 })
    }

    // Verifica la firma
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )

    // Processa l'evento
    console.log('📊 Event type:', event.type)
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session
      console.log('🎉 Processing checkout.session.completed event')
      console.log('📊 Session ID:', session.id)
      console.log('📊 Metadata:', session.metadata)
      console.log('📊 Payment Type:', session.metadata?.paymentType)
      console.log('📊 User ID:', session.metadata?.userId)
      console.log('📊 Tour ID:', session.metadata?.tourId)

      // Usa Service Role Key per bypassare RLS
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

      const {
        userId,
        tourId,
        sessionId,
        paymentType,
        quantity
      } = session.metadata || {}

      if (!userId || !tourId || !sessionId || !paymentType) {
        return NextResponse.json({ 
          error: 'Missing metadata',
          timestamp,
          sessionId: session.id,
          availableMetadata: session.metadata 
        }, { status: 400 })
      }

      // Ora tutti gli utenti dovrebbero essere registrati prima del pagamento
      const finalUserId = userId

      if (userId === 'anonymous') {
        return NextResponse.json({ 
          error: 'Anonymous users not supported - user must register first',
          timestamp,
          sessionId: session.id 
        }, { status: 400 })
      }

      // Gestisci acconto vs saldo
      if (paymentType === 'deposit') {
        // Crea nuovo booking per acconto
        try {
          // Calcola il totale atteso (prezzo completo per tutte le persone)
          const sessionPrice = parseFloat(session.metadata?.sessionPrice || '0')
          const sessionDeposit = parseFloat(session.metadata?.sessionDeposit || '0')
          const quantity = parseInt(session.metadata?.quantity || '1')
          const expectedTotal = sessionPrice * 100 * quantity
          
          // Determina lo status: se l'importo pagato >= totale atteso, è tutto pagato
          const bookingStatus = session.amount_total >= expectedTotal ? 'fully_paid' : 'deposit_paid'
          
          console.log('💰 Payment Analysis:', {
            amountPaid: session.amount_total,
            sessionPrice: sessionPrice,
            sessionDeposit: sessionDeposit,
            quantity: quantity,
            expectedTotal,
            bookingStatus,
            isFullPayment: session.amount_total >= expectedTotal
          })
          
          const { error: insertError } = await supabase
            .from('bookings')
            .insert({
              user_id: finalUserId,
              tour_id: tourId,
              session_id: sessionId,
              status: bookingStatus,
              deposit_amount: session.amount_total,
              total_amount: expectedTotal,
              stripe_payment_intent_id: session.payment_intent as string,
              deposit_due_date: new Date().toISOString(),
              balance_due_date: session.metadata?.sessionDate ? 
                new Date(new Date(session.metadata.sessionDate).getTime() - 30 * 24 * 60 * 60 * 1000).toISOString() : 
                new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 giorni prima della partenza
              quantity: quantity,
              tour_title: session.metadata?.tourTitle || '',
              tour_destination: session.metadata?.tourDestination || '',
              session_date: session.metadata?.sessionDate || '',
              session_end_date: session.metadata?.sessionEndDate || '',
            })

          if (insertError) {
            return NextResponse.json({ error: 'Booking creation failed' }, { status: 500 })
          }
        } catch (error) {
          return NextResponse.json({ error: 'Booking creation failed' }, { status: 500 })
        }
      } else if (paymentType === 'balance') {
        // Aggiorna booking esistente per saldo
        try {
          // Cerca la prenotazione esistente
          const { data: existingBookings, error: searchError } = await supabase
            .from('bookings')
            .select('*')
            .eq('user_id', finalUserId)
            .eq('tour_id', tourId)
            .eq('session_id', sessionId)
            .eq('status', 'deposit_paid')
            .order('created_at', { ascending: false })
            .limit(1)

          if (searchError) {
            return NextResponse.json({ error: 'Failed to find existing booking' }, { status: 500 })
          }

          if (!existingBookings || existingBookings.length === 0) {
            return NextResponse.json({ error: 'No existing booking found for balance payment' }, { status: 400 })
          }

          const existingBooking = existingBookings[0]

          // Aggiorna lo status a fully_paid
          const { error: updateError } = await supabase
            .from('bookings')
            .update({
              status: 'fully_paid',
              stripe_payment_intent_id: session.payment_intent as string,
              updated_at: new Date().toISOString()
            })
            .eq('id', existingBooking.id)

          if (updateError) {
            return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 })
          }
        } catch (error) {
          return NextResponse.json({ error: 'Balance payment failed' }, { status: 500 })
        }
      } else {
        return NextResponse.json({ error: 'Unknown payment type' }, { status: 400 })
      }

      // Aggiorna il profilo con i dati di fatturazione da Stripe
      if (session.customer_details) {
        try {
          const customerDetails = session.customer_details
          const billingAddress = customerDetails.address
          
          const profileUpdate: any = {}
          
          // Aggiungi email se presente
          if (customerDetails.email) {
            profileUpdate.email = customerDetails.email
          }
          
          // Aggiungi indirizzo se presente
          if (billingAddress?.line1) {
            profileUpdate.address = billingAddress.line1
          }
          if (billingAddress?.city) {
            profileUpdate.city = billingAddress.city
          }
          if (billingAddress?.postal_code) {
            profileUpdate.postal_code = billingAddress.postal_code
          }
          if (billingAddress?.country) {
            profileUpdate.country = billingAddress.country
          }
          
          // Aggiungi dati fiscali da custom fields di Stripe
          if (session.custom_fields) {
            session.custom_fields.forEach((field: any) => {
              if (field.key === 'fiscal_code' && field.text?.value) {
                const fiscalCode = field.text.value.trim().toUpperCase()
                
                // Valida formato codice fiscale italiano (16 caratteri, solo lettere e numeri)
                if (fiscalCode && fiscalCode.length === 16 && /^[A-Z0-9]{16}$/.test(fiscalCode)) {
                  profileUpdate.fiscal_code = fiscalCode
                }
              }
              if (field.key === 'vat_number' && field.text?.value && field.text.value.trim()) {
                profileUpdate.vat_number = field.text.value.trim()
              }
              if (field.key === 'pec_email' && field.text?.value && field.text.value.trim()) {
                profileUpdate.pec_email = field.text.value.trim()
              }
              if (field.key === 'phone_number' && field.text?.value && field.text.value.trim()) {
                profileUpdate.phone_number = field.text.value.trim()
              }
            })
          }
          
          // Aggiorna il profilo solo se ci sono dati da aggiornare
          if (Object.keys(profileUpdate).length > 0) {
            const { error: profileError } = await supabase
              .from('profiles')
              .upsert({
                id: finalUserId,
                ...profileUpdate,
              }, { onConflict: 'id' })
            
            if (profileError) {
              // Non bloccare il flusso se l'aggiornamento del profilo fallisce
            }
          }
        } catch (profileUpdateError) {
          // Non bloccare il flusso se l'aggiornamento del profilo fallisce
        }
      }
    } else if (event.type === 'payment_intent.succeeded') {
      // Payment Intent events are handled automatically by Stripe when using Checkout Sessions
      // We only need to handle checkout.session.completed events for our booking system
    }

    return NextResponse.json({ 
      received: true, 
      timestamp,
      eventType: event.type,
      processed: true 
    })
  } catch (error) {
    return NextResponse.json({ 
      error: 'Webhook processing failed',
      timestamp,
      errorMessage: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
