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
import { QuickRegistrationForm } from './QuickRegistrationForm'
import { GiftCardInput } from '@/components/gift-card/GiftCardInput'
import { generateEventId, createPurchaseEventId } from '@/utils/facebook'

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
  isBalancePayment?: boolean // Nuovo prop per distinguere pagamento saldo
}

export function SimpleCheckoutModal({
  isOpen,
  onClose,
  tour,
  session,
  user,
  isBalancePayment = false,
}: SimpleCheckoutModalProps) {
  // Imposta il tipo di pagamento iniziale basato sulla disponibilità dell'acconto
  const [paymentType, setPaymentType] = useState<'deposit' | 'full'>(() => {
    // Se è un pagamento di saldo, usa sempre 'balance' (che viene mappato a 'full' per l'API)
    if (isBalancePayment) {
      return 'full'
    }
    // Se non c'è acconto o è molto piccolo, usa pagamento completo
    if (!session.deposit || session.deposit === 0 || session.deposit >= session.price || session.deposit < session.price * 0.2) {
      return 'full'
    }
    return 'deposit'
  })
  const [quantity, setQuantity] = useState(1)
  const [registeredUserId, setRegisteredUserId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [giftCardCode, setGiftCardCode] = useState<string | undefined>(undefined)
  const [giftCardDiscount, setGiftCardDiscount] = useState<number>(0)
  
  // Gestione degli step del modal
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1)
  
  // Funzioni per gestire gli step
  const handleNextStep = () => {
    if (currentStep < 3) {
      setCurrentStep((prev) => (prev + 1) as 1 | 2 | 3)
    }
  }
  
  const handlePrevStep = () => {
    if (currentStep > 1) {
      // Navigazione intelligente: se l'utente è già loggato, salta lo step 2 (Accesso)
      const isUserLoggedIn = user && user.id && user.email
      
      if (currentStep === 3 && isUserLoggedIn) {
        // Se siamo allo step 3 e l'utente è loggato, vai direttamente allo step 1
        setCurrentStep(1)
      } else {
        // Altrimenti, navigazione normale
        setCurrentStep((prev) => (prev - 1) as 1 | 2 | 3)
      }
    }
  }
  
  const resetModal = () => {
    setCurrentStep(1)
    setRegisteredUserId(null)
    setError(null)
    setGiftCardCode(undefined)
    setGiftCardDiscount(0)
  }
  
  const handleClose = () => {
    resetModal()
    onClose()
  }

  const handleApplyGiftCard = async (code: string, discount: number) => {
    setGiftCardCode(code)
    setError(null)
    
    // Calculate the actual discount based on the amount to pay
    const baseAmount = paymentType === 'deposit' ? session.deposit : session.price
    const totalAmount = baseAmount * quantity
    
    try {
      // Validate gift card and get its balance
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
      
      // Calculate actual discount (can't exceed amount to pay or remaining balance)
      // Convert gift card balance from cents to euros for comparison
      const giftCardBalanceInEuros = data.giftCard.remaining_balance / 100
      const actualDiscount = Math.min(giftCardBalanceInEuros, totalAmount)
      setGiftCardDiscount(actualDiscount)
      
      // Force re-render to update the display
      setGiftCardDiscount(actualDiscount)
      
    } catch (err) {
      setError('Errore nella validazione della gift card')
    }
  }
  
  const handleRemoveGiftCard = () => {
    setGiftCardCode(undefined)
    setGiftCardDiscount(0)
  }

  const handleZeroPayment = async () => {
    try {
      // Create booking directly without Stripe payment
      const response = await fetch('/api/zero-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tourId: tour.id,
          sessionId: session.id,
          userId: user?.id || registeredUserId,
          quantity,
          paymentType: isBalancePayment ? 'balance' : paymentType,
          giftCardCode,
          amount: getPaymentAmount(), // Pass the actual amount to pay
          // Pass tour and session data for enriched booking
          tourTitle: tour.title,
          tourDestination: tour.title, // or tour.destination if available
          sessionDate: session.date,
          sessionEndDate: tour.endDate,
          sessionPrice: session.price,
          sessionDeposit: session.deposit
        })
      })

      if (!response.ok) {
        throw new Error('Errore nella creazione della prenotazione')
      }

      // Calculate the correct base amount for tracking
      let baseAmount: number
      if (isBalancePayment) {
        baseAmount = session.price - session.deposit
      } else {
        baseAmount = paymentType === 'deposit' ? session.deposit : session.price
      }
      const totalValue = (baseAmount || 0) * (quantity || 1)

      // Save purchase data for Facebook Pixel tracking
      if (typeof window !== 'undefined' && window.sessionStorage && totalValue > 0) {
        sessionStorage.setItem('lastPurchase', JSON.stringify({
          tourTitle: tour.title,
          value: totalValue,
          quantity: quantity || 1,
          tourDestination: tour.title,
          sessionDate: session.date
        }))
        console.log('💾 [FB PIXEL] Saved purchase data for gift card payment:', {
          tourTitle: tour.title,
          value: totalValue,
          quantity: quantity || 1
        })
      }

      // Track Facebook Pixel Purchase event for gift card payments
      if (typeof window !== 'undefined' && window.fbq && totalValue > 0 && !isNaN(totalValue) && isFinite(totalValue)) {
        // Generate unique event_id for gift card purchases (no Stripe session)
        const eventId = createPurchaseEventId(`giftcard_${Date.now()}_${user?.id || registeredUserId}`)
        
        console.log('🆔 [FB PIXEL] Generated event_id for gift card purchase:', eventId)
        
        window.fbq('track', 'Purchase', {
          content_name: tour.title,
          content_category: 'Viaggi Fotografici',
          value: totalValue,
          currency: 'EUR',
          num_items: quantity || 1
        }, { eventID: eventId })
        
        console.log('✅ [FB PIXEL] Purchase event sent with event_id for gift card payment')
      }

      // Success - close modal and redirect
      handlePaymentSuccess()
    } catch (error) {
      handlePaymentError('Errore nella creazione della prenotazione')
    }
  }

  // Funzione centralizzata per tracciare InitiateCheckout
  const handleTrackInitiateCheckout = () => {
    if (typeof window === 'undefined' || !window.fbq || typeof session.price !== 'number' || session.price <= 0) {
      return
    }

    // Calcola il valore base in base al tipo di pagamento
    let baseAmount: number
    if (isBalancePayment) {
      baseAmount = session.price - session.deposit
    } else {
      baseAmount = paymentType === 'deposit' ? session.deposit : session.price
    }
    const totalValue = (baseAmount || 0) * (quantity || 1)

    // Traccia solo se il valore è valido
    if (totalValue > 0 && !isNaN(totalValue) && isFinite(totalValue)) {
      const eventId = generateEventId()
      
      const eventData = {
        content_name: tour.title,
        content_category: 'Viaggi Fotografici',
        value: totalValue,
        currency: 'EUR',
        num_items: quantity || 1
      }

      // 1. Traccia con il Pixel del Browser
      window.fbq('track', 'InitiateCheckout', eventData, { eventID: eventId })
      console.log('✅ [FB PIXEL] InitiateCheckout event sent (user identified)')

      // 2. Traccia con l'API Conversions (non bloccante)
      fetch('/api/track-fb-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_name: 'InitiateCheckout',
          event_id: eventId,
          event_source_url: window.location.href,
          custom_data: eventData,
        }),
      }).catch(error => {
        console.error('❌ [CAPI] Error sending InitiateCheckout event:', error)
      })
    }
  }

  const getPaymentAmount = () => {
    // For balance payments, calculate the remaining balance to pay
    const baseAmount = isBalancePayment 
      ? (session.price - session.deposit)  // Balance amount for balance payments
      : (paymentType === 'deposit' ? session.deposit : session.price)
    
    const total = baseAmount * quantity
    // Apply gift card discount (giftCardDiscount is already in euros)
    const finalAmount = Math.max(0, total - giftCardDiscount)
    
    
    return finalAmount
  }

  const getTotalAmount = () => {
    return session.price * quantity
  }

  const getDepositAmount = () => {
    return session.deposit * quantity
  }

  const getBalanceAmount = () => {
    return (session.price - session.deposit) * quantity
  }

  // Determina se mostrare l'opzione acconto
  const shouldShowDepositOption = () => {
    // Se l'acconto è 0 o null, non mostrare l'opzione acconto
    if (!session.deposit || session.deposit === 0) {
      return false
    }
    
    // Se l'acconto è uguale al prezzo totale, non mostrare l'opzione acconto
    if (session.deposit >= session.price) {
      return false
    }
    
    // Se l'acconto è meno del 20% del prezzo totale, non mostrare l'opzione acconto
    if (session.deposit < session.price * 0.2) {
      return false
    }
    
    return true
  }

  const handlePaymentSuccess = () => {
    // Close modal and redirect to dashboard
    onClose()
    // Small delay to ensure modal closes smoothly before redirect
    setTimeout(() => {
      window.location.href = '/dashboard'
    }, 300)
  }

  const handlePaymentError = (error: string) => {
    setError(error)
  }

  // 🆕 Traccia InitiateCheckout quando il modal si apre
  useEffect(() => {
    if (isOpen) {
      // Traccia l'evento quando il modal si apre
      // Questo segue le best practice di Facebook: tracciare quando l'utente "inizia" il checkout
      // L'evento viene tracciato con i valori iniziali (quantità e tipo di pagamento di default)
      handleTrackInitiateCheckout()
      
      console.log('🎯 [FB PIXEL] InitiateCheckout tracked on modal open', {
        tourTitle: tour.title,
        quantity,
        paymentType,
        isBalancePayment
      })
    }
  }, [isOpen]) // Si attiva ogni volta che il modal si apre
  // Note: Usa i valori correnti di quantity/paymentType quando il modal si apre
  // eslint-disable-next-line react-hooks/exhaustive-deps

  const handleRegistrationSuccess = (userId: string) => {
    setRegisteredUserId(userId)
    setError(null)
    // Vai allo step 3 (pagamento) dopo il successo
    setCurrentStep(3)
    // Non tracciamo più qui perché già tracciato all'apertura del modal
  }

  const handleRegistrationError = (error: string) => {
    setError(error)
  }

  const handleStartPayment = () => {
    // Controlla se l'utente è effettivamente loggato
    const isUserLoggedIn = user && user.id && user.email
    
    if (!isUserLoggedIn && !registeredUserId) {
      // Utente non registrato, vai allo step 2 (autenticazione)
      setCurrentStep(2)
    } else {
      // Utente già registrato, vai allo step 3 (pagamento)
      setCurrentStep(3)
      // Non tracciamo più qui perché già tracciato all'apertura del modal
    }
  }


  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Checkout Rapido
          </DialogTitle>
          
          {/* Indicatore di step */}
          <div className="flex items-center justify-center space-x-2 sm:space-x-4 py-4 px-2">
            <div className={`flex items-center space-x-1 sm:space-x-2 ${currentStep >= 1 ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium ${
                currentStep >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>
                1
              </div>
              <span className="text-xs sm:text-sm hidden sm:inline">Dettagli</span>
            </div>
            <div className={`w-4 sm:w-8 h-0.5 ${currentStep >= 2 ? 'bg-primary' : 'bg-muted'}`}></div>
            <div className={`flex items-center space-x-1 sm:space-x-2 ${currentStep >= 2 ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium ${
                currentStep >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>
                2
              </div>
              <span className="text-xs sm:text-sm hidden sm:inline">Accesso</span>
            </div>
            <div className={`w-4 sm:w-8 h-0.5 ${currentStep >= 3 ? 'bg-primary' : 'bg-muted'}`}></div>
            <div className={`flex items-center space-x-1 sm:space-x-2 ${currentStep >= 3 ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium ${
                currentStep >= 3 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>
                3
              </div>
              <span className="text-xs sm:text-sm hidden sm:inline">Pagamento</span>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 pb-4">
          {/* Step 1: Dettagli Tour e Selezione */}
          {currentStep === 1 && (
            <>
          {/* Tour Details */}
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

          {/* Quantity Selection */}
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

          {/* Payment Type Selection - Skip for balance payments */}
          {!isBalancePayment && shouldShowDepositOption() && (
            <div className="space-y-4">
              <h4 className="font-semibold">Scegli il tipo di pagamento:</h4>
              
              <div className="grid grid-cols-1 gap-4">
                {/* Deposit Option */}
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
                    <Checkbox 
                      checked={paymentType === 'deposit'} 
                      onChange={() => setPaymentType('deposit')}
                    />
                    <div className="flex-1">
                      <h5 className="font-semibold text-foreground">Acconto</h5>
                      <p className="text-sm text-muted-foreground">
                        Paga solo l'acconto ora, saldo entro 30 giorni dalla partenza
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-primary">
                        {getDepositAmount()}€
                      </div>
                      <div className="text-xs text-muted-foreground">
                        +{getBalanceAmount()}€ saldo
                      </div>
                      {quantity > 1 && (
                        <div className="text-xs text-muted-foreground">
                          {quantity} × {session.deposit}€
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Full Payment Option */}
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
                    <Checkbox 
                      checked={paymentType === 'full'} 
                      onChange={() => setPaymentType('full')}
                    />
                    <div className="flex-1">
                      <h5 className="font-semibold text-foreground">Pagamento Completo</h5>
                      <p className="text-sm text-muted-foreground">
                        Paga tutto subito e hai finito
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-primary">
                        {getTotalAmount()}€
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Pagamento completo
                      </div>
                      {quantity > 1 && (
                        <div className="text-xs text-muted-foreground">
                          {quantity} × {session.price}€
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          )}

          {/* Info message when no deposit option */}
          {!shouldShowDepositOption() && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <p className="text-sm text-blue-700">
                  Per questo importo è previsto solo il pagamento completo
                </p>
              </div>
            </div>
          )}

          {/* Payment Summary */}
          <Card className="bg-muted/50 border-border">
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {isBalancePayment 
                      ? `Pagamento saldo rimanente di ${session.price}€`
                      : paymentType === 'deposit' 
                        ? `Acconto di ${session.deposit}€ (saldo di ${getBalanceAmount()}€ da pagare entro 30 giorni)`
                        : `Pagamento completo di ${session.price}€`
                    }
                  </p>
                  {isBalancePayment ? (
                    <p className="text-xs text-muted-foreground/70 mt-1">
                      Completa il pagamento del saldo per la tua prenotazione
                    </p>
                  ) : paymentType === 'deposit' && (
                    <p className="text-xs text-muted-foreground/70 mt-1">
                      Saldo da pagare entro 30 giorni dalla prenotazione
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">
                    {getPaymentAmount()}€
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bottoni Step 1 */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleClose} className="flex-1">
              Annulla
            </Button>
            <Button 
              onClick={handleStartPayment}
              className="flex-1 bg-primary hover:bg-primary/90"
            >
              <Euro className="w-4 h-4 mr-2" />
              {isBalancePayment ? `Paga Saldo ${getPaymentAmount()}€` : `Paga ${getPaymentAmount()}€`}
            </Button>
          </div>
            </>
          )}

          {/* Step 2: Autenticazione */}
          {currentStep === 2 && (
            <div className="space-y-4 w-full max-w-full overflow-hidden">
              <div className="text-center space-y-2">
                <h3 className="text-xl font-semibold">Per continuare con il pagamento</h3>
                <p className="text-muted-foreground">è necessario fare l'accesso o registrarsi</p>
              </div>
              
              <QuickRegistrationForm
                onSuccess={handleRegistrationSuccess}
                onError={handleRegistrationError}
              />
              
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={handlePrevStep}
                  className="flex-1"
                >
                  Indietro
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Pagamento */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="text-center space-y-2">
                <h3 className="text-xl font-semibold">Completa il pagamento</h3>
                <p className="text-muted-foreground">Procedi con il checkout sicuro</p>
              </div>

              {/* Gift Card Input */}
              <GiftCardInput
                onApply={handleApplyGiftCard}
                onRemove={handleRemoveGiftCard}
                appliedCode={giftCardCode}
                appliedDiscount={giftCardDiscount}
              />
              
              {!user?.id && !registeredUserId ? (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Errore di autenticazione. Per favore, ricarica la pagina e riprova.
                  </AlertDescription>
                </Alert>
              ) : getPaymentAmount() === 0 ? (
                // Handle 0€ payment (gift card covers full amount)
                <div className="space-y-4">
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      <strong>Gift card copre l'intero importo!</strong><br />
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
                </div>
              ) : (
                <div className="space-y-3">
                  <StripeCheckoutButton
                    amount={getPaymentAmount() * 100}
                    currency={session.currency.toLowerCase()}
                    tourId={tour.id}
                    sessionId={session.id}
                    userId={user?.id || registeredUserId || ''}
                    paymentType={isBalancePayment ? 'balance' : paymentType}
                    quantity={quantity}
                    tourTitle={tour.title}
                    tourDestination={tour.title}
                    sessionDate={session.date}
                    sessionEndDate={tour.endDate}
                    sessionPrice={session.price}
                    sessionDeposit={session.deposit}
                    giftCardCode={giftCardCode}
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
                <Button 
                  variant="outline" 
                  onClick={handlePrevStep}
                  className="flex-1"
                >
                  Indietro
                </Button>
              </div>
            </div>
          )}

          {/* Error Display */}
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
