'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CreditCard, User, Calendar, Euro, AlertCircle, Loader2, Users } from 'lucide-react'
import { StripeCheckoutButton } from './StripeCheckoutButton'
import { QuickRegistrationForm } from './QuickRegistrationForm'

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
}

export function SimpleCheckoutModal({
  isOpen,
  onClose,
  tour,
  session,
  user,
}: SimpleCheckoutModalProps) {
  // Imposta il tipo di pagamento iniziale basato sulla disponibilità dell'acconto
  const [paymentType, setPaymentType] = useState<'deposit' | 'full'>(() => {
    // Se non c'è acconto o è molto piccolo, usa pagamento completo
    if (!session.deposit || session.deposit === 0 || session.deposit >= session.price || session.deposit < session.price * 0.2) {
      return 'full'
    }
    return 'deposit'
  })
  const [quantity, setQuantity] = useState(1)
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [showRegistrationForm, setShowRegistrationForm] = useState(false)
  const [registeredUserId, setRegisteredUserId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const getPaymentAmount = () => {
    const baseAmount = paymentType === 'deposit' ? session.deposit : session.price
    const total = baseAmount * quantity
    return total
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
    onClose()
  }

  const handlePaymentError = (error: string) => {
    console.error('Payment error:', error)
    setError(error)
  }

  const handleRegistrationSuccess = (userId: string) => {
    setRegisteredUserId(userId)
    setShowRegistrationForm(false)
    setShowPaymentForm(true)
    setError(null)
  }

  const handleRegistrationError = (error: string) => {
    setError(error)
  }

  const handleStartPayment = () => {
    // Controlla se l'utente è effettivamente loggato
    const isUserLoggedIn = user && user.id && user.email
    
    if (!isUserLoggedIn && !registeredUserId) {
      // Utente non registrato, mostra form di registrazione
      setShowRegistrationForm(true)
    } else {
      // Utente già registrato, vai al pagamento
      setShowPaymentForm(true)
    }
  }


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto modal-content">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Checkout Rapido
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pb-4">
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
            <div className="flex items-center gap-4">
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
              <span className="text-sm text-muted-foreground">
                {session.availableSpots} posti disponibili
              </span>
            </div>
          </div>

          {/* Payment Type Selection */}
          {shouldShowDepositOption() && (
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
                    {paymentType === 'deposit' 
                      ? `Acconto di ${session.deposit}€ (saldo di ${getBalanceAmount()}€ da pagare entro 30 giorni)`
                      : `Pagamento completo di ${session.price}€`
                    }
                  </p>
                  {paymentType === 'deposit' && (
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

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Registration Form */}
          {showRegistrationForm ? (
            <div className="space-y-4">
              <QuickRegistrationForm
                onSuccess={handleRegistrationSuccess}
                onError={handleRegistrationError}
              />
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setShowRegistrationForm(false)}
                  className="flex-1"
                >
                  Indietro
                </Button>
              </div>
            </div>
          ) : showPaymentForm ? (
            <div className="space-y-4">
              <h4 className="font-semibold">Completa il pagamento</h4>
              <StripeCheckoutButton
                amount={getPaymentAmount() * 100}
                currency={session.currency.toLowerCase()}
                tourId={tour.id}
                sessionId={session.id}
                userId={user?.id || registeredUserId || ''}
                paymentType={paymentType === 'full' ? 'balance' : 'deposit'}
                quantity={quantity}
                tourTitle={tour.title}
                tourDestination={tour.title}
                sessionDate={session.date}
                sessionEndDate={tour.endDate}
                sessionPrice={session.price}
                sessionDeposit={session.deposit}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
              />
            </div>
          ) : (
            <div className="flex gap-3">
              <Button variant="outline" onClick={onClose} className="flex-1">
                Annulla
              </Button>
              <Button 
                onClick={handleStartPayment}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                <Euro className="w-4 h-4 mr-2" />
                Paga {getPaymentAmount()}€
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
