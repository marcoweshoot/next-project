import Link from "next/link";
import React from 'react';
import { ArrowRight } from 'lucide-react';
import CalendarSession from './CalendarSession';

interface TourSession {
  id: string;
  startDate: string;
  endDate: string;
  status: 'scheduled' | 'confirmed' | 'almostConfirmed' | 'almostFull' | 'waitingList' | 'soldOut';
  price: number;
  currency: string;
  availableSpots?: number;
  tour: {
    id: string;
    title: string;
    slug: string;
    places: string;
    states: string;
    duration: number;
    coach: {
      id: string;
      name: string;
      avatar?: {
        url: string;
        alt?: string;
      };
    };
  };
}

interface CalendarMonthProps {
  monthData: {
    month: string;
    year: number;
    tours: TourSession[];
  };
  monthKey: string;
}

const CalendarMonthPreview: React.FC<CalendarMonthProps> = ({
  monthData,
  monthKey,
}) => {
  return (
    <div key={monthKey}>
      {/* Month Header */}
      <div className="bg-black text-white px-6 py-4 rounded-t-lg flex items-center justify-between">
        <h2 className="text-2xl font-bold capitalize">
          {monthData.month} {monthData.year}
        </h2>
        <Link 
          href={`/viaggi-fotografici/calendario/${monthData.year}/${monthData.month.toLowerCase()}`}
          className="text-white hover:text-gray-300 flex items-center gap-2"
        >
          Mostra tutti i {monthData.tours.length} viaggi di {monthData.month.toLowerCase()} {monthData.year}
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
      {/* Sessions */}
      <div className="bg-white rounded-b-lg border border-gray-200">
        {monthData.tours.map((session, index) => (
          <CalendarSession 
            key={session.id}
            session={session}
            isLast={index === monthData.tours.length - 1}
          />
        ))}
      </div>
    </div>
  );
};

export default CalendarMonthPreview;
