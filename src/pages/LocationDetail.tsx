
import { useParams } from "next/navigation";
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import LocationHero from '@/components/location-detail/LocationHero';
import LocationContent from '@/components/location-detail/LocationContent';
import LocationTours from '@/components/location-detail/LocationTours';
import LocationError from '@/components/location-detail/LocationError';
import { Skeleton } from '@/components/ui/skeleton';
import { useLocationDetail } from '@/hooks/useLocationDetail';

const LocationDetail = () => {
  const { stateSlug, locationSlug } = useParams();
  const { pathname, tours, loading, error } = useLocationDetail();

  console.log("🔍 LocationDetail - Component render state:", {
    stateSlug,
    locationSlug,
    location: !!location,
    locationTitle: location?.title,
    tours: tours?.length || 0,
    loading,
    error: !!error,
    errorMessage: error?.message
  });

  // Early return for error state
  if (error) {
    console.error('🚨 LocationDetail - Error loading location:', error);
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="px-4">
          <div className="max-w-7xl mx-auto">
            <LocationError stateSlug={stateSlug || ''} type="error" />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Early return for loading state
  if (loading) {
    console.log("🔍 LocationDetail - Showing loading state");
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <SEO 
          title="Caricamento..."
          description="Caricamento location in corso..."
          url={`https://www.weshoot.it/viaggi-fotografici/destinazioni/${stateSlug}/${locationSlug}/`}
        />
        
        <div className="h-96 bg-gray-200 animate-pulse" />

        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="space-y-8">
              <Skeleton className="h-8 w-3/4 mx-auto" />
              <Skeleton className="h-96 w-full" />
              <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
          </div>
        </section>
        
        <Footer />
      </div>
    );
  }

  // Early return for not found state
  if (!location) {
    console.log("🔍 LocationDetail - No location found, showing not found");
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="px-4">
          <div className="max-w-7xl mx-auto">
            <LocationError stateSlug={stateSlug || ''} type="not-found" />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  console.log("🔍 LocationDetail - Rendering main content with location:", location.title);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <SEO 
        title={`${location.title} - Viaggi Fotografici ${location.state.name}`}
        description={`Scopri ${location.title} in ${location.state.name}. Una delle location più belle per i tuoi scatti fotografici.`}
        url={`https://www.weshoot.it/viaggi-fotografici/destinazioni/${stateSlug}/${locationSlug}/`}
      />
      
      <LocationHero location={location} stateSlug={stateSlug || ''} />

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <LocationContent location={location} loading={false} />
          <LocationTours tours={tours} locationTitle={location.title} />
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default LocationDetail;
