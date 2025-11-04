import { NextRequest, NextResponse } from 'next/server'
import { sendServerEvent, UserData } from '@/lib/facebook-capi'
import { createServerClientSupabase } from '@/lib/supabase/server'
import { getCookies } from 'cookies-next'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { event_name, event_id, custom_data, event_source_url } = body

    if (!event_name || !event_id || !custom_data || !event_source_url) {
      return NextResponse.json({ error: 'Missing required event parameters' }, { status: 400 })
    }

    const ip = request.headers.get('x-forwarded-for') ?? '127.0.0.1'
    const userAgent = request.headers.get('user-agent')
    
    // Leggi i cookie _fbp e _fbc dalla richiesta
    const cookies = getCookies({ req: request });
    const fbp = cookies['_fbp'] || undefined;
    const fbc = cookies['_fbc'] || undefined;

    // Recupera i dati dell'utente loggato per l'Advanced Matching
    const supabase = await createServerClientSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    
    const userData: UserData = {
      client_ip_address: ip,
      client_user_agent: userAgent,
      fbp,
      fbc,
    }

    if (user) {
      userData.external_id = user.id
      userData.em = user.email

      // Prova a recuperare dati più dettagliati dal profilo
      const { data: profile } = await supabase
        .from('profiles')
        .select('first_name, last_name, mobile_phone')
        .eq('id', user.id)
        .single()
      
      if (profile) {
        userData.fn = profile.first_name
        userData.ln = profile.last_name
        userData.ph = profile.mobile_phone
      }
    }

    // Invia l'evento all'API Conversions in modo non bloccante
    // Non usiamo await qui per non far attendere il client
    sendServerEvent({
      event_name,
      event_id,
      event_source_url,
      user_data: userData,
      custom_data,
    })

    // Rispondi immediatamente al client senza attendere la risposta di Facebook
    return NextResponse.json({ success: true, message: 'Event received and is being processed.' })

  } catch (error) {
    console.error('❌ [API /track-fb-event] Error processing event:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
