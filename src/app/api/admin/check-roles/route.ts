import { NextRequest, NextResponse } from 'next/server'
import { createServerClientSupabase } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClientSupabase()
    
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
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

    // Controlla i ruoli esistenti
    const { data: existingRoles, error: rolesError } = await supabaseAdmin
      .from('user_roles')
      .select('*')

    if (rolesError) {
      console.error('❌ Errore nel recupero ruoli:', rolesError)
      return NextResponse.json({ error: 'Error fetching roles' }, { status: 500 })
    }

    // Se non ci sono ruoli admin, crea un super admin per l'utente corrente
    if (existingRoles.length === 0) {
      console.log(`🔧 Creazione super admin per l'utente: ${user.email}`)
      
      const { error: insertError } = await supabaseAdmin
        .from('user_roles')
        .insert({
          user_id: user.id,
          role: 'super_admin',
          granted_by: user.id // Self-granted
        })
      
      if (insertError) {
        console.error('❌ Errore nella creazione del super admin:', insertError)
        return NextResponse.json({ error: 'Error creating super admin' }, { status: 500 })
      } else {
        console.log('✅ Super admin creato con successo!')
        return NextResponse.json({ 
          message: 'Super admin created successfully',
          roles: [{ user_id: user.id, role: 'super_admin' }]
        })
      }
    }

    return NextResponse.json({ 
      message: 'Roles exist',
      roles: existingRoles
    })

  } catch (error) {
    console.error('❌ Errore generale:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
