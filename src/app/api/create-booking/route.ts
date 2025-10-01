import { NextRequest, NextResponse } from 'next/server'
import { createServerClientSupabase } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, tourId, sessionId, paymentType = 'deposit', quantity = 1, tourTitle, tourDestination, sessionDate, sessionEndDate, sessionPrice, sessionDeposit, amount } = body


    // Prova prima con l'utente loggato
    let supabase = await createServerClientSupabase()
    let isUserLoggedIn = false
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      isUserLoggedIn = !!user
    } catch (error) {
      console.log('User not logged in, using service role key')
    }
    
    // Se l'utente non è loggato, usa Service Role Key
    if (!isUserLoggedIn) {
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

    return NextResponse.json({ success: true, message: 'Booking created' })

  } catch (error) {
    console.error('❌ Error creating booking:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
