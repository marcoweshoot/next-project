'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'

function ResetPasswordRedirectContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [_loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleRedirect = async () => {
      try {
        // Aspetta che la pagina si carichi completamente
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Cerca il vero URL di reset password nei parametri
        const url = searchParams.get('url') || searchParams.get('redirect_url') || searchParams.get('link')
        
        if (url) {
          // Decodifica l'URL se è codificato
          const decodedUrl = decodeURIComponent(url)
          console.log('🔍 Redirecting to:', decodedUrl)
          
          // Reindirizza al vero URL di reset password
          window.location.href = decodedUrl
        } else {
          // Se non troviamo l'URL, prova a cercare token/code nei parametri
          const accessToken = searchParams.get('access_token')
          const refreshToken = searchParams.get('refresh_token')
          const code = searchParams.get('code')
          
          if (accessToken && refreshToken) {
            // Redirect con token vecchi
            const resetUrl = `/auth/reset-password?access_token=${accessToken}&refresh_token=${refreshToken}`
            router.push(resetUrl)
          } else if (code) {
            // Redirect con code nuovo
            const resetUrl = `/auth/reset-password?code=${code}`
            router.push(resetUrl)
          } else {
            setError('Link di reset password non valido')
          }
        }
      } catch (err) {
        console.error('Redirect error:', err)
        setError('Errore durante il redirect')
      } finally {
        setLoading(false)
      }
    }

    handleRedirect()
  }, [router, searchParams])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="text-center space-y-4 max-w-md mx-auto p-6">
          <div className="text-red-500 text-6xl">⚠️</div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            Link non valido
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            {error}
          </p>
          <button
            onClick={() => router.push('/auth/forgot-password')}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Richiedi nuovo reset
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-red-600" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            Reindirizzamento...
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Stiamo reindirizzando al link di reset password
          </p>
        </div>
      </div>
    </div>
  )
}

export default function ResetPasswordRedirectPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-red-600" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              Caricamento...
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Preparazione del redirect...
            </p>
          </div>
        </div>
      </div>
    }>
      <ResetPasswordRedirectContent />
    </Suspense>
  )
}
