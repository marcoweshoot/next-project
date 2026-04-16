import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// GET /api/sessions/availability?ids=id1,id2,id3
// Restituisce il numero di posti occupati per ogni session_id passato.
// Dato pubblico: non richiede autenticazione.
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const idsParam = searchParams.get('ids')

  if (!idsParam) {
    return NextResponse.json({ availability: {} })
  }

  const ids = idsParam
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean)

  if (ids.length === 0) {
    return NextResponse.json({ availability: {} })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { data, error } = await supabase
    .from('bookings')
    .select('session_id, quantity')
    .in('session_id', ids)
    .not('status', 'in', '("cancelled","refunded")')

  if (error) {
    console.error('[availability] Supabase error:', error)
    return NextResponse.json({ error: 'Failed to fetch availability' }, { status: 500 })
  }

  // Aggrega SUM(quantity) per session_id
  const availability: Record<string, number> = {}
  for (const row of data ?? []) {
    if (!row.session_id) continue
    availability[row.session_id] = (availability[row.session_id] ?? 0) + (row.quantity ?? 1)
  }

  return NextResponse.json({ availability })
}
