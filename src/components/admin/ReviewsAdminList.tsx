'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Star, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle,
  Loader2,
  User,
  Calendar,
  MessageSquare,
  Eye,
  EyeOff
} from 'lucide-react'
import { format } from 'date-fns'
import { it } from 'date-fns/locale'

interface Review {
  id: string
  user_id: string
  booking_id: string
  tour_id: string
  tour_slug?: string
  rating: number
  comment?: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  updated_at: string
  profiles?: {
    first_name?: string
    last_name?: string
    email?: string
  }
}

export function ReviewsAdminList() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true)
        
        const { data, error } = await supabase
          .from('reviews')
          .select(`
            *,
            profiles!inner(
              first_name,
              last_name,
              email
            )
          `)
          .order('created_at', { ascending: false })

        if (error) throw error
        setReviews(data || [])
      } catch (err) {
        console.error('Error fetching reviews:', err)
        setError(err instanceof Error ? err.message : 'Errore nel caricamento delle recensioni')
      } finally {
        setLoading(false)
      }
    }

    fetchReviews()
  }, [supabase])

  const handleStatusChange = async (reviewId: string, newStatus: 'approved' | 'rejected') => {
    try {
      setActionLoading(reviewId)
      
      const { error } = await supabase
        .from('reviews')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', reviewId)

      if (error) throw error

      // Update local state
      setReviews(prev => prev.map(review => 
        review.id === reviewId 
          ? { ...review, status: newStatus, updated_at: new Date().toISOString() }
          : review
      ))
    } catch (err) {
      console.error('Error updating review status:', err)
      setError(err instanceof Error ? err.message : 'Errore nell\'aggiornamento della recensione')
    } finally {
      setActionLoading(null)
    }
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
      case 'approved':
        return (
          <Badge className="flex items-center gap-1 bg-green-500/15 text-green-700 dark:text-green-300 ring-1 ring-green-500/30">
            <CheckCircle className="w-3 h-3" />
            Approvata
          </Badge>
        )
      case 'rejected':
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <XCircle className="w-3 h-3" />
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

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating 
            ? 'text-yellow-400 fill-yellow-400' 
            : 'text-gray-300'
        }`}
      />
    ))
  }

  const getStats = () => {
    const total = reviews.length
    const pending = reviews.filter(r => r.status === 'pending').length
    const approved = reviews.filter(r => r.status === 'approved').length
    const rejected = reviews.filter(r => r.status === 'rejected').length

    return { total, pending, approved, rejected }
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

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Totale</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Attesa</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approvate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rifiutate</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
          </CardContent>
        </Card>
      </div>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Nessuna recensione</h3>
            <p className="text-muted-foreground text-center">
              Non ci sono ancora recensioni da gestire.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">
                          {review.profiles?.first_name} {review.profiles?.last_name}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          ({review.profiles?.email})
                        </span>
                      </div>
                      {getStatusBadge(review.status)}
                    </div>

                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium">Tour:</span>
                      <span className="text-sm text-muted-foreground">
                        {review.tour_slug || review.tour_id}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-sm font-medium">Valutazione:</span>
                      <div className="flex items-center gap-1">
                        {renderStars(review.rating)}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        ({review.rating}/5)
                      </span>
                    </div>

                    {review.comment && (
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm font-medium">Commento:</span>
                        </div>
                        <p className="text-sm bg-muted/50 p-3 rounded-lg">
                          {review.comment}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>
                          Creata il {format(new Date(review.created_at), 'dd MMMM yyyy HH:mm', { locale: it })}
                        </span>
                      </div>
                      {review.updated_at !== review.created_at && (
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>
                            Aggiornata il {format(new Date(review.updated_at), 'dd MMMM yyyy HH:mm', { locale: it })}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t">
                  {review.status === 'pending' && (
                    <>
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => handleStatusChange(review.id, 'approved')}
                        disabled={actionLoading === review.id}
                      >
                        {actionLoading === review.id ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <CheckCircle className="w-4 h-4 mr-2" />
                        )}
                        Approva
                      </Button>
                      
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleStatusChange(review.id, 'rejected')}
                        disabled={actionLoading === review.id}
                      >
                        {actionLoading === review.id ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <XCircle className="w-4 h-4 mr-2" />
                        )}
                        Rifiuta
                      </Button>
                    </>
                  )}

                  {review.status === 'approved' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStatusChange(review.id, 'rejected')}
                      disabled={actionLoading === review.id}
                    >
                      {actionLoading === review.id ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <EyeOff className="w-4 h-4 mr-2" />
                      )}
                      Nascondi
                    </Button>
                  )}

                  {review.status === 'rejected' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStatusChange(review.id, 'approved')}
                      disabled={actionLoading === review.id}
                    >
                      {actionLoading === review.id ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Eye className="w-4 h-4 mr-2" />
                      )}
                      Mostra
                    </Button>
                  )}

                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
