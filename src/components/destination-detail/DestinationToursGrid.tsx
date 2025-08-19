import React from 'react';
import TourCard from '@/components/TourCard';
import { Tour, Destination } from './types';
import { transformTourData } from '@/utils/TourDataUtilis';

interface DestinationToursGridProps {
  tours: Tour[];
  destination?: Destination;
}

const DestinationToursGrid: React.FC<DestinationToursGridProps> = ({
  tours,
  destination,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {tours.map((tour) => {
        const transformedTour = transformTourData(tour);

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
