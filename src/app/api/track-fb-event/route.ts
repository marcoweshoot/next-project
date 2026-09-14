import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { sendServerEvent, UserData } from '@/lib/facebook-capi'
import { createServerClientSupabase } from '@/lib/supabase/server'
import { getCookies } from 'cookies-next'

// Questo endpoint inoltra eventi alla Conversions API con il token di WeShoot, quindi tutto
// ciò che arriva dal body è input non fidato: senza queste allowlist chiunque può scrivere
// nel dataset (PageView fantasma, Purchase con value arbitrario) e rovinare pubblici,
// ottimizzazione e attribuzione.

// Solo gli eventi che il browser emette davvero verso questo endpoint.
// Purchase e CompleteRegistration sono volutamente esclusi: partono già server-side da
// webhook-stripe, zero-payment, create-profile e checkout/claim, che chiamano
// sendServerEvent direttamente. Tenerli fuori blocca l'iniezione di acquisti finti.
const ALLOWED_EVENT_NAMES = new Set([
  'ViewContent',
  'Lead',
  'AddToCart',
  'InitiateCheckout',
  'AddPaymentInfo',
])

const ALLOWED_HOSTNAMES = new Set(['www.weshoot.it', 'weshoot.it'])

// Identificativo anonimo di prima parte, usato come `external_id` quando il visitatore non è
// loggato. Senza di esso un evento da utente anonimo arriva a Meta con il solo IP e user agent,
// che non contano come chiavi di corrispondenza: la Diagnostica del pixel segnala
// "Invia i parametri dei dati degli utenti mancanti" e quegli eventi non sono utilizzabili
// né per l'attribuzione né per l'ottimizzazione.
const ANON_ID_COOKIE = 'ws_eid'
const ANON_ID_MAX_AGE = 60 * 60 * 24 * 365 // 1 anno

function isAllowedHostname(hostname: string): boolean {
  if (ALLOWED_HOSTNAMES.has(hostname)) return true
  // In sviluppo accetta anche il server locale; i preview deploy *.vercel.app restano esclusi
  // di proposito, così non inquinano il dataset di produzione.
  return process.env.NODE_ENV !== 'production' && (hostname === 'localhost' || hostname === '127.0.0.1')
}

// Persiste l'id anonimo solo quando è appena stato generato, e solo sulle risposte di successo:
// una richiesta rifiutata non deve ricevere un identificativo.
function withAnonId(res: NextResponse, anonId: string, isNew: boolean): NextResponse {
  if (isNew) {
    res.cookies.set(ANON_ID_COOKIE, anonId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: ANON_ID_MAX_AGE,
      path: '/',
    })
  }
  return res
}

