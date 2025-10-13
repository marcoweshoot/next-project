import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerClientSupabase } from '@/lib/supabase/server'

// PUT /api/admin/bookings/[id]/change-session - Change booking session/tour
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
    const { newSessionId, newTourId } = await request.json()
    const { id } = await params

    if (!newSessionId) {
      return NextResponse.json({ error: 'New session ID is required' }, { status: 400 })
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

    // Prima recupera la prenotazione corrente
    const { data: currentBooking, error: fetchError } = await adminSupabase
      .from('bookings')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !currentBooking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // Recupera i dati della nuova sessione da Strapi
    const API_URL = process.env.STRAPI_GRAPHQL_API! || 'https://api.weshoot.it/graphql'
    
    const query = `
      query GetSessionData($sessionId: ID!) {
        session(id: $sessionId) {
          id
          start
          end
          price
          deposit
          balance
          currency
          tour {
            id
            title
            slug
            places {
              slug
            }
            states {
              slug
            }
          }
        }
      }
    `

    const sessionResponse = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query,
        variables: { sessionId: newSessionId }
      })
    })

    const sessionData = await sessionResponse.json()
    
    if (!sessionData.data?.session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    const newSession = sessionData.data.session
    const newTour = newSession.tour

    // Calcola la nuova balance_due_date (30 giorni prima della partenza)
    const sessionStartDate = new Date(newSession.start)
    const balanceDueDate = new Date(sessionStartDate.getTime() - 30 * 24 * 60 * 60 * 1000)

    // Calcola le differenze di prezzo
    const currentTotal = currentBooking.total_amount
    const newTotal = newSession.price * 100 // Converti in centesimi
    const priceDifference = newTotal - currentTotal

    // Aggiorna la prenotazione con i nuovi dati
    const updateData: any = {
      session_id: newSessionId,
      session_date: newSession.start,
      session_end_date: newSession.end,
      balance_due_date: balanceDueDate.toISOString(),
      updated_at: new Date().toISOString(),
    }

    // Se cambia anche il tour, aggiorna i dati del tour
    if (newTourId && newTourId !== currentBooking.tour_id) {
      updateData.tour_id = newTourId
      updateData.tour_title = newTour.title
      updateData.tour_destination = newTour.title
    }

    // Se il prezzo è cambiato, aggiorna i totali e ricalcola lo stato
    if (priceDifference !== 0) {
      updateData.total_amount = newTotal
      updateData.deposit_amount = Math.round(newSession.deposit * 100)
      
      // Calcola quanto ha già pagato il cliente in base allo stato attuale
      let amountPaid = 0
      switch (currentBooking.status) {
        case 'deposit_paid':
          amountPaid = currentBooking.deposit_amount || 0
          break
        case 'fully_paid':
          amountPaid = currentBooking.total_amount || 0
          break
        case 'cancelled':
        case 'refunded':
          amountPaid = 0
          break
        default:
          amountPaid = 0
      }
      
      // Determina il nuovo stato basandosi su quanto ha pagato vs il nuovo totale
      const newDepositAmount = Math.round(newSession.deposit * 100)
      
      if (amountPaid >= newTotal) {
        // Ha già pagato più del nuovo totale (situazione di credito)
        updateData.status = 'fully_paid'
      } else if (amountPaid >= newDepositAmount) {
        // Ha pagato almeno il nuovo deposito
        updateData.status = 'deposit_paid'
      } else {
        // Ha pagato meno del nuovo deposito
        updateData.status = 'pending'
      }
      
      // Se il cliente aveva un credito (fully_paid) e il nuovo tour costa meno,
      // mantieni lo stato fully_paid ma aggiorna l'importo pagato
      if (currentBooking.status === 'fully_paid' && amountPaid >= newTotal) {
        updateData.status = 'fully_paid'
      }
      
      // Traccia l'importo effettivamente pagato dal cliente
      updateData.amount_paid = amountPaid
    }

    const { data, error } = await adminSupabase
      .from('bookings')
      .update(updateData)
      .eq('id', id)
      .select()

    if (error) {
      console.error('Error updating booking session:', error)
      return NextResponse.json({ error: 'Failed to update booking session' }, { status: 500 })
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // TODO: Invia email di notifica al cliente
    // await sendSessionChangeNotification(currentBooking.user_id, updateData)

    // Calcola informazioni dettagliate per la risposta
    const updatedBooking = data[0]
    const amountPaid = updatedBooking.amount_paid || 0
    const newDepositAmount = Math.round(newSession.deposit * 100)
    const remainingBalance = newTotal - amountPaid
    
    let statusMessage = ''
    if (updatedBooking.status === 'fully_paid') {
      statusMessage = 'Prenotazione completamente pagata'
    } else if (updatedBooking.status === 'deposit_paid') {
      statusMessage = `Acconto pagato (€${(amountPaid / 100).toFixed(2)}). Saldo residuo: €${(remainingBalance / 100).toFixed(2)}`
    } else {
      statusMessage = `Importo pagato: €${(amountPaid / 100).toFixed(2)}. Nuovo deposito richiesto: €${(newDepositAmount / 100).toFixed(2)}`
    }

    return NextResponse.json({ 
      success: true,
      booking: updatedBooking,
      priceDifference,
      newTotal: newTotal / 100, // Converti in euro per la risposta
      amountPaid: amountPaid / 100,
      remainingBalance: remainingBalance / 100,
      newDepositAmount: newDepositAmount / 100,
      statusMessage,
      message: priceDifference > 0 
        ? `La nuova sessione costa €${(priceDifference / 100).toFixed(2)} in più. ${statusMessage}`
        : priceDifference < 0 
        ? `La nuova sessione costa €${Math.abs(priceDifference / 100).toFixed(2)} in meno. ${statusMessage}`
        : `Il prezzo rimane invariato. ${statusMessage}`
    })

  } catch (error) {
    console.error('Admin booking session change API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
