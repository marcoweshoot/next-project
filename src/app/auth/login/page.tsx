'use client'

import { useState, useEffect, Suspense } from 'react'
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
  ArrowRight, 
  Loader2, 
  Camera,
  MapPin,
  Users,
  Star,
  CheckCircle
} from 'lucide-react'
import { GoogleAuthButton } from '@/components/auth/GoogleAuthButton'
import dynamic from 'next/dynamic'

const Aurora = dynamic(() => import('@/components/ui/Aurora'), { ssr: false })
const SplashCursor = dynamic(() => import('@/components/ui/SplashCursor'), { ssr: false })

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    if (searchParams.get('message') === 'payment_success') {
      setShowPaymentSuccess(true)
    }
  }, [searchParams])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError(error.message)
      } else {
        router.push('/dashboard')
        router.refresh()
      }
    } catch {
      setError('Si è verificato un errore durante il login')
    } finally {
      setLoading(false)
    }
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
      
      {/* Splash Cursor Effect */}
      <SplashCursor />
      
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
            <div className="space-y-6">
              <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
                Benvenuto
                <span className="block text-2xl text-slate-600 dark:text-slate-300 font-normal mt-2">
                  Torna nella Tua Avventura
                </span>
              </h1>
              
              <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                Accedi al tuo account per gestire le prenotazioni, 
                visualizzare i tuoi viaggi e continuare la tua passione fotografica.
              </p>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 gap-4 pt-8">
              <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                <Camera className="w-5 h-5 text-red-500" />
                <span>Gestisci le tue prenotazioni</span>
              </div>
              <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                <MapPin className="w-5 h-5 text-red-500" />
                <span>Visualizza i tuoi viaggi</span>
              </div>
              <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                <Users className="w-5 h-5 text-red-500" />
                <span>Condividi le tue foto</span>
              </div>
              <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                <Star className="w-5 h-5 text-red-500" />
                <span>Continua la tua avventura</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
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

            {/* Login Card */}
            <Card className="border-0 shadow-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
              <CardHeader className="text-center space-y-4 pb-8">
                <div className="space-y-2">
                  <CardTitle className="text-3xl font-bold text-slate-900 dark:text-white">
                    Accedi
                  </CardTitle>
                  <CardDescription className="text-slate-600 dark:text-slate-400 text-base">
                    Accedi al tuo account per gestire le tue prenotazioni
                  </CardDescription>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {showPaymentSuccess && (
                  <Alert className="border-green-500 bg-green-50 dark:bg-green-950 dark:border-green-800">
                    <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <AlertDescription className="text-green-800 dark:text-green-200">
                      <strong>Pagamento completato con successo!</strong>
                      <br />
                      Abbiamo creato il tuo account. Fai il login per accedere alla dashboard.
                    </AlertDescription>
                  </Alert>
                )}
                
                <form onSubmit={handleLogin} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Email
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="la-tua-email@esempio.com"
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
                        placeholder="La tua password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="pl-10 h-12 border-slate-200 dark:border-slate-700 focus:border-red-500 focus:ring-red-500/20"
                      />
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
                        Accesso in corso...
                      </>
                    ) : (
                      <>
                        Accedi
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </form>

                <div className="text-center">
                  <Link href="/auth/forgot-password" className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors duration-200 hover:underline">
                    Hai dimenticato la password?
                  </Link>
                </div>

                <div className="relative">
                  <Separator className="bg-slate-200 dark:bg-slate-700" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="bg-white dark:bg-slate-900 px-4 text-sm text-slate-500 dark:text-slate-400">
                      oppure
                    </span>
                  </div>
                </div>

                <GoogleAuthButton 
                  mode="signin"
                  onSuccess={() => router.push('/dashboard')}
                  onError={(error) => setError(error)}
                />

                <div className="text-center">
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Non hai ancora un account?{' '}
                    <Link 
                      href="/auth/register" 
                      className="font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors duration-200 hover:underline"
                    >
                      Registrati qui
                    </Link>
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Footer */}
            <div className="text-center text-xs text-slate-500 dark:text-slate-400">
              <p>Accedi in modo sicuro e gestisci le tue prenotazioni</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Aurora 
            amplitude={1.0}
            blend={0.5}
            speed={0.8}
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/40 via-transparent to-slate-900/60 z-0" />
        <SplashCursor />
        <div className="relative z-10 min-h-screen flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin text-red-500" />
            <span className="text-white">Caricamento...</span>
          </div>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
