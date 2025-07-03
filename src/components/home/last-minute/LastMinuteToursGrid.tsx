
import React from 'react';
import LastMinuteTourCard from './LastMinuteTourCard';

interface LastMinuteTour {
  id: string;
  title: string;
  slug: string;
  image: string;
  startDate: string;
  duration: string;
  price: number;
  availableSpots: number;
  states?: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
  places?: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
}

interface LastMinuteToursGridProps {
  tours: LastMinuteTour[];
}

const LastMinuteToursGrid: React.FC<LastMinuteToursGridProps> = ({ tours }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
      {tours.map((tour) => (
        <LastMinuteTourCard key={tour.id} tour={tour} />
      ))}
    </div>
  );
};

export default LastMinuteToursGrid;
