import { NextRequest, NextResponse } from 'next/server'
import { createServerClientSupabase } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'
import { sendServerEvent, UserData } from '@/lib/facebook-capi' // Import CAPI helper

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, email, firstName, lastName, privacyAccepted = true, marketingAccepted = false, fbEventId } = body

    console.log('📝 Creating profile:', { userId, email, firstName, lastName, privacyAccepted, marketingAccepted, fbEventId })

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    if (!privacyAccepted) {
      console.error('❌ Privacy not accepted:', privacyAccepted)
      return NextResponse.json({ error: 'Privacy policy must be accepted' }, { status: 400 })
    }

    // Usa Service Role per bypassare RLS
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

    // Usa la funzione RPC che bypassa RLS
    console.log('🔄 Calling RPC with params:', {
      user_id: userId,
      user_email: email,
      user_first_name: firstName,
      user_last_name: lastName,
      user_privacy_accepted: privacyAccepted,
      user_marketing_accepted: marketingAccepted
    })

    const { error: rpcError } = await supabaseAdmin.rpc('create_user_profile', {
      user_id: userId,
      user_email: email || '',
      user_first_name: firstName || '',
      user_last_name: lastName || '',
      user_privacy_accepted: privacyAccepted,
      user_marketing_accepted: marketingAccepted
    })

    if (rpcError) {
      console.error('❌ Error creating profile via RPC:', rpcError)
      console.error('❌ RPC Error details:', JSON.stringify(rpcError, null, 2))
      
      // Fallback: usa insert diretto con service role
      const { data, error: insertError } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: userId,
          email: email || '',
          first_name: firstName || '',
          last_name: lastName || '',
          full_name: `${firstName || ''} ${lastName || ''}`.trim(),
          country: 'IT',
          privacy_accepted: privacyAccepted,
          privacy_accepted_at: privacyAccepted ? new Date().toISOString() : null,
          marketing_accepted: marketingAccepted,
          marketing_accepted_at: marketingAccepted ? new Date().toISOString() : null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()

      if (insertError) {
        console.error('❌ Error creating profile via insert:', insertError)
        return NextResponse.json({ 
          error: 'Database error',
          details: insertError.message,
          code: insertError.code
        }, { status: 500 })
      }

      console.log('✅ Profile created successfully via fallback insert')
      console.log('📊 Fallback insert data:', data?.[0])
      return NextResponse.json({
        success: true,
        message: 'Profile created successfully (fallback)',
        profile: data?.[0],
        usedFallback: true
      })
    }

    console.log('✅ Profile created successfully via RPC')

    // --- Track CompleteRegistration event with CAPI ---
    // This is a non-blocking call (fire and forget)
    try {
      const ip = request.headers.get('x-forwarded-for')
      const userAgent = request.headers.get('user-agent')
      // Use the event_id from the client, or generate a fallback
      const eventId = fbEventId || `registration_${userId}_${Date.now()}`

      const userData: UserData = {
        external_id: userId,
        em: email,
        fn: firstName,
        ln: lastName,
        client_ip_address: ip || undefined,
        client_user_agent: userAgent || undefined,
      }

      sendServerEvent({
        event_name: 'CompleteRegistration',
        event_id: eventId,
        event_source_url: request.headers.get('referer') || process.env.NEXT_PUBLIC_SITE_URL,
        user_data: userData,
        custom_data: {
          currency: 'EUR',
          // You can add a value if registration has a monetary value, otherwise omit it
        },
      })
      
      console.log('✅ [CAPI] Sent CompleteRegistration event for user:', userId)
    } catch (capiError) {
      console.error('❌ [CAPI] Failed to send CompleteRegistration event:', capiError)
      // Do not block the response for CAPI errors
    }
    // ------------------------------------------------

    return NextResponse.json({ success: true, message: 'Profile created successfully' })

  } catch (error) {
    console.error('❌ Create profile error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
