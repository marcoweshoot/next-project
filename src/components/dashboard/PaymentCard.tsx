'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Calendar, 
  Euro, 
  CreditCard, 
  CheckCircle, 
  Clock, 
  XCircle,
  AlertCircle,
  MapPin,
  Users,
  ChevronDown,
  ChevronRight
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

interface TourInfo {
  id: string
  title: string
  location: string
  date: string
  participants: number
}

interface PaymentCardProps {
  tourId: string
  bookings: Booking[]
  tourInfo?: TourInfo
  isExpanded: boolean
  onToggle: () => void
}

export function PaymentCard({ tourId, bookings, tourInfo, isExpanded, onToggle }: PaymentCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount / 100)
  }

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
            Rimborsato
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

  const totalAmount = bookings.reduce((sum, booking) => sum + booking.total_amount, 0)
  const totalPaid = bookings.reduce((sum, booking) => {
    return sum + (booking.amount_paid || 0)
  }, 0)

  const pendingAmount = totalAmount - totalPaid

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader 
        className="cursor-pointer"
        onClick={onToggle}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isExpanded ? (
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            ) : (
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            )}
            <div>
              <CardTitle className="text-lg">
                {tourInfo?.title || `Tour ${tourId}`}
                {bookings.some(b => b.quantity > 1) && (
                  <span className="text-sm font-normal text-muted-foreground ml-2">
                    ({bookings.reduce((sum, b) => sum + b.quantity, 0)} persone)
                  </span>
                )}
              </CardTitle>
              <CardDescription className="flex items-center gap-4 mt-1">
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {tourInfo?.location || 'Destinazione da definire'}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {tourInfo?.date || 'Data da definire'}
                </span>
              </CardDescription>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-lg font-bold">
              {formatCurrency(totalAmount)}
            </div>
            <div className="text-sm text-muted-foreground">
              {formatCurrency(totalPaid)} pagato
            </div>
            {pendingAmount > 0 && (
              <div className="text-sm text-orange-600 font-medium">
                {formatCurrency(pendingAmount)} da pagare
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="pt-0">
          <div className="space-y-4">
            {bookings.map((booking) => {
              const paymentInfo = getPaymentInfo(booking)
              
              return (
                <div key={booking.id} className="border rounded-lg p-4 bg-muted/30">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium break-words">Prenotazione: {booking.id.slice(0, 8)}...</h4>
                      <p className="text-sm text-muted-foreground">
                        Sessione: {booking.session_id}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      {getStatusBadge(booking.status)}
                    </div>
                  </div>
                  
                  {/* Payment Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
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
                      <Button size="sm" className="bg-primary hover:bg-primary/90">
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
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="flex-1"
                        onClick={() => window.open(`/dashboard/bookings/${booking.id}`, '_blank')}
                      >
                        Dettagli
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="flex-1"
                        onClick={() => {
                        const subject = encodeURIComponent('Assistenza Prenotazione')
                        const body = encodeURIComponent(`Salve,\n\nHo bisogno di assistenza per la prenotazione:\n- ID Prenotazione: ${booking.id}\n- Tour: ${tourInfo?.title || 'N/A'}\n- Sessione: ${booking.session_id}\n\nDescrivo il problema:\n\n`)
                        
                        // Prova prima con mailto:
                        const mailtoUrl = `mailto:prenotazioni@weshoot.it?subject=${subject}&body=${body}`
                        
                        try {
                          const newWindow = window.open(mailtoUrl)
                          
                          // Se la finestra non si apre o si apre con un URL strano, usa il fallback
                          setTimeout(() => {
                            if (!newWindow || newWindow.location.href.includes('mailto:') === false) {
                              // Fallback: copia l'email e le info negli appunti
                              const emailText = `prenotazioni@weshoot.it\n\nOggetto: Assistenza Prenotazione\n\nMessaggio:\nSalve,\n\nHo bisogno di assistenza per la prenotazione:\n- ID Prenotazione: ${booking.id}\n- Tour: ${tourInfo?.title || 'N/A'}\n- Sessione: ${booking.session_id}\n\nDescrivo il problema:\n\n`
                              navigator.clipboard.writeText(emailText)
                              alert('Email e messaggio copiati negli appunti!\n\nIncolla in un nuovo messaggio a: prenotazioni@weshoot.it')
                            }
                          }, 500)
                        } catch (error) {
                          // Fallback diretto se mailto: non è supportato
                          const emailText = `prenotazioni@weshoot.it\n\nOggetto: Assistenza Prenotazione\n\nMessaggio:\nSalve,\n\nHo bisogno di assistenza per la prenotazione:\n- ID Prenotazione: ${booking.id}\n- Tour: ${tourInfo?.title || 'N/A'}\n- Sessione: ${booking.session_id}\n\nDescrivo il problema:\n\n`
                          navigator.clipboard.writeText(emailText)
                          alert('Email e messaggio copiati negli appunti!\n\nIncolla in un nuovo messaggio a: prenotazioni@weshoot.it')
                        }
                      }}
                    >
                      Assistenza
                    </Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      )}
    </Card>
  )
}
