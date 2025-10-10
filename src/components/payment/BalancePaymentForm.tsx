'use client'

import React, { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  CreditCard, 
  Euro, 
  AlertCircle,
  Loader2,
  CheckCircle
} from 'lucide-react'
import { StripeCheckoutButton } from '@/components/payment/StripeCheckoutButton'

interface BalancePaymentFormProps {
  booking: {
    id: string
    tour_id: string
    session_id: string
    total_amount: number
    deposit_amount: number
    status: string
    tour_title?: string
    tour_destination?: string
    session_date?: string
    session_end_date?: string
    quantity?: number
  }
  onPaymentSuccess?: () => void
}

export function BalancePaymentForm({ booking, onPaymentSuccess }: BalancePaymentFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [user, setUser] = useState<{ id: string } | null>(null)
  const supabase = createClient()

  // Get authenticated user
  React.useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser({ id: user.id })
      }
    }
    getUser()
  }, [supabase.auth])

  const balanceAmount = Math.max(booking.total_amount - booking.deposit_amount, 0)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount / 100)
  }

  const handlePaymentSuccess = async () => {
    try {
      setLoading(true)
      setError(null)
      setSuccess(null)

      // Update booking status to fully_paid
      const { error: updateError } = await supabase
        .from('bookings')
        .update({ 
          status: 'fully_paid',
          updated_at: new Date().toISOString()
        })
        .eq('id', booking.id)

      if (updateError) throw updateError

      setSuccess('Saldo pagato con successo! La tua prenotazione è ora completamente pagata.')
      onPaymentSuccess?.()
      
      // Refresh page after 2 seconds
      setTimeout(() => window.location.reload(), 2000)
    } catch (err) {
      console.error('Error updating booking status:', err)
      setError(err instanceof Error ? err.message : 'Errore nell\'aggiornamento dello stato')
    } finally {
      setLoading(false)
    }
  }

  const handlePaymentError = (error: string) => {
    setError(error)
  }

  if (success) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-600">
            <CheckCircle className="w-5 h-5" />
            Pagamento Completato
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  // If balance is 0 or negative, don't show payment form
  if (balanceAmount <= 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-600">
            <CheckCircle className="w-5 h-5" />
            Nessun Saldo da Pagare
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Questa prenotazione è già stata pagata completamente.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Pagamento Saldo
        </CardTitle>
        <CardDescription>
          Completa il pagamento del saldo rimanente per la tua prenotazione
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Payment Summary */}
        <div className="bg-muted/50 p-4 rounded-lg space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Totale prenotazione:</span>
            <span className="font-semibold">{formatCurrency(booking.total_amount)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Acconto già pagato:</span>
            <span className="text-green-600">-{formatCurrency(booking.deposit_amount)}</span>
          </div>
          <div className="border-t pt-2 flex justify-between items-center">
            <span className="font-semibold">Saldo da pagare:</span>
            <span className="text-lg font-bold text-orange-600">{formatCurrency(balanceAmount)}</span>
          </div>
        </div>

        {/* Payment Form */}
        {user ? (
          <StripeCheckoutButton
            amount={balanceAmount}
            currency="eur"
            tourId={booking.tour_id}
            sessionId={booking.session_id}
            userId={user.id}
            paymentType="balance"
            quantity={booking.quantity || 1}
            tourTitle={booking.tour_title || `Tour ${booking.tour_id}`}
            tourDestination={booking.tour_destination || booking.tour_title || 'Destinazione'}
            sessionDate={booking.session_date || ''}
            sessionEndDate={booking.session_end_date || ''}
            sessionPrice={booking.total_amount}
            sessionDeposit={booking.deposit_amount}
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
          />
        ) : (
          <div className="text-center py-4">
            <p className="text-muted-foreground">Caricamento utente...</p>
          </div>
        )}

        {/* Additional Info */}
        <div className="text-sm text-muted-foreground">
          <p>• Il pagamento è sicuro e protetto da Stripe</p>
          <p>• Riceverai una conferma via email</p>
          <p>• Per assistenza contatta prenotazioni@weshoot.it</p>
        </div>
      </CardContent>
    </Card>
  )
}
