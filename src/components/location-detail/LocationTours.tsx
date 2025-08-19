import React from 'react';
import TourCard from '@/components/TourCard';
import { Tour } from '@/types';
import { transformTourData } from '@/utils/TourDataUtilis';

interface LocationToursProps {
  tours: any[];
  locationTitle: string;
}

const LocationTours: React.FC<LocationToursProps> = ({ tours, locationTitle }) => {
  const safeTours = Array.isArray(tours) ? tours : [];

  if (safeTours.length === 0) return null;

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
        {safeTours.map((tour) => {
          const transformedTour: Tour = transformTourData(tour);
          return <TourCard key={transformedTour.id} tour={transformedTour} />;
        })}
      </div>
    </div>
  );
};

export default LocationTours;
