import { NextRequest, NextResponse } from 'next/server'

// Test semplice per verificare se il webhook endpoint è raggiungibile
export async function GET() {
  return NextResponse.json({ 
    success: true, 
    message: 'Webhook endpoint is reachable',
    timestamp: new Date().toISOString()
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')
    
    console.log('🧪 Test webhook called at:', new Date().toISOString())
    console.log('🧪 Body length:', body.length)
    console.log('🧪 Signature present:', !!signature)
    console.log('🧪 Headers:', Object.fromEntries(request.headers.entries()))
    
    return NextResponse.json({ 
      success: true, 
      message: 'Test webhook received',
      bodyLength: body.length,
      hasSignature: !!signature,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('❌ Test webhook error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
