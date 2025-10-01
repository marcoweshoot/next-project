import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Test endpoint per verificare la connessione a Supabase
export async function GET() {
  try {
    console.log('🧪 Testing Supabase connection...')
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Test 1: Verifica connessione
    const { data: testData, error: testError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1)

    if (testError) {
      console.error('❌ Supabase connection error:', testError)
      return NextResponse.json({ 
        success: false, 
        error: 'Supabase connection failed',
        details: testError 
      })
    }

    console.log('✅ Supabase connection successful')

    // Test 2: Verifica struttura tabella bookings
    const { data: bookingsData, error: bookingsError } = await supabase
      .from('bookings')
      .select('*')
      .limit(1)

    if (bookingsError) {
      console.error('❌ Bookings table error:', bookingsError)
      return NextResponse.json({ 
        success: false, 
        error: 'Bookings table access failed',
        details: bookingsError 
      })
    }

    console.log('✅ Bookings table accessible')

    // Test 3: Prova a creare un booking di test
    const testBooking = {
      user_id: '00000000-0000-0000-0000-000000000000', // UUID di test
      tour_id: 'test-tour',
      session_id: 'test-session',
      status: 'deposit_paid',
      deposit_amount: 10000, // 100€ in centesimi
      total_amount: 50000, // 500€ in centesimi
      stripe_payment_intent_id: 'test_pi_123',
      deposit_due_date: new Date().toISOString(),
      balance_due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      quantity: 1,
      tour_title: 'Test Tour',
      tour_destination: 'Test Destination',
      session_date: '2024-12-01',
      session_end_date: '2024-12-05',
    }

    const { data: insertData, error: insertError } = await supabase
      .from('bookings')
      .insert(testBooking)
      .select()

    if (insertError) {
      console.error('❌ Booking insert test failed:', insertError)
      return NextResponse.json({ 
        success: false, 
        error: 'Booking insert test failed',
        details: insertError,
        testBooking 
      })
    }

    console.log('✅ Booking insert test successful')

    // Cleanup: rimuovi il booking di test
    await supabase
      .from('bookings')
      .delete()
      .eq('stripe_payment_intent_id', 'test_pi_123')

    return NextResponse.json({ 
      success: true, 
      message: 'All tests passed',
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasServiceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY
    })

  } catch (error) {
    console.error('❌ Test endpoint error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Test endpoint failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
