
import React from 'react';
import TourCard from '@/components/TourCard';
import { Tour } from '@/types';

interface CalendarMonthToursGridProps {
  tours: Tour[];
  monthName: string;
  year: string;
}

const CalendarMonthToursGrid: React.FC<CalendarMonthToursGridProps> = ({ 
  tours, 
  monthName, 
  year 
}) => {
  return (
    <>
      <div className="text-center mb-12">
        <p className="text-lg text-gray-600">
          {tours.length} {tours.length === 1 ? 'viaggio trovato' : 'viaggi trovati'} per {monthName} {year}
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {tours.map((tour) => (
          <div key={tour.id} className="animate-zoomIn">
            <TourCard tour={tour} />
          </div>
        ))}
      </div>
    </>
  );
};

export default CalendarMonthToursGrid;
