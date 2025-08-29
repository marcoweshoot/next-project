'use client';

import React, { useState } from 'react';
import {
  Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious,
} from '@/components/ui/carousel';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Star, Quote } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import TourReviewsModal from './TourReviewsModal';

interface TourReviewsProps {
  reviews: Array<{
    id?: string | number;
    title: string;
    description: string;
    rating: number;
    user: {
      firstName?: string;
      profilePicture?: {
        url: string;
        alternativeText?: string;
      };
    };
    /** gestiamo più varianti di campo */
    created_at?: string | number | Date;
    createdAt?: string | number | Date;
    publishedAt?: string | number | Date;
  }>;
}

const makeReviewKey = (
  review: TourReviewsProps['reviews'][number],
  index: number
): string => {
  const idPart =
    review.id !== undefined && review.id !== null ? `id:${String(review.id)}` : undefined;
  const rawDate = review.created_at ?? review.createdAt ?? review.publishedAt;
  const tsPart = rawDate ? `t:${new Date(rawDate as any).getTime()}` : undefined;
  return `rev-${idPart ?? tsPart ?? `idx:${index}`}`;
};

function fullNameOf(review: TourReviewsProps['reviews'][number]): string {
  const fn = review.user?.firstName?.trim();
  return fn || 'Utente';
}

function initialsOf(review: TourReviewsProps['reviews'][number]): string {
  const fnI = review.user?.firstName?.[0] ?? 'U';
  return fnI.toUpperCase();
}

function parseDateLabel(review: TourReviewsProps['reviews'][number]): string | null {
  const raw = review.created_at ?? review.createdAt ?? review.publishedAt;
  if (!raw) return null;
  const d = new Date(raw as any);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric' });
}

const SingleReviewCard: React.FC<{ review: TourReviewsProps['reviews'][0] }> = ({ review }) => {
  const [open, setOpen] = useState(false);

  const renderStars = (rating: number) => {
    const safeRating = Number.isFinite(rating) ? Math.max(0, Math.min(5, Math.floor(rating))) : 5;
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < safeRating ? 'text-yellow-400 fill-current' : 'text-gray-300 dark:text-zinc-600'}`}
      />
    ));
  };

  const text = review.description ?? '';
  const truncated = text.length > 300 ? text.slice(0, 300) + '...' : text;
  const name = fullNameOf(review);
  const initials = initialsOf(review);
  const dateLabel = parseDateLabel(review);

  return (
    <>
      <Card className="h-full hover:shadow-lg transition-shadow duration-300 border-border bg-card text-card-foreground">
        <CardContent className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Avatar className="h-12 w-12">
              {review.user?.profilePicture?.url && (
                <AvatarImage
                  src={review.user.profilePicture.url}
                  alt={review.user.profilePicture.alternativeText || name}
                />
              )}
              <AvatarFallback className="bg-gradient-to-br from-orange-400 to-red-500 text-white font-bold text-lg">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-foreground">{name}</h3>
              <div className="flex items-center space-x-1">
                {renderStars(review.rating || 5)}
              </div>
            </div>
          </div>

          <p className="text-sm leading-relaxed whitespace-pre-wrap mb-2 text-muted-foreground">
            {truncated}
          </p>

          {text.length > 300 && (
            <button
              onClick={() => setOpen(true)}
              className="text-sm text-primary hover:underline"
            >
              Continua a leggere
            </button>
          )}

          <div className="flex items-center justify-between text-xs text-muted-foreground mt-3">
            {dateLabel ? <span>{dateLabel}</span> : <span>&nbsp;</span>}
          </div>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl">
          <DialogTitle className="text-lg font-semibold text-foreground mb-2">
            Recensione di {name}
          </DialogTitle>

          <DialogDescription className="text-sm text-muted-foreground mb-4">
            Valutazione: {review.rating}/5{dateLabel ? ` · ${dateLabel}` : ''}
          </DialogDescription>

          <p className="text-sm text-foreground whitespace-pre-wrap">{text}</p>
        </DialogContent>
      </Dialog>
    </>
  );
};

const TourReviews: React.FC<TourReviewsProps> = ({ reviews }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  if (!reviews?.length) return null;

  const averageRating =
    reviews.reduce((sum, r) => sum + (Number.isFinite(r.rating) ? r.rating : 0), 0) /
    reviews.length;

  return (
    <section id="reviews" className="py-16 bg-background">
      <div className="container mx-auto px-4">
        {/* Heading */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Quote className="w-8 h-8 text-primary mr-3" />
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Le esperienze dei nostri viaggiatori
            </h2>
          </div>

          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="flex space-x-1">
              {Array.from({ length: 5 }, (_, index) => (
                <Star
                  key={`avg-star-${index}`}
                  className={`w-5 h-5 ${
                    index + 1 <= Math.floor(averageRating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : index < averageRating
                      ? 'fill-yellow-400 text-yellow-200'
                      : 'fill-gray-200 text-gray-200'
                  }`}
                />
              ))}
            </div>
            <span className="text-lg font-semibold text-foreground">
              {averageRating.toFixed(1)}
            </span>
            <span className="text-muted-foreground">({reviews.length} recensioni)</span>
          </div>

          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Scopri cosa pensano i fotografi che hanno già vissuto questa esperienza unica
          </p>
        </div>

        {/* Carousel */}
        <div className="relative max-w-6xl mx-auto">
          <Carousel opts={{ align: 'start', loop: true }} className="w-full">
            <CarouselContent className="-ml-2 md:-ml-4">
              {reviews.map((review, idx) => (
                <CarouselItem
                  key={makeReviewKey(review, idx)}
                  className="pl-2 md:pl-4 basis-[90%] sm:basis-1/2 lg:basis-1/3"
                >
                  <SingleReviewCard review={review} />
                </CarouselItem>
              ))}
            </CarouselContent>

            {reviews.length > 3 && (
              <>
                <CarouselPrevious aria-label="Precedente" className="hidden md:flex -left-4 lg:-left-12" />
                <CarouselNext aria-label="Successivo" className="hidden md:flex -right-4 lg:-right-12" />
              </>
            )}
          </Carousel>
        </div>

        {/* Vedi tutte */}
        {reviews.length > 6 && (
          <div className="text-center mt-8">
            <button
              onClick={() => setIsModalOpen(true)}
              className="text-foreground font-semibold hover:underline"
            >
              Vedi tutte le recensioni
            </button>
          </div>
        )}

        <TourReviewsModal
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          reviews={reviews.map(r => ({ 
            ...r, 
            id: String(r.id ?? `review-${r.createdAt ?? r.created_at ?? r.publishedAt}`),
            user: {
              firstName: fullNameOf(r),
              profilePicture: r.user?.profilePicture
            },
            created_at: String(r.created_at ?? r.createdAt ?? r.publishedAt ?? '')
          }))}
          title="Recensioni del viaggio"
        />
      </div>
    </section>
  );
};

export default TourReviews;
