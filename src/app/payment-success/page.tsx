'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import { CheckCircle, Loader2 } from 'lucide-react'

function PaymentSuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handlePaymentSuccess = async () => {
      try {
        const sessionId = searchParams.get('session_id')
        
        if (!sessionId) {
          throw new Error('Session ID non trovato')
        }

        // Get payment data from localStorage
        const paymentData = localStorage.getItem('paymentData')
        if (!paymentData) {
          throw new Error('Dati di pagamento non trovati')
        }

        const { 
          userId, 
          tourId, 
          sessionId: storedSessionId, 
          paymentType, 
          quantity = 1, 
          tourTitle, 
          tourDestination, 
          sessionDate, 
          sessionEndDate, 
          sessionPrice, 
          sessionDeposit, 
          amount 
        } = JSON.parse(paymentData)

        console.log('🔄 Creating booking for user:', userId)

        // Create booking
        const response = await fetch('/api/create-booking', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            userId, 
            tourId, 
            sessionId: storedSessionId, 
            paymentType, 
            quantity, 
            tourTitle, 
            tourDestination, 
            sessionDate, 
            sessionEndDate, 
            sessionPrice, 
            sessionDeposit, 
            amount,
            stripeSessionId: sessionId 
          }),
        })

        const result = await response.json()
        console.log('📊 Create booking result:', result)

        if (result.success) {
          console.log('✅ Booking created successfully!')
          
          // Clear payment data
          localStorage.removeItem('paymentData')
          
          // Show success toast
          toast({
            title: "Pagamento completato! 🎉",
            description: "La tua prenotazione è stata confermata. Controlla la sezione 'Prenotazioni' per i dettagli.",
          })

          // Redirect to dashboard after 2 seconds
          setTimeout(() => {
            router.push('/dashboard')
          }, 2000)
        } else {
          throw new Error(result.error || 'Errore nella creazione del booking')
        }
      } catch (error) {
        console.error('❌ Error handling payment success:', error)
        setError(error instanceof Error ? error.message : 'Errore sconosciuto')
      } finally {
        setLoading(false)
      }
    }

    handlePaymentSuccess()
  }, [searchParams, router, toast])

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
