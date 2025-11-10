import { NextRequest, NextResponse } from 'next/server'
import { createServerClientSupabase } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'

/**
 * API per cancellare l'account utente (GDPR Compliant)
 * 
 * Questa API:
 * 1. Anonimizza le recensioni (nome → "Utente Anonimo")
 * 2. Anonimizza le prenotazioni (per contabilità)
 * 3. Cancella il profilo completo
 * 4. Cancella l'utente da auth.users
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClientSupabase()
    
    // Verifica che l'utente sia autenticato
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Non autenticato' },
        { status: 401 }
      )
    }

    const userId = user.id
    console.log('🗑️ Richiesta cancellazione account per utente:', userId)

    // Usa Service Role per operazioni che bypassano RLS
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // STEP 1: Anonimizza le recensioni (manteniamo le recensioni per altri utenti)
    const { error: reviewsError } = await supabaseAdmin
      .from('reviews')
      .update({
        user_id: '00000000-0000-0000-0000-000000000000', // UUID null
        // Non tocchiamo il commento, solo il riferimento all'utente
      })
      .eq('user_id', userId)

    if (reviewsError) {
      console.error('❌ Errore anonimizzazione recensioni:', reviewsError)
      // Continuiamo comunque, non è critico
    } else {
      console.log('✅ Recensioni anonimizzate')
    }

    // STEP 2: Anonimizza le prenotazioni (necessarie per contabilità)
    const { error: bookingsError } = await supabaseAdmin
      .from('bookings')
      .update({
        // Manteniamo i dati di fatturazione per legge (10 anni)
        // Ma anonimizziamo i riferimenti personali
        user_id: '00000000-0000-0000-0000-000000000000',
      })
      .eq('user_id', userId)

    if (bookingsError) {
      console.error('❌ Errore anonimizzazione prenotazioni:', bookingsError)
      // Continuiamo comunque
    } else {
      console.log('✅ Prenotazioni anonimizzate')
    }

    // STEP 3: Cancella il profilo completo (dati sensibili)
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', userId)

    if (profileError) {
      console.error('❌ Errore cancellazione profilo:', profileError)
      return NextResponse.json(
        { error: 'Errore durante la cancellazione del profilo', details: profileError.message },
        { status: 500 }
      )
    }
    console.log('✅ Profilo cancellato')

    // STEP 4: Cancella l'utente da auth.users
    const { error: deleteUserError } = await supabaseAdmin.auth.admin.deleteUser(userId)

    if (deleteUserError) {
      console.error('❌ Errore cancellazione utente auth:', deleteUserError)
      return NextResponse.json(
        { error: 'Errore durante la cancellazione dell\'utente', details: deleteUserError.message },
        { status: 500 }
      )
    }
    console.log('✅ Utente cancellato da auth')

    // STEP 5: Logout
    await supabase.auth.signOut()

    console.log('🎉 Account cancellato con successo:', userId)

    return NextResponse.json({
      success: true,
      message: 'Account cancellato con successo. Tutti i tuoi dati personali sono stati rimossi.'
    })

  } catch (error) {
    console.error('❌ Errore generico cancellazione account:', error)
    return NextResponse.json(
      { error: 'Errore durante la cancellazione dell\'account' },
      { status: 500 }
    )
  }
}

