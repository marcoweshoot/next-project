import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    // Usa Service Role Key per bypassare RLS
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

    // Conta utenti recenti (ultimi 10 minuti)
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString()
    
    const { data: recentUsers, error: usersError } = await supabase
      .from('auth.users')
      .select('id, email, created_at')
      .gte('created_at', tenMinutesAgo)
      .limit(5)

    // Conta bookings recenti (ultimi 10 minuti)
    const { data: recentBookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('id, user_id, tour_id, session_id, status, created_at')
      .gte('created_at', tenMinutesAgo)
      .limit(5)

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      recentUsers: recentUsers || [],
      recentBookings: recentBookings || [],
      usersError: usersError?.message,
      bookingsError: bookingsError?.message,
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    })
  }
}
