'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CreditCard, User, Calendar, Euro, AlertCircle, Loader2, Users, CheckCircle } from 'lucide-react'
import { StripeCheckoutButton } from './StripeCheckoutButton'
import { GiftCardInput } from '@/components/gift-card/GiftCardInput'
import { createPurchaseEventId, getFbCookies, trackInitiateCheckout } from '@/utils/facebook'
import { persistCheckoutSelection, loadCheckoutSelection, type CheckoutPaymentType } from '@/utils/checkoutDraft'
import { trackCheckoutFunnel } from '@/utils/checkoutFunnel'

interface SimpleCheckoutModalProps {
  isOpen: boolean
  onClose: () => void
  tour: {
    id: string
    title: string
    startDate: string
    endDate: string
    coach: string
  }
  session: {
    id: string
    date: string
    price: number
    deposit: number
    currency: string
    availableSpots: number
  }
  user: {
    id: string
    email: string
  } | null
  isBalancePayment?: boolean
  initialStep?: 1 | 2
  initialQuantity?: number
  initialPaymentType?: CheckoutPaymentType
}

export function SimpleCheckoutModal({
  isOpen,
  onClose,
  tour,
  session,
  user,
  isBalancePayment = false,
  initialStep,
  initialQuantity,
  initialPaymentType,
}: SimpleCheckoutModalProps) {
  const [paymentType, setPaymentType] = useState<'deposit' | 'full'>(() => {
    if (isBalancePayment) return 'full'
    if (!session.deposit || session.deposit === 0 || session.deposit >= session.price || session.deposit < session.price * 0.2) {
      return 'full'
    }
    return 'deposit'
  })
  const [quantity, setQuantity] = useState(1)
  const [error, setError] = useState<string | null>(null)
  const [giftCardCode, setGiftCardCode] = useState<string | undefined>(undefined)
  const [giftCardDiscount, setGiftCardDiscount] = useState<number>(0)
  const [currentStep, setCurrentStep] = useState<1 | 2>(initialStep ?? 1)
  const [hasCommitted, setHasCommitted] = useState(false)

  const handlePrevStep = () => {
    if (currentStep > 1) setCurrentStep(1)
  }

  const resetModal = () => {
    setCurrentStep(1)
    setError(null)
    setGiftCardCode(undefined)
    setGiftCardDiscount(0)
    setHasCommitted(false)
  }

  const handleClose = () => {
    if (hasCommitted && currentStep < 2) {
      trackCheckoutFunnel({
        step: 'modal_abandon',
        tourId: tour.id,
        sessionId: session.id,
        metaEvent: 'diagnostic',
      })
    }
    resetModal()
    onClose()
  }

  const handleApplyGiftCard = async (code: string, discount: number) => {
    setGiftCardCode(code)
    setError(null)

    const baseAmount = paymentType === 'deposit' ? session.deposit : session.price
    const totalAmount = baseAmount * quantity

    try {
      const response = await fetch('/api/gift-cards/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim().toUpperCase() })
      })

      const data = await response.json()

      if (!response.ok || !data.valid) {
        setError(data.error || 'Gift card non valida')
        return
      }

      const giftCardBalanceInEuros = data.giftCard.remaining_balance / 100
      const actualDiscount = Math.min(giftCardBalanceInEuros, totalAmount)
      setGiftCardDiscount(actualDiscount)
    } catch {
      setError('Errore nella validazione della gift card')
    }
  }

  const handleRemoveGiftCard = () => {
    setGiftCardCode(undefined)
    setGiftCardDiscount(0)
  }

  const handleZeroPayment = async () => {
    if (!user?.id) {
      setError('Per completare una prenotazione con gift card al 100% devi accedere al tuo account')
      return
    }

    const fbEventId = createPurchaseEventId(`giftcard_${Date.now()}_${user.id}`)
    const { fbc, fbp } = getFbCookies()

    try {
      const response = await fetch('/api/zero-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tourId: tour.id,
          sessionId: session.id,
          userId: user.id,
          quantity,
          paymentType: isBalancePayment ? 'balance' : paymentType,
          giftCardCode,
          amount: getPaymentAmount(),
          fbEventId,
          fbc,
          fbp,
          tourTitle: tour.title,
          tourDestination: tour.title,
          sessionDate: session.date,
          sessionEndDate: tour.endDate,
          sessionPrice: session.price,
          sessionDeposit: session.deposit
        })
      })

      if (!response.ok) {
        throw new Error('Errore nella creazione della prenotazione')
      }

      let baseAmount: number
      if (isBalancePayment) {
        baseAmount = session.price - session.deposit
      } else {
        baseAmount = paymentType === 'deposit' ? session.deposit : session.price
      }
      const totalValue = (baseAmount || 0) * (quantity || 1)

      if (typeof window !== 'undefined' && window.sessionStorage && totalValue > 0) {
        sessionStorage.setItem('lastPurchase', JSON.stringify({
          tourTitle: tour.title,
          value: totalValue,
          quantity: quantity || 1,
          tourDestination: tour.title,
          sessionDate: session.date
        }))
      }

      if (typeof window !== 'undefined' && window.fbq && totalValue > 0 && !isNaN(totalValue) && isFinite(totalValue)) {
        window.fbq('track', 'Purchase', {
          content_name: tour.title,
          content_category: 'Viaggi Fotografici',
          value: totalValue,
          currency: 'EUR',
          num_items: quantity || 1
        }, { eventID: fbEventId })

        try {
          sessionStorage.removeItem('lastPurchase')
          localStorage.removeItem('lastPurchase')
        } catch {
          // ignore
        }
      }

      handlePaymentSuccess()
    } catch {
      handlePaymentError('Errore nella creazione della prenotazione')
    }
  }

  const getCheckoutValue = () => {
    let baseAmount: number
    if (isBalancePayment) {
      baseAmount = session.price - session.deposit
    } else {
      baseAmount = paymentType === 'deposit' ? session.deposit : session.price
    }
    return (baseAmount || 0) * (quantity || 1)
  }

  const isUserLoggedIn = Boolean(user?.id && user?.email)

  const getStep1ButtonLabel = () => {
    if (isBalancePayment) return `Paga Saldo ${getPaymentAmount()}€`
    return 'Procedi al pagamento'
  }

  const getPaymentAmount = () => {
    const baseAmount = isBalancePayment
      ? (session.price - session.deposit)
      : (paymentType === 'deposit' ? session.deposit : session.price)

    const total = baseAmount * quantity
    return Math.max(0, total - giftCardDiscount)
  }

  const getTotalAmount = () => session.price * quantity
  const getDepositAmount = () => session.deposit * quantity
  const getBalanceAmount = () => (session.price - session.deposit) * quantity

  const shouldShowDepositOption = () => {
    if (!session.deposit || session.deposit === 0) return false
    if (session.deposit >= session.price) return false
    if (session.deposit < session.price * 0.2) return false
    return true
  }

  const handlePaymentSuccess = () => {
    onClose()
    setTimeout(() => {
      window.location.href = '/dashboard'
    }, 300)
  }

  const handlePaymentError = (errorMessage: string) => {
    setError(errorMessage)
    trackCheckoutFunnel({
      step: 'checkout_error',
      tourId: tour.id,
      sessionId: session.id,
      error: errorMessage,
      metaEvent: 'diagnostic',
    })
  }

  useEffect(() => {
    if (!isOpen) return

    trackCheckoutFunnel({
      step: 'modal_open',
      tourId: tour.id,
      sessionId: session.id,
      metaEvent: 'diagnostic',
    })

    if (initialStep) setCurrentStep(initialStep)
    if (initialQuantity) setQuantity(initialQuantity)
    if (initialPaymentType) setPaymentType(initialPaymentType)

    const saved = loadCheckoutSelection(tour.id, session.id)
    if (saved && !initialQuantity && !initialPaymentType) {
      setQuantity(saved.quantity)
      setPaymentType(saved.paymentType)
    }
  }, [isOpen, initialStep, initialQuantity, initialPaymentType, tour.id, session.id])

  useEffect(() => {
    if (!isOpen) return
    persistCheckoutSelection({
      quantity,
      paymentType,
      tourId: tour.id,
      sessionId: session.id,
    })
  }, [quantity, paymentType, isOpen, tour.id, session.id])

  const handleStartPayment = () => {
    setHasCommitted(true)
    const totalValue = getCheckoutValue()

    if (totalValue > 0) {
      trackInitiateCheckout({
        tourTitle: tour.title,
        value: totalValue,
        quantity,
      })
      trackCheckoutFunnel({
        step: 'step1_commit',
        tourId: tour.id,
        sessionId: session.id,
        value: totalValue,
        quantity,
        paymentType,
        metaEvent: 'InitiateCheckout',
      })
    }

    setCurrentStep(2)
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleClose() }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Checkout Rapido
          </DialogTitle>

          <div className="flex items-center justify-center space-x-2 sm:space-x-4 py-4 px-2">
            <div className={`flex items-center space-x-1 sm:space-x-2 ${currentStep >= 1 ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium ${
                currentStep >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>
                1
              </div>
              <span className="text-xs sm:text-sm hidden sm:inline">Dettagli</span>
            </div>
            <div className={`w-4 sm:w-8 h-0.5 ${currentStep >= 2 ? 'bg-primary' : 'bg-muted'}`} />
            <div className={`flex items-center space-x-1 sm:space-x-2 ${currentStep >= 2 ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium ${
                currentStep >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>
                2
              </div>
              <span className="text-xs sm:text-sm hidden sm:inline">Pagamento</span>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 pb-4">
          {currentStep === 1 && (
            <>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">{tour.title}</h3>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(tour.startDate).toLocaleDateString('it-IT')} - {new Date(tour.endDate).toLocaleDateString('it-IT')}
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    Coach: {tour.coach}
                  </div>
                </div>
                <Badge variant="secondary" className="w-fit">
                  {session.availableSpots} posti disponibili
                </Badge>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold">Seleziona il numero di posti:</h4>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-muted-foreground" />
                    <Select value={quantity.toString()} onValueChange={(value) => setQuantity(parseInt(value))}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: Math.min(session.availableSpots, 10) }, (_, i) => i + 1).map((num) => (
                          <SelectItem key={num} value={num.toString()}>
                            {num} {num === 1 ? 'persona' : 'persone'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {session.availableSpots} posti disponibili
                  </span>
                </div>
              </div>

              {!isBalancePayment && shouldShowDepositOption() && (
                <div className="space-y-4">
                  <h4 className="font-semibold">Scegli il tipo di pagamento:</h4>
                  <div className="grid grid-cols-1 gap-4">
                    <Card
                      className={`cursor-pointer transition-all ${
                        paymentType === 'deposit'
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => setPaymentType('deposit')}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <Checkbox checked={paymentType === 'deposit'} onChange={() => setPaymentType('deposit')} />
                          <div className="flex-1">
                            <h5 className="font-semibold text-foreground">Acconto</h5>
                            <p className="text-sm text-muted-foreground">
                              Paga solo l&apos;acconto ora, saldo entro 30 giorni dalla partenza
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-primary">{getDepositAmount()}€</div>
                            <div className="text-xs text-muted-foreground">+{getBalanceAmount()}€ saldo</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card
                      className={`cursor-pointer transition-all ${
                        paymentType === 'full'
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => setPaymentType('full')}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <Checkbox checked={paymentType === 'full'} onChange={() => setPaymentType('full')} />
                          <div className="flex-1">
                            <h5 className="font-semibold text-foreground">Pagamento Completo</h5>
                            <p className="text-sm text-muted-foreground">Paga tutto subito e hai finito</p>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-primary">{getTotalAmount()}€</div>
                            <div className="text-xs text-muted-foreground">Pagamento completo</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {!shouldShowDepositOption() && !isBalancePayment && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    <p className="text-sm text-blue-700">
                      Per questo importo è previsto solo il pagamento completo
                    </p>
                  </div>
                </div>
              )}

              <Card className="bg-muted/50 border-border">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {isBalancePayment
                          ? `Pagamento saldo rimanente di ${session.price}€`
                          : paymentType === 'deposit'
                            ? `Acconto di ${session.deposit}€ (saldo di ${getBalanceAmount()}€ da pagare entro 30 giorni)`
                            : `Pagamento completo di ${session.price}€`}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">{getPaymentAmount()}€</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {!isUserLoggedIn && (
                <p className="text-sm text-muted-foreground text-center">
                  Potrai creare il tuo account dopo il pagamento con i dati inseriti su Stripe
                </p>
              )}

              <div className="flex gap-3">
                <Button variant="outline" onClick={handleClose} className="flex-1">
                  Annulla
                </Button>
                <Button onClick={handleStartPayment} className="flex-1 bg-primary hover:bg-primary/90">
                  <Euro className="w-4 h-4 mr-2" />
                  {getStep1ButtonLabel()}
                </Button>
              </div>
            </>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="text-center space-y-2">
                <h3 className="text-xl font-semibold">Completa il pagamento</h3>
                <p className="text-muted-foreground">Procedi con il checkout sicuro Stripe</p>
              </div>

              <GiftCardInput
                onApply={handleApplyGiftCard}
                onRemove={handleRemoveGiftCard}
                appliedCode={giftCardCode}
                appliedDiscount={giftCardDiscount}
              />

              {getPaymentAmount() === 0 ? (
                <div className="space-y-4">
                  {!isUserLoggedIn ? (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Per prenotazioni coperte al 100% da gift card è necessario accedere al tuo account.
                        Torna indietro e accedi dalla pagina del tour, oppure{' '}
                        <a href="/auth/login" className="underline font-medium">accedi qui</a>.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <>
                      <Alert className="border-green-200 bg-green-50">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-800">
                          <strong>Gift card copre l&apos;intero importo!</strong><br />
                          La tua prenotazione sarà completata automaticamente.
                        </AlertDescription>
                      </Alert>
                      <Button
                        onClick={handleZeroPayment}
                        className="w-full bg-green-600 hover:bg-green-700 text-white"
                        size="lg"
                      >
                        <CheckCircle className="mr-2 h-5 w-5" />
                        Completa Prenotazione (0€)
                      </Button>
                    </>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <StripeCheckoutButton
                    amount={getPaymentAmount() * 100}
                    currency={session.currency.toLowerCase()}
                    tourId={tour.id}
                    sessionId={session.id}
                    userId={user?.id}
                    paymentType={isBalancePayment ? 'balance' : paymentType}
                    quantity={quantity}
                    tourTitle={tour.title}
                    tourDestination={tour.title}
                    sessionDate={session.date}
                    sessionEndDate={tour.endDate}
                    sessionPrice={session.price}
                    sessionDeposit={session.deposit}
                    giftCardCode={giftCardCode}
                    cancelReturnUrl={typeof window !== 'undefined' ? window.location.href.split('?')[0] : undefined}
                    onSuccess={handlePaymentSuccess}
                    onError={handlePaymentError}
                  />
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-blue-700 text-center">
                      💳 <strong>Paga a rate con Klarna:</strong> Scegli Klarna al checkout per dividere il pagamento in comode rate senza interessi
                    </p>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <Button variant="outline" onClick={handlePrevStep} className="flex-1">
                  Indietro
                </Button>
              </div>
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
