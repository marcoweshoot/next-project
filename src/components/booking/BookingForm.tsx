'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Calendar, Euro, Users, CreditCard } from 'lucide-react'
import { StripeCheckoutButton } from '@/components/payment/StripeCheckoutButton'
import { GiftCardInput } from '@/components/gift-card/GiftCardInput'
import { formatCurrency } from '@/lib/giftCards'

interface TourSession {
  id: string
  start: string
  end: string
  price: number
  maxPax: number
  status: string
}

interface BookingFormProps {
  tour: {
    id: string
    title: string
    slug: string
  }
  session: TourSession
  onBookingSuccess?: () => void
}

export function BookingForm({ tour, session, onBookingSuccess }: BookingFormProps) {
  const [step, setStep] = useState<'info' | 'payment'>('info')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
  const [giftCardCode, setGiftCardCode] = useState<string | undefined>(undefined)
  const [giftCardDiscount, setGiftCardDiscount] = useState<number>(0)
  const supabase = createClient()

  // Get current user
  useState(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()
  })

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Accesso Richiesto</CardTitle>
          <CardDescription>
            Devi effettuare il login per prenotare questo viaggio
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <a href="/auth/login">Accedi</a>
          </Button>
        </CardContent>
      </Card>
    )
  }

  const depositAmount = Math.round(session.price * 0.5) // 50% deposit
  const balanceAmount = session.price - depositAmount
  
  // Calculate final amount after gift card
  const finalDepositAmount = Math.max(0, depositAmount - (giftCardDiscount / 100))

  const handlePaymentSuccess = () => {
    setStep('payment')
    onBookingSuccess?.()
  }

  const handlePaymentError = (error: string) => {
    setError(error)
  }
  
  const handleApplyGiftCard = (code: string, discount: number) => {
    setGiftCardCode(code)
    setGiftCardDiscount(discount)
    setError(null)
  }
  
  const handleRemoveGiftCard = () => {
    setGiftCardCode(undefined)
    setGiftCardDiscount(0)
  }

  if (step === 'payment') {
    return (
      <div className="space-y-4">
        <Alert>
          <AlertDescription>
            ✅ Deposito pagato con successo! 
            Il saldo di €{balanceAmount} sarà dovuto 30 giorni prima della partenza.
          </AlertDescription>
        </Alert>
        
        <Button onClick={() => setStep('info')} variant="outline">
          Torna alle informazioni
        </Button>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Prenota {tour.title}
        </CardTitle>
        <CardDescription>
          Completa la prenotazione per questa sessione
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Session Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Date</p>
              <p className="text-sm text-muted-foreground">
                {new Date(session.start).toLocaleDateString('it-IT')} - {' '}
                {new Date(session.end).toLocaleDateString('it-IT')}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Euro className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Prezzo</p>
              <p className="text-sm text-muted-foreground">€{session.price}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Posti</p>
              <p className="text-sm text-muted-foreground">{session.maxPax} max</p>
            </div>
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Status:</span>
          <Badge variant={session.status === 'confirmed' ? 'default' : 'secondary'}>
            {session.status}
          </Badge>
        </div>

        {/* Gift Card Input */}
        <GiftCardInput
          onApply={handleApplyGiftCard}
          onRemove={handleRemoveGiftCard}
          appliedCode={giftCardCode}
          appliedDiscount={giftCardDiscount}
        />

        {/* Payment Breakdown */}
        <div className="border rounded-lg p-4 space-y-2">
          <h4 className="font-medium">Riepilogo Pagamento</h4>
          <div className="flex justify-between text-sm">
            <span>Prezzo totale:</span>
            <span>€{session.price}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Acconto (50%):</span>
            <span>€{depositAmount}</span>
          </div>
          {giftCardDiscount > 0 && (
            <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
              <span>Sconto Gift Card:</span>
              <span>-{formatCurrency(giftCardDiscount)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span>Saldo:</span>
            <span>€{balanceAmount}</span>
          </div>
          <div className="border-t pt-2">
            <div className="flex justify-between font-medium text-lg">
              <span>Da pagare ora:</span>
              <span className={giftCardDiscount > 0 ? 'text-green-600 dark:text-green-400' : ''}>
                €{finalDepositAmount}
              </span>
            </div>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {finalDepositAmount === 0 ? (
          <Alert>
            <AlertDescription>
              🎉 La tua gift card copre l'intero importo dell'acconto! 
              Contatta il supporto per completare la prenotazione.
            </AlertDescription>
          </Alert>
        ) : (
          /* Payment Form */
          <StripeCheckoutButton
            amount={finalDepositAmount * 100} // Convert to cents
            currency="eur"
            tourId={tour.id}
            sessionId={session.id}
            userId={user.id}
            paymentType="deposit"
            tourTitle={tour.title}
            tourDestination={tour.title}
            sessionDate={session.start}
            giftCardCode={giftCardCode}
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
          />
        )}
      </CardContent>
    </Card>
  )
}
