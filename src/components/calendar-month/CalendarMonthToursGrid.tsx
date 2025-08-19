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
  year,
}) => {
  return (
    <section aria-labelledby="month-results" className="w-full">
      <header className="text-center mb-12">
        <h2
          id="month-results"
          className="text-xl font-medium text-gray-700"
        >
          {tours.length}{' '}
          {tours.length === 1 ? 'viaggio trovato' : 'viaggi trovati'} per{' '}
          {monthName} {year}
        </h2>
      </header>

      <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 list-none p-0 m-0">
        {tours.map((tour, index) => {
          if (index === 0) {
            console.debug('CALENDAR GRID → tour[0] raw', {
              id: tour?.id,
              slug: tour?.slug,
              states: tour?.states,
              places: tour?.places,
              destination: (tour as any)?.destination,
              statesSlugs: tour?.states?.map?.((s: any) => s?.slug),
              placesSlugs: tour?.places?.map?.((p: any) => p?.slug),
            });
          }

          return (
            <li
              key={`tour-${tour.id}-${index}`}
              className="animate-zoomIn h-full"
            >
              <TourCard tour={tour} />
            </li>
          );
        })}
      </ul>
    </section>
  );
};

export default CalendarMonthToursGrid;
