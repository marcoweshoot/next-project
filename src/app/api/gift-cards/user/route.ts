import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/integrations/supabase/client'
import { getUserGiftCards } from '@/lib/giftCards'

export async function GET(request: NextRequest) {
  try {
    // Use the imported supabase client
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Non autenticato' },
        { status: 401 }
      )
    }
    
    // Get user's gift cards
    const giftCards = await getUserGiftCards(user.id, supabase as any)
    
    return NextResponse.json({ giftCards })
  } catch (error) {
    console.error('Error fetching user gift cards:', error)
    return NextResponse.json(
      { error: 'Errore nel recupero delle gift card' },
      { status: 500 }
    )
  }
}

