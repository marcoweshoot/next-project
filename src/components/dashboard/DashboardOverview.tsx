'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Calendar, 
  Euro, 
  CheckCircle, 
  Clock, 
  XCircle,
  AlertCircle,
  Loader2,
  ArrowRight
} from 'lucide-react'
import Link from 'next/link'
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
  created_at: string
  tour_title?: string
  tour_destination?: string
  session_date?: string
  session_end_date?: string
}

interface DashboardOverviewProps {
  userId: string
}

export function DashboardOverview({ userId }: DashboardOverviewProps) {
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
          .select(`
            *,
            tour_title,
            tour_destination,
            session_date,
            session_end_date,
            quantity
          `)
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(5) // Show only recent bookings

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

  const getStats = () => {
    const totalBookings = bookings.length
    const activeBookings = bookings.filter(b => 
      ['pending', 'deposit_paid', 'fully_paid'].includes(b.status)
    ).length
    const completedBookings = bookings.filter(b => b.status === 'completed').length
    const totalSpent = bookings
      .filter(b => ['deposit_paid', 'fully_paid', 'completed'].includes(b.status))
      .reduce((sum, b) => {
        // Usa l'importo effettivamente pagato
        return sum + (b.amount_paid || 0)
      }, 0)

    return {
      totalBookings,
      activeBookings,
      completedBookings,
      totalSpent,
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount / 100)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />
      case 'deposit_paid':
        return <AlertCircle className="w-4 h-4 text-blue-500" />
      case 'fully_paid':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-emerald-500" />
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-500" />
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'In attesa'
      case 'deposit_paid':
        return 'Acconto pagato'
      case 'fully_paid':
        return 'Pagato'
      case 'completed':
        return 'Completato'
      case 'cancelled':
        return 'Cancellato'
      default:
        return 'Sconosciuto'
    }
  }

  const stats = getStats()

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Totale Prenotazioni</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBookings}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Prenotazioni Attive</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.activeBookings}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Viaggi Completati</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completedBookings}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Totale Speso</CardTitle>
            <Euro className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              {formatCurrency(stats.totalSpent)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Bookings */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Prenotazioni Recenti</CardTitle>
              <CardDescription>
                Le tue ultime prenotazioni
              </CardDescription>
            </div>
            <Link href="/dashboard/bookings">
              <Button variant="outline" size="sm">
                Vedi tutte
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {bookings.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Nessuna prenotazione</h3>
              <p className="text-muted-foreground mb-4">
                Non hai ancora effettuato prenotazioni. Inizia esplorando i nostri tour!
              </p>
              <Link href="/viaggi-fotografici">
                <Button>
                  Esplora i tour
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(booking.status)}
                    <div>
                      <p className="font-medium">
                        {booking.tour_title || `Tour: ${booking.tour_id}`}
                        {booking.quantity > 1 && (
                          <span className="text-sm font-normal text-muted-foreground ml-2">
                            ({booking.quantity} persone)
                          </span>
                        )}
                      </p>
                      <p className="text-sm text-muted-foreground">
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
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(booking.total_amount)}</p>
                      <p className="text-sm text-muted-foreground">
                        {getStatusText(booking.status)}
                      </p>
                    </div>
                    
                    <Link href={`/dashboard/bookings/${booking.id}`}>
                      <Button variant="outline" size="sm">
                        Dettagli
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
