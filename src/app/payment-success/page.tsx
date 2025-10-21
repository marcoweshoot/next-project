'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

function PaymentSuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handlePaymentSuccess = async () => {
      try {
        const sessionId = searchParams.get('session_id')
        
        if (!sessionId) {
          throw new Error('Session ID non trovato')
        }

        
        // Check if user is authenticated
        const supabase = createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        
        if (authError || !user) {
          // Redirect to login with success message
          router.push('/auth/login?message=payment_success')
          return
        }
        
        
        // Clear payment data from localStorage (if it was ever there)
        localStorage.removeItem('paymentData')
        
        // Facebook Pixel: Track Purchase event client-side
        console.log('🎯 [FB PIXEL] Payment success page loaded')
        console.log('🎯 [FB PIXEL] window.fbq exists:', typeof window !== 'undefined' && !!window.fbq)
        
        if (typeof window !== 'undefined' && window.fbq) {
          // Try to get purchase details from session storage if available
          const purchaseData = sessionStorage.getItem('lastPurchase')
          console.log('🎯 [FB PIXEL] Retrieved purchase data:', purchaseData)
          
          if (purchaseData) {
            const purchase = JSON.parse(purchaseData)
            console.log('🎯 [FB PIXEL] Parsed purchase data:', purchase)
            
            const eventData = {
              content_name: purchase.tourTitle || 'Tour',
              content_category: 'Viaggi Fotografici',
              value: purchase.value || 0,
              currency: 'EUR',
              num_items: purchase.quantity || 1
            }
            console.log('🎯 [FB PIXEL] Tracking Purchase event with data:', eventData)
            
            window.fbq('track', 'Purchase', eventData)
            console.log('✅ [FB PIXEL] Purchase event sent successfully!')
            
            // Clean up
            sessionStorage.removeItem('lastPurchase')
            console.log('🧹 [FB PIXEL] Cleaned up sessionStorage')
          } else {
            console.warn('⚠️ [FB PIXEL] No purchase data found in sessionStorage')
          }
        } else {
          console.error('❌ [FB PIXEL] Facebook Pixel not initialized (window.fbq not found)')
        }
        
        // Redirect to dashboard with success parameter
        setTimeout(() => {
          router.push('/dashboard?payment=success')
        }, 2000)
      } catch (error) {
        console.error('❌ Error handling payment success:', error)
        setError(error instanceof Error ? error.message : 'Errore sconosciuto')
      } finally {
        setLoading(false)
      }
    }

    handlePaymentSuccess()
  }, [searchParams, router])

  if (loading) {
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

  if (error) {
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
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
        <h1 className="text-2xl font-semibold">Pagamento Completato!</h1>
        <p className="text-muted-foreground">La tua prenotazione è stata confermata</p>
        <p className="text-sm text-muted-foreground">Reindirizzamento alla dashboard...</p>
      </div>
    </div>
  )
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <h1 className="text-2xl font-semibold">Caricamento...</h1>
        </div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  )
}
