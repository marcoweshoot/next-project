'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import Header from '@/components/Header'
import { CheckCircle, Loader2, User, Mail, AlertCircle } from 'lucide-react'

function GoogleSignupConfirmContent() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [privacyAccepted, setPrivacyAccepted] = useState(false)
  const [marketingAccepted, setMarketingAccepted] = useState(false)
  const [userData, setUserData] = useState<{
    id: string;
    email: string;
    name: string;
    firstName: string;
    lastName: string;
    avatar: string;
  } | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  const userId = searchParams.get('user_id')

  useEffect(() => {
    if (!userId) {
      router.push('/auth/login')
      return
    }

    // Get user data from auth
    const getUserData = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        
        if (error || !user) {
          setError('Errore nel recupero dei dati utente')
          return
        }

        setUserData({
          id: user.id,
          email: user.email,
          name: user.user_metadata?.full_name || user.user_metadata?.name || '',
          firstName: user.user_metadata?.first_name || user.user_metadata?.given_name || '',
          lastName: user.user_metadata?.last_name || user.user_metadata?.family_name || '',
          avatar: user.user_metadata?.avatar_url || user.user_metadata?.picture || '',
        })
      } catch {
        setError('Errore nel recupero dei dati utente')
      }
    }

    getUserData()
  }, [userId, router, supabase.auth])

  const handleConfirmSignup = async () => {
    if (!userData) return

    // Validation
    if (!privacyAccepted) {
      setError('Devi accettare la Privacy Policy e i Termini e Condizioni')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Create profile using API that bypasses RLS
      const response = await fetch('/api/create-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userData.id,
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          privacyAccepted: privacyAccepted,
          marketingAccepted: marketingAccepted
        })
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        console.error('Profile creation error:', result.error)
        setError('Errore nella creazione del profilo. Riprova.')
        return
      }

      // Success - redirect to dashboard
      router.push('/dashboard')
    } catch (err) {
      console.error('Error:', err)
      setError('Errore durante la registrazione. Riprova.')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    // Sign out the user and redirect to login
    supabase.auth.signOut().then(() => {
      router.push('/auth/login')
    })
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-red-600 mx-auto" />
            <p className="text-muted-foreground">Caricamento dati...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <CardTitle className="text-xl">Conferma Registrazione</CardTitle>
            <CardDescription>
              Non abbiamo trovato un account associato a questo indirizzo email. 
              Vuoi creare un nuovo account con i tuoi dati Google?
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* User Data Preview */}
            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <h4 className="font-medium text-sm text-muted-foreground">Dati che verranno salvati:</h4>
              
              {userData.avatar && (
                <div className="flex items-center gap-3">
                  <img 
                    src={userData.avatar} 
                    alt="Avatar" 
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <p className="font-medium">{userData.name || `${userData.firstName} ${userData.lastName}`}</p>
                    <p className="text-sm text-muted-foreground">Foto profilo</p>
                  </div>
                </div>
              )}
              
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">{userData.email}</p>
                  <p className="text-sm text-muted-foreground">Email</p>
                </div>
              </div>
              
              {(userData.firstName || userData.lastName) && (
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">
                      {userData.firstName} {userData.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">Nome e cognome</p>
                  </div>
                </div>
              )}
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Privacy and Marketing Consent */}
            <div className="space-y-4 border-t pt-4">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="privacyAccepted"
                  checked={privacyAccepted}
                  onChange={(e) => setPrivacyAccepted(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label htmlFor="privacyAccepted" className="text-sm text-muted-foreground leading-tight">
                  Accetto la{' '}
                  <a href="/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    Privacy Policy
                  </a>{' '}
                  e i{' '}
                  <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    Termini e Condizioni
                  </a>
                  {' '}<span className="text-destructive">*</span>
                </label>
              </div>

              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="marketingAccepted"
                  checked={marketingAccepted}
                  onChange={(e) => setMarketingAccepted(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label htmlFor="marketingAccepted" className="text-sm text-muted-foreground leading-tight">
                  Acconsento a ricevere comunicazioni marketing e newsletter
                </label>
              </div>
            </div>

            <div className="space-y-3">
              <Button 
                onClick={handleConfirmSignup}
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creazione account...
                  </>
                ) : (
                  'Sì, crea il mio account'
                )}
              </Button>
              
              <Button 
                variant="outline" 
                onClick={handleCancel}
                disabled={loading}
                className="w-full"
              >
                No, torna al login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function GoogleSignupConfirmPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-red-600 mx-auto" />
            <p className="text-muted-foreground">Caricamento...</p>
          </div>
        </div>
      </div>
    }>
      <GoogleSignupConfirmContent />
    </Suspense>
  )
}
