import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const { giftCardCode, userId } = await request.json()
    
    if (!giftCardCode || !userId) {
      return NextResponse.json(
        { success: false, error: 'Gift card code and user ID are required' },
        { status: 400 }
      )
    }
    
    // Use service role for updating gift card
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
    
    // Find the gift card by code
    const { data: giftCard, error: findError } = await supabase
      .from('gift_cards')
      .select('*')
      .eq('code', giftCardCode)
      .single()
    
    if (findError || !giftCard) {
      return NextResponse.json(
        { success: false, error: 'Gift card not found' },
        { status: 404 }
      )
    }
    
    // Check if gift card is already redeemed by a user
    if (giftCard.redeemed_by_user_id) {
      return NextResponse.json(
        { success: false, error: 'Gift card is already redeemed by another user' },
        { status: 400 }
      )
    }
    
    // Associate the gift card with the user (set redeemed_by_user_id, not purchaser_user_id)
    const { error: updateError } = await supabase
      .from('gift_cards')
      .update({
        redeemed_by_user_id: userId,
        updated_at: new Date().toISOString()
      })
      .eq('id', giftCard.id)
    
    if (updateError) {
      console.error('Error associating gift card:', updateError)
      return NextResponse.json(
        { success: false, error: 'Failed to associate gift card' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: 'Gift card associated successfully',
      giftCard: {
        code: giftCard.code,
        amount: giftCard.amount,
        remaining_balance: giftCard.remaining_balance,
        expires_at: giftCard.expires_at
      }
    })
    
  } catch (error) {
    console.error('Error in gift card association:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
