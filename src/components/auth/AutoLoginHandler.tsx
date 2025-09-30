'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'

export function AutoLoginHandler() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const router = useRouter()

  useEffect(() => {
    const handleAutoLogin = async () => {
      try {
        // Simula un processo di auto-login
        // In realtà, l'utente dovrebbe già essere loggato dal magic link di Stripe
        setMessage('Verifica dell\'accesso in corso...')
        
        // Aspetta 2 secondi per simulare il processo
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        // Controlla se l'utente è ora loggato
        const response = await fetch('/api/auth/check-session')
        const data = await response.json()
        
        if (data.user) {
          setStatus('success')
          setMessage('Accesso effettuato con successo!')
          
          // Redirect alla dashboard dopo 2 secondi
          setTimeout(() => {
            router.push('/dashboard?payment=success')
          }, 2000)
        } else {
          throw new Error('Accesso non riuscito')
        }
      } catch (error) {
        console.error('Auto-login error:', error)
        setStatus('error')
        setMessage('Errore durante l\'accesso automatico. Verrai reindirizzato alla pagina di login.')
        
        // Redirect al login dopo 3 secondi
        setTimeout(() => {
          router.push('/auth/login')
        }, 3000)
      }
    }

    handleAutoLogin()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {status === 'loading' && (
          <>
            <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-600" />
            <h2 className="text-xl font-semibold mb-2">Accesso in corso...</h2>
            <p className="text-gray-600">{message}</p>
          </>
        )}
        
        {status === 'success' && (
          <>
            <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-600" />
            <h2 className="text-xl font-semibold mb-2 text-green-800">Accesso completato!</h2>
            <p className="text-gray-600">{message}</p>
            <p className="text-sm text-gray-500 mt-2">
              Verrai reindirizzato alla dashboard...
            </p>
          </>
        )}
        
        {status === 'error' && (
          <>
            <XCircle className="w-12 h-12 mx-auto mb-4 text-red-600" />
            <h2 className="text-xl font-semibold mb-2 text-red-800">Errore di accesso</h2>
            <p className="text-gray-600">{message}</p>
            <p className="text-sm text-gray-500 mt-2">
              Verrai reindirizzato alla pagina di login...
            </p>
          </>
        )}
      </div>
    </div>
  )
}
