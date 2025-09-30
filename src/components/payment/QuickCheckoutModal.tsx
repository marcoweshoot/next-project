'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'
import { CreditCard, User, Calendar, Euro, AlertCircle, Loader2 } from 'lucide-react'
import { StripeCheckoutButton } from './StripeCheckoutButton'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface QuickCheckoutModalProps {
  isOpen: boolean
  onClose: () => void
  session: {
    id: string
    start: string
    end: string
    price: number
    deposit: number
    balance: number
    currency: string
    maxPax: number
  }
  tour: {
    id: string
    title: string
    slug: string
  }
  coach: {
    id: string
    name: string
  }
}

export function QuickCheckoutModal({ 
  isOpen, 
  onClose, 
  session, 
  tour, 
  coach 
}: QuickCheckoutModalProps) {
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [paymentType, setPaymentType] = useState<'deposit' | 'full'>('deposit')
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  
  // Modalità autenticazione
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
  
  // Form per utenti non registrati
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()
  }, [supabase])

  const handlePaymentTypeChange = (type: 'deposit' | 'full') => {
    setPaymentType(type)
  }

  const getPaymentAmount = () => {
    return paymentType === 'deposit' ? session.deposit : session.price
  }

  const getPaymentDescription = () => {
    if (paymentType === 'deposit') {
      return `Acconto di ${session.deposit}€ (saldo di ${session.balance}€ da pagare entro 30 giorni)`
    }
    return `Pagamento completo di ${session.price}€`
  }

  const handleLogin = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError(error.message)
        return
      }

      setUser(data.user)
      await createPaymentIntent()
    } catch (err) {
      setError('Errore durante il login. Riprova.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName
          }
        }
      })

      if (error) {
        setError(error.message)
        return
      }

      setUser(data.user)
      await createPaymentIntent()
    } catch (err) {
      setError('Errore durante la registrazione. Riprova.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleStartPayment = async () => {
    if (!user) {
      // Utente non registrato - mostra form di autenticazione
      return
    } else {
      // Utente registrato - procedi con pagamento
      await createPaymentIntent()
    }
  }


  const createPaymentIntent = async () => {
    if (!user) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/stripe/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: getPaymentAmount() * 100, // Converti in centesimi per Stripe
          currency: session.currency.toLowerCase(),
          tourId: tour.id,
          sessionId: session.id,
          userId: user.id,
          paymentType: paymentType === 'full' ? 'deposit' : 'deposit', // Sempre deposit, ma amount diverso
        }),
      })

      const { clientSecret: secret, error: apiError } = await response.json()

      if (apiError) {
        throw new Error(apiError)
      }

      setClientSecret(secret)
      setShowPaymentForm(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore durante la creazione del pagamento')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePaymentSuccess = () => {
    onClose()
    router.push('/dashboard')
    router.refresh()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Checkout Rapido
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Completa la tua prenotazione per {tour.title}
          </p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Riepilogo Sessione */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{tour.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(session.start)} - {formatDate(session.end)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Coach: {coach.name}
                  </p>
                </div>
                <Badge variant="outline">
                  {session.maxPax} posti disponibili
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Opzioni di Pagamento */}
          <div className="space-y-4">
            <h4 className="font-semibold">Scegli il tipo di pagamento:</h4>
            
            <div className="grid gap-3">
              <Card 
                className={`cursor-pointer transition-colors ${
                  paymentType === 'deposit' ? 'ring-2 ring-primary bg-primary/5' : ''
                }`}
                onClick={() => handlePaymentTypeChange('deposit')}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Checkbox 
                        checked={paymentType === 'deposit'} 
                        onChange={() => handlePaymentTypeChange('deposit')}
                      />
                      <div>
                        <p className="font-medium">Acconto</p>
                        <p className="text-sm text-muted-foreground">
                          Paga solo l'acconto ora, saldo entro 30 giorni dalla partenza
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">{session.deposit}€</p>
                      <p className="text-xs text-muted-foreground">
                        +{session.balance}€ saldo
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card 
                className={`cursor-pointer transition-colors ${
                  paymentType === 'full' ? 'ring-2 ring-primary bg-primary/5' : ''
                }`}
                onClick={() => handlePaymentTypeChange('full')}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Checkbox 
                        checked={paymentType === 'full'} 
                        onChange={() => handlePaymentTypeChange('full')}
                      />
                      <div>
                        <p className="font-medium">Pagamento Completo</p>
                        <p className="text-sm text-muted-foreground">
                          Paga tutto subito e hai finito
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">{session.price}€</p>
                      <p className="text-xs text-muted-foreground">
                        Pagamento completo
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Form Autenticazione per utenti non registrati */}
          {!user && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <User className="w-4 h-4" />
                <h4 className="font-semibold">
                  {authMode === 'login' ? 'Accedi al tuo account' : 'Crea il tuo account'}
                </h4>
              </div>
              
              {/* Toggle tra Login e Registrazione */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  type="button"
                  onClick={() => setAuthMode('login')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    authMode === 'login' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Accedi
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMode('register')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    authMode === 'register' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Registrati
                </button>
              </div>
              
              {/* Campi solo per registrazione */}
              {authMode === 'register' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">Nome</Label>
                    <Input
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Il tuo nome"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Cognome</Label>
                    <Input
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Il tuo cognome"
                    />
                  </div>
                </div>
              )}
              
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tua@email.com"
                />
              </div>
              
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimo 6 caratteri"
                />
              </div>
            </div>
          )}

          {/* Riepilogo Pagamento */}
          <Card className="bg-muted/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{getPaymentDescription()}</p>
                  <p className="text-sm text-muted-foreground">
                    {paymentType === 'deposit' 
                      ? 'Saldo da pagare entro 30 giorni dalla prenotazione'
                      : 'Pagamento completo, nessun altro addebito'
                    }
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary">
                    {getPaymentAmount()}€
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Errori */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Form di Pagamento */}
          {showPaymentForm && (
            <div className="space-y-4">
              <h4 className="font-semibold">Completa il pagamento</h4>
              <StripeCheckoutButton
                amount={getPaymentAmount() * 100} // Converti in centesimi per Stripe
                currency={session.currency.toLowerCase()}
                tourId={tour.id}
                sessionId={session.id}
                userId={user?.id}
                paymentType="deposit"
                onSuccess={handlePaymentSuccess}
                onError={setError}
              />
            </div>
          )}

          {/* Azioni */}
          {!showPaymentForm && (
            <div className="flex gap-3">
              <Button variant="outline" onClick={onClose} className="flex-1">
                Annulla
              </Button>
              {user ? (
                <Button 
                  onClick={handleStartPayment}
                  disabled={isLoading}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creando pagamento...
                    </>
                  ) : (
                    <>
                      <Euro className="w-4 h-4 mr-2" />
                      Paga {getPaymentAmount()}€
                    </>
                  )}
                </Button>
              ) : (
                <Button 
                  onClick={authMode === 'login' ? handleLogin : handleRegister}
                  disabled={isLoading || !email || !password || (authMode === 'register' && (!firstName || !lastName))}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {authMode === 'login' ? 'Accesso...' : 'Registrazione...'}
                    </>
                  ) : (
                    <>
                      <Euro className="w-4 h-4 mr-2" />
                      {authMode === 'login' ? 'Accedi e Paga' : 'Registrati e Paga'} {getPaymentAmount()}€
                    </>
                  )}
                </Button>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
