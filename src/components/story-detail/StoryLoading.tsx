import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import { Skeleton } from '@/components/ui/skeleton';

const StoryLoading: React.FC = () => {
  return (
    <>
      <SEO
        title="Caricamento della storia in corso..."
        description="Stiamo caricando i dettagli della storia fotografica selezionata. Attendi qualche secondo."
      />

      <Header />

      <main className="min-h-screen bg-white" aria-busy="true">
        {/* Hero placeholder */}
        <div className="relative h-[70vh] bg-gray-200 animate-pulse" aria-hidden="true" />

        <div className="container mx-auto px-4 py-12">
          {/* Titolo e descrizione */}
          <section className="mb-12">
            <Skeleton className="h-8 w-3/4 mb-4" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-2/3" />
          </section>

          {/* Griglia autore + contenuto */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div>
              <Skeleton className="h-64 w-full mb-6" />
              <Skeleton className="h-4 w-5/6 mb-2" />
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-4 w-4/5" />
            </div>
            <div>
              <Skeleton className="h-8 w-1/2 mb-4" />
              <Skeleton className="h-32 w-full" />
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default StoryLoading;
