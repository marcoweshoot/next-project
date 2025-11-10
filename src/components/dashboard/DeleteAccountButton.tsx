'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Trash2, AlertTriangle, Loader2 } from 'lucide-react'

export function DeleteAccountButton() {
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleDeleteAccount = async () => {
    try {
      setIsDeleting(true)
      setError(null)

      const response = await fetch('/api/delete-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Errore durante la cancellazione dell\'account')
      }

      // Redirect alla home dopo cancellazione
      router.push('/?account_deleted=true')

    } catch (err) {
      console.error('Errore cancellazione account:', err)
      setError(err instanceof Error ? err.message : 'Errore durante la cancellazione dell\'account')
      setIsDeleting(false)
    }
  }

  return (
    <div className="border-t pt-6 mt-8">
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-red-900 mb-2">
              Zona Pericolosa
            </h3>
            <p className="text-sm text-red-700 mb-4">
              La cancellazione del tuo account è permanente e irreversibile. 
              Tutti i tuoi dati personali verranno rimossi in conformità al GDPR.
            </p>

            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  className="gap-2"
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Cancellazione in corso...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4" />
                      Elimina il mio account
                    </>
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2 text-red-600">
                    <AlertTriangle className="h-5 w-5" />
                    Sei sicuro?
                  </AlertDialogTitle>
                  <AlertDialogDescription className="space-y-3">
                    <p className="font-semibold">
                      Questa azione è irreversibile!
                    </p>
                    <p>
                      Se procedi, il tuo account e tutti i tuoi dati personali verranno 
                      cancellati permanentemente:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>Profilo completo (nome, email, telefono, indirizzo, codice fiscale)</li>
                      <li>Foto profilo</li>
                      <li>Storico prenotazioni (anonimizzato per contabilità)</li>
                      <li>Tue recensioni (anonimizzate, rimarranno visibili come "Utente Anonimo")</li>
                    </ul>
                    <p className="text-red-600 font-semibold mt-4">
                      Non potrai recuperare questi dati in alcun modo.
                    </p>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={isDeleting}>
                    Annulla
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    disabled={isDeleting}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Cancellazione...
                      </>
                    ) : (
                      'Sì, elimina il mio account'
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>
    </div>
  )
}

