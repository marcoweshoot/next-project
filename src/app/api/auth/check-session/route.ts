import { NextResponse } from 'next/server'
import { createServerClientSupabase } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createServerClientSupabase()
    
    const {
      data: { user },
    } = await supabase.auth.getUser()

    return NextResponse.json({ 
      user: user ? {
        id: user.id,
        email: user.email,
        created_at: user.created_at
      } : null
    })
  } catch (error) {
    console.error('Error checking session:', error)
    return NextResponse.json({ user: null }, { status: 500 })
  }
}
