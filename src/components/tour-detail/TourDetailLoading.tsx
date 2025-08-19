import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import { Skeleton } from '@/components/ui/skeleton';

const TourDetailLoading: React.FC = () => {
  return (
    <>
      <SEO title="Caricamento..." />
      <div className="min-h-screen bg-white">
        <Header />

        {/* Hero Placeholder */}
        <div className="relative h-96 bg-gray-200 animate-pulse" />

        {/* Contenuto principale */}
        <div className="container mx-auto px-4 py-12 space-y-12">
          {/* Titolo e descrizione */}
          <div>
            <Skeleton className="h-10 w-2/3 mb-4" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-5/6" />
          </div>

          {/* Griglia dettagli */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>

          {/* Card "Cosa include / non include" */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>

          {/* Itinerario */}
          <div>
            <Skeleton className="h-8 w-1/2 mb-4" />
            <div className="space-y-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          </div>

          {/* Galleria */}
          <div>
            <Skeleton className="h-8 w-1/3 mb-4" />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              <Skeleton className="aspect-square w-full" />
              <Skeleton className="aspect-square w-full" />
              <Skeleton className="aspect-square w-full" />
              <Skeleton className="aspect-square w-full" />
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
};

export default TourDetailLoading;
