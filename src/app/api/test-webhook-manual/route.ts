import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Test manuale del webhook per utenti anonimi
export async function POST() {
  try {
    console.log('🧪 Testing manual webhook simulation...')
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Simula la creazione di un utente anonimo
    const testEmail = `test_${Date.now()}@temp.com`
    
    console.log('👤 Creating test user:', testEmail)
    
    const { data: newUser, error: userError } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: `temp_password_${Date.now()}`,
      email_confirm: true,
    })

    if (userError) {
      console.error('❌ Error creating user:', userError)
      return NextResponse.json({ 
        success: false, 
        error: 'User creation failed',
        details: userError 
      })
    }

    console.log('✅ User created:', newUser.user.id)

    // Simula la creazione di un booking
    const testBooking = {
      user_id: newUser.user.id,
      tour_id: 'test-tour-123',
      session_id: 'test-session-456',
      status: 'deposit_paid',
      deposit_amount: 10000, // 100€ in centesimi
      total_amount: 50000, // 500€ in centesimi
      stripe_payment_intent_id: `test_pi_${Date.now()}`,
      deposit_due_date: new Date().toISOString(),
      balance_due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      quantity: 1,
      tour_title: 'Test Tour Islanda',
      tour_destination: 'Islanda',
      session_date: '2024-12-01',
      session_end_date: '2024-12-05',
    }

    console.log('📝 Creating test booking...')
    
    const { data: insertData, error: insertError } = await supabase
      .from('bookings')
      .insert(testBooking)
      .select()

    if (insertError) {
      console.error('❌ Booking insert failed:', insertError)
      return NextResponse.json({ 
        success: false, 
        error: 'Booking insert failed',
        details: insertError,
        testBooking 
      })
    }

    console.log('✅ Booking created:', insertData)

    // Test invio email recovery
    console.log('📧 Testing recovery email...')
    
    const { error: emailError } = await supabase.auth.admin.generateLink({
      type: 'recovery',
      email: testEmail,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/reset-password`
      }
    })

    if (emailError) {
      console.error('❌ Email send failed:', emailError)
      return NextResponse.json({ 
        success: false, 
        error: 'Email send failed',
        details: emailError 
      })
    }

    console.log('✅ Recovery email sent')

    // Cleanup: rimuovi i dati di test
    await supabase
      .from('bookings')
      .delete()
      .eq('stripe_payment_intent_id', testBooking.stripe_payment_intent_id)

    await supabase.auth.admin.deleteUser(newUser.user.id)

    return NextResponse.json({ 
      success: true, 
      message: 'Manual webhook test completed successfully',
      testUser: newUser.user.id,
      testBooking: insertData[0]
    })

  } catch (error) {
    console.error('❌ Manual webhook test error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Manual webhook test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
