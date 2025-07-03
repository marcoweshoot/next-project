'use client';

import React, { memo } from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import TourCard from '@/components/TourCard';
import { Tour } from '@/types';

interface ToursGridProps {
  tours: Tour[];
  loading: boolean;
  searchTerm: string;
}

// Memoized TourCard per evitare re-render inutili
const MemoizedTourCard = memo(TourCard);

const ToursGrid: React.FC<ToursGridProps> = memo(({
  tours,
  loading,
  searchTerm
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
      {loading ? (
        // Loading skeleton
        [...Array(6)].map((_, index) => (
          <div key={index} className="animate-fade-in">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <Skeleton className="h-48 w-full" />
              <div className="p-6">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-4" />
                <Skeleton className="h-4 w-1/2 mb-4" />
                <div className="flex justify-between items-center">
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-24" />
                </div>
              </div>
            </div>
          </div>
        ))
      ) : tours.length > 0 ? (
        tours.slice(0, 6).map((tour, index) => (
          <div 
            key={tour.id} 
            className="animate-fade-in"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <MemoizedTourCard tour={tour} />
          </div>
        ))
      ) : (
        // No results found
        <div className="col-span-full text-center py-12">
          <p className="text-gray-500 text-lg mb-4">
            Nessun viaggio trovato per "{searchTerm}"
          </p>
          <Button 
            variant="outline" 
            onClick={() => window.location.reload()}
          >
            Cancella ricerca
          </Button>
        </div>
      )}
    </div>
  );
});

ToursGrid.displayName = 'ToursGrid';

export default ToursGrid;
