import React from 'react';
import TourCard from '@/components/TourCard';
import { Tour } from '@/types';

interface PhotographerToursGridProps {
  tours: Tour[];
}

const PhotographerToursGrid: React.FC<PhotographerToursGridProps> = ({ tours }) => {
  return (
    <section className="py-16 bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Parti in viaggio con me
          </h2>
          <p className="text-xl text-gray-600">
            Questi sono i viaggi fotografici dove ti farò da coach
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tours.map((tour) => (
            <TourCard key={tour.id} tour={tour} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default PhotographerToursGrid;
