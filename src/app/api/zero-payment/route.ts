import { NextRequest, NextResponse } from 'next/server'
import { createServerClientSupabase } from '@/lib/supabase/server'
import { applyGiftCard } from '@/lib/giftCards'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      tourId, 
      sessionId, 
      userId, 
      quantity, 
      paymentType, 
      giftCardCode, 
      amount,
      tourTitle,
      tourDestination,
      sessionDate,
      sessionEndDate,
      sessionPrice,
      sessionDeposit
    } = body

    console.log('🎁 [ZERO PAYMENT API] Received parameters:', {
      tourId,
      sessionId,
      userId,
      quantity,
      paymentType,
      giftCardCode,
      amount,
      hasUserId: !!userId,
      userIdType: typeof userId,
      userIdLength: userId?.length,
      // Log enriched data
      tourTitle,
      tourDestination,
      sessionDate,
      sessionEndDate,
      sessionPrice,
      sessionDeposit
    })

    // Check for existing booking to prevent duplicates
    const { data: existingBookings } = await supabase
      .from('bookings')
      .select('id, created_at')
      .eq('user_id', userId)
      .eq('tour_id', tourId)
      .eq('session_id', sessionId)
      .eq('gift_card_code', giftCardCode)
      .order('created_at', { ascending: false })
      .limit(1)

    if (existingBookings && existingBookings.length > 0) {
      const lastBooking = existingBookings[0]
      const timeDiff = Date.now() - new Date(lastBooking.created_at).getTime()
      
      // If booking was created less than 30 seconds ago, it's likely a duplicate
      if (timeDiff < 30000) {
        console.log('🚫 [ZERO PAYMENT API] Duplicate booking prevented:', {
          existingBookingId: lastBooking.id,
          timeDiff: timeDiff + 'ms'
        })
        return NextResponse.json({ 
          success: true, 
          bookingId: lastBooking.id,
          message: 'Booking already exists (duplicate prevented)'
        })
      }
    }

    // Validate required fields
    if (!tourId || !sessionId || !userId || !giftCardCode) {
      console.error('❌ [ZERO PAYMENT API] Missing required fields:', {
        tourId: !!tourId,
        sessionId: !!sessionId,
        userId: !!userId,
        giftCardCode: !!giftCardCode,
        userIdValue: userId
      })
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const supabase = await createServerClientSupabase()

    // Note: Tour and session data come from Strapi (GraphQL), not Supabase
    // We need to get the amounts from the request body or calculate them
    // For now, we'll use the amount from the request or calculate based on typical values
    
    // Since we don't have access to tour/session data in Supabase,
    // we'll use the amount passed from the frontend
    // The frontend calculates the correct amount based on tour/session data from Strapi
    const totalAmount = amount || 0 // Use the amount from the request
    
    console.log('🎁 [ZERO PAYMENT API] Using amount from frontend:', totalAmount)

    console.log('🎁 [ZERO PAYMENT API] Creating booking:', {
      userId,
      tourId,
      sessionId,
      quantity,
      paymentType,
      totalAmount
    })

    // Create booking with enriched data
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        user_id: userId,
        tour_id: tourId,
        session_id: sessionId,
        quantity,
        status: paymentType === 'deposit' ? 'deposit_paid' : 'fully_paid',
        deposit_amount: paymentType === 'deposit' ? totalAmount : 0,
        total_amount: totalAmount,
        amount_paid: totalAmount,
        payment_method: 'gift_card',
        gift_card_code: giftCardCode,
        // Add enriched data for better display
        tour_title: tourTitle,
        tour_destination: tourDestination,
        session_date: sessionDate,
        session_end_date: sessionEndDate,
        session_price: sessionPrice,
        session_deposit: sessionDeposit,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (bookingError || !booking) {
      console.error('❌ [ZERO PAYMENT API] Error creating booking:', bookingError)
      return NextResponse.json(
        { error: 'Failed to create booking' },
        { status: 500 }
      )
    }

    console.log('✅ [ZERO PAYMENT API] Booking created:', booking.id)

    // Apply gift card using service role
    if (giftCardCode) {
      try {
        console.log('🎁 [ZERO PAYMENT API] Applying gift card:', giftCardCode)
        
        // Create service role client for gift card operations
        const { createClient } = await import('@supabase/supabase-js')
        const serviceSupabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!,
          {
            auth: {
              autoRefreshToken: false,
              persistSession: false
            }
          }
        )
        
        // Calculate correct amount based on payment type
        const originalAmount = paymentType === 'deposit' ? sessionDeposit : sessionPrice
        const originalAmountInCents = originalAmount * 100
        
        console.log('🎁 [ZERO PAYMENT API] Gift card details:', {
          sessionPrice,
          sessionDeposit,
          originalAmount,
          originalAmountInCents,
          totalAmount,
          paymentType
        })
        
        const result = await applyGiftCard(
          giftCardCode,
          originalAmountInCents, // Use original amount, not discounted amount
          userId,
          booking.id,
          serviceSupabase as any
        )

        if (!result.success) {
          console.error('❌ [ZERO PAYMENT API] Error applying gift card:', result.error)
          // Don't fail the booking if gift card application fails
        } else {
          console.log('✅ [ZERO PAYMENT API] Gift card applied successfully')
        }
      } catch (giftCardError) {
        console.error('❌ [ZERO PAYMENT API] Exception applying gift card:', giftCardError)
        // Don't fail the booking if gift card application fails
      }
    }

    return NextResponse.json({
      success: true,
      bookingId: booking.id,
      message: 'Booking created successfully with gift card payment'
    })

  } catch (error) {
    console.error('❌ [ZERO PAYMENT API] Error in create-zero-payment:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}