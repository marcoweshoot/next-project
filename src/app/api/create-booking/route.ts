import { NextRequest, NextResponse } from 'next/server'
import { createServerClientSupabase } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, tourId, sessionId, paymentType = 'deposit', quantity = 1, tourTitle, tourDestination, sessionDate, sessionEndDate, sessionPrice, sessionDeposit, amount } = body

    console.log('📝 Creating booking after payment...', { userId, tourId, sessionId, paymentType, tourTitle, tourDestination, sessionDate, sessionEndDate, amount })

    const supabase = await createServerClientSupabase()

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

    console.log('💰 Amounts calculated:', { totalAmount, depositAmount, paymentType, amount })
    console.log('🎯 Status will be:', paymentType === 'deposit' ? 'deposit_paid' : 'fully_paid')

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
      
      console.log('📝 Inserting booking data:', JSON.stringify(bookingData, null, 2))
      
      const { data: insertData, error: insertError } = await supabase
        .from('bookings')
        .insert(bookingData)
        .select()

      if (insertError) {
        console.error('❌ Error creating booking:', insertError)
        console.error('❌ Full error details:', JSON.stringify(insertError, null, 2))
        return NextResponse.json({ error: insertError.message }, { status: 500 })
      }
      console.log('✅ Booking created successfully for deposit payment')
      console.log('✅ Inserted data:', JSON.stringify(insertData, null, 2))
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
      console.log('✅ Booking updated successfully for balance payment')
    }

    console.log('✅ Booking created successfully for user:', userId)
    return NextResponse.json({ success: true, message: 'Booking created' })

  } catch (error) {
    console.error('❌ Error creating booking:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
