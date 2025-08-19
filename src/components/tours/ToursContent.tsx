'use client';

import Link from "next/link";
import React, { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import TourCard from '@/components/TourCard';
import { Tour } from '@/types';
import { Loader2 } from 'lucide-react';

interface ToursContentProps {
  tours: Tour[];
  loading: boolean;
  loadingMore?: boolean;
  error: any;
  searchTerm: string;
  onClearSearch: () => void;
  hasMore?: boolean;
}

const ToursContent: React.FC<ToursContentProps> = ({
  tours,
  loading,
  loadingMore = false,
  error,
  searchTerm,
  onClearSearch,
  hasMore = false,
}) => {

  // Filter tours based on search term
  const filteredTours = useMemo(() => {
    if (!searchTerm.trim()) return tours;
    
    const searchLower = searchTerm.toLowerCase();
    return tours.filter(tour => 
      tour.title.toLowerCase().includes(searchLower) ||
      tour.description?.toLowerCase().includes(searchLower) ||
      tour.destination.name.toLowerCase().includes(searchLower) ||
      tour.destination.country.toLowerCase().includes(searchLower)
    );
  }, [tours, searchTerm]);

  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <Card key={i} className="overflow-hidden">
          <Skeleton className="w-full h-48" />
          <CardContent className="p-6">
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-full mb-4" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-1/3" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const LoadingMoreIndicator = () => (
    <div className="flex justify-center items-center py-8">
      <Loader2 className="h-6 w-6 animate-spin mr-2" />
      <span className="text-gray-600">Caricamento altri viaggi...</span>
    </div>
  );

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {searchTerm ? `Risultati per "${searchTerm}"` : 'I Nostri Viaggi Fotografici'}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {searchTerm ? 
              `${filteredTours.length} viaggio${filteredTours.length !== 1 ? 'i' : ''} trovato${filteredTours.length !== 1 ? 'i' : ''}` :
              'Ogni viaggio è un\'opportunità unica per migliorare le tue competenze fotografiche esplorando alcune delle destinazioni più spettacolari del mondo.'
            }
          </p>
        </div>

        {loading && <LoadingSkeleton />}
        
        {error && (
          <Alert className="max-w-2xl mx-auto">
            <AlertDescription>
              Si è verificato un errore nel caricamento dei tour. 
              Riprova più tardi o contattaci per assistenza.
            </AlertDescription>
          </Alert>
        )}

        {!loading && !error && filteredTours.length === 0 && searchTerm && (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              Nessun viaggio trovato
            </h3>
            <p className="text-gray-500 mb-4">
              Prova a modificare i termini di ricerca o esplora tutti i nostri viaggi.
            </p>
            <Button 
              variant="outline" 
              onClick={onClearSearch}
              className="mr-4"
            >
              Cancella ricerca
            </Button>
            <Button asChild>
              <Link href="/viaggi-fotografici/destinazioni">
                Esplora destinazioni
              </Link>
            </Button>
          </div>
        )}

        {!loading && !error && tours.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              Nessun tour disponibile al momento
            </h3>
            <p className="text-gray-500">
              Torna presto per scoprire nuove destinazioni fotografiche!
            </p>
          </div>
        )}

        {!loading && !error && filteredTours.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredTours.map((tour) => (
                <TourCard key={tour.id} tour={tour} />
              ))}
            </div>
            
            {/* Loading More Indicator */}
            {loadingMore && <LoadingMoreIndicator />}
            
            {/* Show "Carica altri" button if no search and there are more tours but not currently loading */}
            {!searchTerm && hasMore && !loadingMore && (
              <div className="text-center mt-12">
                <p className="text-gray-500 mb-4">
                  Scorri verso il basso per caricare altri viaggi automaticamente
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default ToursContent;
