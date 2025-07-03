"use client"

'use client';

import { useParams, usePathname, useRouter } from "next/navigation";
import React, { useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { GET_DESTINATION_DETAIL } from '@/graphql/queries';
import { GET_TOURS } from '@/graphql/queries';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import DestinationDetailHero from '@/components/destination-detail/DestinationDetailHero';
import DestinationDetailLocations from '@/components/destination-detail/DestinationDetailLocations';
import DestinationDetailTours from '@/components/destination-detail/DestinationDetailTours';
import DestinationDetailError from '@/components/destination-detail/DestinationDetailError';
import DestinationDetailEmptyState from '@/components/destination-detail/DestinationDetailEmptyState';

const DestinationDetail = () => {
  const { destinationSlug } = useParams();
  const pathname = usePathname();
  const router = useRouter();
  
  console.log("DestinationDetail: destinationSlug from params:", destinationSlug);
  console.log("DestinationDetail: Full location:", location);
  console.log("DestinationDetail: All params:", useParams());
  
  // Query per destinazioni (stati)
  const { data, loading, error } = useQuery(GET_DESTINATION_DETAIL, {
    variables: { 
      locale: 'it', 
      slug: destinationSlug
    },
    skip: !destinationSlug
  });

  // Query per verificare se è un tour invece di uno stato
  const { data: toursData, loading: toursLoading } = useQuery(GET_TOURS, {
    variables: { 
      locale: 'it'
    },
    skip: !destinationSlug || loading || data?.states?.length > 0
  });

  console.log("DestinationDetail: Query data:", data);
  console.log("DestinationDetail: Loading:", loading);
  console.log("DestinationDetail: Error:", error);
  console.log("DestinationDetail: Tours data:", toursData);

  // Controlla se il slug corrisponde a un tour e fai redirect al percorso corretto
  useEffect(() => {
    if (!loading && !toursLoading && data?.states?.length === 0 && toursData?.tours) {
      const tour = toursData.tours.find((t: any) => t.slug === destinationSlug);
      
      if (tour) {
        console.log("Found tour that matches slug:", tour);
        
        // Costruisci il percorso corretto per il tour
        const stateSlug = tour.states?.[0]?.slug;
        const placeSlug = tour.places?.[0]?.slug;
        
        if (stateSlug && placeSlug) {
          const correctPath = `/viaggi-fotografici/destinazioni/${stateSlug}/${placeSlug}/${destinationSlug}`;
          console.log("Redirecting to correct tour path:", correctPath);
          router.push(correctPath, { replace: true });
          return;
        } else if (stateSlug) {
          // Fallback se non abbiamo place ma abbiamo state
          const fallbackPath = `/viaggi-fotografici/destinazioni/${stateSlug}/${destinationSlug}`;
          console.log("Redirecting to fallback tour path:", fallbackPath);
          router.push(fallbackPath, { replace: true });
          return;
        } else {
          // Se non abbiamo né state né place, redirect alla pagina tours principale
          console.log("No state/place found, redirecting to tours list");
          router.push(`/viaggi-fotografici/`, { replace: true });
          return;
        }
      }
    }
  }, [loading, toursLoading, data, toursData, destinationSlug, router]);

  // Handle errors
  if (error) {
    console.error('Error loading destination:', error);
    return <DestinationDetailError type="general" destinationSlug={destinationSlug} />;
  }

  if (!destinationSlug) {
    return <DestinationDetailError type="missingParam" currentPath={pathname} />;
  }

  const destination = data?.states?.[0];
  const locations = data?.locations || [];
  const tours = data?.tours || [];

  if (!destination && !loading && !toursLoading) {
    return <DestinationDetailError type="notFound" />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {destination && (
        <SEO 
          title={destination.seo?.metaTitle || `${destination.name} - Viaggi Fotografici`}
          description={destination.seo?.metaDescription || `Scopri i viaggi fotografici in ${destination.name}. Esplora paesaggi mozzafiato e cattura momenti indimenticabili.`}
          url={`https://www.weshoot.it/viaggi-fotografici/destinazioni/${destination.slug}`}
        />
      )}
      
      <Header />
      
      <DestinationDetailHero 
        destination={destination}
        loading={loading || toursLoading}
        destinationSlug={destinationSlug}
      />

      <DestinationDetailLocations 
        locations={locations}
        destination={destination}
        loading={loading || toursLoading}
      />

      <DestinationDetailTours 
        tours={tours}
        destination={destination}
        loading={loading || toursLoading}
      />

      {!loading && locations.length === 0 && tours.length === 0 && (
        <DestinationDetailEmptyState destinationName={destination?.name} />
      )}

      <Footer />
    </div>
  );
};

export default DestinationDetail;
