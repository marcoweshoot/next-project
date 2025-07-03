"use client";

import { useMemo } from 'react';
import { useQuery } from '@apollo/client';
import { GET_TOURS_PREVIEW } from '@/graphql/queries';

export const useOptimizedTours = (limit = 6, featured = false) => {
  const { data, loading, error } = useQuery(GET_TOURS_PREVIEW, {
    variables: {
      locale: 'it',
      limit
    },
    errorPolicy: 'all',
    fetchPolicy: 'cache-first',
    notifyOnNetworkStatusChange: false
  });

  const tours = useMemo(() => {
    if (!data?.tours) return [];
    
    return data.tours.map((tour: any) => {
      const latestSession = tour.sessions?.[0];
      
      return {
        id: tour.id,
        title: tour.title,
        slug: tour.slug,
        excerpt: tour.excerpt,
        cover: tour.image ? {
          url: tour.image.url,
          alt: tour.image.alternativeText || tour.title
        } : undefined,
        startDate: latestSession?.start || new Date().toISOString(),
        duration: latestSession?.start && latestSession?.end ? 
          Math.ceil((new Date(latestSession.end).getTime() - new Date(latestSession.start).getTime()) / (1000 * 60 * 60 * 24)) : 7,
        price: latestSession?.price || 0,
        maxParticipants: latestSession?.maxPax || 10,
        availableSpots: latestSession?.maxPax || 10,
        difficulty: 'medium' as const,
        featured: false,
        coach: {
          id: latestSession?.users?.[0]?.id || '1',
          name: latestSession?.users?.[0]?.firstName ? 
            `${latestSession.users[0].firstName} ${latestSession.users[0].lastName || ''}`.trim() : 
            'Coach WeShoot',
          slug: 'coach-weshoot',
          avatar: {
            url: latestSession?.users?.[0]?.profilePicture?.url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
            alt: latestSession?.users?.[0]?.firstName || 'Coach WeShoot'
          }
        },
        destination: {
          id: tour.states?.[0]?.id || '1',
          name: tour.places?.[0]?.name || 'Destinazione',
          slug: tour.places?.[0]?.slug || 'destinazione',
          country: tour.states?.[0]?.name || 'Paese'
        },
        sessions: tour.sessions || [],
        states: tour.states,
        places: tour.places
      };
    });
  }, [data]);

  return { tours, loading, error };
};
