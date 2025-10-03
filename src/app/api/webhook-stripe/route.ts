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
      console.log('📊 Custom Fields:', session.custom_fields)
      console.log('📊 Full Session Object:', JSON.stringify(session, null, 2))

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
            console.log('📊 Processing custom fields:', session.custom_fields)
            
            session.custom_fields.forEach((field: any) => {
              console.log('📊 Processing field:', field.key, 'value:', field.text?.value)
              
              if (field.key === 'fiscal_code' && field.text?.value) {
                const fiscalCode = field.text.value.trim().toUpperCase()
                console.log('📊 Fiscal code after processing:', fiscalCode)
                
                // Valida formato codice fiscale italiano (16 caratteri, solo lettere e numeri)
                if (fiscalCode && fiscalCode.length === 16 && /^[A-Z0-9]{16}$/.test(fiscalCode)) {
                  profileUpdate.fiscal_code = fiscalCode
                  console.log('✅ Valid fiscal code:', fiscalCode)
                } else {
                  console.warn('⚠️ Invalid fiscal code format:', fiscalCode, 'length:', fiscalCode.length)
                }
              }
              if (field.key === 'vat_number' && field.text?.value && field.text.value.trim()) {
                profileUpdate.vat_number = field.text.value.trim()
                console.log('✅ VAT number:', field.text.value.trim())
              }
              if (field.key === 'pec_email' && field.text?.value && field.text.value.trim()) {
                profileUpdate.pec_email = field.text.value.trim()
                console.log('✅ PEC email:', field.text.value.trim())
              }
            })
          }
          
          // Aggiorna il profilo solo se ci sono dati da aggiornare
          if (Object.keys(profileUpdate).length > 0) {
            console.log('📊 Updating profile with billing data:', profileUpdate)
            
            const { error: profileError } = await supabase
              .from('profiles')
              .upsert({
                id: finalUserId,
                ...profileUpdate,
              }, { onConflict: 'id' })
            
            if (profileError) {
              console.error('❌ Error updating user profile with billing data:', profileError)
              // Non bloccare il flusso se l'aggiornamento del profilo fallisce
              console.log('ℹ️ Continuing with booking creation despite profile update error')
            } else {
              console.log('✅ User profile updated with billing data for user:', finalUserId)
            }
          } else {
            console.log('ℹ️ No billing data to update profile')
          }
        } catch (profileUpdateError) {
          console.error('❌ Error in profile update process:', profileUpdateError)
          // Non bloccare il flusso se l'aggiornamento del profilo fallisce
          console.log('ℹ️ Continuing with booking creation despite profile update error')
        }
      }
    } else if (event.type === 'payment_intent.succeeded') {
      // Payment Intent events are handled automatically by Stripe when using Checkout Sessions
      // We only need to handle checkout.session.completed events for our booking system
      console.log('ℹ️ Payment Intent succeeded - this is handled by checkout.session.completed event')
      console.log('📊 Payment Intent ID:', (event.data.object as Stripe.PaymentIntent).id)
      console.log('📊 Amount:', (event.data.object as Stripe.PaymentIntent).amount)
      console.log('📊 This event is informational only - booking creation is handled by checkout.session.completed')
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
