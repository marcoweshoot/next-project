import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/integrations/supabase/client'
import { validateGiftCardCode } from '@/lib/giftCards'

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json()
    
    if (!code) {
      return NextResponse.json(
        { valid: false, error: 'Codice gift card richiesto' },
        { status: 400 }
      )
    }
    
    const supabase = createClient()
    
    // Validate the gift card code
    const result = await validateGiftCardCode(code, supabase)
    
    if (!result.valid) {
      return NextResponse.json(
        { valid: false, error: result.error },
        { status: 400 }
      )
    }
    
    // Return gift card details
    return NextResponse.json({
      valid: true,
      giftCard: {
        code: result.giftCard!.code,
        remaining_balance: result.giftCard!.remaining_balance,
        expires_at: result.giftCard!.expires_at,
      }
    })
  } catch (error) {
    console.error('Error validating gift card:', error)
    return NextResponse.json(
      { valid: false, error: 'Errore nella validazione del codice' },
      { status: 500 }
    )
  }
}

