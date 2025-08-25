import React from 'react';
import TourCard from '@/components/TourCard';
import { Tour } from '@/types';

interface CalendarMonthToursGridProps {
  tours: Tour[];
  monthName: string;
  year: string;
}

// Trasforma x in array: supporta x, [x], null/undefined
const toArray = <T,>(x: T | T[] | null | undefined): T[] =>
  Array.isArray(x) ? x : x ? [x] : [];

const CalendarMonthToursGrid: React.FC<CalendarMonthToursGridProps> = ({
  tours,
  monthName,
  year,
}) => {
  const isDev = process.env.NODE_ENV !== 'production';

  return (
    <section aria-labelledby="month-results" className="w-full">
      <header className="text-center mb-12">
        <h2 id="month-results" className="text-xl font-medium text-gray-700">
          {tours.length}{' '}
          {tours.length === 1 ? 'viaggio trovato' : 'viaggi trovati'} per {monthName} {year}
        </h2>
      </header>

      <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 list-none p-0 m-0">
        {tours.map((tour, index) => {
          // Normalizza states/places in array (alcune query restituiscono oggetto singolo)
          const statesArr = toArray((tour as any)?.states);
          const placesArr = toArray((tour as any)?.places);

          if (isDev && index === 0) {
            console.debug('CALENDAR GRID → tour[0] normalized', {
              id: tour?.id,
              slug: tour?.slug,
              states: (tour as any)?.states,
              places: (tour as any)?.places,
              statesSlugs: statesArr.map(s => s?.slug),
              placesSlugs: placesArr.map(p => p?.slug),
            });
          }

          // Se TourCard si aspetta array, passiamo la versione normalizzata
          const tourForCard = {
            ...tour,
            states: statesArr,
            places: placesArr,
          } as Tour;

          return (
            <li key={`tour-${tour.id}-${index}`} className="animate-zoomIn h-full">
              <TourCard tour={tourForCard} />
            </li>
          );
        })}
      </ul>
    </section>
  );
};

export default CalendarMonthToursGrid;
