'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { 
  Calendar, 
  Euro, 
  CreditCard, 
  CheckCircle, 
  Clock, 
  XCircle,
  AlertCircle,
  Loader2,
  Receipt,
  User
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

interface BookingDetailsProps {
  booking: Booking
  userId: string
}

export function BookingDetails({ booking, userId }: BookingDetailsProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const supabase = createClient()

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
    const balanceAmount = booking.total_amount - booking.deposit_amount

    return {
      depositPaid,
      fullyPaid,
      balanceAmount,
      depositAmount: booking.deposit_amount,
      totalAmount: booking.total_amount,
    }
  }


  const paymentInfo = getPaymentInfo(booking)

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Booking Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Receipt className="w-5 h-5" />
              Stato prenotazione
            </CardTitle>
            {getStatusBadge(booking.status)}
          </div>
          <CardDescription>
            Prenotazione creata il {format(new Date(booking.created_at), 'dd MMMM yyyy', { locale: it })}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Tour Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Informazioni tour
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Tour</p>
              <p className="text-lg font-semibold">
                {booking.tour_title || `Tour ID: ${booking.tour_id}`}
                {booking.quantity > 1 && (
                  <span className="text-sm font-normal text-muted-foreground ml-2">
                    ({booking.quantity} persone)
                  </span>
                )}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Data</p>
              <p className="text-lg font-semibold">
                {booking.session_date ? 
                  new Date(booking.session_date).toLocaleDateString('it-IT', { 
                    day: '2-digit', 
                    month: '2-digit', 
                    year: 'numeric' 
                  }) : 
                  `Sessione: ${booking.session_id}`
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Informazioni pagamento
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <p className="text-sm font-medium text-muted-foreground">Totale</p>
              <p className="text-2xl font-bold">{formatCurrency(booking.total_amount)}</p>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <p className="text-sm font-medium text-muted-foreground">Acconto</p>
              <p className="text-2xl font-bold">
                {formatCurrency(booking.deposit_amount)}
                {paymentInfo.depositPaid && (
                  <CheckCircle className="inline w-5 h-5 text-green-500 ml-2" />
                )}
              </p>
            </div>
            
            {!paymentInfo.fullyPaid && (
              <div className="text-center p-4 border rounded-lg border-orange-200 bg-orange-50 dark:bg-orange-950/20">
                <p className="text-sm font-medium text-muted-foreground">Saldo rimanente</p>
                <p className="text-2xl font-bold text-orange-600">
                  {formatCurrency(paymentInfo.balanceAmount)}
                </p>
              </div>
            )}
          </div>

          <Separator />

          {/* Payment Dates */}
          <div className="space-y-3">
            <h4 className="font-semibold">Scadenze pagamento</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {booking.deposit_due_date && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Acconto</p>
                    <p className="text-sm">
                      {format(new Date(booking.deposit_due_date), 'dd MMMM yyyy', { locale: it })}
                    </p>
                  </div>
                </div>
              )}
              
              {booking.balance_due_date && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Saldo</p>
                    <p className="text-sm">
                      {format(new Date(booking.balance_due_date), 'dd MMMM yyyy', { locale: it })}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Stripe Payment IDs */}
          {(booking.stripe_payment_intent_id || booking.stripe_deposit_intent_id) && (
            <>
              <Separator />
              <div className="space-y-2">
                <h4 className="font-semibold">ID Pagamenti Stripe</h4>
                {booking.stripe_deposit_intent_id && (
                  <p className="text-sm text-muted-foreground">
                    <strong>Acconto:</strong> {booking.stripe_deposit_intent_id}
                  </p>
                )}
                {booking.stripe_payment_intent_id && (
                  <p className="text-sm text-muted-foreground">
                    <strong>Pagamento:</strong> {booking.stripe_payment_intent_id}
                  </p>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Azioni</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            {!paymentInfo.depositPaid && (
              <Button className="bg-blue-600 hover:bg-blue-700">
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
            
            <Button 
              variant="outline" 
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
              <AlertCircle className="w-4 h-4 mr-2" />
              Contatta Assistenza
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
