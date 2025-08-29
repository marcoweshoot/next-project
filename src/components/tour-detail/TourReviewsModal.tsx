'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Star } from 'lucide-react';

interface TourReviewsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reviews: Array<{
    id: string;
    title: string;
    description: string;
    rating: number;
    user: {
      firstName: string;
      profilePicture?: {
        url: string;
        alternativeText?: string;
      };
    };
    created_at: string;
  }>;
  title?: string;
}

const SingleReviewCard: React.FC<{ review: TourReviewsModalProps['reviews'][0] }> = ({ review }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-muted-foreground'
        }`}
      />
    ));
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300 bg-card text-card-foreground border border-border">
      <CardContent className="p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Avatar className="h-12 w-12">
            {review.user?.profilePicture?.url && (
              <AvatarImage 
                src={review.user.profilePicture.url} 
                alt={review.user.profilePicture.alternativeText || review.user?.firstName || 'Utente'}
              />
            )}
            <AvatarFallback className="bg-gradient-to-br from-orange-400 to-red-500 text-white font-bold text-lg">
              {review.user?.firstName?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-foreground">
              {review.user?.firstName || 'Utente'}
            </h3>
            <div className="flex items-center space-x-1">
              {renderStars(review.rating || 5)}
            </div>
          </div>
        </div>

        <p className="text-sm leading-relaxed mb-4 text-muted-foreground">
          {review.description}
        </p>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{formatDate(review.created_at)}</span>
        </div>
      </CardContent>
    </Card>
  );
};

const TourReviewsModal: React.FC<TourReviewsModalProps> = ({
  open,
  onOpenChange,
  reviews,
  title = 'Tutte le recensioni',
}) => {
  const hasReviews = reviews.length > 0;
  const averageRating = hasReviews
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden bg-background text-foreground border border-border">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold text-foreground">
            {title} {hasReviews && `(${reviews.length})`}
          </DialogTitle>
          {hasReviews && (
            <div className="flex justify-center items-center text-sm text-muted-foreground mt-1">
              <span className="font-medium text-foreground mr-1">
                {averageRating.toFixed(1)}
              </span>
              <span>valutazione media</span>
            </div>
          )}
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] pr-4 pb-6 mt-4">
          {hasReviews ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pr-2">
              {reviews.map((review) => (
                <div key={review.id}>
                  <SingleReviewCard review={review} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-sm py-12 text-muted-foreground">
              Nessuna recensione disponibile per questo viaggio.
            </div>
          )}
          <ScrollBar />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default TourReviewsModal;
