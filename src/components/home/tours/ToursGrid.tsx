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
        className="mb-12 grid grid-cols-1 gap-6 sm:grid-cols-2 md:gap-8 lg:grid-cols-3"
        aria-live="polite"
      >
        {loading &&
          Array.from({ length: 6 }).map((_, index) => (
            <div key={`skeleton-${index}`} className="animate-pulse">
              <div className="overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm">
                <Skeleton className="h-48 w-full" />
                <div className="space-y-3 p-4">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-1/2" />
                  <div className="mt-4 flex items-center justify-between">
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
          <div className="col-span-full py-12 text-center">
            <p className="mb-4 text-lg text-muted-foreground">
              Nessun viaggio trovato per &quot;{searchTerm}&quot;
            </p>
            {onResetSearch && (
              <Button variant="outline" onClick={onResetSearch} className="text-sm">
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
