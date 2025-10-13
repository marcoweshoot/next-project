import { NextRequest, NextResponse } from 'next/server'
import { createServerClientSupabase } from '@/lib/supabase/server'
import { GET_FUTURE_SESSIONS } from '@/graphql/queries/tours-sessions'

// GET /api/admin/available-sessions - Get all available future sessions
export async function GET(request: NextRequest) {
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

    // Recupera le sessioni future da Strapi
    const API_URL = process.env.STRAPI_GRAPHQL_API! || 'https://api.weshoot.it/graphql'
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        query: GET_FUTURE_SESSIONS.loc?.source.body,
        variables: { limit: 100 }
      }),
      next: { revalidate: 60 }, // Cache per 1 minuto
    })

    const data = await response.json()
    
    if (!data.data?.tours) {
      return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 })
    }

    // Filtra solo le sessioni future e le formatta per l'admin
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const availableSessions: any[] = []

    data.data.tours.forEach((tour: any) => {
      tour.sessions?.forEach((session: any) => {
        const sessionStart = new Date(session.start)
        
        // Solo sessioni future
        if (sessionStart >= today) {
          availableSessions.push({
            id: session.id,
            start: session.start,
            end: session.end,
            price: session.price,
            deposit: session.deposit,
            balance: session.balance,
            currency: session.currency,
            status: session.status,
            maxPax: session.maxPax,
            tour: {
              id: tour.id,
              title: tour.title,
              slug: tour.slug,
              places: tour.places,
              states: tour.states,
            },
            // Informazioni formattate per la UI
            displayText: `${tour.title} - ${new Date(session.start).toLocaleDateString('it-IT')} (€${session.price})`,
            coach: session.users?.[0] ? 
              `${session.users[0].firstName || ''} ${session.users[0].lastName || ''}`.trim() : 
              'Coach da definire'
          })
        }
      })
    })

    // Ordina per data di inizio
    availableSessions.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())

    return NextResponse.json({
      sessions: availableSessions,
      total: availableSessions.length
    })

  } catch (error) {
    console.error('Available sessions API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
