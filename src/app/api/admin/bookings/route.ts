import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerClientSupabase } from '@/lib/supabase/server'

// GET /api/admin/bookings - Fetch bookings for admin with pagination
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const offset = (page - 1) * limit
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

    // Fetch bookings con paginazione e solo campi essenziali per la lista
    const { data: bookings, error, count } = await adminSupabase
      .from('bookings')
      .select(`
        id,
        tour_id,
        session_id,
        status,
        total_amount,
        deposit_amount,
        amount_paid,
        quantity,
        tour_title,
        tour_destination,
        session_date,
        session_end_date,
        created_at,
        updated_at,
        profiles!inner(
          first_name,
          last_name,
          email
        )
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Error fetching bookings:', error)
      return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 })
    }

    const totalPages = Math.ceil((count || 0) / limit)

    return NextResponse.json({ 
      bookings: bookings || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    })

  } catch (error) {
    console.error('Admin bookings API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
