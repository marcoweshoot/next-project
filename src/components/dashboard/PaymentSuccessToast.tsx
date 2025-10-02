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
        
        // Create booking
        console.log('🔄 Creating booking for user:', userId)
        fetch('/api/create-booking', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            userId, 
            tourId, 
            sessionId, 
            paymentType, 
            quantity, 
            tourTitle, 
            tourDestination, 
            sessionDate, 
            sessionEndDate, 
            sessionPrice, 
            sessionDeposit, 
            amount,
            stripeSessionId 
          }),
        })
        .then(response => {
          console.log('📊 Create booking response status:', response.status)
          return response.json()
        })
        .then(result => {
          console.log('📊 Create booking result:', result)
          if (result.success) {
            console.log('✅ Booking created successfully!')
            // Clear payment data
            localStorage.removeItem('paymentData')
            // Force dashboard refresh to show new booking
            window.location.reload()
          } else {
            console.error('❌ Booking creation failed:', result.error)
          }
        })
        .catch(error => {
          console.error('❌ Error creating booking:', error)
        })
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
