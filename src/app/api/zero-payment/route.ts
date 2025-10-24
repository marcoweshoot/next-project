import { NextRequest, NextResponse } from 'next/server'
import { createServerClientSupabase } from '@/lib/supabase/server'
import { applyGiftCard } from '@/lib/giftCards'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { tourId, sessionId, userId, quantity, paymentType, giftCardCode, amount } = body

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
      userIdLength: userId?.length
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

    // Get tour and session details
    const { data: tour, error: tourError } = await supabase
      .from('tours')
      .select('title, destination')
      .eq('id', tourId)
      .single()

    if (tourError || !tour) {
      console.error('❌ [ZERO PAYMENT API] Tour not found:', tourError)
      return NextResponse.json(
        { error: 'Tour not found' },
        { status: 404 }
      )
    }

    const { data: session, error: sessionError } = await supabase
      .from('tour_sessions')
      .select('start, end, price, deposit')
      .eq('id', sessionId)
      .single()

    if (sessionError || !session) {
      console.error('❌ [ZERO PAYMENT API] Session not found:', sessionError)
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      )
    }

    // Calculate amounts
    const baseAmount = paymentType === 'deposit' ? session.deposit : session.price
    const totalAmount = baseAmount * quantity

    console.log('🎁 [ZERO PAYMENT API] Creating booking:', {
      userId,
      tourId,
      sessionId,
      quantity,
      paymentType,
      totalAmount,
      baseAmount
    })

    // Create booking
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

    // Apply gift card
    if (giftCardCode) {
      try {
        console.log('🎁 [ZERO PAYMENT API] Applying gift card:', giftCardCode)
        const result = await applyGiftCard(
          giftCardCode,
          totalAmount * 100, // Convert to cents
          userId,
          booking.id,
          supabase as any
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