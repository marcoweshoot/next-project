'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import { AlertCircle, CreditCard, RefreshCw } from 'lucide-react'

interface PaymentErrorToastProps {
  error?: string
}

export function PaymentErrorToast({ error }: PaymentErrorToastProps) {
  const { toast } = useToast()
  const router = useRouter()
  const hasShownToast = useRef(false)

  useEffect(() => {
    // Prevent multiple toasts
    if (hasShownToast.current) return
    
    hasShownToast.current = true

    // Determine error message based on error type
    let errorMessage = "Si è verificato un errore durante il pagamento."
    let errorTitle = "Pagamento fallito ❌"

    if (error) {
      if (error.includes('card_declined')) {
        errorMessage = "La carta è stata rifiutata. Controlla i dati o prova con un'altra carta."
        errorTitle = "Carta rifiutata 💳"
      } else if (error.includes('insufficient_funds')) {
        errorMessage = "Fondi insufficienti sulla carta. Prova con un'altra carta o metodo di pagamento."
        errorTitle = "Fondi insufficienti 💰"
      } else if (error.includes('expired_card')) {
        errorMessage = "La carta è scaduta. Inserisci una carta valida."
        errorTitle = "Carta scaduta 📅"
      } else if (error.includes('processing_error')) {
        errorMessage = "Errore di elaborazione. Riprova tra qualche minuto."
        errorTitle = "Errore di elaborazione ⚙️"
      } else {
        errorMessage = `Errore: ${error}`
      }
    }

    // Show error toast
    toast({
      title: errorTitle,
      description: errorMessage,
    })

    // Clean up URL parameter after showing toast
    const timer = setTimeout(() => {
      router.replace('/dashboard')
    }, 100)

    return () => clearTimeout(timer)
  }, []) // Remove dependencies to prevent re-renders

  return null
}
