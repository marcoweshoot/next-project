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
  Lock, 
  ArrowRight, 
  Loader2, 
  Camera,
  MapPin,
  Users,
  Star,
  ArrowLeft,
  CheckCircle,
  Eye,
  EyeOff
} from 'lucide-react'

function ResetPasswordForm() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isValidSession, setIsValidSession] = useState<boolean | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session) {
          setIsValidSession(true)
        } else {
          // Check URL params for PKCE format (token and token_hash)
          const token = searchParams.get('token')
          const tokenHash = searchParams.get('token_hash')
          const type = searchParams.get('type')
          
          // Fallback: check cookies for old format
          let accessToken = document.cookie
            .split('; ')
            .find(row => row.startsWith('reset_access_token='))
            ?.split('=')[1]
          let refreshToken = document.cookie
            .split('; ')
            .find(row => row.startsWith('reset_refresh_token='))
            ?.split('=')[1]
          let code = document.cookie
            .split('; ')
            .find(row => row.startsWith('reset_code='))
            ?.split('=')[1]
          
          // Fallback: check URL params for old format if PKCE not found
          if (!token && !tokenHash) {
            accessToken = searchParams.get('access_token')
            refreshToken = searchParams.get('refresh_token')
            code = searchParams.get('code')
          }
          
          // Debug logging
          console.log('🔍 Reset password parameters:', { 
            hasToken: !!token,
            hasTokenHash: !!tokenHash,
            hasType: !!type,
            hasAccessToken: !!accessToken, 
            hasRefreshToken: !!refreshToken,
            hasCode: !!code,
            cookies: document.cookie,
            urlParams: {
              token: searchParams.get('token'),
              token_hash: searchParams.get('token_hash'),
              type: searchParams.get('type'),
              access_token: searchParams.get('access_token'),
              refresh_token: searchParams.get('refresh_token'),
              code: searchParams.get('code')
            },
            currentUrl: window.location.href,
            searchParams: Object.fromEntries(searchParams.entries())
          })
          
                // Alert visibile per debug (rimuovere dopo test)
                alert(`DEBUG PKCE: Token: ${!!token}, TokenHash: ${!!tokenHash}, Type: ${type}
DEBUG Old: AccessToken: ${!!accessToken}, RefreshToken: ${!!refreshToken}, Code: ${!!code}
                
URL: ${window.location.href}
Cookies: ${document.cookie}
Search Params: ${window.location.search}`)
          
          // Log dettagliato per debug
          console.log('🔍 DEBUG DETAILS:', {
            token: token ? `${token.substring(0, 20)}...` : null,
            tokenHash: tokenHash ? `${tokenHash.substring(0, 20)}...` : null,
            type: type,
            accessToken: accessToken ? `${accessToken.substring(0, 20)}...` : null,
            refreshToken: refreshToken ? `${refreshToken.substring(0, 20)}...` : null,
            code: code ? `${code.substring(0, 20)}...` : null,
            allCookies: document.cookie,
            searchParams: Object.fromEntries(searchParams.entries()),
            currentUrl: window.location.href
          })
          
          // Se abbiamo token e token_hash (formato PKCE)
          if (token && tokenHash && type === 'recovery') {
            console.log('🔍 Using PKCE format for verification:', {
              tokenLength: token.length,
              tokenHashLength: tokenHash.length,
              type: type
            })
            
            try {
              // Per PKCE, verifichiamo il token_hash
              const { error: verifyError } = await supabase.auth.verifyOtp({
                token_hash: tokenHash,
                type: 'recovery'
              })
              
              console.log('🔍 PKCE verification result:', { verifyError })
              
              if (verifyError) {
                if (verifyError.message.includes('expired') || verifyError.message.includes('scaduto')) {
                  setError('Il link di reset è scaduto. Richiedi un nuovo link.')
                } else {
                  setError('Link di reset non valido o scaduto')
                }
                setIsValidSession(false)
              } else {
                // Token PKCE validi - richiedi nuova password
                setIsValidSession(true)
              }
            } catch {
              setError('Link di reset non valido')
              setIsValidSession(false)
            }
          }
          // Se abbiamo access_token e refresh_token (formato vecchio)
          else if (accessToken && refreshToken) {
            // Verifica che i token siano validi ma NON creare la sessione
            // La sessione verrà creata solo dopo l'inserimento della nuova password
            try {
              // Verifica che i token siano validi senza crearli
              const { error: verifyError } = await supabase.auth.getUser(accessToken)
              
              if (verifyError) {
                setError('Link di reset non valido o scaduto')
                setIsValidSession(false)
              } else {
                // Token validi, ma non creare sessione - richiedi nuova password
                setIsValidSession(true)
              }
            } catch {
              setError('Link di reset non valido')
              setIsValidSession(false)
            }
          }
          // Se abbiamo un code (formato nuovo)
          else if (code) {
            // Per il formato nuovo con code, verifichiamo che il code sia valido
            // Il code verrà usato per verificare la password durante l'update
            try {
              console.log('🔍 Attempting to verify code:', {
                codeLength: code.length,
                codeStart: code.substring(0, 10),
                codeEnd: code.substring(code.length - 10),
                fullCode: code
              })
              
              // Verifica che il code sia valido (non crea sessione)
              // Per recovery, dobbiamo usare token_hash invece di token
              const { error } = await supabase.auth.verifyOtp({
                token_hash: code,
                type: 'recovery'
              })
              
              console.log('🔍 Verification result:', { error })
              
              if (error) {
                if (error.message.includes('expired') || error.message.includes('scaduto')) {
                  setError('Il link di reset è scaduto. Richiedi un nuovo link.')
                } else {
                  setError('Link di reset non valido o scaduto')
                }
                setIsValidSession(false)
              } else {
                // Code valido - richiedi nuova password
                setIsValidSession(true)
              }
            } catch {
              setError('Link di reset non valido')
              setIsValidSession(false)
            }
          } else {
            setError('Link di reset non valido')
            setIsValidSession(false)
          }
        }
      } catch {
        setError('Errore nella verifica del link')
        setIsValidSession(false)
      }
    }

    checkSession()
  }, [searchParams, supabase.auth])

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Validation
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
      // Check URL params for PKCE format first
      const token = searchParams.get('token')
      const tokenHash = searchParams.get('token_hash')
      const type = searchParams.get('type')
      
      // Fallback: check cookies for old format
      let accessToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('reset_access_token='))
        ?.split('=')[1]
      let refreshToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('reset_refresh_token='))
        ?.split('=')[1]
      let code = document.cookie
        .split('; ')
        .find(row => row.startsWith('reset_code='))
        ?.split('=')[1]
      
      // Fallback: check URL params for old format if PKCE not found
      if (!token && !tokenHash) {
        accessToken = searchParams.get('access_token')
        refreshToken = searchParams.get('refresh_token')
        code = searchParams.get('code')
      }
      
      // Se abbiamo token e token_hash (formato PKCE)
      if (token && tokenHash && type === 'recovery') {
        console.log('🔍 Using PKCE format for password reset:', { 
          token: `${token.substring(0, 20)}...`,
          tokenHash: `${tokenHash.substring(0, 20)}...`,
          type: type
        })
        
        // Per PKCE, prima verifichiamo il token_hash e poi aggiorniamo la password
        const { data: verifyData, error: verifyError } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: 'recovery'
        })
        
        console.log('🔍 PKCE verification result:', { verifyData, verifyError })
        
        if (verifyError) {
          setError(verifyError.message)
        } else {
          // Ora che il token è verificato, aggiorna la password
          const { error: updateError } = await supabase.auth.updateUser({
            password: password
          })
          
          if (updateError) {
            setError(updateError.message)
          } else {
            setSuccess(true)
            // Redirect to dashboard after 3 seconds
            setTimeout(() => {
              router.push('/dashboard')
            }, 3000)
          }
        }
      }
      // Se abbiamo access_token e refresh_token (formato vecchio)
      else if (accessToken && refreshToken) {
        // Crea la sessione temporanea per poter aggiornare la password
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        })
        
        if (sessionError) {
          setError('Sessione non valida. Riprova con un nuovo link.')
          return
        }
        
        // Ora aggiorna la password
        const { error } = await supabase.auth.updateUser({
          password: password
        })

        if (error) {
          setError(error.message)
        } else {
          // Pulisci i cookie di reset per sicurezza
          document.cookie = 'reset_access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/auth/reset-password;'
          document.cookie = 'reset_refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/auth/reset-password;'
          
          setSuccess(true)
          // Redirect to dashboard after 3 seconds
          setTimeout(() => {
            router.push('/dashboard')
          }, 3000)
        }
      }
      // Se abbiamo un code (formato nuovo)
      else if (code) {
        console.log('🔍 Using CODE format for password reset:', { code: `${code.substring(0, 20)}...` })
        
        // Per il formato nuovo con code, prima verifichiamo il code e poi aggiorniamo la password
        const { data: verifyData, error: verifyError } = await supabase.auth.verifyOtp({
          token_hash: code,
          type: 'recovery'
        })
        
        console.log('🔍 Code verification result:', { verifyData, verifyError })
        
        if (verifyError) {
          setError(verifyError.message)
        } else {
          // Ora che il code è verificato, aggiorna la password
          const { error: updateError } = await supabase.auth.updateUser({
            password: password
          })
          
          if (updateError) {
            setError(updateError.message)
          } else {
            // Pulisci il cookie di reset per sicurezza
            document.cookie = 'reset_code=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/auth/reset-password;'
            
            setSuccess(true)
            // Redirect to dashboard after 3 seconds
            setTimeout(() => {
              router.push('/dashboard')
            }, 3000)
          }
        }
      } else {
        setError('Token o codice mancanti. Riprova con un nuovo link.')
      }
    } catch {
      setError('Si è verificato un errore durante l\'aggiornamento della password')
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
                    Password Aggiornata!
                  </CardTitle>
                  <CardDescription className="text-slate-600 dark:text-slate-400 text-base">
                    La tua password è stata aggiornata con successo. Verrai reindirizzato alla dashboard tra pochi secondi.
                  </CardDescription>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="text-center space-y-4">
                  <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <p className="text-sm text-green-800 dark:text-green-200">
                      <strong>Successo!</strong> Ora puoi accedere al tuo account con la nuova password.
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <Button asChild className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-medium text-base">
                      <Link href="/dashboard">
                        Vai alla Dashboard
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Link>
                    </Button>
                    
                    <Button asChild variant="outline" className="w-full h-12">
                      <Link href="/auth/login">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Torna al Login
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Footer */}
            <div className="text-center text-xs text-slate-500 dark:text-slate-400 mt-6">
              <p>Reindirizzamento automatico in corso...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (isValidSession === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Verifica del link in corso...</span>
        </div>
      </div>
    )
  }

  if (isValidSession === false) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="relative min-h-screen flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            <Card className="border-0 shadow-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
              <CardHeader className="text-center space-y-4 pb-8">
                <div className="space-y-2">
                  <CardTitle className="text-3xl font-bold text-slate-900 dark:text-white">
                    Link Non Valido
                  </CardTitle>
                  <CardDescription className="text-slate-600 dark:text-slate-400 text-base">
                    Il link di reset password non è valido o è scaduto
                  </CardDescription>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <Alert variant="destructive" className="border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800">
                  <AlertDescription className="text-red-800 dark:text-red-200">
                    {error || 'Il link potrebbe essere scaduto o non valido. Richiedi un nuovo link di reset.'}
                  </AlertDescription>
                </Alert>

                <div className="text-center space-y-3">
                  <Button asChild className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-medium text-base">
                    <Link href="/auth/forgot-password">
                      Richiedi Nuovo Link
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                  
                  <Button asChild variant="outline" className="w-full h-12">
                    <Link href="/auth/login">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Torna al Login
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
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
                Nuova Password
                <span className="block text-2xl text-slate-600 dark:text-slate-300 font-normal mt-2">
                  Riprendi il Controllo del Tuo Account
                </span>
              </h1>
              
              <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                Inserisci una nuova password sicura per il tuo account. 
                Scegli una password forte per proteggere i tuoi dati.
              </p>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 gap-4 pt-8">
              <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                <Camera className="w-5 h-5 text-red-500" />
                <span>Password sicura e protetta</span>
              </div>
              <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                <MapPin className="w-5 h-5 text-red-500" />
                <span>Accesso immediato alla dashboard</span>
              </div>
              <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                <Users className="w-5 h-5 text-red-500" />
                <span>Tutti i tuoi dati al sicuro</span>
              </div>
              <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                <Star className="w-5 h-5 text-red-500" />
                <span>Continua la tua avventura fotografica</span>
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
                    Imposta Nuova Password
                  </CardTitle>
                  <CardDescription className="text-slate-600 dark:text-slate-400 text-base">
                    Scegli una password sicura per proteggere il tuo account
                  </CardDescription>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <form onSubmit={handleResetPassword} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Nuova Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Minimo 6 caratteri"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="pl-10 pr-10 h-12 border-slate-200 dark:border-slate-700 focus:border-red-500 focus:ring-red-500/20"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
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
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Ripeti la password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="pl-10 pr-10 h-12 border-slate-200 dark:border-slate-700 focus:border-red-500 focus:ring-red-500/20"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
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
                        Aggiornamento in corso...
                      </>
                    ) : (
                      <>
                        Aggiorna Password
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

                <div className="text-center">
                  <Button asChild variant="outline" className="w-full h-12">
                    <Link href="/auth/login">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Torna al Login
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Footer */}
            <div className="text-center text-xs text-slate-500 dark:text-slate-400">
              <p>Assicurati che la password sia sicura e non la condividere con altri</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Caricamento...</span>
        </div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  )
}
