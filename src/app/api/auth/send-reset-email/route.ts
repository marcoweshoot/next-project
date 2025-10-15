import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Usa il service role per bypassare le limitazioni
    const { data, error } = await supabase.auth.admin.generateLink({
      type: 'recovery',
      email: email,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-password`,
      }
    })

    if (error) {
      console.error('Error generating reset link:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Qui potresti inviare l'email tramite un servizio che non modifica i link
    // Per ora, restituiamo il link generato (per debug)
    console.log('Generated reset link:', data.properties?.action_link)

    return NextResponse.json({ 
      success: true, 
      message: 'Reset link generated successfully',
      // In produzione, non restituire il link per sicurezza
      ...(process.env.NODE_ENV === 'development' && { 
        resetLink: data.properties?.action_link 
      })
    })

  } catch (error) {
    console.error('Reset email API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
