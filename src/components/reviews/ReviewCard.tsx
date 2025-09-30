'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Star, Calendar, MessageSquare } from 'lucide-react'
import { format } from 'date-fns'
import { it } from 'date-fns/locale'

interface ReviewCardProps {
  review: {
    id: string
    rating: number
    comment?: string
    status: string
    created_at: string
    user?: {
      first_name?: string
      last_name?: string
      email?: string
    }
    tour?: {
      title?: string
      slug?: string
    }
  }
}

export function ReviewCard({ review }: ReviewCardProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approvata</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">In attesa</Badge>
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rifiutata</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getRatingText = (rating: number) => {
    switch (rating) {
      case 1: return 'Pessimo'
      case 2: return 'Scarso'
      case 3: return 'Discreto'
      case 4: return 'Buono'
      case 5: return 'Eccellente'
      default: return ''
    }
  }

  const getUserInitials = (user?: { first_name?: string; last_name?: string }) => {
    if (user?.first_name && user?.last_name) {
      return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase()
    }
    return 'U'
  }

  const getUserDisplayName = (user?: { first_name?: string; last_name?: string }) => {
    if (user?.first_name && user?.last_name) {
      return `${user.first_name} ${user.last_name}`
    }
    return 'Utente Anonimo'
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src="" />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {getUserInitials(review.user)}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-base">
                {getUserDisplayName(review.user)}
              </CardTitle>
              <CardDescription className="flex items-center gap-2">
                <Calendar className="w-3 h-3" />
                {format(new Date(review.created_at), 'dd MMMM yyyy', { locale: it })}
              </CardDescription>
            </div>
          </div>
          {getStatusBadge(review.status)}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* Rating */}
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-4 h-4 ${
                  star <= review.rating
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-sm font-medium text-muted-foreground">
            {review.rating}/5 - {getRatingText(review.rating)}
          </span>
        </div>

        {/* Tour Info */}
        {review.tour?.title && (
          <div className="text-sm text-muted-foreground">
            <strong>Tour:</strong> {review.tour.title}
          </div>
        )}

        {/* Comment */}
        {review.comment && (
          <div className="space-y-2">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MessageSquare className="w-3 h-3" />
              Commento:
            </div>
            <p className="text-sm leading-relaxed bg-muted/50 p-3 rounded-lg">
              {review.comment}
            </p>
          </div>
        )}

        {/* Status Info */}
        {review.status === 'pending' && (
          <div className="text-xs text-muted-foreground bg-yellow-50 p-2 rounded">
            La tua recensione è in attesa di approvazione
          </div>
        )}
      </CardContent>
    </Card>
  )
}
