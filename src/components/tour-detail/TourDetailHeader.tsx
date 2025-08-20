'use client';

import React from 'react';
import PageHeader from '@/components/PageHeader';
import PageBreadcrumbs from '@/components/PageBreadcrumbs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Users, Star } from 'lucide-react';
import { buildTourBreadcrumbs } from '@/utils/tourBreadcrumbBuilder';

interface TourDetailHeaderProps {
  tour: any;
  reviewsCount: number;
  averageRating: number;
  stateSlug?: string;
  placeSlug?: string;
  onScrollToSessions: () => void;
  onScrollToReviews: () => void;
}

const TourDetailHeader: React.FC<TourDetailHeaderProps> = ({
  tour,
  reviewsCount,
  averageRating,
  stateSlug,
  placeSlug,
  onScrollToSessions,
  onScrollToReviews,
}) => {
  const breadcrumbElements = tour ? buildTourBreadcrumbs(tour, stateSlug, placeSlug) : [];

  const renderStars = (rating: number) =>
    Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < Math.round(rating)
            ? 'fill-yellow-400 text-yellow-400'
            : 'fill-gray-200 text-gray-200'
        }`}
      />
    ));

  // prossima sessione futura (o prima se nulla di futuro)
  const now = new Date();
  const nextSession =
    tour?.sessions
      ?.filter((s: any) => s?.start && new Date(s.start) >= now)
      .sort((a: any, b: any) => new Date(a.start).getTime() - new Date(b.start).getTime())[0] ||
    tour?.sessions?.[0];

  // calcola durata e maxPax sulla prima sessione (rimane compatibile col precedente)
  const firstSession = tour?.sessions?.[0];
  const duration =
    firstSession?.start && firstSession?.end
      ? Math.ceil(
          (new Date(firstSession.end).getTime() - new Date(firstSession.start).getTime()) /
            (1000 * 60 * 60 * 24)
        )
      : null;
  const maxPax = firstSession?.maxPax;

  const extractPrice = (session: any): number | null => {
    if (!session) return null;
    // tentativi comuni di path per prezzo
    if (typeof session.price === 'number') return session.price;
    if (typeof session.price === 'string' && !isNaN(Number(session.price))) return Number(session.price);
    if (session.pricing?.from && typeof session.pricing.from === 'number') return session.pricing.from;
    if (
      session.pricePerPerson?.amount &&
      (typeof session.pricePerPerson.amount === 'number' ||
        (typeof session.pricePerPerson.amount === 'string' && !isNaN(Number(session.pricePerPerson.amount))))
    ) {
      return Number(session.pricePerPerson.amount);
    }
    return null;
  };

  const formatPrice = (amount: number | null) => {
    if (amount == null) return '—';
    // se fosse in centesimi, adattare qui (es. amount / 100)
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const nextSessionPrice = extractPrice(nextSession);
  const nextSessionDate = nextSession?.start ? new Date(nextSession.start) : null;

  return (
    <PageHeader
      backgroundImage={
        tour?.image?.url ||
        'https://wxoodcdxscxazjkoqhsg.supabase.co/storage/v1/object/public/picture//viaggi-fotografici-e-workshop.avif'
      }
      size="medium"
      className="pt-20"
      priority                 // ← true solo qui: migliora il LCP
      sizes="100vw"            // ← hero full-width responsive
      alt={tour?.image?.alternativeText || tour?.title || 'Hero tour'}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
          {tour?.title || 'Caricamento...'}
        </h1>

        {breadcrumbElements.length > 0 && (
          <div className="mb-4">
            <PageBreadcrumbs
              elements={breadcrumbElements}
              className="flex justify-center text-xs"
            />
          </div>
        )}

        {tour && (
          <>
            <div className="flex flex-wrap justify-center gap-4 mb-6">
              {duration && (
                <Badge variant="secondary" className="bg-white/20 text-white">
                  <Clock className="w-4 h-4 mr-2" />
                  Durata {duration} giorni
                </Badge>
              )}

              {typeof maxPax === 'number' && (
                <Badge variant="secondary" className="bg-white/20 text-white">
                  <Users className="w-4 h-4 mr-2" />
                  Max {maxPax} partecipanti
                </Badge>
              )}

              <Badge variant="secondary" className="bg-white/20 text-white">
                <Star className="w-4 h-4 mr-2" />
                {tour.difficulty === 'easy'
                  ? 'Facile'
                  : tour.difficulty === 'medium'
                  ? 'Medio'
                  : 'Difficile'}
              </Badge>
            </div>

            <Button onClick={onScrollToSessions} className="text-white shadow-lg mb-6 font-bold">
              Vedi Partenze
            </Button>

            {/* Se ci sono recensioni */}
            {reviewsCount > 0 && (
              <div className="flex items-center justify-center gap-3">
                <div className="flex items-center space-x-1">{renderStars(averageRating)}</div>
                <button
                  onClick={onScrollToReviews}
                  className="text-white/90 hover:text-white transition-colors font-medium underline underline-offset-2"
                >
                  {reviewsCount} recensioni
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </PageHeader>
  );
};

export default TourDetailHeader;
