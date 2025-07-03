'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import PageBreadcrumbs from '@/components/PageBreadcrumbs';
import { Clock, Users, Star } from 'lucide-react';

interface TourHeroProps {
  tour: {
    title: string;
    description?: string;
    image?: {
      url: string;
      alternativeText?: string;
    };
    duration: number;
    maxParticipants: number;
    difficulty: 'easy' | 'medium' | 'hard';
  };
  stateSlug?: string;
  placeSlug?: string;
  onViewSessions: () => void;
}

const TourHero: React.FC<TourHeroProps> = ({ tour, stateSlug, placeSlug, onViewSessions }) => {
  const breadcrumbElements = [
    { name: 'WeShoot', path: '/' },
    { name: 'Viaggi Fotografici', path: '/viaggi-fotografici' },
    { name: 'Destinazioni', path: '/viaggi-fotografici/destinazioni' },
    { name: tour.title }
  ];

  return (
    <section className="relative h-96 bg-gradient-to-r from-blue-600 to-purple-600 overflow-hidden">
      {tour.image?.url && (
        <img
          src={tour.image.url}
          alt={tour.image.alternativeText || tour.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}
      <div className="absolute inset-0 bg-black/60" />
      
      <div className="relative z-10 container mx-auto px-4 h-full flex flex-col justify-center text-white">
        <div className="mb-6">
          <PageBreadcrumbs elements={breadcrumbElements} />
        </div>
        
        <h1 className="text-4xl md:text-6xl font-bold mb-4 text-white drop-shadow-lg">
          {tour.title}
        </h1>
        
        {tour.description && (
          <p className="text-xl mb-6 max-w-2xl text-white/90 drop-shadow-md">
            {tour.description.replace(/<[^>]*>/g, '')}
          </p>
        )}
        
        <div className="flex flex-wrap gap-4 mb-6">
          <Badge variant="secondary" className="bg-white/20 text-white backdrop-blur-sm">
            <Clock className="w-4 h-4 mr-2" />
            {tour.duration} giorni
          </Badge>
          <Badge variant="secondary" className="bg-white/20 text-white backdrop-blur-sm">
            <Users className="w-4 h-4 mr-2" />
            Max {tour.maxParticipants} partecipanti
          </Badge>
          <Badge variant="secondary" className="bg-white/20 text-white backdrop-blur-sm">
            <Star className="w-4 h-4 mr-2" />
            {tour.difficulty === 'easy' ? 'Facile' : tour.difficulty === 'medium' ? 'Medio' : 'Difficile'}
          </Badge>
        </div>
        
        <Button 
          onClick={onViewSessions}
          className="w-fit shadow-lg"
        >
          Vedi Partenze
        </Button>
      </div>
    </section>
  );
};

export default TourHero;
