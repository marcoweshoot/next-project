'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { XCircle } from 'lucide-react'

export function PaymentCancelledToast() {
  const router = useRouter()

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/dashboard')
    }, 6000)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div
      role="status"
      className="fixed bottom-4 right-4 z-50 flex max-w-sm items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 shadow-lg"
    >
      <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
      <div>
        <p className="font-medium text-amber-900">Pagamento annullato</p>
        <p className="text-sm text-amber-800">
          Nessun addebito effettuato. Puoi riprovare dalla tua prenotazione o dal tour.
        </p>
      </div>
    </div>
  )
}
