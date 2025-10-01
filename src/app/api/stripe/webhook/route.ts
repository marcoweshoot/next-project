import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createServerClientSupabase } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

// Stripe consiglia Node.js runtime per i webhook
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  console.log('🔔 Webhook received at:', new Date().toISOString())
  console.log('🔔 Request headers:', Object.fromEntries(request.headers.entries()))
  
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')!

  console.log('🔔 Body length:', body.length)
  console.log('🔔 Signature present:', !!signature)
  console.log('🔔 Webhook received:', { signature: signature?.substring(0, 20) + '...' })
  console.log('🔔 Body preview:', body.substring(0, 200) + '...')
  console.log('🔔 Webhook secret length:', process.env.STRIPE_WEBHOOK_SECRET?.length)
  console.log('🔔 Webhook secret preview:', process.env.STRIPE_WEBHOOK_SECRET?.substring(0, 10) + '...')
  console.log('🔔 Full signature:', signature)
  console.log('🔔 Body type:', typeof body)
  console.log('🔔 Body encoding:', Buffer.from(body).toString('hex').substring(0, 100))

  let event: Stripe.Event

  try {
    // Debug: Verifichiamo che il secret sia corretto
    console.log('🔍 Webhook secret from env:', process.env.STRIPE_WEBHOOK_SECRET)
    console.log('🔍 Expected secret starts with:', process.env.STRIPE_WEBHOOK_SECRET?.substring(0, 10))
    console.log('🔍 Body first 100 chars:', body.substring(0, 100))
    console.log('🔍 Body last 100 chars:', body.substring(body.length - 100))
    console.log('🔍 Body length:', body.length)
    console.log('🔍 Signature header:', signature)
    
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
    console.log('✅ Webhook signature verified successfully!')
    console.log('Webhook event type:', event.type)
  } catch (err) {
    console.error('❌ Webhook signature verification failed:', err)
    console.error('❌ Error details:', JSON.stringify(err, null, 2))
    console.error('❌ Error type:', err?.constructor?.name)
    console.error('❌ Error message:', err?.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        await handlePaymentSuccess(paymentIntent)
        break
      }
      case 'checkout.session.completed': {
        console.log('🎉 Processing checkout.session.completed event')
        const session = event.data.object as Stripe.Checkout.Session
        console.log('📊 Session object:', JSON.stringify(session, null, 2))
        await handleCheckoutSuccess(session)
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
  console.log('🎉 Payment succeeded! PaymentIntent ID:', paymentIntent.id)
  console.log('📊 Metadata:', paymentIntent.metadata)
  
  const supabase = await createServerClientSupabase()
  
  const { userId, tourId, sessionId, paymentType } = paymentIntent.metadata

  if (!userId || !tourId || !sessionId || !paymentType) {
    console.error('❌ Missing metadata in payment intent:', paymentIntent.id)
    console.error('📊 Available metadata:', paymentIntent.metadata)
    return
  }


  // Nota: per PaymentIntent non abbiamo i dati di fatturazione completi come in Checkout Session
  // I dati di fatturazione vengono salvati solo quando si usa Stripe Checkout

  try {
    // Get session details to calculate total amount
    const { data: sessionData, error: sessionError } = await supabase
      .from('tour_sessions')
      .select('price, deposit, start')
      .eq('id', sessionId)
      .single()

    if (sessionError || !sessionData) {
      console.error('Error fetching session data:', sessionError)
      return
    }

    const totalAmount = sessionData.price * 100 // Convert to cents
    const depositAmount = sessionData.deposit * 100 // Convert to cents

    if (paymentType === 'deposit') {
      // Create new booking with deposit paid
      const { error: insertError } = await supabase
        .from('bookings')
        .insert({
          user_id: userId,
          tour_id: tourId,
          session_id: sessionId,
          status: 'deposit_paid',
          deposit_amount: depositAmount,
          total_amount: totalAmount,
          stripe_payment_intent_id: paymentIntent.id,
          deposit_due_date: new Date().toISOString(), // Data di pagamento dell'acconto (oggi)
          balance_due_date: new Date(new Date(sessionData.start).getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 giorni prima della partenza
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

async function handleCheckoutSuccess(session: Stripe.Checkout.Session) {
  console.log('🎉 Checkout completed! Session ID:', session.id)
  console.log('📊 Metadata:', session.metadata)
  
  // Usa service role per bypassare RLS nel webhook
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
    quantity,
    tourTitle,
    tourDestination,
    sessionDate,
    sessionEndDate,
    sessionPrice,
    sessionDeposit
  } = session.metadata

  if (!userId || !tourId || !sessionId || !paymentType) {
    console.error('❌ Missing metadata in checkout session:', session.id)
    console.error('📊 Available metadata:', session.metadata)
    return
  }


  // Gestisci il caso di utenti anonimi
  let finalUserId = userId
  
  if (userId === 'anonymous') {
    const userEmail = session.customer_details?.email || `user_${Date.now()}@temp.com`
    
    // Crea un nuovo utente con i dati raccolti da Stripe
    const { data: newUser, error: userError } = await supabase.auth.admin.createUser({
      email: userEmail,
      password: `temp_password_${Date.now()}`,
      email_confirm: true, // Auto-confirm per permettere il checkout
    })

    if (userError) {
      console.error('❌ Error creating user:', userError)
      return
    }

    finalUserId = newUser.user.id
    
    // Invia email di benvenuto con istruzioni per impostare la password
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 
                   (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')
    
    try {
      // Genera un link per il reset password (per permettere all'utente di impostare la sua password)
      const { error: emailError } = await supabase.auth.admin.generateLink({
        type: 'recovery',
        email: userEmail,
        options: {
          redirectTo: `${siteUrl}/auth/reset-password`
        }
      })
      
      if (emailError) {
        console.error('❌ Error sending welcome email:', emailError)
      } else {
        console.log('✅ Welcome email sent to:', userEmail)
      }
    } catch (err) {
      console.error('❌ Error in welcome email flow:', err)
    }
  }

  // Aggiorna il profilo dell'utente con i dati di fatturazione da Stripe
  await updateUserProfileWithBillingData(supabase, finalUserId, session)

  try {
    // Get session details to calculate total amount
    const { data: sessionData, error: sessionError } = await supabase
      .from('tour_sessions')
      .select('price, deposit, start')
      .eq('id', sessionId)
      .single()

    if (sessionError || !sessionData) {
      console.error('Error fetching session data:', sessionError)
      return
    }

    const totalAmount = sessionData.price * 100 // Convert to cents
    const depositAmount = sessionData.deposit * 100 // Convert to cents

    if (paymentType === 'deposit') {
      // Create new booking with deposit paid
      const { error: insertError } = await supabase
        .from('bookings')
        .insert({
          user_id: finalUserId,
          tour_id: tourId,
          session_id: sessionId,
          status: 'deposit_paid',
          deposit_amount: depositAmount,
          total_amount: totalAmount,
          stripe_payment_intent_id: session.payment_intent as string,
          deposit_due_date: new Date().toISOString(), // Data di pagamento dell'acconto (oggi)
          balance_due_date: new Date(new Date(sessionData.start).getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 giorni prima della partenza
          quantity: quantity ? parseInt(quantity) : 1,
          tour_title: tourTitle || '',
          tour_destination: tourDestination || '',
          session_date: sessionDate || '',
          session_end_date: sessionEndDate || '',
        })

      if (insertError) {
        console.error('Error creating booking:', insertError)
        console.error('❌ Booking insert error details:', JSON.stringify(insertError, null, 2))
      } else {
        console.log('✅ Booking created successfully for user:', finalUserId)
      }
    } else if (paymentType === 'balance') {
      // Update existing booking to fully paid
      const { error: updateError } = await supabase
        .from('bookings')
        .update({
          status: 'fully_paid',
          stripe_payment_intent_id: session.payment_intent as string,
        })
        .eq('user_id', finalUserId)
        .eq('tour_id', tourId)
        .eq('session_id', sessionId)

      if (updateError) {
        console.error('Error updating booking:', updateError)
      }
    }
  } catch (error) {
    console.error('Error handling checkout success:', error)
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

async function updateUserProfileWithBillingData(supabase: any, userId: string, session: Stripe.Checkout.Session) {
  try {
    
    // Estrai i dati di fatturazione dalla sessione Stripe
    const customerDetails = session.customer_details
    const customFields = session.custom_fields
    
    
    if (!customerDetails) {
      console.log('⚠️ No customer details found in session')
      return
    }

    // Prepara i dati per l'aggiornamento del profilo
    const profileUpdate: any = {
      updated_at: new Date().toISOString()
    }

    // Aggiorna i dati di base se disponibili
    if (customerDetails.name) {
      const nameParts = customerDetails.name.split(' ')
      profileUpdate.first_name = nameParts[0] || ''
      profileUpdate.last_name = nameParts.slice(1).join(' ') || ''
    }

    // Aggiorna l'indirizzo di fatturazione
    if (customerDetails.address) {
      const address = customerDetails.address
      profileUpdate.address = [
        address.line1,
        address.line2
      ].filter(Boolean).join(', ')
      profileUpdate.city = address.city || ''
      profileUpdate.postal_code = address.postal_code || ''
      profileUpdate.country = address.country || 'IT'
    }

    // Aggiorna i campi personalizzati (codice fiscale, partita IVA, PEC)
    if (customFields && customFields.length > 0) {
      customFields.forEach((field: any) => {
        if (field.key === 'fiscal_code' && field.value) {
          profileUpdate.fiscal_code = field.value
        } else if (field.key === 'vat_number' && field.value) {
          profileUpdate.vat_number = field.value
        } else if (field.key === 'pec_email' && field.value) {
          profileUpdate.pec_email = field.value
        }
      })
    }

    console.log('💾 Profile update data:', profileUpdate)

    // Aggiorna o crea il profilo nel database
    const { error: updateError } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        ...profileUpdate,
        created_at: new Date().toISOString()
      })

    if (updateError) {
      console.error('❌ Error updating/creating user profile:', updateError)
    }

  } catch (error) {
    console.error('❌ Error in updateUserProfileWithBillingData:', error)
  }
}
