import { NextRequest, NextResponse } from 'next/server'
import { createServerClientSupabase } from '@/lib/supabase/server'
import { applyGiftCard } from '@/lib/giftCards'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { tourId, sessionId, userId, quantity, paymentType, giftCardCode, amount } = body

    // Validate required fields
    if (!tourId || !sessionId || !userId || !giftCardCode) {
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
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      )
    }

    // Calculate amounts
    const baseAmount = paymentType === 'deposit' ? session.deposit : session.price
    const totalAmount = baseAmount * quantity

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
      console.error('Error creating booking:', bookingError)
      return NextResponse.json(
        { error: 'Failed to create booking' },
        { status: 500 }
      )
    }

    // Apply gift card
    if (giftCardCode) {
      try {
        const result = await applyGiftCard(
          giftCardCode,
          totalAmount * 100, // Convert to cents
          userId,
          booking.id,
          supabase as any
        )

        if (!result.success) {
          console.error('Error applying gift card:', result.error)
          // Don't fail the booking if gift card application fails
        }
      } catch (giftCardError) {
        console.error('Exception applying gift card:', giftCardError)
        // Don't fail the booking if gift card application fails
      }
    }

    return NextResponse.json({
      success: true,
      bookingId: booking.id,
      message: 'Booking created successfully with gift card payment'
    })

  } catch (error) {
    console.error('Error in create-zero-payment:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
