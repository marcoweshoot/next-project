
import React from 'react';
import Link from 'next/link';

interface CalendarMonthEmptyProps {
  monthName: string;
  year: string;
}

const CalendarMonthEmpty: React.FC<CalendarMonthEmptyProps> = ({ monthName, year }) => {
  return (
    <div className="text-center py-16">
      <h3 className="text-2xl font-bold text-gray-900 mb-4">
        Nessun viaggio trovato
      </h3>
      <p className="text-lg text-gray-600 mb-8">
        Non ci sono viaggi fotografici programmati per {monthName} {year}.
      </p>
      <Link
        href="/viaggi-fotografici/calendario/"
        className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
        aria-label="Torna al calendario dei viaggi fotografici"
      >
        Torna al Calendario
      </Link>
    </div>
  );
};

export default CalendarMonthEmpty;
