'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'
import { buildCheckoutResumeUrl, loadCheckoutDraft } from '@/utils/checkoutDraft'
import { loadPostPaymentClaim, clearPostPaymentClaim } from '@/utils/postPaymentClaim'

export default function AuthCallbackPage() {
  const router = useRouter()
  const supabase = createClient()

  const redirectAfterAuth = () => {
    const draft = loadCheckoutDraft()
    if (draft) {
      router.push(buildCheckoutResumeUrl(draft))
      return
    }
    router.push('/dashboard')
  }

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

          const postPaymentSessionId = loadPostPaymentClaim()
          if (postPaymentSessionId) {
            clearPostPaymentClaim()
            try {
              const res = await fetch('/api/checkout/claim/complete-oauth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionId: postPaymentSessionId }),
              })
              const claimResult = await res.json()

              if (!res.ok) {
                router.push(`/checkout/complete-account?session_id=${postPaymentSessionId}&error=${encodeURIComponent(claimResult.error || 'claim_failed')}`)
                return
              }

              router.push('/dashboard?payment=success')
              return
            } catch {
              router.push(`/checkout/complete-account?session_id=${postPaymentSessionId}&error=claim_failed`)
              return
            }
          }

          const { data: existingProfile, error: profileError } = await supabase
            .from('profiles')
            .select('id, first_name, last_name, email')
            .eq('id', user.id)
            .single()

          const fullName = user.user_metadata?.full_name || user.user_metadata?.name || ''
          const nameParts = fullName.trim().split(' ')
          const firstName = nameParts[0] || ''
          const lastName = nameParts.slice(1).join(' ') || ''

          const googleData = {
            email: user.email || '',
            first_name: firstName,
            last_name: lastName,
            updated_at: new Date().toISOString()
          }

          if (profileError || !existingProfile) {
            router.push(`/auth/google-signup-confirm?user_id=${user.id}`)
            return
          }

          const needsUpdate =
            !existingProfile.first_name ||
            !existingProfile.last_name ||
            !existingProfile.email

          if (needsUpdate) {
            try {
              await supabase
                .from('profiles')
                .update({
                  email: existingProfile.email || googleData.email,
                  first_name: existingProfile.first_name || googleData.first_name,
                  last_name: existingProfile.last_name || googleData.last_name,
                  updated_at: googleData.updated_at
                })
                .eq('id', user.id)
            } catch (err) {
              console.error('Error updating profile:', err)
            }
          }

          redirectAfterAuth()
        } else {
          router.push('/auth/login')
        }
      } catch (err) {
        console.error('Auth callback error:', err)
        router.push('/auth/login?error=auth_failed')
      }
    }

    handleAuthCallback()
  }, [router, supabase])

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
            Stiamo completando l&apos;accesso al tuo account
          </p>
        </div>
      </div>
    </div>
  )
}
