'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { AlertCircle, ArrowLeft, CreditCard } from 'lucide-react'
import Header from '@/components/Header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

function CheckoutCancelledContent() {
  const searchParams = useSearchParams()
  const returnUrl = searchParams.get('return') || '/viaggi-fotografici'

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto flex min-h-[calc(100vh-80px)] items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100">
              <AlertCircle className="h-7 w-7 text-amber-600" />
            </div>
            <CardTitle className="text-xl">Pagamento annullato</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-muted-foreground">
              Non è stato addebitato alcun importo. Puoi riprendere la prenotazione quando vuoi.
            </p>
            <div className="flex flex-col gap-3 pt-2">
              <Button asChild className="w-full">
                <Link href={`${returnUrl}${returnUrl.includes('?') ? '&' : '?'}checkout=resume`}>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Riprendi prenotazione
                </Link>
              </Button>
              <Button variant="outline" asChild className="w-full">
                <Link href={returnUrl}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Torna al viaggio
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function CheckoutCancelledPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <p className="text-muted-foreground">Caricamento...</p>
        </div>
      }
    >
      <CheckoutCancelledContent />
    </Suspense>
  )
}
