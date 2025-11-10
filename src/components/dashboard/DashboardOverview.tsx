'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Calendar, 
  CheckCircle, 
  Clock, 
  XCircle,
  AlertCircle,
  Loader2,
  ArrowRight,
  MapPin,
  Star
} from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { it } from 'date-fns/locale'

interface Booking {
  id: string
  tour_id: string
  tour_slug?: string
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
  const [reviewedBookingIds, setReviewedBookingIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true)
        
        // Fetch bookings
        const { data, error } = await supabase
          .from('bookings')
          .select(`
            *,
            tour_title,
            tour_slug,
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

        // Fetch reviews to check which bookings already have one
        const { data: reviewsData } = await supabase
          .from('reviews')
          .select('booking_id')
          .eq('user_id', userId)

        if (reviewsData) {
          setReviewedBookingIds(new Set(reviewsData.map(r => r.booking_id)))
        }
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
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()) // Midnight today
    
    const totalBookings = bookings.length
    
    // Prenotazioni attive: pagate (deposit_paid o fully_paid) e con data futura o uguale ad oggi
    const activeBookings = bookings.filter(b => {
      // Solo prenotazioni pagate (non pending, non cancelled, non completed)
      if (!['deposit_paid', 'fully_paid'].includes(b.status)) return false
      
      // Se non c'è una data, consideriamola attiva (fallback)
      if (!b.session_end_date && !b.session_date) return true
      
      // Usa session_end_date se disponibile, altrimenti session_date
      const eventDate = new Date(b.session_end_date || b.session_date!)
      
      // Il viaggio è attivo se la data è oggi o nel futuro
      return eventDate >= today
    }).length
    
    // Viaggi completati: viaggi con pagamento confermato e data passata, OPPURE con status 'completed'
    const completedBookings = bookings.filter(b => {
      // Se ha status completed, è sicuramente completato
      if (b.status === 'completed') return true
      
      // Altrimenti, controlla se è pagato e la data è passata
      if (!['deposit_paid', 'fully_paid'].includes(b.status)) return false
      
      // Se non c'è una data, non possiamo considerarlo completato
      if (!b.session_end_date && !b.session_date) return false
      
      // Usa session_end_date se disponibile, altrimenti session_date
      const eventDate = new Date(b.session_end_date || b.session_date!)
      
      // Il viaggio è completato se la data è passata (prima di oggi)
      return eventDate < today
    }).length
    
    // Trova il prossimo viaggio (quello con la data più vicina nel futuro)
    const upcomingTrips = bookings
      .filter(b => {
        if (!['deposit_paid', 'fully_paid'].includes(b.status)) return false
        if (!b.session_date) return false
        const eventDate = new Date(b.session_date)
        return eventDate >= today
      })
      .sort((a, b) => {
        const dateA = new Date(a.session_date!)
        const dateB = new Date(b.session_date!)
        return dateA.getTime() - dateB.getTime()
      })
    
    const nextTrip = upcomingTrips.length > 0 ? upcomingTrips[0] : null

    return {
      totalBookings,
      activeBookings,
      completedBookings,
      nextTrip,
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

  const canBeReviewed = (booking: Booking) => {
    // Non può essere recensito se già c'è una recensione
    if (reviewedBookingIds.has(booking.id)) return false

    // Non può essere recensito se cancellato o pending
    if (booking.status === 'cancelled' || booking.status === 'pending') return false

    // Può essere recensito se:
    // 1. Status è 'completed'
    // 2. Oppure è pagato (deposit_paid o fully_paid) e la data è passata
    if (booking.status === 'completed') return true

    if (['deposit_paid', 'fully_paid'].includes(booking.status)) {
      if (!booking.session_end_date && !booking.session_date) return false
      
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const eventDate = new Date(booking.session_end_date || booking.session_date!)
      
      return eventDate < today // È passato
    }

    return false
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
            <CardTitle className="text-sm font-medium">Prossimo Viaggio</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {stats.nextTrip ? (
              <div className="space-y-1">
                <div className="text-lg font-bold text-primary">
                  {new Date(stats.nextTrip.session_date!).toLocaleDateString('it-IT', {
                    day: 'numeric',
                    month: 'short'
                  })}
                </div>
                <div className="text-xs text-muted-foreground line-clamp-1">
                  {stats.nextTrip.tour_title || stats.nextTrip.tour_destination || 'Tour'}
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">
                  Nessun viaggio
                </div>
                <Link href="/viaggi-fotografici" className="text-xs text-primary hover:underline">
                  Prenota ora
                </Link>
              </div>
            )}
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
                  
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(booking.total_amount)}</p>
                      <p className="text-sm text-muted-foreground">
                        {getStatusText(booking.status)}
                      </p>
                    </div>
                    
                    <div className="flex gap-2">
                      {canBeReviewed(booking) && (
                        <Link href="/dashboard/reviews">
                          <Button variant="default" size="sm" className="gap-1">
                            <Star className="w-4 h-4" />
                            Recensisci
                          </Button>
                        </Link>
                      )}
                      
                      <Link href={`/dashboard/bookings/${booking.id}`}>
                        <Button variant="outline" size="sm">
                          Dettagli
                        </Button>
                      </Link>
                    </div>
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
