'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { User } from 'lucide-react'

export default function TestAuthPage() {
  const [email, setEmail] = useState('test@example.com')
  const [password, setPassword] = useState('password123')
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [message, setMessage] = useState('')
  const supabase = createClient()

  useEffect(() => {
    // Check if user is already logged in
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null)
      setMessage(`Auth event: ${event}`)
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const handleSignUp = async () => {
    setLoading(true)
    setMessage('')
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: 'Test',
            last_name: 'User'
          }
        }
      })

      if (error) {
        setMessage(`❌ Errore registrazione: ${error.message}`)
      } else {
        setMessage(`✅ Registrazione completata! Controlla l'email: ${data.user?.email}`)
      }
    } catch (err) {
      setMessage(`❌ Errore: ${err}`)
    } finally {
      setLoading(false)
    }
  }

  const handleSignIn = async () => {
    setLoading(true)
    setMessage('')
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setMessage(`❌ Errore login: ${error.message}`)
      } else {
        setMessage(`✅ Login completato! Benvenuto ${data.user?.email}`)
      }
    } catch (err) {
      setMessage(`❌ Errore: ${err}`)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setMessage('Logout completato')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Test Autenticazione Supabase
          </CardTitle>
          <CardDescription>
            Testa il sistema di login/registrazione
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* User Status */}
          {user ? (
            <Alert>
              <User className="w-4 h-4" />
              <AlertDescription>
                <strong>Utente loggato:</strong> {user.email}<br/>
                <strong>ID:</strong> {user.id}<br/>
                <strong>Creato:</strong> {new Date(user.created_at).toLocaleString()}
              </AlertDescription>
            </Alert>
          ) : (
            <Alert>
              <AlertDescription>
                Nessun utente loggato
              </AlertDescription>
            </Alert>
          )}

          {/* Auth Form */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-2">
            {!user ? (
              <>
                <Button onClick={handleSignUp} disabled={loading}>
                  Registrati
                </Button>
                <Button onClick={handleSignIn} disabled={loading} variant="default">
                  Login
                </Button>
              </>
            ) : (
              <Button onClick={handleSignOut} variant="destructive">
                Logout
              </Button>
            )}
          </div>

          {/* Messages */}
          {message && (
            <Alert>
              <AlertDescription className="whitespace-pre-line">
                {message}
              </AlertDescription>
            </Alert>
          )}

          {/* Navigation */}
          <div className="text-center text-sm text-muted-foreground">
            <p>
              <a href="/test-supabase" className="text-primary hover:underline">
                ← Test Connessione
              </a>
              {' | '}
              <a href="/auth/login" className="text-primary hover:underline">
                Pagina Login →
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
