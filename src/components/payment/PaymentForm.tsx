'use client'

import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2 } from 'lucide-react'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface PaymentFormProps {
  amount: number
  currency?: string
  tourId: string
  sessionId: string
  userId: string
  paymentType: 'deposit' | 'balance'
  onSuccess?: () => void
  onError?: (error: string) => void
}

function CheckoutForm({ 
  amount, 
  currency = 'eur', 
  tourId, 
  sessionId, 
  userId, 
  paymentType,
  onSuccess,
  onError 
}: PaymentFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Create payment intent
      const response = await fetch('/api/stripe/create-payment-intent', {
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
        }),
      })

      const { clientSecret, error: apiError } = await response.json()

      if (apiError) {
        throw new Error(apiError)
      }

      // Confirm payment
      const { error: stripeError } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/dashboard`,
        },
      })

      if (stripeError) {
        throw new Error(stripeError.message)
      }

      // Payment succeeded
      onSuccess?.()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      onError?.(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button 
        type="submit" 
        disabled={!stripe || loading} 
        className="w-full"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Processing...
          </>
        ) : (
          `Pay €${(amount / 100).toFixed(2)}`
        )}
      </Button>
    </form>
  )
}

export function PaymentForm(props: PaymentFormProps) {
  const { amount, currency = 'eur', paymentType } = props

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {paymentType === 'deposit' ? 'Pay Deposit' : 'Pay Balance'}
        </CardTitle>
        <CardDescription>
          {paymentType === 'deposit' 
            ? 'Pay the deposit to secure your spot'
            : 'Complete your payment'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Elements 
          stripe={stripePromise}
          options={{
            mode: 'payment',
            amount: amount,
            currency: currency,
            appearance: {
              theme: 'stripe',
            },
          }}
        >
          <CheckoutForm {...props} />
        </Elements>
      </CardContent>
    </Card>
  )
}
