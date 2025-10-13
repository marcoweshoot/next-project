'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Calendar, 
  Euro, 
  Users, 
  CreditCard, 
  CheckCircle, 
  Clock, 
  XCircle,
  AlertCircle,
  Loader2
} from 'lucide-react'
import { BalancePaymentForm } from '@/components/payment/BalancePaymentForm'
import { format } from 'date-fns'
import { it } from 'date-fns/locale'

interface Booking {
  id: string
  tour_id: string
  session_id: string
  quantity: number
  status: 'pending' | 'deposit_paid' | 'fully_paid' | 'completed' | 'cancelled'
  deposit_amount: number
  total_amount: number
  amount_paid?: number // Importo effettivamente pagato
  stripe_payment_intent_id?: string
  stripe_deposit_intent_id?: string
  deposit_due_date?: string
  balance_due_date?: string
  tour_title?: string
  tour_destination?: string
  session_date?: string
  session_end_date?: string
  created_at: string
  updated_at: string
}

interface BookingsListProps {
  userId: string
}

export function BookingsList({ userId }: BookingsListProps) {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('bookings')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })

        if (error) throw error
        setBookings(data || [])
      } catch (err) {
        console.error('Error fetching bookings:', err)
        setError(err instanceof Error ? err.message : 'Errore nel caricamento delle prenotazioni')
      } finally {
        setLoading(false)
      }
    }

    fetchBookings()
  }, [userId, supabase])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            In attesa
          </Badge>
        )
      case 'deposit_paid':
        return (
          <Badge className="flex items-center gap-1 bg-blue-500/15 text-blue-700 dark:text-blue-300 ring-1 ring-blue-500/30">
            <CheckCircle className="w-3 h-3" />
            Acconto pagato
          </Badge>
        )
      case 'fully_paid':
        return (
          <Badge className="flex items-center gap-1 bg-green-500/15 text-green-700 dark:text-green-300 ring-1 ring-green-500/30">
            <CheckCircle className="w-3 h-3" />
            Pagato
          </Badge>
        )
      case 'completed':
        return (
          <Badge className="flex items-center gap-1 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-500/30">
            <CheckCircle className="w-3 h-3" />
            Completato
          </Badge>
        )
      case 'cancelled':
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <XCircle className="w-3 h-3" />
            Cancellato
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            Sconosciuto
          </Badge>
        )
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount / 100)
  }

  const getPaymentInfo = (booking: Booking) => {
    const depositPaid = booking.status === 'deposit_paid' || booking.status === 'fully_paid'
    const fullyPaid = booking.status === 'fully_paid' || booking.status === 'completed'
    
    // Calcola il saldo rimanente basato sull'importo effettivamente pagato
    const amountPaid = booking.amount_paid || 0
    const balanceAmount = booking.total_amount - amountPaid

    return {
      depositPaid,
      fullyPaid,
      balanceAmount,
      amountPaid,
      depositAmount: booking.deposit_amount,
      totalAmount: booking.total_amount,
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (bookings.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Nessuna prenotazione</h3>
          <p className="text-muted-foreground text-center">
            Non hai ancora effettuato prenotazioni. Esplora i nostri tour e inizia la tua avventura fotografica!
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {bookings.map((booking) => {
        const paymentInfo = getPaymentInfo(booking)
        
        return (
          <Card key={booking.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg break-words">
                    {booking.tour_title || `Tour ID: ${booking.tour_id}`}
                    {booking.quantity > 1 && (
                      <span className="text-sm font-normal text-muted-foreground ml-2">
                        ({booking.quantity} persone)
                      </span>
                    )}
                  </CardTitle>
                  <CardDescription>
                    {booking.session_date ? 
                      new Date(booking.session_date).toLocaleDateString('it-IT', { 
                        day: '2-digit', 
                        month: '2-digit', 
                        year: 'numeric' 
                      }) : 
                      `Sessione: ${booking.session_id}`
                    }
                  </CardDescription>
                </div>
                <div className="flex-shrink-0">
                  {getStatusBadge(booking.status)}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Payment Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <Euro className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Totale</p>
                    <p className="text-lg font-bold">{formatCurrency(booking.total_amount)}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Pagato</p>
                    <p className="text-lg font-bold">
                      {formatCurrency(paymentInfo.amountPaid)}
                      {paymentInfo.depositPaid && (
                        <CheckCircle className="inline w-4 h-4 text-green-500 ml-1" />
                      )}
                    </p>
                  </div>
                </div>
                
                {!paymentInfo.fullyPaid && (
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Saldo</p>
                      <p className="text-lg font-bold text-orange-600">
                        {formatCurrency(paymentInfo.balanceAmount)}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                {booking.deposit_due_date && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>
                      <strong>Acconto:</strong>{' '}
                      {format(new Date(booking.deposit_due_date), 'dd MMMM yyyy', { locale: it })}
                    </span>
                  </div>
                )}
                
                {booking.balance_due_date && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>
                      <strong>Saldo:</strong>{' '}
                      {format(new Date(booking.balance_due_date), 'dd MMMM yyyy', { locale: it })}
                    </span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t">
                {!paymentInfo.depositPaid && (
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                    <CreditCard className="w-4 h-4 mr-2" />
                    Paga Acconto
                  </Button>
                )}
                
                {paymentInfo.depositPaid && !paymentInfo.fullyPaid && (
                  <div className="w-full">
                    <BalancePaymentForm 
                      booking={booking}
                      onPaymentSuccess={() => window.location.reload()}
                    />
                  </div>
                )}
                
                <div className="flex gap-2 flex-1">
                  <Link href={`/dashboard/bookings/${booking.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      Dettagli
                    </Button>
                  </Link>
                  
                  <Button 
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  onClick={() => {
                    const subject = encodeURIComponent('Assistenza Prenotazione')
                    const body = encodeURIComponent(`Salve,\n\nHo bisogno di assistenza per la prenotazione:\n- ID Prenotazione: ${booking.id}\n- Tour: ${booking.tour_title || `Tour ${booking.tour_id}`}\n- Sessione: ${booking.session_id}\n\nDescrivo il problema:\n\n`)
                    
                    // Prova prima con mailto:
                    const mailtoUrl = `mailto:prenotazioni@weshoot.it?subject=${subject}&body=${body}`
                    
                    try {
                      const newWindow = window.open(mailtoUrl)
                      
                      // Se la finestra non si apre o si apre con un URL strano, usa il fallback
                      setTimeout(() => {
                        if (!newWindow || newWindow.location.href.includes('mailto:') === false) {
                          // Fallback: copia l'email e le info negli appunti
                          const emailText = `prenotazioni@weshoot.it\n\nOggetto: Assistenza Prenotazione\n\nMessaggio:\nSalve,\n\nHo bisogno di assistenza per la prenotazione:\n- ID Prenotazione: ${booking.id}\n- Tour: ${booking.tour_title || `Tour ${booking.tour_id}`}\n- Sessione: ${booking.session_id}\n\nDescrivo il problema:\n\n`
                          navigator.clipboard.writeText(emailText)
                          alert('Email e messaggio copiati negli appunti!\n\nIncolla in un nuovo messaggio a: prenotazioni@weshoot.it')
                        }
                      }, 500)
                    } catch (error) {
                      // Fallback diretto se mailto: non è supportato
                      const emailText = `prenotazioni@weshoot.it\n\nOggetto: Assistenza Prenotazione\n\nMessaggio:\nSalve,\n\nHo bisogno di assistenza per la prenotazione:\n- ID Prenotazione: ${booking.id}\n- Tour: ${booking.tour_title || `Tour ${booking.tour_id}`}\n- Sessione: ${booking.session_id}\n\nDescrivo il problema:\n\n`
                      navigator.clipboard.writeText(emailText)
                      alert('Email e messaggio copiati negli appunti!\n\nIncolla in un nuovo messaggio a: prenotazioni@weshoot.it')
                    }
                  }}
                >
                  Assistenza
                </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
