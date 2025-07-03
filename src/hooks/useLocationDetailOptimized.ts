"use client";

import { useParams } from "next/navigation";
import { useMemo } from 'react';
import { useQuery } from '@apollo/client';
import { GET_LOCATION_DETAIL_OPTIMIZED } from '@/graphql/queries/location-detail-optimized';

export const useLocationDetailOptimized = () => {
  const { stateSlug, locationSlug } = useParams();
  
  const { data, loading, error } = useQuery(GET_LOCATION_DETAIL_OPTIMIZED, {
    variables: {
      slug: locationSlug,
      locale: 'it'
    },
    errorPolicy: 'all',
    fetchPolicy: 'cache-first', // Usa cache quando possibile
    nextFetchPolicy: 'cache-first',
    notifyOnNetworkStatusChange: false
  });

  const location = useMemo(() => {
    if (!data?.locations?.[0]) return null;
    
    const locationData = data.locations[0];
    return {
      id: locationData.id,
      title: locationData.title,
      description: locationData.description,
      slug: locationData.slug,
      latitude: locationData.latitude,
      longitude: locationData.longitude,
      state: {
        id: locationData.state?.id || '',
        name: locationData.state?.name || '',
        slug: locationData.state?.slug || stateSlug || ''
      },
      pictures: (locationData.pictures || []).map((picture: any) => ({
        id: picture.id,
        title: picture.title,
        url: picture.image?.formats?.medium?.url || picture.image?.url,
        alternativeText: picture.image?.alternativeText || picture.title
      }))
    };
  }, [data, stateSlug]);

  const tours = useMemo(() => {
    if (!data?.locations?.[0]?.tours) return [];
    
    return data.locations[0].tours.map((tour: any) => ({
      id: tour.id,
      title: tour.title,
      slug: tour.slug,
      description: tour.excerpt,
      image: tour.image ? {
        url: tour.image.formats?.medium?.url || tour.image.url,
        alternativeText: tour.image.alternativeText || tour.title
      } : undefined,
      states: Array.isArray(tour.states) ? tour.states : [tour.states].filter(Boolean),
      places: Array.isArray(tour.places) ? tour.places : [tour.places].filter(Boolean),
      sessions: tour.sessions || []
    }));
  }, [data]);

  return {
    pathname,
    tours,
    loading,
    error
  };
};