function hostnameOf(url: string | null): string | null {
  if (!url) return null
  try {
    return new URL(url).hostname
  } catch {
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { event_name, event_id, custom_data, event_source_url } = body

    if (!event_name || !event_id || !custom_data || !event_source_url) {
      return NextResponse.json({ error: 'Missing required event parameters' }, { status: 400 })
    }

    if (!ALLOWED_EVENT_NAMES.has(event_name)) {
      return NextResponse.json({ error: 'Event not allowed' }, { status: 400 })
    }

    const sourceHostname = hostnameOf(event_source_url)
    if (!sourceHostname || !isAllowedHostname(sourceHostname)) {
      return NextResponse.json({ error: 'Invalid event source URL' }, { status: 400 })
    }

    // Le chiamate legittime sono fetch() same-origin da una pagina del sito, quindi Origin è
    // sempre presente. Un chiamante server-to-server di norma non lo manda.
    const originHostname = hostnameOf(request.headers.get('origin'))
    if (!originHostname || !isAllowedHostname(originHostname)) {
      return NextResponse.json({ error: 'Invalid origin' }, { status: 400 })
    }

    // x-forwarded-for può essere una lista "client, proxy1, proxy2": Meta vuole un IP singolo.
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1'
    const userAgent = request.headers.get('user-agent')
    
    // Leggi i cookie _fbp e _fbc dalla richiesta
    let fbp: string | undefined
    let fbc: string | undefined
    let anonId = request.cookies.get(ANON_ID_COOKIE)?.value
    // Alla primissima visita il cookie non c'è ancora: generalo subito, così anche questo
    // evento parte con un external_id invece di aspettare la richiesta successiva.
    const isNewAnonId = !anonId
    if (!anonId) anonId = randomUUID()

    try {
      const cookies = getCookies({ req: request });
      fbp = cookies['_fbp'] || undefined;
      fbc = cookies['_fbc'] || undefined;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('⚠️ [API /track-fb-event] Error reading cookies with getCookies, trying manual parsing:', error)
      }
      
      // Fallback: leggi i cookie manualmente dall'header
      const cookieHeader = request.headers.get('cookie')
      if (cookieHeader) {
        const cookieMatch = cookieHeader.match(/_fbp=([^;]+)/)
        if (cookieMatch) fbp = cookieMatch[1]
        
        const fbcMatch = cookieHeader.match(/_fbc=([^;]+)/)
        if (fbcMatch) fbc = fbcMatch[1]
      }
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('📊 [API /track-fb-event] Cookies received:', {
        hasFbp: !!fbp,
        hasFbc: !!fbc,
        fbpValue: fbp ? `${fbp.substring(0, 10)}...` : 'missing',
        fbcValue: fbc ? `${fbc.substring(0, 10)}...` : 'missing'
      })
    }

    // Recupera i dati dell'utente loggato per l'Advanced Matching
    const supabase = await createServerClientSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    
    const userData: UserData = {
      client_ip_address: ip,
      client_user_agent: userAgent,
      fbp,
      fbc,
      // Sempre presente: l'id dell'utente loggato, altrimenti quello anonimo di prima parte.
      // Garantisce almeno una chiave di corrispondenza su ogni evento.
      external_id: user?.id ?? anonId,
    }

    if (user) {
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

      // Log della qualità dei dati utente
      const dataQuality = {
        hasEmail: !!userData.em,
        hasPhone: !!userData.ph,
        hasFirstName: !!userData.fn,
        hasLastName: !!userData.ln,
        hasExternalId: !!userData.external_id,
        hasFbp: !!userData.fbp,
        hasFbc: !!userData.fbc,
        hasIp: !!userData.client_ip_address && userData.client_ip_address !== '127.0.0.1',
        hasUserAgent: !!userData.client_user_agent
      }
      
      const matchingScore = Object.values(dataQuality).filter(Boolean).length
      const maxScore = Object.keys(dataQuality).length
      
      if (process.env.NODE_ENV === 'development') {
        console.log('📊 [API /track-fb-event] User data quality:', {
          ...dataQuality,
          matchingScore: `${matchingScore}/${maxScore}`,
          quality: matchingScore >= 7 ? '✅ Excellent' : matchingScore >= 5 ? '⚠️ Good' : '❌ Poor'
        })
      }
    } else {
      if (process.env.NODE_ENV === 'development') {
        console.warn('⚠️ [API /track-fb-event] No user logged in - limited matching data available')
      }
    }

    // Invia l'evento all'API Conversions e attendi la risposta
    const success = await sendServerEvent({
      event_name,
      event_id,
      event_source_url,
      user_data: userData,
      custom_data,
    })

    if (!success) {
      if (process.env.NODE_ENV === 'development') {
        console.error('❌ [API /track-fb-event] Failed to send event to Facebook CAPI')
      }
      // Restituisci comunque successo al client per non bloccare il flusso utente
      return withAnonId(NextResponse.json({
        success: true,
        message: 'Event received but failed to send to Facebook',
        warning: 'CAPI event not sent'
      }), anonId, isNewAnonId)
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('✅ [API /track-fb-event] Event sent successfully to Facebook CAPI', {
        event_name,
        event_id
      })
    }

    return withAnonId(
      NextResponse.json({ success: true, message: 'Event sent successfully to Facebook.' }),
      anonId,
      isNewAnonId
    )

  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('❌ [API /track-fb-event] Error processing event:', error)
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
