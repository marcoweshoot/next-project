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
  renderStars: (rating: number) => React.ReactNode;
}

const TourDetailHeader: React.FC<TourDetailHeaderProps> = ({
  tour,
  reviewsCount,
  averageRating,
  stateSlug,
  placeSlug,
  onScrollToSessions,
  onScrollToReviews,
  renderStars
}) => {
  // Only build breadcrumbs if tour data is available
  const breadcrumbElements = tour ? buildTourBreadcrumbs(tour, stateSlug, placeSlug) : [];

  return (
    <PageHeader 
      backgroundImage={tour?.image?.url}
      size="medium"
      className="pt-20"
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
              <Badge variant="secondary" className="bg-white/20 text-white">
                <Clock className="w-4 h-4 mr-2" />
                Durata {tour.duration} giorni
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white">
                <Users className="w-4 h-4 mr-2" />
                Max {tour.maxParticipants} partecipanti
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white">
                <Star className="w-4 h-4 mr-2" />
                {tour.difficulty === 'easy' ? 'Facile' : tour.difficulty === 'medium' ? 'Medio' : 'Difficile'}
              </Badge>
            </div>
            
            <Button 
              onClick={onScrollToSessions}
              className="text-white shadow-lg mb-6"
            >
              Vedi Partenze
            </Button>

            {/* Reviews section - only show if there are reviews */}
            {reviewsCount > 0 && (
              <div className="flex items-center justify-center gap-3">
                <div className="flex items-center space-x-1">
                  {renderStars(averageRating)}
                </div>
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
