
import React from 'react';
import TourCard from '@/components/TourCard';
import { Tour, Destination } from './types';
import { transformTourData } from './tourTransformers';

interface DestinationToursGridProps {
  tours: Tour[];
  destination?: Destination;
}

const DestinationToursGrid: React.FC<DestinationToursGridProps> = ({
  tours,
  destination
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {tours.map((tour) => {
        console.log(`🔍 DestinationDetailTours - Processing tour: ${tour.title}`, {
          id: tour.id,
          sessions: tour.sessions?.length || 0,
          status: tour.sessions?.[0]?.status,
          states: tour.states
        });

        const transformedTour = transformTourData(tour);

        console.log(`✅ DestinationDetailTours - Transformed tour: ${tour.title}`, {
          status: transformedTour.status,
          availableSpots: transformedTour.availableSpots,
          maxParticipants: transformedTour.maxParticipants,
          difficulty: transformedTour.difficulty
        });

        return (
          <TourCard 
            key={tour.id} 
            tour={transformedTour}
          />
        );
      })}
    </div>
  );
};

export default DestinationToursGrid;
