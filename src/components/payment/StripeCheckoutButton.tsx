'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { CreditCard, Loader2 } from 'lucide-react'

interface StripeCheckoutButtonProps {
  amount: number
  currency: string
  tourId: string
  sessionId: string
  userId: string
  paymentType: 'deposit' | 'balance'
  quantity?: number
  tourTitle?: string
  tourDestination?: string
  sessionDate?: string
  sessionEndDate?: string
  sessionPrice?: number
  sessionDeposit?: number
  onSuccess?: () => void
  onError?: (error: string) => void
}

export function StripeCheckoutButton({
  amount,
  currency,
  tourId,
  sessionId,
  userId,
  paymentType,
  quantity = 1,
  tourTitle,
  tourDestination,
  sessionDate,
  sessionEndDate,
  sessionPrice,
  sessionDeposit,
  onSuccess,
  onError,
}: StripeCheckoutButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleCheckout = async () => {
    setLoading(true)
    
    try {
      // Crea checkout session
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          currency,
          tourId,
          sessionId,
          userId,
          paymentType,
          quantity,
          tourTitle,
          tourDestination,
          sessionDate,
          sessionEndDate,
          sessionPrice,
          sessionDeposit,
        }),
      })

      const { url, error } = await response.json()

      if (error) {
        throw new Error(error)
      }

      // Save purchase data for Facebook Pixel tracking
      sessionStorage.setItem('lastPurchase', JSON.stringify({
        tourTitle,
        value: amount / 100, // Convert from cents
        quantity,
        tourDestination,
        sessionDate
      }))

      // Redirect a Stripe Checkout
      window.location.href = url
      
    } catch (error) {
      console.error('Checkout error:', error)
      onError?.(error instanceof Error ? error.message : 'Checkout failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      onClick={handleCheckout}
      disabled={loading}
      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Elaborazione...
        </>
      ) : (
        <>
          <CreditCard className="w-4 h-4 mr-2" />
          Paga {amount / 100}€
        </>
      )}
    </Button>
  )
}
