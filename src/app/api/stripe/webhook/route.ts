import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createServerClientSupabase } from '@/lib/supabase/server'
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        await handlePaymentSuccess(paymentIntent)
        break
      }
      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        await handlePaymentFailure(paymentIntent)
        break
      }
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}

async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  const supabase = await createServerClientSupabase()
  
  const { userId, tourId, sessionId, paymentType } = paymentIntent.metadata

  if (!userId || !tourId || !sessionId || !paymentType) {
    console.error('Missing metadata in payment intent:', paymentIntent.id)
    return
  }

  try {
    if (paymentType === 'deposit') {
      // Create new booking with deposit paid
      const { error: insertError } = await supabase
        .from('bookings')
        .insert({
          user_id: userId,
          tour_id: tourId,
          session_id: sessionId,
          status: 'deposit_paid',
          deposit_amount: paymentIntent.amount,
          total_amount: 0, // Will be updated when we know the total
          stripe_payment_intent_id: paymentIntent.id,
          deposit_due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
          balance_due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        })

      if (insertError) {
        console.error('Error creating booking:', insertError)
      } else {
        console.log('Booking created successfully for user:', userId)
      }
    } else if (paymentType === 'balance') {
      // Update existing booking to fully paid
      const { error: updateError } = await supabase
        .from('bookings')
        .update({
          status: 'fully_paid',
          stripe_payment_intent_id: paymentIntent.id,
        })
        .eq('user_id', userId)
        .eq('tour_id', tourId)
        .eq('session_id', sessionId)

      if (updateError) {
        console.error('Error updating booking:', updateError)
      } else {
        console.log('Booking updated to fully paid for user:', userId)
      }
    }
  } catch (error) {
    console.error('Error handling payment success:', error)
  }
}

async function handlePaymentFailure(paymentIntent: Stripe.PaymentIntent) {
  const { userId, tourId, sessionId, paymentType } = paymentIntent.metadata

  if (!userId || !tourId || !sessionId) {
    console.error('Missing metadata in failed payment intent:', paymentIntent.id)
    return
  }

  console.log(`Payment failed for user ${userId}, tour ${tourId}, session ${sessionId}, type ${paymentType}`)
  
  // Here you could update the booking status to 'payment_failed' or send notifications
  // For now, we'll just log it
}
