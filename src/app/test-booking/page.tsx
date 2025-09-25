'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { BookingForm } from '@/components/booking/BookingForm'
import { Badge } from '@/components/ui/badge'
import { User, Calendar, Euro } from 'lucide-react'

export default function TestBookingPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  // Mock tour data
  const mockTour = {
    id: 'dolomiti',
    title: 'Le Dolomiti: un\'esperienza fotografica incredibile',
    slug: 'dolomiti'
  }

  const mockSession = {
    id: '191',
    start: '2025-07-03',
    end: '2025-07-06',
    price: 899,
    maxPax: 7,
    status: 'confirmed'
  }

  useState(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()
  })

  const handleBookingSuccess = () => {
    console.log('Booking successful!')
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto max-w-4xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Test Sistema Prenotazioni</CardTitle>
            <CardDescription>
              Testa il sistema di prenotazioni con Stripe
            </CardDescription>
          </CardHeader>
          <CardContent>
            {user ? (
              <Alert>
                <User className="w-4 h-4" />
                <AlertDescription>
                  <strong>Utente loggato:</strong> {user.email}
                </AlertDescription>
              </Alert>
            ) : (
              <Alert>
                <AlertDescription>
                  <strong>Nessun utente loggato</strong> - 
                  <Button asChild variant="link" className="p-0 h-auto">
                    <a href="/auth/login">Accedi qui</a>
                  </Button>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tour Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                {mockTour.title}
              </CardTitle>
              <CardDescription>
                Informazioni sul viaggio
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Date:</span>
                <span className="text-sm text-muted-foreground">
                  {new Date(mockSession.start).toLocaleDateString('it-IT')} - {' '}
                  {new Date(mockSession.end).toLocaleDateString('it-IT')}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Prezzo:</span>
                <span className="text-sm text-muted-foreground">€{mockSession.price}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Posti disponibili:</span>
                <span className="text-sm text-muted-foreground">{mockSession.maxPax}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Status:</span>
                <Badge variant="default">{mockSession.status}</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Booking Form */}
          <BookingForm
            tour={mockTour}
            session={mockSession}
            onBookingSuccess={handleBookingSuccess}
          />
        </div>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Istruzioni per il Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><strong>1. Configura Stripe:</strong></p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Aggiungi STRIPE_SECRET_KEY e STRIPE_PUBLISHABLE_KEY al .env.local</li>
              <li>Configura il webhook endpoint in Stripe Dashboard</li>
            </ul>
            
            <p><strong>2. Test del flusso:</strong></p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Fai login con un account test</li>
              <li>Prova a prenotare il viaggio</li>
              <li>Usa le carte di test di Stripe (4242 4242 4242 4242)</li>
            </ul>
            
            <p><strong>3. Verifica:</strong></p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Controlla che la prenotazione sia creata in Supabase</li>
              <li>Verifica il webhook di Stripe</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
