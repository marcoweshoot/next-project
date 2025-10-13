'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Star, 
  MessageSquare, 
  Calendar,
  AlertCircle,
  Loader2,
  Plus,
  Clock,
  Euro
} from 'lucide-react'
import { ReviewForm } from '@/components/reviews/ReviewForm'
import { ReviewCard } from '@/components/reviews/ReviewCard'
import { format } from 'date-fns'
import { it } from 'date-fns/locale'

interface Review {
  id: string
  tour_id: string
  tour_slug: string
  rating: number
  comment?: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  updated_at: string
}

interface ReviewsListProps {
  userId: string
}

interface Booking {
  id: string
  tour_id: string
  session_id: string
  tour_title?: string
  tour_destination?: string
  session_date?: string
  session_end_date?: string
  status: string
  total_amount: number
  amount_paid?: number // Importo effettivamente pagato
  created_at: string
}

export function ReviewsList({ userId }: ReviewsListProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [completedBookings, setCompletedBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [editingReview, setEditingReview] = useState<Review | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch reviews
        const { data: reviewsData, error: reviewsError } = await supabase
          .from('reviews')
          .select(`
            *,
            user:profiles(first_name, last_name)
          `)
          .eq('user_id', userId)
          .order('created_at', { ascending: false })

        if (reviewsError) throw reviewsError

        setReviews(reviewsData || [])

        // Fetch all bookings that can potentially be reviewed (paid or completed)
        const { data: bookingsData, error: bookingsError } = await supabase
          .from('bookings')
          .select(`
            *,
            tour_title,
            tour_destination,
            session_date,
            session_end_date
          `)
          .eq('user_id', userId)
          .in('status', ['deposit_paid', 'fully_paid', 'completed'])
          .order('created_at', { ascending: false })

        if (bookingsError) throw bookingsError

        setCompletedBookings(bookingsData || [])
      } catch (err) {
        console.error('Error fetching data:', err)
        setError(err instanceof Error ? err.message : 'Errore nel caricamento dei dati')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [userId, supabase])

  const handleEditReview = (review: Review) => {
    setEditingReview(review)
    setShowReviewForm(true)
  }

  // Determina se una prenotazione può essere recensita
  const canReviewBooking = (booking: Booking) => {
    // 1. Deve essere pagato completamente
    const isFullyPaid = booking.status === 'fully_paid' || booking.status === 'completed'
    
    // 2. Il viaggio deve essere completato (data fine < oggi)
    const tripEndDate = booking.session_end_date || booking.session_date
    const isTripCompleted = tripEndDate && new Date(tripEndDate) < new Date()
    
    return isFullyPaid && isTripCompleted
  }

  // Determina se una prenotazione è in attesa di completamento del viaggio
  const isBookingPending = (booking: Booking) => {
    const tripEndDate = booking.session_end_date || booking.session_date
    return tripEndDate && new Date(tripEndDate) >= new Date()
  }

  // Determina se il viaggio è completato ma non pagato completamente
  const isTripCompletedButNotPaid = (booking: Booking) => {
    const tripEndDate = booking.session_end_date || booking.session_date
    const isTripCompleted = tripEndDate && new Date(tripEndDate) < new Date()
    const isNotFullyPaid = booking.status !== 'fully_paid' && booking.status !== 'completed'
    
    return isTripCompleted && isNotFullyPaid
  }


  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="secondary" className="flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            In attesa
          </Badge>
        )
      case 'approved':
        return (
          <Badge className="flex items-center gap-1 bg-green-500/15 text-green-700 dark:text-green-300 ring-1 ring-green-500/30">
            <Star className="w-3 h-3" />
            Approvata
          </Badge>
        )
      case 'rejected':
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            Rifiutata
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

  const handleReviewSubmit = (booking: Booking) => {
    setSelectedBooking(booking)
    setShowReviewForm(true)
  }

  const handleReviewSubmitted = () => {
    setShowReviewForm(false)
    setSelectedBooking(null)
    // Refresh data
    window.location.reload()
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ))
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

  if (reviews.length === 0 && completedBookings.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <Star className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Nessuna recensione</h3>
          <p className="text-muted-foreground text-center mb-4">
            Non hai ancora completato viaggi. Completa un viaggio per poter lasciare una recensione!
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Completed Bookings - Review Form */}
      {completedBookings.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">I Tuoi Viaggi - Recensioni</h3>
          {completedBookings.map((booking) => (
            <Card key={booking.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">
                  {booking.tour_title || `Tour: ${booking.tour_id}`}
                </CardTitle>
                <CardDescription>
                  {booking.tour_destination && (
                    <div className="text-sm text-muted-foreground mb-1">
                      {booking.tour_destination}
                    </div>
                  )}
                  {canReviewBooking(booking) 
                    ? `Viaggio completato - Prenotazione del ${format(new Date(booking.created_at), 'dd MMMM yyyy', { locale: it })}`
                    : isTripCompletedButNotPaid(booking)
                    ? `Viaggio completato ma non pagato - Prenotazione del ${format(new Date(booking.created_at), 'dd MMMM yyyy', { locale: it })}`
                    : `Prenotazione effettuata il ${format(new Date(booking.created_at), 'dd MMMM yyyy', { locale: it })}`
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {format(new Date(booking.created_at), 'dd MMMM yyyy', { locale: it })}
                    </div>
                    <div className="flex items-center gap-1">
                      <Euro className="w-4 h-4" />
                      {(booking.total_amount / 100).toFixed(2)}€
                    </div>
                  </div>
                  
                  <div className="flex-shrink-0">
                    {canReviewBooking(booking) ? (
                      <Button 
                        onClick={() => handleReviewSubmit(booking)}
                        className="bg-primary hover:bg-primary/90 w-full sm:w-auto"
                      >
                        <Star className="w-4 h-4 mr-2" />
                        Lascia Recensione
                      </Button>
                    ) : isTripCompletedButNotPaid(booking) ? (
                      <Button 
                        disabled
                        className="bg-gray-400 cursor-not-allowed w-full sm:w-auto"
                      >
                        <AlertCircle className="w-4 h-4 mr-2" />
                        <span className="hidden sm:inline">Non hai partecipato, sarà per la prossima</span>
                        <span className="sm:hidden">Non partecipato</span>
                      </Button>
                    ) : (
                      <Button 
                        disabled
                        className="bg-gray-400 cursor-not-allowed w-full sm:w-auto"
                      >
                        <Clock className="w-4 h-4 mr-2" />
                        <span className="hidden sm:inline">Recensione disponibile dopo il viaggio</span>
                        <span className="sm:hidden">Dopo il viaggio</span>
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Existing Reviews */}
      {reviews.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Le Tue Recensioni</h3>
          {reviews.map((review) => (
        <Card key={review.id} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div className="flex-1 min-w-0">
                <CardTitle className="text-lg">
                  Tour: {review.tour_slug}
                </CardTitle>
                <CardDescription>
                  Tour ID: {review.tour_id}
                </CardDescription>
              </div>
              <div className="flex-shrink-0">
                {getStatusBadge(review.status)}
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Rating */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Valutazione:</span>
              <div className="flex items-center gap-1">
                {renderStars(review.rating)}
              </div>
              <span className="text-sm text-muted-foreground">
                ({review.rating}/5)
              </span>
            </div>

            {/* Comment */}
            {review.comment && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Commento:</span>
                </div>
                <p className="text-sm bg-muted/50 p-3 rounded-lg">
                  {review.comment}
                </p>
              </div>
            )}

            {/* Dates */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>
                Creata il {format(new Date(review.created_at), 'dd MMMM yyyy', { locale: it })}
              </span>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 pt-4 border-t">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleEditReview(review)}
                className="w-full sm:w-auto"
              >
                Modifica
              </Button>
              
              {/* Solo per recensioni in attesa, l'utente può modificare */}
              {review.status === 'pending' && (
                <div className="text-xs text-muted-foreground text-center sm:text-left">
                  La recensione è in attesa di approvazione
                </div>
              )}
              
              {review.status === 'approved' && (
                <div className="text-xs text-green-600 text-center sm:text-left">
                  ✓ Recensione approvata
                </div>
              )}
              
              {review.status === 'rejected' && (
                <div className="text-xs text-red-600 text-center sm:text-left">
                  ⚠ Recensione rifiutata - modifica e reinvia
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
        </div>
      )}

      {/* Review Form Modal */}
      {(showReviewForm && selectedBooking) || editingReview ? (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-background rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <ReviewForm
              booking={selectedBooking}
              editingReview={editingReview}
              onReviewSubmitted={handleReviewSubmitted}
            />
            <div className="p-4 border-t">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowReviewForm(false)
                  setEditingReview(null)
                }}
                className="w-full"
              >
                Chiudi
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
