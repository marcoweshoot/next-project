import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { step, tourId, sessionId, value, quantity, paymentType, error, metaEvent, event_source_url, timestamp } = body

    if (!step) {
      return NextResponse.json({ error: 'Missing step' }, { status: 400 })
    }

    // Structured log for Vercel runtime — compare with Meta Events Manager:
    // step1_commit ≈ InitiateCheckout, complete_registration ≈ CompleteRegistration, stripe_redirect ≈ AddPaymentInfo
    console.log(
      JSON.stringify({
        type: 'checkout_funnel',
        step,
        metaEvent: metaEvent ?? null,
        tourId: tourId ?? null,
        sessionId: sessionId ?? null,
        value: value ?? null,
        quantity: quantity ?? null,
        paymentType: paymentType ?? null,
        error: error ?? null,
        event_source_url: event_source_url ?? null,
        timestamp: timestamp ?? new Date().toISOString(),
      })
    )

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
