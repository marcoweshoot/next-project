'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { AlertCircle, CheckCircle, ChevronDown } from 'lucide-react'
import { StripeCheckoutButton } from './StripeCheckoutButton'
import { GiftCardInput } from '@/components/gift-card/GiftCardInput'
import {
  CheckoutStepper,
  CheckoutTripSummary,
  CheckoutParticipants,
  CheckoutPaymentMode,
  CheckoutOrderRecap,
  CheckoutFooter,
} from './checkout/CheckoutParts'
import { createPurchaseEventId, getFbCookies, trackInitiateCheckout } from '@/utils/facebook'
import { persistCheckoutSelection, loadCheckoutSelection, type CheckoutPaymentType } from '@/utils/checkoutDraft'
import { trackCheckoutFunnel } from '@/utils/checkoutFunnel'
import { cn } from '@/lib/utils'

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
  const [giftCardOpen, setGiftCardOpen] = useState(false)

  const handlePrevStep = () => {
    if (currentStep > 1) setCurrentStep(1)
  }

  const resetModal = () => {
    setCurrentStep(1)
    setError(null)
    setGiftCardCode(undefined)
    setGiftCardDiscount(0)
    setHasCommitted(false)
    setGiftCardOpen(false)
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
      setGiftCardOpen(true)
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

  const getTotalLabel = () => {
    if (isBalancePayment) return 'Saldo da pagare'
    if (paymentType === 'deposit') return 'Acconto ora'
    return 'Totale'
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

  const modalTitle = currentStep === 1 ? 'Prenota' : 'Pagamento'

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleClose() }}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-0 space-y-0">
          <DialogTitle className="text-lg font-semibold">{modalTitle}</DialogTitle>
          <CheckoutStepper currentStep={currentStep} />
        </DialogHeader>

        <div className="px-6 pb-6 pt-2">
          {currentStep === 1 && (
            <>
              <CheckoutTripSummary
                title={tour.title}
                startDate={tour.startDate}
                coach={tour.coach}
                availableSpots={session.availableSpots}
              />

              <CheckoutParticipants
                quantity={quantity}
                availableSpots={session.availableSpots}
                onQuantityChange={setQuantity}
              />

              {!isBalancePayment && shouldShowDepositOption() && (
                <CheckoutPaymentMode
                  paymentType={paymentType}
                  depositAmount={getDepositAmount()}
                  totalAmount={getTotalAmount()}
                  balanceAmount={getBalanceAmount()}
                  onPaymentTypeChange={setPaymentType}
                />
              )}

              <CheckoutFooter
                totalLabel={getTotalLabel()}
                totalAmount={getPaymentAmount()}
                primaryLabel="Continua"
                onPrimary={handleStartPayment}
                onCancel={handleClose}
              />
            </>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <CheckoutOrderRecap
                quantity={quantity}
                isBalancePayment={isBalancePayment}
                paymentType={paymentType}
                paymentAmount={getPaymentAmount()}
              />

              <Collapsible
                open={giftCardOpen || Boolean(giftCardCode)}
                onOpenChange={setGiftCardOpen}
              >
                <CollapsibleTrigger className="flex w-full items-center justify-between py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <span>Hai una gift card?</span>
                  <ChevronDown
                    className={cn(
                      'h-4 w-4 transition-transform',
                      (giftCardOpen || giftCardCode) && 'rotate-180'
                    )}
                  />
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-2 pb-4">
                  <GiftCardInput
                    onApply={handleApplyGiftCard}
                    onRemove={handleRemoveGiftCard}
                    appliedCode={giftCardCode}
                    appliedDiscount={giftCardDiscount}
                    hideLabel
                  />
                </CollapsibleContent>
              </Collapsible>

              {getPaymentAmount() === 0 ? (
                <div className="space-y-3">
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
                      <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
                        <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                        <AlertDescription className="text-green-800 dark:text-green-200">
                          Gift card copre l&apos;intero importo. La prenotazione sarà completata automaticamente.
                        </AlertDescription>
                      </Alert>
                      <Button
                        onClick={handleZeroPayment}
                        className="w-full"
                        size="lg"
                      >
                        <CheckCircle className="mr-2 h-5 w-5" />
                        Completa prenotazione (0€)
                      </Button>
                    </>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
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
                  <p className="text-xs text-center text-muted-foreground">
                    Klarna disponibile su Stripe
                  </p>
                </div>
              )}

              {!isUserLoggedIn && getPaymentAmount() > 0 && (
                <p className="text-xs text-center text-muted-foreground">
                  Account creato dopo il pagamento con i dati inseriti su Stripe
                </p>
              )}

              <Button variant="outline" onClick={handlePrevStep} className="w-full">
                Indietro
              </Button>
            </div>
          )}

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
