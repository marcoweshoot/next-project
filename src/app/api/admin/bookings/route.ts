import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerClientSupabase } from '@/lib/supabase/server'

// GET /api/admin/bookings - Fetch all bookings for admin
export async function GET(_request: NextRequest) {
  try {
    // Verifica autenticazione e ruolo admin
    const supabase = await createServerClientSupabase()
    
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verifica se l'utente è admin
    const { data: roles, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)

    if (roleError || !roles || roles.length === 0) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const isAdmin = roles.some(role => 
      role.role === 'admin' || role.role === 'super_admin'
    )

    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Usa Service Role Key per bypassare RLS
    const adminSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Fetch bookings con profili utenti
    const { data: bookings, error } = await adminSupabase
      .from('bookings')
      .select(`
        *,
        profiles!inner(
          first_name,
          last_name,
          email,
          phone,
          mobile_phone,
          address,
          city,
          postal_code,
          country,
          fiscal_code,
          vat_number
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching bookings:', error)
      return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 })
    }

    return NextResponse.json({ bookings: bookings || [] })

  } catch (error) {
    console.error('Admin bookings API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
