'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Calendar, 
  Euro, 
  CreditCard, 
  CheckCircle, 
  Clock, 
  XCircle,
  AlertCircle,
  Loader2,
  MapPin,
  Users,
  ChevronDown,
  ChevronRight
} from 'lucide-react'
import { PaymentCard } from '@/components/dashboard/PaymentCard'
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

interface TourInfo {
  id: string
  title: string
  location: string
  date: string
  participants: number
}

interface PaymentsListProps {
  userId: string
}

export function PaymentsList({ userId }: PaymentsListProps) {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [tourInfo, setTourInfo] = useState<Record<string, TourInfo>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedTours, setExpandedTours] = useState<Set<string>>(new Set())
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
        
        // Carica informazioni sui tour
        await loadTourInfo(data || [])
      } catch (err) {
        console.error('Error fetching bookings:', err)
        setError(err instanceof Error ? err.message : 'Errore nel caricamento delle prenotazioni')
      } finally {
        setLoading(false)
      }
    }

    fetchBookings()
  }, [userId, supabase])

  const loadTourInfo = async (bookings: Booking[]) => {
    try {
      // Usa i dati reali dal database invece dei mock
      const realTourInfo: Record<string, TourInfo> = {}
      
      bookings.forEach(booking => {
        if (!realTourInfo[booking.tour_id]) {
          realTourInfo[booking.tour_id] = {
            id: booking.tour_id,
            title: booking.tour_title || `Tour ${booking.tour_id}`,
            location: booking.tour_destination || 'Destinazione da definire',
            date: booking.session_date ? 
              new Date(booking.session_date).toLocaleDateString('it-IT', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
              }) : 
              'Data da definire',
            participants: 1
          }
        }
      })
      
      setTourInfo(realTourInfo)
    } catch (err) {
      console.error('Error loading tour info:', err)
    }
  }


  const toggleTourExpansion = (tourId: string) => {
    const newExpanded = new Set(expandedTours)
    if (newExpanded.has(tourId)) {
      newExpanded.delete(tourId)
    } else {
      newExpanded.add(tourId)
    }
    setExpandedTours(newExpanded)
  }

  const groupBookingsByTour = () => {
    const grouped: Record<string, Booking[]> = {}
    bookings.forEach(booking => {
      if (!grouped[booking.tour_id]) {
        grouped[booking.tour_id] = []
      }
      grouped[booking.tour_id].push(booking)
    })
    return grouped
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

  const groupedBookings = groupBookingsByTour()

  return (
    <div className="space-y-6">
      {/* Payments Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Prenotazioni e Pagamenti</h3>
        {Object.entries(groupedBookings).map(([tourId, tourBookings]) => {
          const tour = tourInfo[tourId]
          const isExpanded = expandedTours.has(tourId)

          return (
            <PaymentCard
              key={tourId}
              tourId={tourId}
              bookings={tourBookings}
              tourInfo={tour}
              isExpanded={isExpanded}
              onToggle={() => toggleTourExpansion(tourId)}
            />
          )
        })}
      </div>
    </div>
  )
}