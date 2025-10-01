import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

// Endpoint webhook esterno che bypassa completamente l'autenticazione Vercel
export async function POST(request: NextRequest) {
  console.log('🔔 External webhook received at:', new Date().toISOString())
  
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')!

  console.log('🔔 Body length:', body.length)
  console.log('🔔 Signature present:', !!signature)

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('❌ Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  console.log('✅ Webhook signature verified, event type:', event.type)

  // Handle checkout.session.completed
  if (event.type === 'checkout.session.completed') {
    console.log('🎉 Processing checkout.session.completed')
    
    const session = event.data.object as Stripe.Checkout.Session
    console.log('📊 Session ID:', session.id)
    console.log('📊 Session metadata:', session.metadata)

    // Create Supabase client with service role key
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
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
      return NextResponse.json({ error: 'Missing metadata' }, { status: 400 })
    }

    console.log('📊 Processing payment for user:', userId)

    // Handle anonymous users
    let finalUserId = userId
    
    if (userId === 'anonymous') {
      console.log('👤 Creating anonymous user...')
      
      const userEmail = session.customer_details?.email || `user_${Date.now()}@temp.com`
      
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
      console.log('✅ Anonymous user created:', finalUserId)

      // Send recovery email
      try {
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 
                       (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')
        
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

    // Update user profile with billing data
    try {
      const profileUpdate: any = {
        id: finalUserId,
        updated_at: new Date().toISOString()
      }

      if (session.customer_details?.address) {
        const addr = session.customer_details.address
        profileUpdate.address = `${addr.line1 || ''} ${addr.line2 || ''}`.trim()
        profileUpdate.city = addr.city || ''
        profileUpdate.postal_code = addr.postal_code || ''
        profileUpdate.country = addr.country || ''
      }

      if (session.customer_details?.name) {
        profileUpdate.full_name = session.customer_details.name
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

      const { error: updateError } = await supabase
        .from('profiles')
        .upsert({
          id: finalUserId,
          ...profileUpdate,
          created_at: new Date().toISOString()
        })

      if (updateError) {
        console.error('❌ Error updating user profile:', updateError)
      } else {
        console.log('✅ User profile updated')
      }
    } catch (error) {
      console.error('❌ Error in updateUserProfileWithBillingData:', error)
    }

    // Create booking
    try {
      const sessionData = {
        price: parseFloat(sessionPrice || '0'),
        deposit: parseFloat(sessionDeposit || '0'),
        start: sessionDate || new Date().toISOString()
      }

      const totalAmount = sessionData.price * 100
      const depositAmount = sessionData.deposit * 100

      if (paymentType === 'deposit') {
        console.log('📝 Creating booking with deposit...')
        
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
            deposit_due_date: new Date().toISOString(),
            balance_due_date: new Date(new Date(sessionData.start).getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            quantity: quantity ? parseInt(quantity) : 1,
            tour_title: tourTitle || '',
            tour_destination: tourDestination || '',
            session_date: sessionDate || '',
            session_end_date: sessionEndDate || '',
          })

        if (insertError) {
          console.error('❌ Error creating booking:', insertError)
          return NextResponse.json({ error: 'Booking creation failed' }, { status: 500 })
        } else {
          console.log('✅ Booking created successfully for user:', finalUserId)
        }
      } else if (paymentType === 'balance') {
        console.log('📝 Updating booking to fully paid...')
        
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
          console.error('❌ Error updating booking:', updateError)
          return NextResponse.json({ error: 'Booking update failed' }, { status: 500 })
        } else {
          console.log('✅ Booking updated to fully paid')
        }
      }
    } catch (error) {
      console.error('❌ Error handling checkout success:', error)
      return NextResponse.json({ error: 'Checkout processing failed' }, { status: 500 })
    }

    console.log('🎉 Checkout processing completed successfully')
    return NextResponse.json({ received: true })
  }

  return NextResponse.json({ received: true })
}
