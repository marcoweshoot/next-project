import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

// Stripe consiglia Node.js runtime per i webhook
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  console.log('🔔 Webhook received at:', new Date().toISOString())
  console.log('🔔 Request headers:', Object.fromEntries(request.headers.entries()))
  
  try {
    // Leggi il body come stringa raw
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      console.error('❌ No stripe-signature header found')
      return NextResponse.json({ error: 'No signature' }, { status: 400 })
    }

    console.log('🔔 Body length:', body.length)
    console.log('🔔 Signature present:', !!signature)
    console.log('🔔 Body preview:', body.substring(0, 200) + '...')

    // Verifica la firma
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )

    console.log('✅ Webhook signature verified successfully!')
    console.log('🔔 Webhook event type:', event.type)
    console.log('🔔 Event ID:', event.id)
    console.log('🔔 Event data:', JSON.stringify(event.data, null, 2))

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
        return NextResponse.json({ error: 'Missing metadata' }, { status: 400 })
      }

      // Gestisci il caso di utenti anonimi
      let finalUserId = userId

      if (userId === 'anonymous') {
        const userEmail = session.customer_details?.email || `user_${Date.now()}@temp.com`

        console.log('👤 Anonymous user detected. Creating user:', userEmail)

        const { data: newUser, error: userError } = await supabase.auth.admin.createUser({
          email: userEmail,
          password: `temp_password_${Date.now()}`,
          email_confirm: true,
        })

        if (userError) {
          console.error('❌ Error creating user:', userError)
          return NextResponse.json({ error: 'User creation failed' }, { status: 500 })
        }

        finalUserId = newUser.user.id
        console.log('✅ Anonymous user created with ID:', finalUserId)

        // Invia email di recovery
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ||
                       (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')

        try {
          const { error: emailError } = await supabase.auth.admin.generateLink({
            type: 'recovery',
            email: userEmail,
            options: {
              redirectTo: `${siteUrl}/auth/reset-password`
            }
          })

          if (emailError) {
            console.error('❌ Error sending recovery email:', emailError)
          } else {
            console.log('✅ Recovery email sent to:', userEmail)
          }
        } catch (err) {
          console.error('❌ Error in recovery email flow:', err)
        }
      }

      // Crea il booking
      try {
        const { error: insertError } = await supabase
          .from('bookings')
          .insert({
            user_id: finalUserId,
            tour_id: tourId,
            session_id: sessionId,
            status: 'deposit_paid',
            deposit_amount: session.amount_total,
            total_amount: session.amount_total * 2, // Assumiamo che l'acconto sia metà del totale
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
    } else {
      console.log('⚠️ Unhandled event type:', event.type)
      console.log('⚠️ Event data:', JSON.stringify(event.data, null, 2))
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('❌ Webhook error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
