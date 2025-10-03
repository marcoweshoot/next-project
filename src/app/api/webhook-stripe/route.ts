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
      console.error('❌ No stripe-signature header found')
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

    console.log('✅ Webhook signature verified successfully!')

    // Processa l'evento
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session
      console.log('🎉 Processing checkout.session.completed event')
      console.log('📊 Session ID:', session.id)
      console.log('📊 Session Status:', session.status)
      console.log('📊 Payment Status:', session.payment_status)
      console.log('📊 Metadata:', session.metadata)
      console.log('📊 Customer Details:', session.customer_details)

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

      console.log('🔍 Extracted metadata:', { userId, tourId, sessionId, paymentType, quantity })

      if (!userId || !tourId || !sessionId || !paymentType) {
        console.error('❌ Missing metadata in checkout session:', session.id)
        console.error('❌ Available metadata:', session.metadata)
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
        console.error('❌ Anonymous user detected but should not happen anymore')
        return NextResponse.json({ 
          error: 'Anonymous users not supported - user must register first',
          timestamp,
          sessionId: session.id 
        }, { status: 400 })
      }

      // Crea il booking
      try {
        const { error: insertError } = await supabase
          .from('bookings')
          .insert({
            user_id: finalUserId,
            tour_id: tourId,
            session_id: sessionId,
            status: paymentType === 'deposit' ? 'deposit_paid' : 'fully_paid',
            deposit_amount: paymentType === 'deposit' ? session.amount_total : (parseFloat(session.metadata?.sessionDeposit || '0') * 100),
            total_amount: paymentType === 'deposit' ? (parseFloat(session.metadata?.sessionPrice || '0') * 100) : session.amount_total,
            stripe_payment_intent_id: session.payment_intent as string,
            deposit_due_date: new Date().toISOString(),
            balance_due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 giorni da oggi
            quantity: quantity ? parseInt(quantity) : 1,
            tour_title: session.metadata?.tourTitle || '',
            tour_destination: session.metadata?.tourDestination || '',
            session_date: session.metadata?.sessionDate || '',
            session_end_date: session.metadata?.sessionEndDate || '',
          })

        if (insertError) {
          console.error('❌ Error creating booking:', insertError)
          return NextResponse.json({ error: 'Booking creation failed' }, { status: 500 })
        } else {
          console.log('✅ Booking created successfully for user:', finalUserId)
        }
      } catch (error) {
        console.error('❌ Error handling booking creation:', error)
        return NextResponse.json({ error: 'Booking creation failed' }, { status: 500 })
      }

      // Aggiorna il profilo con i dati di fatturazione
      if (session.customer_details) {
        try {
          const customerDetails = session.customer_details
          const billingAddress = customerDetails.address
          
          const profileUpdate: any = {
            email: customerDetails.email || null,
            address: billingAddress?.line1 || null,
            city: billingAddress?.city || null,
            postal_code: billingAddress?.postal_code || null,
            country: billingAddress?.country || null,
          }
          
          // Aggiungi dati custom di Stripe (codice fiscale, P.IVA, PEC)
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
          
          // Rimuovi campi nulli
          Object.keys(profileUpdate).forEach(key => {
            if (profileUpdate[key] === null) {
              delete profileUpdate[key]
            }
          })
          
          console.log('📊 Updating profile with billing data:', profileUpdate)
          
          const { error: profileError } = await supabase
            .from('profiles')
            .upsert({
              id: finalUserId,
              ...profileUpdate,
            }, { onConflict: 'id' })
          
          if (profileError) {
            console.error('❌ Error updating user profile with billing data:', profileError)
          } else {
            console.log('✅ User profile updated with billing data for user:', finalUserId)
          }
        } catch (profileUpdateError) {
          console.error('❌ Error in profile update process:', profileUpdateError)
        }
      }
    } else if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      console.log('🎉 Processing payment_intent.succeeded event')
      console.log('📊 Payment Intent ID:', paymentIntent.id)
      console.log('📊 Amount:', paymentIntent.amount)
      console.log('📊 Currency:', paymentIntent.currency)
      console.log('📊 Status:', paymentIntent.status)
      console.log('📊 Metadata:', paymentIntent.metadata)

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
        paymentType
      } = paymentIntent.metadata || {}

      console.log('🔍 Extracted metadata from payment intent:', { userId, tourId, sessionId, paymentType })

      if (!userId || !tourId || !sessionId || !paymentType) {
        console.error('❌ Missing metadata in payment intent:', paymentIntent.id)
        console.error('❌ Available metadata:', paymentIntent.metadata)
        return NextResponse.json({ 
          error: 'Missing metadata in payment intent',
          timestamp,
          paymentIntentId: paymentIntent.id,
          availableMetadata: paymentIntent.metadata 
        }, { status: 400 })
      }

      if (userId === 'anonymous') {
        console.error('❌ Anonymous user detected but should not happen anymore')
        return NextResponse.json({ 
          error: 'Anonymous users not supported - user must register first',
          timestamp,
          paymentIntentId: paymentIntent.id 
        }, { status: 400 })
      }

      // Crea il booking per payment intent
      try {
        const { error: insertError } = await supabase
          .from('bookings')
          .insert({
            user_id: userId,
            tour_id: tourId,
            session_id: sessionId,
            status: paymentType === 'deposit' ? 'deposit_paid' : 'fully_paid',
            deposit_amount: paymentType === 'deposit' ? paymentIntent.amount : 0,
            total_amount: paymentIntent.amount,
            stripe_payment_intent_id: paymentIntent.id,
            deposit_due_date: new Date().toISOString(),
            balance_due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 giorni da oggi
            quantity: 1, // Default quantity for payment intents
            tour_title: paymentIntent.metadata?.tourTitle || '',
            tour_destination: paymentIntent.metadata?.tourDestination || '',
            session_date: paymentIntent.metadata?.sessionDate || '',
            session_end_date: paymentIntent.metadata?.sessionEndDate || '',
          })

        if (insertError) {
          console.error('❌ Error creating booking from payment intent:', insertError)
          return NextResponse.json({ error: 'Booking creation failed' }, { status: 500 })
        } else {
          console.log('✅ Booking created successfully from payment intent for user:', userId)
        }
      } catch (error) {
        console.error('❌ Error handling booking creation from payment intent:', error)
        return NextResponse.json({ error: 'Booking creation failed' }, { status: 500 })
      }
    } else {
      console.log('⚠️ Unhandled event type:', event.type)
      console.log('⚠️ Event data:', JSON.stringify(event.data, null, 2))
    }

    return NextResponse.json({ 
      received: true, 
      timestamp,
      eventType: event.type,
      processed: true 
    })
  } catch (error) {
    console.error('❌ Webhook error:', error)
    return NextResponse.json({ 
      error: 'Webhook processing failed',
      timestamp,
      errorMessage: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
