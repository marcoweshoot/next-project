'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import Link from 'next/link'
import Image from 'next/image'
import { 
  Mail, 
  Lock,
  User,
  ArrowRight, 
  Loader2, 
  Camera,
  MapPin,
  Users,
  Star,
  ArrowLeft,
  CheckCircle
} from 'lucide-react'
import { GoogleAuthButton } from '@/components/auth/GoogleAuthButton'
import dynamic from 'next/dynamic'

const Aurora = dynamic(() => import('@/components/ui/Aurora'), { ssr: false })

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [privacyAccepted, setPrivacyAccepted] = useState(false)
  const [marketingAccepted, setMarketingAccepted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [giftCardCode, setGiftCardCode] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  // Check for gift card parameter
  useEffect(() => {
    const giftCard = searchParams.get('gift_card')
    if (giftCard) {
      setGiftCardCode(giftCard)
    }
  }, [searchParams])

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Validation
    if (!privacyAccepted) {
      setError('Devi accettare la Privacy Policy e i Termini e Condizioni')
      setLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError('Le password non corrispondono')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError('La password deve essere di almeno 6 caratteri')
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) {
        setError(error.message)
      } else if (data.user) {
        // Crea il profilo usando l'API che bypassa RLS
        try {
          const response = await fetch('/api/create-profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: data.user.id,
              email: email,
              firstName: firstName,
              lastName: lastName,
              privacyAccepted: privacyAccepted,
              marketingAccepted: marketingAccepted
            })
          })
          
          const result = await response.json()
          console.log('Profile creation result:', result)
          
          if (!response.ok) {
            console.error('Profile creation failed:', result)
          }
        } catch (err) {
          // Profile creation failed, but registration can continue
          console.error('Failed to create profile via API:', err)
        }
        
        // Se l'email confirmation è disabilitata, l'utente è già loggato
        // Redirect direttamente alla dashboard
        if (data.session) {
          // Associate gift card if present
          if (giftCardCode) {
            try {
              await fetch('/api/gift-cards/associate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  giftCardCode: giftCardCode,
                  userId: data.user.id
                })
              })
            } catch (error) {
              console.error('Failed to associate gift card:', error)
              // Don't fail registration if gift card association fails
            }
          }
          router.push('/dashboard')
          return
        }
        
        setSuccess(true)
      }
    } catch {
      setError('Si è verificato un errore durante la registrazione')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-slate-900 relative overflow-hidden">
        {/* Aurora Background */}
        <div className="absolute inset-0 z-0">
          <Aurora 
            amplitude={1.0}
            blend={0.5}
            speed={0.8}
          />
        </div>
        
        {/* Overlay gradient for better readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/40 via-transparent to-slate-900/60 z-0" />
        
        
        <div className="relative z-10 min-h-screen flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            {/* Mobile Logo */}
            <div className="flex justify-center mb-8">
              <Image
                src="/lovable-uploads/logo-light.svg"
                alt="WeShoot"
                width={150}
                height={45}
                className="h-12 w-auto"
                priority
              />
            </div>

            <Card className="border-0 shadow-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
              <CardHeader className="text-center space-y-4 pb-8">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                  </div>
                </div>
                <div className="space-y-2">
                  <CardTitle className="text-3xl font-bold text-slate-900 dark:text-white">
                    Registrazione Completata!
                  </CardTitle>
                  <CardDescription className="text-slate-600 dark:text-slate-400 text-base">
                    Ti abbiamo inviato un'email di conferma all'indirizzo <strong>{email}</strong>
                  </CardDescription>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="text-center space-y-4">
                  <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      <strong>Prossimo passo:</strong> Controlla la tua email e clicca sul link di conferma per attivare il tuo account.
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <Button asChild className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-medium text-base">
                      <Link href="/auth/login">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Vai al Login
                      </Link>
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="w-full h-12"
                      onClick={() => {
                        setSuccess(false)
                        setEmail('')
                        setFirstName('')
                        setLastName('')
                        setPassword('')
                        setConfirmPassword('')
                      }}
                    >
                      Registra un altro account
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Footer */}
            <div className="text-center text-xs text-slate-500 dark:text-slate-400 mt-6">
              <p>Non hai ricevuto l'email? Controlla anche la cartella spam</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 relative overflow-hidden">
      {/* Aurora Background */}
      <div className="absolute inset-0 z-0">
        <Aurora 
          amplitude={1.0}
          blend={0.5}
          speed={0.8}
        />
      </div>
      
      {/* Overlay gradient for better readability */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/40 via-transparent to-slate-900/60 z-0" />
      
      
      <div className="relative z-10 min-h-screen flex">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-center items-center p-12 text-center">
          <div className="max-w-md space-y-8">
            {/* Logo */}
            <div className="flex justify-center">
              <Image
                src="/lovable-uploads/logo-light.svg"
                alt="WeShoot"
                width={200}
                height={60}
                className="h-16 w-auto"
                priority
              />
            </div>
            
            {/* Branding Content */}
            <div className="space-y-6 text-center">
              <h1 className="text-4xl font-bold text-white">
                Unisciti a Noi
                <span className="block text-2xl text-slate-200 font-normal mt-2">
                  Inizia la Tua Avventura Fotografica
                </span>
              </h1>
              
              <p className="text-lg text-slate-300 leading-relaxed">
                Crea il tuo account e accedi a viaggi fotografici unici, 
                gestisci le tue prenotazioni e connettiti con altri fotografi.
              </p>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 gap-4 pt-8">
              <div className="flex items-center justify-center gap-3 text-slate-200">
                <Camera className="w-5 h-5 text-red-500 flex-shrink-0" />
                <span>Viaggi fotografici esclusivi</span>
              </div>
              <div className="flex items-center justify-center gap-3 text-slate-200">
                <MapPin className="w-5 h-5 text-red-500 flex-shrink-0" />
                <span>Destinazioni mozzafiato</span>
              </div>
              <div className="flex items-center justify-center gap-3 text-slate-200">
                <Users className="w-5 h-5 text-red-500 flex-shrink-0" />
                <span>Community di fotografi</span>
              </div>
              <div className="flex items-center justify-center gap-3 text-slate-200">
                <Star className="w-5 h-5 text-red-500 flex-shrink-0" />
                <span>Esperienze indimenticabili</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Register Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <div className="w-full max-w-md space-y-8">
            {/* Mobile Logo */}
            <div className="lg:hidden flex justify-center mb-8">
              <Image
                src="/lovable-uploads/logo-light.svg"
                alt="WeShoot"
                width={150}
                height={45}
                className="h-12 w-auto"
                priority
              />
            </div>

            {/* Register Card */}
            <Card className="border-0 shadow-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
              <CardHeader className="text-center space-y-4 pb-8">
                <div className="space-y-2">
                  <CardTitle className="text-3xl font-bold text-slate-900 dark:text-white">
                    Registrati
                  </CardTitle>
                  <CardDescription className="text-slate-600 dark:text-slate-400 text-base">
                    Crea un account per gestire le tue prenotazioni
                  </CardDescription>
                </div>
                
                {/* Gift Card Banner */}
                {giftCardCode && (
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950 border border-green-200 dark:border-green-800 rounded-lg p-4 mt-4">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <div className="w-6 h-6 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                      </div>
                      <h3 className="font-semibold text-green-800 dark:text-green-200">Gift Card Rilevata!</h3>
                    </div>
                    <p className="text-sm text-green-700 dark:text-green-300 mb-2">
                      Hai una gift card con codice <code className="bg-green-100 dark:bg-green-900 px-2 py-1 rounded font-mono text-sm">{giftCardCode}</code>
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-400">
                      Creando un account potrai gestire la tua gift card, vedere il saldo e ricevere notifiche quando viene utilizzata.
                    </p>
                  </div>
                )}
              </CardHeader>
              
              <CardContent className="space-y-6">
                <form onSubmit={handleRegister} className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Nome
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <Input
                          id="firstName"
                          type="text"
                          placeholder="Mario"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          required
                          className="pl-10 h-12 border-slate-200 dark:border-slate-700 focus:border-red-500 focus:ring-red-500/20"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Cognome
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <Input
                          id="lastName"
                          type="text"
                          placeholder="Rossi"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          required
                          className="pl-10 h-12 border-slate-200 dark:border-slate-700 focus:border-red-500 focus:ring-red-500/20"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Email
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="mario.rossi@esempio.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="pl-10 h-12 border-slate-200 dark:border-slate-700 focus:border-red-500 focus:ring-red-500/20"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="Minimo 6 caratteri"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="pl-10 h-12 border-slate-200 dark:border-slate-700 focus:border-red-500 focus:ring-red-500/20"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Conferma Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="Ripeti la password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="pl-10 h-12 border-slate-200 dark:border-slate-700 focus:border-red-500 focus:ring-red-500/20"
                      />
                    </div>
                  </div>

                  {/* Privacy e Marketing Checkboxes */}
                  <div className="space-y-3">
                    <div className="flex items-start space-x-2">
                      <input
                        type="checkbox"
                        id="privacyAccepted"
                        checked={privacyAccepted}
                        onChange={(e) => setPrivacyAccepted(e.target.checked)}
                        className="mt-1 h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                      />
                      <label htmlFor="privacyAccepted" className="text-sm text-slate-600 dark:text-slate-400 leading-tight">
                        Accetto la{' '}
                        <a href="/privacy-policy" target="_blank" className="text-red-600 hover:underline">
                          Privacy Policy
                        </a>{' '}
                        e i{' '}
                        <a href="/terms" target="_blank" className="text-red-600 hover:underline">
                          Termini e Condizioni
                        </a>{' '}
                        <span className="text-red-500">*</span>
                      </label>
                    </div>

                    <div className="flex items-start space-x-2">
                      <input
                        type="checkbox"
                        id="marketingAccepted"
                        checked={marketingAccepted}
                        onChange={(e) => setMarketingAccepted(e.target.checked)}
                        className="mt-1 h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                      />
                      <label htmlFor="marketingAccepted" className="text-sm text-slate-600 dark:text-slate-400 leading-tight">
                        Accetto di ricevere comunicazioni promozionali e newsletter via email (opzionale)
                      </label>
                    </div>
                  </div>

                  {error && (
                    <Alert variant="destructive" className="border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800">
                      <AlertDescription className="text-red-800 dark:text-red-200">{error}</AlertDescription>
                    </Alert>
                  )}

                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-medium text-base transition-all duration-200 shadow-lg hover:shadow-xl" 
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Registrazione in corso...
                      </>
                    ) : (
                      <>
                        Registrati
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </form>

                <div className="relative">
                  <Separator className="bg-slate-200 dark:bg-slate-700" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="bg-white dark:bg-slate-900 px-4 text-sm text-slate-500 dark:text-slate-400">
                      oppure
                    </span>
                  </div>
                </div>

                <GoogleAuthButton 
                  mode="signup"
                  onSuccess={() => router.push('/dashboard')}
                  onError={(error) => setError(error)}
                />

                <div className="text-center">
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Hai già un account?{' '}
                    <Link 
                      href="/auth/login" 
                      className="font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors duration-200 hover:underline"
                    >
                      Accedi qui
                    </Link>
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Footer */}
            <div className="text-center text-xs text-slate-500 dark:text-slate-400">
              <p>Crea il tuo account e inizia la tua avventura fotografica</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
