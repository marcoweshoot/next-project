import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { 
      transactionId, 
      value, 
      currency = 'EUR', 
      contentName, 
      contentCategory = 'Viaggi Fotografici',
      numItems = 1
    } = await request.json()

    // Log per debug
    console.log('📊 Purchase tracking:', {
      transactionId,
      value,
      currency,
      contentName,
      contentCategory,
      numItems
    })

    // In un'applicazione reale, qui potresti:
    // 1. Inviare a Facebook Conversions API
    // 2. Inviare a Google Analytics Measurement Protocol
    // 3. Salvare in database per analytics
    // 4. Inviare webhook a servizi di tracking

    return NextResponse.json({ 
      success: true, 
      message: 'Purchase tracked successfully' 
    })

  } catch (error) {
    console.error('Error tracking purchase:', error)
    return NextResponse.json(
      { error: 'Failed to track purchase' },
      { status: 500 }
    )
  }
}
