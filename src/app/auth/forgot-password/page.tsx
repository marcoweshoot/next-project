'use client'

import { useState } from 'react'
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
  ArrowRight, 
  Loader2, 
  Camera,
  MapPin,
  Users,
  Star,
  ArrowLeft,
  CheckCircle
} from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const supabase = createClient()

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Prova prima con l'API custom che bypassa Brevo
      const response = await fetch('/api/auth/send-reset-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const result = await response.json()

      if (!response.ok) {
        // Fallback al metodo standard se l'API custom fallisce
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/reset-password`,
        })

        if (error) {
          setError(error.message)
        } else {
          setSuccess(true)
        }
      } else {
        setSuccess(true)
        console.log('Reset email sent via custom API:', result)
      }
    } catch {
      setError('Si è verificato un errore durante l\'invio della richiesta')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[url('/fallbacks/tour-cover.avif')] bg-cover bg-center opacity-5 dark:opacity-10" />
        
        <div className="relative min-h-screen flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            {/* Mobile Logo */}
            <div className="flex justify-center mb-8">
              <Image
                src="/lovable-uploads/logo-dark.svg"
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
                    Email Inviata!
                  </CardTitle>
                  <CardDescription className="text-slate-600 dark:text-slate-400 text-base">
                    Ti abbiamo inviato un link per reimpostare la password all'indirizzo <strong>{email}</strong>
                  </CardDescription>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="text-center space-y-4">
                  <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      <strong>Prossimo passo:</strong> Controlla la tua email e clicca sul link per reimpostare la password.
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <Button asChild className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-medium text-base">
                      <Link href="/auth/login">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Torna al Login
                      </Link>
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="w-full h-12"
                      onClick={() => {
                        setSuccess(false)
                        setEmail('')
                      }}
                    >
                      Invia un'altra email
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('/fallbacks/tour-cover.avif')] bg-cover bg-center opacity-5 dark:opacity-10" />
      
      <div className="relative min-h-screen flex">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-center items-center p-12 text-center">
          <div className="max-w-md space-y-8">
            {/* Logo */}
            <div className="flex justify-center">
              <Image
                src="/lovable-uploads/logo-dark.svg"
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
                Recupera la Password
                <span className="block text-2xl text-slate-600 dark:text-slate-300 font-normal mt-2">
                  Ti Aiutiamo a Tornare nel Mondo
                </span>
              </h1>
              
              <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                Non preoccuparti, capita a tutti! Inserisci la tua email e ti invieremo 
                un link sicuro per reimpostare la password.
              </p>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 gap-4 pt-8">
              <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                <Camera className="w-5 h-5 text-red-500" />
                <span>Link sicuro e protetto</span>
              </div>
              <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                <MapPin className="w-5 h-5 text-red-500" />
                <span>Processo veloce e semplice</span>
              </div>
              <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                <Users className="w-5 h-5 text-red-500" />
                <span>Supporto clienti disponibile</span>
              </div>
              <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                <Star className="w-5 h-5 text-red-500" />
                <span>Accesso immediato al tuo account</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Reset Form */}
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

            {/* Reset Card */}
            <Card className="border-0 shadow-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
              <CardHeader className="text-center space-y-4 pb-8">
                <div className="space-y-2">
                  <CardTitle className="text-3xl font-bold text-slate-900 dark:text-white">
                    Password Dimenticata?
                  </CardTitle>
                  <CardDescription className="text-slate-600 dark:text-slate-400 text-base">
                    Inserisci la tua email e ti invieremo un link per reimpostare la password
                  </CardDescription>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <form onSubmit={handleResetPassword} className="space-y-5">
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
                        Invio in corso...
                      </>
                    ) : (
                      <>
                        Invia Link di Reset
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

                <div className="text-center space-y-2">
                  <Button asChild variant="outline" className="w-full h-12">
                    <Link href="/auth/login">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Torna al Login
                    </Link>
                  </Button>
                  
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
              <p>Il link sarà valido per 24 ore dalla richiesta</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
