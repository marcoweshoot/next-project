
import React from 'react';
import TourCard from '@/components/TourCard';

interface LocationToursProps {
  tours: any[];
  locationTitle: string;
}

const LocationTours: React.FC<LocationToursProps> = ({ tours, locationTitle }) => {
  console.log("🔍 LocationTours - Received tours:", tours);
  console.log("🔍 LocationTours - Tours is array?", Array.isArray(tours));
  console.log("🔍 LocationTours - Tours length:", tours?.length);

  // Ensure tours is always an array
  const safeTours = Array.isArray(tours) ? tours : [];
  
  if (safeTours.length === 0) {
    console.log("🔍 LocationTours - No tours to display");
    return null;
  }

  console.log("🔍 LocationTours - Rendering tours grid");

  return (
    <div className="mt-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Viaggi fotografici che visitano {locationTitle}
        </h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Scopri i nostri viaggi fotografici che includono questa incredibile location
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {safeTours.map((tour: any) => {
          console.log("🔍 LocationTours - Raw tour data from GraphQL:", tour);
          
          // Extract states and places - handle both array and object formats
          let tourStates = [];
          let tourPlaces = [];
          
          if (tour.states) {
            if (Array.isArray(tour.states)) {
              tourStates = tour.states;
            } else {
              tourStates = [tour.states];
            }
          }
          
          if (tour.places) {
            if (Array.isArray(tour.places)) {
              tourPlaces = tour.places;
            } else {
              tourPlaces = [tour.places];
            }
          }
          
          console.log("🔍 LocationTours - Extracted states:", tourStates);
          console.log("🔍 LocationTours - Extracted places:", tourPlaces);
          
          // Transform tour data to match TourCard interface
          const transformedTour = {
            id: tour.id,
            title: tour.title,
            slug: tour.slug,
            description: tour.description,
            cover: tour.image ? {
              url: tour.image.url,
              alt: tour.image.alternativeText || tour.title
            } : undefined,
            startDate: tour.sessions?.[0]?.start || '2024-01-01',
            duration: tour.sessions?.[0]?.start && tour.sessions?.[0]?.end ? 
              Math.ceil((new Date(tour.sessions[0].end).getTime() - new Date(tour.sessions[0].start).getTime()) / (1000 * 60 * 60 * 24)) : 7,
            price: tour.sessions?.[0]?.price || 0,
            maxParticipants: tour.sessions?.[0]?.maxPax || 10,
            availableSpots: tour.sessions?.[0]?.maxPax || 10,
            difficulty: tour.difficulty || 'medium' as const,
            featured: false,
            coach: {
              id: '1',
              name: 'Coach WeShoot',
              slug: 'coach-weshoot',
              avatar: {
                url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
                alt: 'Coach WeShoot'
              }
            },
            destination: {
              id: tourStates[0]?.id || '1',
              name: tourStates[0]?.name || 'Destinazione',
              slug: tourStates[0]?.slug || 'destinazione',
              country: tourStates[0]?.name || 'Paese'
            },
            sessions: Array.isArray(tour.sessions) ? tour.sessions : [],
            // CRITICAL: Pass the correct states and places for getTourLink
            states: tourStates,
            places: tourPlaces
          };

          console.log("🔍 LocationTours - Final transformed tour:", {
            id: transformedTour.id,
            title: transformedTour.title,
            slug: transformedTour.slug,
            states: transformedTour.states,
            places: transformedTour.places,
            statesCount: transformedTour.states?.length,
            placesCount: transformedTour.places?.length
          });

          return (
            <TourCard key={tour.id} tour={transformedTour} />
          );
        })}
      </div>
    </div>
  );
};

export default LocationTours;
