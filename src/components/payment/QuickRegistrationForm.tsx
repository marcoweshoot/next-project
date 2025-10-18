'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, User, Mail, Lock, AlertCircle, LogIn } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { GoogleAuthButton } from '@/components/auth/GoogleAuthButton'
import { validateFields } from '@/lib/validation'

interface QuickRegistrationFormProps {
  onSuccess: (userId: string) => void
  onError: (error: string) => void
}

export function QuickRegistrationForm({ onSuccess, onError }: QuickRegistrationFormProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('register')
  
  // Form data per registrazione
  const [registerData, setRegisterData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  
  // Form data per login
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  })
  
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateRegisterForm = () => {
    const newErrors: Record<string, string> = {}

    if (!registerData.firstName.trim()) {
      newErrors.firstName = 'Il nome è obbligatorio'
    }

    if (!registerData.lastName.trim()) {
      newErrors.lastName = 'Il cognome è obbligatorio'
    }

    if (!registerData.email.trim()) {
      newErrors.email = 'L\'email è obbligatoria'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerData.email)) {
      newErrors.email = 'Inserisci un\'email valida'
    }

    if (!registerData.password) {
      newErrors.password = 'La password è obbligatoria'
    } else if (registerData.password.length < 6) {
      newErrors.password = 'La password deve essere di almeno 6 caratteri'
    }

    if (!registerData.confirmPassword) {
      newErrors.confirmPassword = 'Conferma la password'
    } else if (registerData.password !== registerData.confirmPassword) {
      newErrors.confirmPassword = 'Le password non coincidono'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateLoginForm = () => {
    const newErrors: Record<string, string> = {}

    if (!loginData.email.trim()) {
      newErrors.email = 'L\'email è obbligatoria'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginData.email)) {
      newErrors.email = 'Inserisci un\'email valida'
    }

    if (!loginData.password) {
      newErrors.password = 'La password è obbligatoria'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Client-side validation first
    if (!validateRegisterForm()) {
      return
    }

    // Server-side validation
    const validation = validateFields(registerData)
    if (!validation.isValid) {
      setErrors(validation.errors)
      return
    }

    setLoading(true)
    setErrors({})

    try {
      const supabase = createClient()

      // Registra l'utente
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: registerData.email,
        password: registerData.password,
        options: {
          data: {
            first_name: registerData.firstName,
            last_name: registerData.lastName,
            full_name: `${registerData.firstName} ${registerData.lastName}`
          }
        }
      })

      if (authError) {
        throw authError
      }

      if (!authData.user) {
        throw new Error('Errore durante la registrazione')
      }

      // Crea il profilo usando l'API che bypassa RLS
      try {
        await fetch('/api/create-profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: authData.user.id,
            email: registerData.email,
            firstName: registerData.firstName,
            lastName: registerData.lastName
          })
        })
      } catch (profileError) {
        console.error('Errore creazione profilo:', profileError)
        // Non blocchiamo il flusso se il profilo non viene creato
      }

      // Fai il login automatico dopo la registrazione
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email: registerData.email,
        password: registerData.password,
      })

      if (loginError) {
        console.error('❌ Errore login automatico:', loginError)
        // Non blocchiamo il flusso, l'utente può comunque procedere
      }

      // Aspetta un momento per assicurarsi che il login sia completato
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Facebook Pixel: Track CompleteRegistration
      if (typeof window !== 'undefined' && window.fbq) {
        window.fbq('track', 'CompleteRegistration', {
          content_name: 'Quick Registration',
          status: 'completed'
        })
      }

      onSuccess(authData.user.id)
    } catch (error: any) {
      console.error('Errore registrazione:', error)
      
      if (error.message?.includes('already registered')) {
        onError('Questo indirizzo email è già registrato. Prova ad accedere.')
      } else if (error.message?.includes('Invalid email')) {
        onError('Indirizzo email non valido.')
      } else {
        onError(error.message || 'Errore durante la registrazione. Riprova.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Client-side validation first
    if (!validateLoginForm()) {
      return
    }

    // Server-side validation
    const validation = validateFields(loginData)
    if (!validation.isValid) {
      setErrors(validation.errors)
      return
    }

    setLoading(true)
    setErrors({})

    try {
      const supabase = createClient()
      
      // Login dell'utente
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password,
      })

      if (error) {
        throw error
      }

      if (data.user) {
        onSuccess(data.user.id)
      }
    } catch (error: any) {
      console.error('Login error:', error)
      onError(error.message || 'Errore durante l\'accesso')
    } finally {
      setLoading(false)
    }
  }

  const handleRegisterInputChange = (field: string, value: string) => {
    setRegisterData(prev => ({ ...prev, [field]: value }))
    // Rimuovi l'errore quando l'utente inizia a digitare
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleLoginInputChange = (field: string, value: string) => {
    setLoginData(prev => ({ ...prev, [field]: value }))
    // Rimuovi l'errore quando l'utente inizia a digitare
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent, nextFieldId?: string) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (nextFieldId) {
        const nextField = document.getElementById(nextFieldId)
        if (nextField) {
          nextField.focus()
        }
      } else {
        // Se è l'ultimo campo, invia il form appropriato
        if (activeTab === 'login') {
          handleLoginSubmit(e as any)
        } else {
          handleRegisterSubmit(e as any)
        }
      }
    }
  }

  return (
    <Card className="w-full max-w-full overflow-hidden">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <User className="w-5 h-5" />
          Accedi o Registrati
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Scegli come procedere con l'acquisto
        </p>
      </CardHeader>
      <CardContent className="pb-4">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'login' | 'register')} className="w-full">
          {/* Simple buttons for all devices */}
          <div className="flex w-full gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('login')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'login' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span className="hidden sm:inline">Accedi</span>
              <span className="sm:hidden">Login</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('register')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'register' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Registrati</span>
              <span className="sm:hidden">Reg</span>
            </button>
          </div>
          
          <TabsContent value="login" className="mt-6">
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">Email *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="login-email"
                    type="email"
                    value={loginData.email}
                    onChange={(e) => handleLoginInputChange('email', e.target.value)}
                    className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                    placeholder="mario.rossi@email.com"
                    disabled={loading}
                    autoComplete="email"
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="login-password">Password *</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="login-password"
                    type="password"
                    value={loginData.password}
                    onChange={(e) => handleLoginInputChange('password', e.target.value)}
                    className={`pl-10 ${errors.password ? 'border-red-500' : ''}`}
                    placeholder="La tua password"
                    disabled={loading}
                    autoComplete="current-password"
                  />
                </div>
                {errors.password && (
                  <p className="text-sm text-red-500">{errors.password}</p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Accesso in corso...
                  </>
                ) : (
                  'Accedi'
                )}
              </Button>
              
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
              
              <GoogleAuthButton
                mode="signin"
                onSuccess={() => onSuccess('')}
                onError={onError}
              />
            </form>
          </TabsContent>
          
          <TabsContent value="register" className="mt-6">
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="register-firstName">Nome *</Label>
                  <Input
                    id="register-firstName"
                    type="text"
                    value={registerData.firstName}
                    onChange={(e) => handleRegisterInputChange('firstName', e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, 'register-lastName')}
                    className={errors.firstName ? 'border-red-500' : ''}
                    placeholder="Mario"
                    disabled={loading}
                    autoComplete="given-name"
                  />
                  {errors.firstName && (
                    <p className="text-sm text-red-500">{errors.firstName}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-lastName">Cognome *</Label>
                  <Input
                    id="register-lastName"
                    type="text"
                    value={registerData.lastName}
                    onChange={(e) => handleRegisterInputChange('lastName', e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, 'register-email')}
                    className={errors.lastName ? 'border-red-500' : ''}
                    placeholder="Rossi"
                    disabled={loading}
                    autoComplete="family-name"
                  />
                  {errors.lastName && (
                    <p className="text-sm text-red-500">{errors.lastName}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-email">Email *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="register-email"
                    type="email"
                    value={registerData.email}
                    onChange={(e) => handleRegisterInputChange('email', e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, 'register-password')}
                    className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                    placeholder="mario.rossi@email.com"
                    disabled={loading}
                    autoComplete="email"
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email}</p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="register-password">Password *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="register-password"
                      type="password"
                      value={registerData.password}
                      onChange={(e) => handleRegisterInputChange('password', e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, 'register-confirmPassword')}
                      className={`pl-10 ${errors.password ? 'border-red-500' : ''}`}
                      placeholder="Min. 6 caratteri"
                      disabled={loading}
                      autoComplete="new-password"
                    />
                  </div>
                  {errors.password && (
                    <p className="text-sm text-red-500">{errors.password}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-confirmPassword">Conferma *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="register-confirmPassword"
                      type="password"
                      value={registerData.confirmPassword}
                      onChange={(e) => handleRegisterInputChange('confirmPassword', e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e)} // Ultimo campo, invia il form
                      className={`pl-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                      placeholder="Ripeti password"
                      disabled={loading}
                      autoComplete="new-password"
                    />
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-sm text-red-500">{errors.confirmPassword}</p>
                  )}
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Registrazione...
                  </>
                ) : (
                  'Registrati e Procedi'
                )}
              </Button>
              
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
              
              <GoogleAuthButton
                mode="signup"
                onSuccess={() => onSuccess('')}
                onError={onError}
              />
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
