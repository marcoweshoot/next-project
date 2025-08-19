import React, { memo } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import TourCard from "@/components/TourCard";
import { Tour } from "@/types";

interface ToursGridProps {
  tours: Tour[];
  loading: boolean;
  searchTerm?: string;
  onResetSearch?: () => void;
}

const MemoizedTourCard = memo(TourCard);

const ToursGrid: React.FC<ToursGridProps> = memo(
  ({ tours, loading, searchTerm, onResetSearch }) => {
    const hasResults = !loading && tours.length > 0;

    return (
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-12"
        aria-live="polite"
      >
        {loading &&
          Array.from({ length: 6 }).map((_, index) => (
            <div key={`skeleton-${index}`} className="animate-pulse">
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <div className="p-4 space-y-3">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-1/2" />
                  <div className="flex justify-between items-center mt-4">
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-8 w-24" />
                  </div>
                </div>
              </div>
            </div>
          ))}

        {hasResults &&
          tours.slice(0, 6).map((tour, index) => (
            <div
              key={tour.id}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <MemoizedTourCard tour={tour} />
            </div>
          ))}

        {!loading && tours.length === 0 && searchTerm && (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-600 text-lg mb-4">
              Nessun viaggio trovato per &quot;{searchTerm}&quot;
            </p>
            {onResetSearch && (
              <Button
                variant="outline"
                onClick={onResetSearch}
                className="text-sm"
              >
                Cancella ricerca
              </Button>
            )}
          </div>
        )}
      </div>
    );
  }
);

ToursGrid.displayName = "ToursGrid";

export default ToursGrid;
