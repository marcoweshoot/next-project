'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

interface GoogleAuthButtonProps {
  mode: 'signin' | 'signup'
  onSuccess?: () => void
  onError?: (error: string) => void
}

export function GoogleAuthButton({ mode, onSuccess, onError }: GoogleAuthButtonProps) {
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleGoogleAuth = async () => {
    try {
      setLoading(true)
      
      // Detect Safari and mobile devices
      const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      const isSafariMobile = /iPhone|iPad|iPod/.test(navigator.userAgent) && /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent)
      
      console.log('🔍 Auth detection:', { isSafari, isMobile, isSafariMobile, userAgent: navigator.userAgent })
      
      // Per Safari, usiamo sempre redirect manuale
      const shouldUseManualRedirect = isSafari || isSafariMobile || isMobile
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || window.location.origin}/auth/callback`,
          // Safari and mobile-specific options
          ...(shouldUseManualRedirect ? {
            queryParams: {
              access_type: 'offline',
              prompt: 'consent',
            }
          } : {})
        }
      })

      if (error) {
        console.error('❌ Google Auth Error:', error)
        onError?.(error.message)
      } else {
        // Safari e mobile: redirect manuale per evitare problemi
        if (shouldUseManualRedirect) {
          console.log('🔍 Safari/Mobile detected, using manual redirect')
          if (data.url) {
            // Per Safari, usiamo window.location.href per evitare problemi di popup
            window.location.href = data.url
          } else {
            onError?.('URL di redirect non disponibile')
          }
        } else {
          // Desktop: comportamento normale (redirect automatico)
          console.log('🔍 Desktop detected, using automatic redirect')
          onSuccess?.()
        }
      }
    } catch (err) {
      console.error('❌ Google Auth Exception:', err)
      onError?.('Errore durante l\'autenticazione con Google')
    } finally {
      setLoading(false)
    }
  }

  const buttonText = mode === 'signin' ? 'Accedi con Google' : 'Registrati con Google'
  
  // Detect Safari per mostrare messaggio informativo
  const isSafari = typeof window !== 'undefined' && /^((?!chrome|android).)*safari/i.test(navigator.userAgent)

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full h-12 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200"
      onClick={handleGoogleAuth}
      disabled={loading}
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Caricamento...
        </>
      ) : (
        <>
          <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          {buttonText}
        </>
      )}
    </Button>
  )
}
