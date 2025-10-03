'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import Link from 'next/link'
import Header from '@/components/Header'
import { GoogleAuthButton } from '@/components/auth/GoogleAuthButton'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleRegister = async (e: React.FormEvent) => {
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
        // Crea il profilo manualmente se il trigger non funziona
        try {
          await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              first_name: firstName,
              last_name: lastName
            })
        } catch (profileError) {
          console.log('Profilo già esistente o errore:', profileError)
        }
        setSuccess(true)
      }
    } catch (err) {
      setError('Si è verificato un errore durante la registrazione')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center p-4 pt-20 lg:pt-24">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-green-600">Registrazione Completata!</CardTitle>
            <CardDescription>
              Ti abbiamo inviato un'email di conferma. Controlla la tua casella di posta.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button asChild>
              <Link href="/auth/login">Vai al Login</Link>
            </Button>
        </CardContent>
      </Card>
      </div>
    </div>
  )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex items-center justify-center p-4 pt-20 lg:pt-24">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Registrati</CardTitle>
          <CardDescription>
            Crea un account per gestire le tue prenotazioni
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Nome</Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="Mario"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Cognome</Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Rossi"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="mario.rossi@esempio.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Minimo 6 caratteri"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Conferma Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Ripeti la password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Registrazione in corso...' : 'Registrati'}
            </Button>
          </form>
          
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Oppure
              </span>
            </div>
          </div>
          
          <GoogleAuthButton 
            mode="signup"
            onSuccess={() => router.push('/dashboard')}
            onError={(error) => setError(error)}
          />
          
          <div className="mt-4 text-center text-sm">
            Hai già un account?{' '}
            <Link href="/auth/login" className="text-primary hover:underline">
              Accedi qui
            </Link>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  )
}
