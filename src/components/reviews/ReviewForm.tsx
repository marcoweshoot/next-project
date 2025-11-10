'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Textarea } from '@/components/ui/textarea'
import { 
  Star, 
  Send, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  Calendar
} from 'lucide-react'

interface ReviewFormProps {
  booking?: {
    id: string
    tour_id: string
    session_id: string
    status: string
    total_amount: number
    created_at: string
    tour_title?: string
    tour_destination?: string
    session_date?: string
    session_end_date?: string
  }
  tour?: {
    title: string
    slug: string
  }
  editingReview?: {
    id: string
    rating: number
    comment?: string
    booking_id?: string
  }
  onReviewSubmitted?: () => void
}

export function ReviewForm({ booking, tour, editingReview, onReviewSubmitted }: ReviewFormProps) {
  const [rating, setRating] = useState(editingReview?.rating || 0)
  const [comment, setComment] = useState(editingReview?.comment || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (rating === 0) {
      setError('Seleziona una valutazione')
      return
    }

    try {
      setLoading(true)
      setError(null)
      setSuccess(null)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Utente non autenticato')

      if (editingReview) {
        // Update existing review
        const { error } = await supabase
          .from('reviews')
          .update({
            rating,
            comment: comment.trim() || null,
            status: 'pending' // Reset to pending when edited
          })
          .eq('id', editingReview.id)
          .eq('user_id', user.id)

        if (error) throw error
        setSuccess('Recensione aggiornata con successo! Verrà ripubblicata dopo l\'approvazione.')
      } else {
        // Create new review
        const { error: reviewError } = await supabase
          .from('reviews')
          .insert({
            user_id: user.id,
            booking_id: booking!.id,
            tour_id: booking!.tour_id,
            tour_slug: tour?.slug || booking!.tour_id,
            rating,
            comment: comment.trim() || null,
            status: 'pending'
          })

        if (reviewError) throw reviewError
        setSuccess('Recensione inviata con successo! Verrà pubblicata dopo l\'approvazione.')
      }

      setRating(0)
      setComment('')
      onReviewSubmitted?.()
      
      // Refresh page after 2 seconds
      setTimeout(() => window.location.reload(), 2000)
    } catch (err) {
      console.error('Error submitting review:', err)
      setError(err instanceof Error ? err.message : 'Errore nell\'invio della recensione')
    } finally {
      setLoading(false)
    }
  }


  if (success) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-600">
            <CheckCircle className="w-5 h-5" />
            Recensione Inviata
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5" />
            {editingReview ? 'Modifica Recensione' : 'Lascia una Recensione'}
          </CardTitle>
          <CardDescription>
            {editingReview ? 'Aggiorna la tua recensione' : 'Condividi la tua esperienza per aiutare altri viaggiatori'}
          </CardDescription>
        </CardHeader>
      <CardContent className="space-y-4">
        {/* Booking Info */}
        <div className="bg-muted/50 p-4 rounded-lg space-y-2">
          <h4 className="font-semibold">
            {booking?.tour_title || tour?.title || (booking ? `Tour ${booking.tour_id}` : 'Tour')}
          </h4>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {booking && booking.session_date && (
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {new Date(booking.session_date).toLocaleDateString('it-IT', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric'
                })}
              </div>
            )}
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Rating */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Valutazione *</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`p-1 rounded transition-colors ${
                    star <= rating
                      ? 'text-yellow-400 hover:text-yellow-500'
                      : 'text-gray-300 hover:text-yellow-400'
                  }`}
                >
                  <Star className="w-6 h-6 fill-current" />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-sm text-muted-foreground">
                {rating === 1 && 'Pessimo'}
                {rating === 2 && 'Scarso'}
                {rating === 3 && 'Discreto'}
                {rating === 4 && 'Buono'}
                {rating === 5 && 'Eccellente'}
              </p>
            )}
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <label htmlFor="comment" className="text-sm font-medium">
              Commento (opzionale)
            </label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Racconta la tua esperienza..."
              className="min-h-[100px]"
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground">
              {comment.length}/500 caratteri
            </p>
          </div>

          {/* Submit Button */}
          <Button 
            type="submit" 
            disabled={loading || rating === 0}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Invio in corso...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Invia Recensione
              </>
            )}
          </Button>
        </form>

        {/* Info */}
        <div className="text-sm text-muted-foreground">
          <p>• La recensione sarà pubblicata dopo l'approvazione</p>
          <p>• Le recensioni aiutano altri viaggiatori a scegliere</p>
          <p>• Per assistenza contatta prenotazioni@weshoot.it</p>
        </div>
      </CardContent>
    </Card>
  )
}
