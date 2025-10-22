import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { applyGiftCard } from '@/lib/giftCards'

// Use service role for applying gift cards (requires write access)
export async function POST(request: NextRequest) {
  try {
    const { code, amountToPay, userId, bookingId } = await request.json()
    
    if (!code || !amountToPay || !userId) {
      return NextResponse.json(
        { success: false, error: 'Parametri mancanti' },
        { status: 400 }
      )
    }
    
    // Use service role client for write operations
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
    
    // Apply the gift card
    const result = await applyGiftCard(
      code,
      amountToPay,
      userId,
      bookingId || null,
      supabase
    )
    
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      )
    }
    
    return NextResponse.json({
      success: true,
      discountAmount: result.discountAmount,
      remainingBalance: result.remainingBalance
    })
  } catch (error) {
    console.error('Error applying gift card:', error)
    return NextResponse.json(
      { success: false, error: 'Errore nell\'applicazione della gift card' },
      { status: 500 }
    )
  }
}

