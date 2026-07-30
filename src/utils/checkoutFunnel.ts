/**
 * Internal checkout funnel tracking.
 *
 * Meta Events Manager mapping:
 * - modal_open            → diagnostic only
 * - step1_commit          → InitiateCheckout
 * - stripe_redirect       → AddPaymentInfo
 * - complete_registration → CompleteRegistration (post-payment on /checkout/complete-account)
 * - checkout_error        → diagnostic
 * - modal_abandon         → diagnostic
 */

export type CheckoutFunnelStep =
  | 'modal_open'
  | 'step1_commit'
  | 'stripe_redirect'
  | 'complete_registration'
  | 'checkout_error'
  | 'modal_abandon'

export interface CheckoutFunnelPayload {
  step: CheckoutFunnelStep
  tourId?: string
  sessionId?: string
  value?: number
  quantity?: number
  paymentType?: string
  error?: string
  metaEvent?: string
}

export const trackCheckoutFunnel = (payload: CheckoutFunnelPayload): void => {
  if (typeof window === 'undefined') return

  if (process.env.NODE_ENV === 'development') {
    console.log('[CHECKOUT FUNNEL]', payload)
  }

  fetch('/api/track-funnel-event', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...payload,
      event_source_url: window.location.href,
      timestamp: new Date().toISOString(),
    }),
  }).catch(() => {
    // non-blocking
  })
}
