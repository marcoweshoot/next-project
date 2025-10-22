import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/integrations/supabase/client'
import { getUserGiftCards } from '@/lib/giftCards'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Non autenticato' },
        { status: 401 }
      )
    }
    
    // Get user's gift cards
    const giftCards = await getUserGiftCards(user.id, supabase)
    
    return NextResponse.json({ giftCards })
  } catch (error) {
    console.error('Error fetching user gift cards:', error)
    return NextResponse.json(
      { error: 'Errore nel recupero delle gift card' },
      { status: 500 }
    )
  }
}

