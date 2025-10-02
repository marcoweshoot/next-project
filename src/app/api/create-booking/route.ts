import { NextRequest, NextResponse } from 'next/server'
import { createServerClientSupabase } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'
import { stripe } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, tourId, sessionId, paymentType = 'deposit', quantity = 1, tourTitle, tourDestination, sessionDate, sessionEndDate, sessionPrice, sessionDeposit, amount, stripeSessionId } = body


    // Prova prima con l'utente loggato
    let supabase = await createServerClientSupabase()
    let isUserLoggedIn = false
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      isUserLoggedIn = !!user
      console.log('🔍 User logged in:', isUserLoggedIn, user?.id)
    } catch (error) {
      console.log('User not logged in, using service role key')
    }
    
    // Se l'utente non è loggato, usa Service Role Key
    if (!isUserLoggedIn) {
      console.log('🔄 Using Service Role Key for booking creation')
      supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        }
      )
    }

    // Use real data from Strapi
    let totalAmount, depositAmount
    
    if (paymentType === 'deposit') {
      // For deposit payments: use real prices from Strapi
      totalAmount = (sessionPrice || 379) * 100 * quantity // Convert to cents and multiply by quantity
      depositAmount = amount || (sessionDeposit || 105) * 100 * quantity // What was actually paid
    } else {
      // For full payments: total and deposit are the same (full amount paid)
      totalAmount = amount || (sessionPrice || 379) * 100 * quantity // Full amount paid
      depositAmount = amount || (sessionPrice || 379) * 100 * quantity // Same as total for full payments
    }


    if (paymentType === 'deposit') {
      // Create new booking for deposit payments
      const bookingData = {
        user_id: userId,
        tour_id: tourId,
        session_id: sessionId,
        quantity: quantity,
        status: 'deposit_paid',
        deposit_amount: depositAmount,
        total_amount: totalAmount,
        stripe_payment_intent_id: 'manual_' + Date.now(),
        deposit_due_date: new Date().toISOString(), // Data di pagamento dell'acconto (oggi)
        balance_due_date: sessionDate ? 
          new Date(new Date(sessionDate).getTime() - 30 * 24 * 60 * 60 * 1000).toISOString() : // 30 giorni prima della partenza
          new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // Fallback se non abbiamo la data
        // Add real tour and session data
        tour_title: tourTitle,
        tour_destination: tourDestination,
        session_date: sessionDate,
        session_end_date: sessionEndDate,
      }
      
      
      const { error: insertError } = await supabase
        .from('bookings')
        .insert(bookingData)
        .select()

      if (insertError) {
        console.error('❌ Error creating booking:', insertError)
        console.error('❌ Full error details:', JSON.stringify(insertError, null, 2))
        return NextResponse.json({ error: insertError.message }, { status: 500 })
      }
    } else if (paymentType === 'balance') {
      // Update existing booking for balance payments
      const { error: updateError } = await supabase
        .from('bookings')
        .update({
          status: 'fully_paid',
          stripe_payment_intent_id: 'manual_' + Date.now(),
        })
        .eq('user_id', userId)
        .eq('tour_id', tourId)
        .eq('session_id', sessionId)

      if (updateError) {
        console.error('❌ Error updating booking:', updateError)
        console.error('❌ Full error details:', JSON.stringify(updateError, null, 2))
        return NextResponse.json({ error: updateError.message }, { status: 500 })
      }
    }

    // Aggiorna il profilo con i dati di fatturazione se abbiamo lo stripeSessionId
    if (stripeSessionId) {
      try {
        console.log('🔄 Updating user profile with billing data from Stripe session:', stripeSessionId)
        
        // Recupera i dettagli della sessione da Stripe
        const session = await stripe.checkout.sessions.retrieve(stripeSessionId)
        
        if (session.customer_details) {
          const customerDetails = session.customer_details
          const billingAddress = customerDetails.address
          
          // Prepara i dati del profilo
          const profileUpdate: any = {
            full_name: customerDetails.name || null,
            email: customerDetails.email || null,
            address: billingAddress?.line1 || null,
            city: billingAddress?.city || null,
            postal_code: billingAddress?.postal_code || null,
            country: billingAddress?.country || null,
          }
          
          // Aggiungi i campi personalizzati se disponibili
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
          
          // Rimuovi i campi null per evitare di sovrascrivere dati esistenti
          Object.keys(profileUpdate).forEach(key => {
            if (profileUpdate[key] === null) {
              delete profileUpdate[key]
            }
          })
          
          // Aggiorna il profilo
          const { error: profileError } = await supabase
            .from('profiles')
            .upsert({
              id: userId,
              ...profileUpdate,
            }, { onConflict: 'id' })
          
          if (profileError) {
            console.error('❌ Error updating user profile:', profileError)
          } else {
            console.log('✅ User profile updated with billing data')
          }
        }
      } catch (error) {
        console.error('❌ Error updating profile with billing data:', error)
        // Non blocchiamo il flusso se l'aggiornamento del profilo fallisce
      }
    }

    return NextResponse.json({ success: true, message: 'Booking created' })

  } catch (error) {
    console.error('❌ Error creating booking:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
