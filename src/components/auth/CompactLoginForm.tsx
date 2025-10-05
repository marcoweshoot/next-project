'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Mail, Lock, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { GoogleAuthButton } from '@/components/auth/GoogleAuthButton'

interface CompactLoginFormProps {
  onSuccess?: () => void
  onError?: (error: string) => void
}

export function CompactLoginForm({ onSuccess, onError }: CompactLoginFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password) {
      setError('Inserisci email e password')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        throw authError
      }

      if (data.user) {
        onSuccess?.()
        router.push('/dashboard')
      }
    } catch (error: any) {
      console.error('❌ Login error:', error)
      const errorMessage = error.message || 'Errore durante il login'
      setError(errorMessage)
      onError?.(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Google Login */}
      <GoogleAuthButton
        mode="signin"
        onSuccess={() => {
          onSuccess?.()
          router.push('/dashboard')
        }}
        onError={(error) => {
          setError(error)
          onError?.(error)
        }}
      />

      {/* Separator */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Oppure
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-10"
            placeholder="mario@email.com"
            disabled={loading}
            autoComplete="email"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pl-10"
            placeholder="••••••••"
            disabled={loading}
            autoComplete="current-password"
          />
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          type="submit"
          className="flex-1"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Accesso...
            </>
          ) : (
            'Accedi'
          )}
        </Button>
      </div>

        <div className="text-center">
          <Button
            type="button"
            variant="link"
            className="text-sm text-muted-foreground hover:text-primary"
            onClick={() => router.push('/auth/register')}
          >
            Non hai un account? Registrati
          </Button>
        </div>
      </form>
    </div>
  )
}
