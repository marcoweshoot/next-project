"use client";
import React from 'react';
import CalendarHero from './CalendarHero';
import CalendarEmptyState from './CalendarEmptyState';
import CalendarMonth from './CalendarMonth';

interface GroupedSessions {
  [key: string]: {
    month: string;
    year: number;
    tours: any[];
  };
}

interface CalendarContentProps {
  groupedSessions: GroupedSessions;
  coverImage: string;
}

const CalendarContent: React.FC<CalendarContentProps> = ({ 
  groupedSessions, 
  coverImage 
}) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <CalendarHero coverImage={coverImage} />

      <section className="py-8 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {Object.keys(groupedSessions).length > 0 ? (
            <div className="space-y-8">
              {Object.entries(groupedSessions).map(([key, monthData]) => (
                <CalendarMonth 
                  key={key}
                  monthKey={key}
                  monthData={monthData}
                />
              ))}
            </div>
          ) : (
            <CalendarEmptyState />
          )}
        </div>
      </section>
    </div>
  );
};

export default CalendarContent;
