'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'

export function PaymentSuccessToast() {
  const { toast } = useToast()
  const router = useRouter()
  const hasShownToast = useRef(false)

  useEffect(() => {
    // Prevent multiple toasts
    if (hasShownToast.current) return
    
    hasShownToast.current = true

    // Get payment data from localStorage
    const paymentData = localStorage.getItem('paymentData')
    if (paymentData) {
      try {
        const { userId, tourId, sessionId, paymentType, quantity = 1, tourTitle, tourDestination, sessionDate, sessionEndDate, sessionPrice, sessionDeposit, amount } = JSON.parse(paymentData)
        
        // Try to get stripeSessionId from URL parameters
        const urlParams = new URLSearchParams(window.location.search)
        const stripeSessionId = urlParams.get('session_id')
        
        console.log('🔍 Stripe session ID from URL:', stripeSessionId)
        
        // Booking is created automatically by Stripe webhook
        console.log('✅ Payment successful! Booking will be created by webhook')
        // Clear payment data
        localStorage.removeItem('paymentData')
      } catch (error) {
        console.error('❌ Error parsing payment data:', error)
      }
    }

    // Show success toast
    toast({
      title: "Pagamento completato! 🎉",
      description: "La tua prenotazione è stata confermata. Controlla la sezione 'Prenotazioni' per i dettagli.",
    })

    // Clean up URL parameter after showing toast
    const timer = setTimeout(() => {
      router.replace('/dashboard')
    }, 100)

    return () => clearTimeout(timer)
  }, []) // Remove dependencies to prevent re-renders

  return null
}
