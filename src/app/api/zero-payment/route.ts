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

    // Calculate the correct amounts based on payment type
    // For gift cards that cover the full amount, we need to preserve the original tour price
    const originalTourAmount = paymentType === 'deposit' 
      ? (sessionDeposit || 0) * quantity 
      : (sessionPrice || 0) * quantity
    
    // The amount being paid (0 if fully covered by gift card)
    const paidAmount = amount || 0
    
    // Total amount of the tour (original price regardless of gift card)
    const totalAmount = originalTourAmount
    
    console.log('🎁 [ZERO PAYMENT API] Amount calculation:', {
      paymentType,
      sessionPrice,
      sessionDeposit,
      quantity,
      originalTourAmount,
      paidAmount,
      totalAmount,
      giftCardCode
    })

    // Convert to cents for database storage
    const totalAmountCents = Math.round(totalAmount * 100)
    const paidAmountCents = Math.round(paidAmount * 100)
    const depositAmountCents = Math.round((paymentType === 'deposit' ? totalAmount : 0) * 100)
    
    console.log('🎁 [ZERO PAYMENT API] Amounts in cents:', {
      totalAmountCents,
      paidAmountCents,
      depositAmountCents
    })

    console.log('🎁 [ZERO PAYMENT API] Creating booking:', {
      userId,
      tourId,
      sessionId,
      quantity,
      paymentType,
      totalAmountCents,
      paidAmountCents,
      depositAmountCents
    })

    // Create booking with enriched data
    console.log('🎁 [ZERO PAYMENT API] About to insert booking with data:', {
      user_id: userId,
      tour_id: tourId,
      session_id: sessionId,
      quantity,
      status: paymentType === 'deposit' ? 'deposit_paid' : 'fully_paid',
      gift_card_code: giftCardCode,
      payment_method: 'gift_card'
    })
    
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        user_id: userId,
        tour_id: tourId,
        session_id: sessionId,
        quantity,
        status: paymentType === 'deposit' ? 'deposit_paid' : 'fully_paid',
        deposit_amount: depositAmountCents, // Convert to cents
        total_amount: totalAmountCents, // Original tour price in cents
        amount_paid: paidAmountCents, // Actual amount paid in cents (0 if gift card covers all)
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
      
    console.log('🎁 [ZERO PAYMENT API] Supabase insert result:', {
      booking: booking ? { id: booking.id, created_at: booking.created_at } : null,
      error: bookingError ? { code: bookingError.code, message: bookingError.message } : null
    })

    if (bookingError || !booking) {
      console.error('❌ [ZERO PAYMENT API] Error creating booking:', bookingError)
      
      // Check if it's a duplicate constraint violation
      if (bookingError?.code === '23505' && bookingError?.message?.includes('unique_booking_user_tour_session')) {
        console.log('🚫 [ZERO PAYMENT API] Duplicate booking blocked by constraint')
        return NextResponse.json(
          { error: 'Booking already exists for this tour and session' },
          { status: 409 }
        )
      }
      
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
        
        // Calculate correct amount based on payment type (for all quantity)
        // totalAmount is already the original tour amount for all quantity
        const originalAmountInCents = totalAmount * 100
        
        console.log('🎁 [ZERO PAYMENT API] Gift card details:', {
          sessionPrice,
          sessionDeposit,
          quantity,
          totalAmount,
          originalAmountInCents,
          paymentType
        })
        
        const result = await applyGiftCard(
          giftCardCode,
          originalAmountInCents, // Use total original amount for all quantity
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