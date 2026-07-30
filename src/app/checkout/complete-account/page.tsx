'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'
import { Loader2, CheckCircle, Lock, Mail, User, MapPin, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { GoogleAuthButton } from '@/components/auth/GoogleAuthButton'
import { generateEventId, getFbCookies } from '@/utils/facebook'
import { savePostPaymentClaim } from '@/utils/postPaymentClaim'
import { trackCheckoutFunnel } from '@/utils/checkoutFunnel'

interface GuestData {
  email: string
  firstName: string | null
  lastName: string | null
  fiscalCode: string | null
  phoneNumber: string | null
  addressLine1: string | null
  city: string | null
  postalCode: string | null
  country: string | null
}

function CompleteAccountContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [guest, setGuest] = useState<GuestData | null>(null)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [privacyAccepted, setPrivacyAccepted] = useState(false)
  const [marketingAccepted, setMarketingAccepted] = useState(false)

  useEffect(() => {
    const loadClaim = async () => {
      if (!sessionId) {
        setError('Sessione di pagamento non valida')
        setLoading(false)
        return
      }

      try {
        const res = await fetch(`/api/checkout/claim/${sessionId}`)
        const data = await res.json()

        if (!res.ok) {
          setError(data.error || 'Impossibile recuperare i dati del pagamento')
          return
        }

        if (data.status === 'claimed' || data.status === 'auto_linked') {
          router.replace(`/auth/login?email=${encodeURIComponent(data.email || '')}&message=payment_success`)
          return
        }

        if (data.guest) {
          setGuest(data.guest)
        } else {
          setError('Dati pagamento non trovati')
        }
      } catch {
        setError('Errore nel caricamento dei dati')
      } finally {
        setLoading(false)
      }
    }

    loadClaim()
  }, [sessionId, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!sessionId || !guest) return

    if (password.length < 6) {
      setError('La password deve essere di almeno 6 caratteri')
      return
    }
    if (password !== confirmPassword) {
      setError('Le password non coincidono')
      return
    }
    if (!privacyAccepted) {
      setError('Devi accettare la Privacy Policy')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const fbEventId = generateEventId()
      const { fbc, fbp } = getFbCookies()

      const res = await fetch(`/api/checkout/claim/${sessionId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password,
          privacyAccepted,
          marketingAccepted,
          fbEventId,
          fbc,
          fbp,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Errore durante la creazione dell\'account')
        return
      }

      if (data.status === 'linked_existing' || data.needsLogin) {
        router.push(`/auth/login?email=${encodeURIComponent(guest.email)}&message=payment_success`)
        return
      }

      trackCheckoutFunnel({
        step: 'complete_registration',
        metaEvent: 'CompleteRegistration',
      })

      const supabase = createClient()
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: guest.email,
        password,
      })

      if (signInError) {
        router.push(`/auth/login?email=${encodeURIComponent(guest.email)}&message=payment_success`)
        return
      }

      router.push('/dashboard?payment=success')
    } catch {
      setError('Errore imprevisto. Riprova o contattaci.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleGoogleClick = () => {
    if (sessionId) savePostPaymentClaim(sessionId)
  }

  const formatAddress = () => {
    if (!guest) return '—'
    const parts = [
      guest.addressLine1,
      [guest.postalCode, guest.city].filter(Boolean).join(' '),
      guest.country,
    ].filter(Boolean)
    return parts.length > 0 ? parts.join(', ') : '—'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error && !guest) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center space-y-4">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto" />
            <p className="text-muted-foreground">{error}</p>
            <Button onClick={() => router.push('/')}>Torna alla home</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-12 px-4">
      <div className="max-w-lg mx-auto space-y-6">
        <div className="text-center space-y-2">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
          <h1 className="text-2xl font-bold">Pagamento completato</h1>
          <p className="text-muted-foreground">Completa il tuo account per accedere alla dashboard</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">I tuoi dati (da Stripe)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <Mail className="w-4 h-4 mt-0.5 text-muted-foreground" />
              <div>
                <p className="text-muted-foreground">Email</p>
                <p className="font-medium">{guest?.email}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <User className="w-4 h-4 mt-0.5 text-muted-foreground" />
              <div>
                <p className="text-muted-foreground">Nome</p>
                <p className="font-medium">
                  {[guest?.firstName, guest?.lastName].filter(Boolean).join(' ') || '—'}
                </p>
              </div>
            </div>
            {guest?.fiscalCode && (
              <div>
                <p className="text-muted-foreground">Codice fiscale</p>
                <p className="font-medium">{guest.fiscalCode}</p>
              </div>
            )}
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground" />
              <div>
                <p className="text-muted-foreground">Indirizzo</p>
                <p className="font-medium">{formatAddress()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Scegli una password</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    className="pl-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimo 6 caratteri"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Conferma password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    className="pl-10"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ripeti la password"
                    required
                  />
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Checkbox
                  id="privacy"
                  checked={privacyAccepted}
                  onCheckedChange={(v) => setPrivacyAccepted(v === true)}
                />
                <Label htmlFor="privacy" className="text-sm leading-snug cursor-pointer">
                  Accetto la{' '}
                  <a href="/privacy-policy" target="_blank" rel="noopener noreferrer" className="underline">
                    Privacy Policy
                  </a>
                </Label>
              </div>

              <div className="flex items-start gap-2">
                <Checkbox
                  id="marketing"
                  checked={marketingAccepted}
                  onCheckedChange={(v) => setMarketingAccepted(v === true)}
                />
                <Label htmlFor="marketing" className="text-sm leading-snug cursor-pointer">
                  Desidero ricevere comunicazioni marketing (opzionale)
                </Label>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creazione account...
                  </>
                ) : (
                  'Completa account e vai alla dashboard'
                )}
              </Button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">oppure</span>
              </div>
            </div>

            <div onClick={handleGoogleClick}>
              <GoogleAuthButton mode="signup" postPaymentSessionId={sessionId || undefined} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function CompleteAccountPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      }
    >
      <CompleteAccountContent />
    </Suspense>
  )
}
