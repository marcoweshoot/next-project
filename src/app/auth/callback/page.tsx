'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'

export default function AuthCallbackPage() {
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Auth callback error:', error)
          router.push('/auth/login?error=auth_failed')
          return
        }

        if (data.session) {
          const user = data.session.user
          
          // Check if this is a new user (created in the last few seconds)
          const isNewUser = user.created_at && 
            new Date(user.created_at).getTime() > (Date.now() - 10000) // 10 seconds ago
          
          if (isNewUser) {
            // Check if user has a profile
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('id')
              .eq('id', user.id)
              .single()
            
            if (profileError || !profile) {
              // New user without profile - redirect to confirmation page
              router.push(`/auth/google-signup-confirm?user_id=${user.id}`)
              return
            }
          }
          
          // Existing user or new user with profile - go to dashboard
          router.push('/dashboard')
        } else {
          // No session, redirect to login
          router.push('/auth/login')
        }
      } catch (err) {
        console.error('Auth callback error:', err)
        router.push('/auth/login?error=auth_failed')
      }
    }

    handleAuthCallback()
  }, [router, supabase.auth])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-red-600" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            Completamento autenticazione...
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Stiamo completando l'accesso al tuo account
          </p>
        </div>
      </div>
    </div>
  )
}
