import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerClientSupabase } from '@/lib/supabase/server'

// PUT /api/admin/bookings/[id] - Update booking status
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    // Parse request body and params
    const { status } = await request.json()
    const { id } = await params

    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 })
    }

    if (!id) {
      return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 })
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

    // Verifica che la prenotazione esista
    const { data: existingBooking, error: fetchError } = await adminSupabase
      .from('bookings')
      .select('id, status, amount_paid')
      .eq('id', id)
      .single()

    if (fetchError) {
      console.error('Error fetching booking:', fetchError)
      return NextResponse.json({ 
        error: 'Booking not found',
        details: fetchError.message 
      }, { status: 404 })
    }

    console.log('Existing booking:', existingBooking)
    console.log('Updating booking:', { id, status })
    
    // Update booking status and amount_paid based on status
    const updateData: any = {
      status,
      updated_at: new Date().toISOString()
    }

    // Se lo status è 'refunded' o 'cancelled', azzera amount_paid
    if (status === 'refunded' || status === 'cancelled') {
      updateData.amount_paid = 0
      console.log('Setting amount_paid to 0 for status:', status)
    }

    console.log('Update data:', updateData)

    const { data, error } = await adminSupabase
      .from('bookings')
      .update(updateData)
      .eq('id', id)
      .select()

    if (error) {
      console.error('Database error updating booking status:', error)
      console.error('Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      })
      return NextResponse.json({ 
        error: 'Failed to update booking status',
        details: error.message 
      }, { status: 500 })
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    return NextResponse.json({ 
      success: true,
      booking: data[0]
    })

  } catch (error) {
    console.error('Admin booking update API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
