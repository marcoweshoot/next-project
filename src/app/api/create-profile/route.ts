import { NextRequest, NextResponse } from 'next/server'
import { createServerClientSupabase } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, email, firstName, lastName, privacyAccepted = true, marketingAccepted = false } = body

    console.log('📝 Creating profile:', { userId, email, firstName, lastName, privacyAccepted, marketingAccepted })

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
      return NextResponse.json({
        success: true,
        message: 'Profile created successfully (fallback)',
        profile: data?.[0]
      })
    }

    console.log('✅ Profile created successfully via RPC')
    return NextResponse.json({
      success: true,
      message: 'Profile created successfully',
      userId
    })

  } catch (error) {
    console.error('❌ Create profile error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
