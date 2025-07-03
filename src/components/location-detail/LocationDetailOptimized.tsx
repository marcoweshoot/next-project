
import React, { Suspense, lazy } from 'react';
import { useLocationDetail } from '@/hooks/useLocationDetail';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import LocationHero from './LocationHero';
import { Skeleton } from '@/components/ui/skeleton';

// Lazy load dei componenti non critici
const LocationContent = lazy(() => import('./LocationContent'));
const LocationTours = lazy(() => import('./LocationTours'));

const LocationDetailOptimized: React.FC = () => {
  const { location, tours, loading, error } = useLocationDetail();

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Location non trovata</h2>
            <p className="text-gray-600">La location che stai cercando non esiste o è stata rimossa.</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {location && (
        <SEO 
          title={`${location.title} - Viaggi Fotografici WeShoot`}
          description={location.description || `Scopri ${location.title} nei nostri viaggi fotografici. Location fotografica unica con paesaggi mozzafiato.`}
          url={`https://www.weshoot.it/viaggi-fotografici/destinazioni/${location.state.slug}/${location.slug}`}
        />
      )}
      
      <Header />
      
      <LocationHero 
        location={location} 
        stateSlug={location?.state?.slug || ''} 
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Suspense fallback={<LocationContentSkeleton />}>
          <LocationContent location={location} loading={loading} />
        </Suspense>

        <Suspense fallback={<LocationToursSkeleton />}>
          <LocationTours tours={tours} locationTitle={location?.title || ''} />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
};

const LocationContentSkeleton = () => (
  <div className="space-y-8">
    <Skeleton className="h-6 w-3/4 mx-auto" />
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(6)].map((_, i) => (
        <Skeleton key={i} className="aspect-video w-full" />
      ))}
    </div>
  </div>
);

const LocationToursSkeleton = () => (
  <div className="mt-16 space-y-8">
    <div className="text-center">
      <Skeleton className="h-8 w-1/2 mx-auto mb-4" />
      <Skeleton className="h-4 w-3/4 mx-auto" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="space-y-4">
          <Skeleton className="aspect-video w-full" />
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ))}
    </div>
  </div>
);

export default LocationDetailOptimized;
