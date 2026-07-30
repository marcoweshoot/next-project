'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { createEventIdFromStripeSession } from '@/utils/facebook'

const THANK_YOU_DELAY_MS = 2500
const CLAIM_RETRY_ATTEMPTS = 3
const CLAIM_RETRY_DELAY_MS = 1500

type SuccessVariant = 'dashboard' | 'complete_account' | 'login_linked'

interface ClaimData {
  status?: string
  email?: string
}

interface SuccessView {
  variant: SuccessVariant
  redirectUrl: string
  subtitle: string
}

const trackPurchasePixel = async (sessionId: string) => {
  if (typeof window === 'undefined') return

  await new Promise<void>((resolve) => {
    if (window.fbq) {
      resolve()
      return
    }
    let attempts = 0
    const timer = setInterval(() => {
      if (window.fbq || ++attempts >= 20) {
        clearInterval(timer)
        resolve()
      }
    }, 100)
  })

  if (!window.fbq) return

  let purchaseData = sessionStorage.getItem('lastPurchase')
  if (!purchaseData) {
    purchaseData = localStorage.getItem('lastPurchase')
  }

  if (!purchaseData) return

  try {
    const purchase = JSON.parse(purchaseData)
    const purchaseValue = purchase.value || 0

    if (purchaseValue > 0 && !isNaN(purchaseValue) && isFinite(purchaseValue)) {
      const eventId = createEventIdFromStripeSession(sessionId)
      window.fbq('track', 'Purchase', {
        content_name: purchase.tourTitle || 'Tour',
        content_category: 'Viaggi Fotografici',
        value: purchaseValue,
        currency: 'EUR',
        num_items: purchase.quantity || 1,
      }, { eventID: eventId })
    }
  } catch {
    // ignore parse errors
  } finally {
    sessionStorage.removeItem('lastPurchase')
    localStorage.removeItem('lastPurchase')
  }
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const fetchClaimWithRetry = async (sessionId: string): Promise<ClaimData> => {
  let lastError = 'Impossibile verificare il pagamento'

  for (let attempt = 0; attempt < CLAIM_RETRY_ATTEMPTS; attempt++) {
    const claimRes = await fetch(`/api/checkout/claim/${sessionId}`)
    const claimData = await claimRes.json()

    if (claimRes.ok) {
      return claimData
    }

    lastError = claimData.error || lastError

    if (claimRes.status === 404 && attempt < CLAIM_RETRY_ATTEMPTS - 1) {
      await delay(CLAIM_RETRY_DELAY_MS)
      continue
    }

    if (claimRes.status >= 500 && attempt < CLAIM_RETRY_ATTEMPTS - 1) {
      await delay(CLAIM_RETRY_DELAY_MS)
      continue
    }

    throw new Error(lastError)
  }

  throw new Error(lastError)
}

const buildGuestRedirectView = (sessionId: string, claimData: ClaimData): SuccessView => {
  const sessionParam = encodeURIComponent(sessionId)

  if (claimData.status === 'auto_linked' || claimData.status === 'claimed') {
    const email = encodeURIComponent(claimData.email || '')
    return {
      variant: 'login_linked',
      redirectUrl: `/auth/login?email=${email}&message=payment_success_linked&session_id=${sessionParam}`,
      subtitle: 'Accedi con il tuo account per vedere la prenotazione...',
    }
  }

  return {
    variant: 'complete_account',
    redirectUrl: `/checkout/complete-account?session_id=${sessionId}`,
    subtitle: 'Tra pochi secondi completerai il tuo account...',
  }
}

function PaymentSuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [phase, setPhase] = useState<'processing' | 'success' | 'error'>('processing')
  const [error, setError] = useState<string | null>(null)
  const [successView, setSuccessView] = useState<SuccessView | null>(null)

  useEffect(() => {
    const handlePaymentSuccess = async () => {
      try {
        const sessionId = searchParams.get('session_id')

        if (!sessionId) {
          throw new Error('Session ID non trovato')
        }

        await trackPurchasePixel(sessionId)
        localStorage.removeItem('paymentData')

        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        let view: SuccessView

        if (user) {
          view = {
            variant: 'dashboard',
            redirectUrl: '/dashboard?payment=success',
            subtitle: 'Reindirizzamento alla dashboard...',
          }
        } else {
          let claimData: ClaimData = {}
          try {
            claimData = await fetchClaimWithRetry(sessionId)
          } catch {
            // Webhook may still be processing; complete-account can recover from Stripe session data
          }
          view = buildGuestRedirectView(sessionId, claimData)
        }

        setSuccessView(view)
        setPhase('success')
        await delay(THANK_YOU_DELAY_MS)
        router.push(view.redirectUrl)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Errore sconosciuto')
        setPhase('error')
      }
    }

    handlePaymentSuccess()
  }, [searchParams, router])

  if (phase === 'processing') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <h1 className="text-2xl font-semibold">Elaborazione pagamento...</h1>
          <p className="text-muted-foreground">Stiamo confermando la tua prenotazione</p>
        </div>
      </div>
    )
  }

  if (phase === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <span className="text-2xl">❌</span>
          </div>
          <h1 className="text-2xl font-semibold text-red-600">Errore</h1>
          <p className="text-muted-foreground">{error}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Vai alla Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="text-center space-y-4 max-w-md">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
        <h1 className="text-2xl font-semibold">Pagamento completato!</h1>
        <p className="text-muted-foreground">
          La tua prenotazione è stata confermata. Riceverai a breve un&apos;email di riepilogo.
        </p>
        <p className="text-sm text-muted-foreground animate-pulse">
          {successView?.subtitle}
        </p>
      </div>
    </div>
  )
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center space-y-4">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
            <h1 className="text-2xl font-semibold">Caricamento...</h1>
          </div>
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  )
}
