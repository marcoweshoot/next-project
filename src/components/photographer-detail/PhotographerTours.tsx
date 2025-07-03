
import React from 'react';
import { filterToursByPhotographer } from './utils/tourFilters';
import { transformTourForCard } from './utils/tourTransformers';
import PhotographerToursLoading from './components/PhotographerToursLoading';
import PhotographerToursEmpty from './components/PhotographerToursEmpty';
import PhotographerToursGrid from './components/PhotographerToursGrid';

interface Tour {
  id: string;
  title: string;
  slug: string;
  description?: string;
  excerpt?: string;
  difficulty?: string;
  experience_level?: string;
  currency?: string;
  image?: {
    id: string;
    url: string;
    alternativeText?: string;
  };
  places?: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
  states?: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
  sessions?: Array<{
    id: string;
    start: string;
    end: string;
    status: string;
    sessionId: string;
    maxPax: number;
    price: number;
    deposit: number;
    balance: number;
    minPax: number;
    currency: string;
    priceCompanion: number;
    users?: Array<{
      id: string;
      username: string;
      firstName: string;
      lastName: string;
      profilePicture?: {
        id: string;
        url: string;
        alternativeText?: string;
      };
    }>;
  }>;
}

interface PhotographerToursProps {
  tours: Tour[];
  photographerName: string;
  photographerUsername: string;
  loading?: boolean;
}

const PhotographerTours: React.FC<PhotographerToursProps> = ({ 
  tours, 
  photographerName, 
  photographerUsername,
  loading 
}) => {
  if (loading) {
    return <PhotographerToursLoading />;
  }

  // Filter tours by photographer
  const photographerTours = filterToursByPhotographer(tours, photographerUsername);

  if (photographerTours.length === 0) {
    return <PhotographerToursEmpty photographerName={photographerName} />;
  }

  // Transform tours for TourCard component
  const transformedTours = photographerTours.map(tour => 
    transformTourForCard(tour, photographerUsername, photographerName)
  );

  return <PhotographerToursGrid tours={transformedTours} />;
};

export default PhotographerTours;
