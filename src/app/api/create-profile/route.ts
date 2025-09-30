import { NextRequest, NextResponse } from 'next/server'
import { createServerClientSupabase } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    const supabase = await createServerClientSupabase()

    console.log('🔨 Creating profile for userId:', userId)

    // Crea il profilo
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        first_name: '',
        last_name: '',
        country: 'IT',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()

    if (error) {
      console.error('❌ Error creating profile:', error)
      return NextResponse.json({ 
        error: 'Database error',
        details: error.message,
        code: error.code
      }, { status: 500 })
    }

    console.log('✅ Profile created successfully:', data[0])

    return NextResponse.json({
      message: 'Profile created successfully',
      profile: data[0]
    })

  } catch (error) {
    console.error('❌ Create profile error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
