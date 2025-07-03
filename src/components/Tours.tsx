"use client"


import React, { useState, useCallback } from 'react';
import { useQuery } from '@apollo/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import ToursHero from '@/components/tours/ToursHero';
import ToursQuickLinks from '@/components/tours/ToursQuickLinks';
import ToursInfoSection from '@/components/tours/ToursInfoSection';
import ToursContent from '@/components/tours/ToursContent';
import ToursFAQ from '@/components/tours/ToursFAQ';
import { GET_TOURS, GET_TOURS_PAGE } from '@/graphql/queries';
import { Tour } from '@/types';
import { getFutureSessions, getLatestSession } from '@/components/tour-card/tourCardUtils';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';

const TOURS_PER_PAGE = 6;

const Tours = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [allTours, setAllTours] = useState<Tour[]>([]);
  const [hasMore, setHasMore] = useState(true);
  
  // Query per i tour con paginazione
  const { data, loading, error, fetchMore } = useQuery(GET_TOURS, {
    variables: {
      locale: 'it',
      limit: TOURS_PER_PAGE,
      start: 0
    },
    errorPolicy: 'all',
    notifyOnNetworkStatusChange: false,
    fetchPolicy: 'cache-first',
    onCompleted: (data) => {
      if (data?.tours) {
        const transformedTours = transformTours(data.tours);
        setAllTours(transformedTours);
        setHasMore(data.tours.length === TOURS_PER_PAGE);
      }
    }
  });

  // Query per la pagina tours (hero image e FAQ)
  const { data: toursPageData } = useQuery(GET_TOURS_PAGE, {
    variables: { locale: 'it' },
    errorPolicy: 'all'
  });

  console.log("Tours.tsx: Query data:", data);
  console.log("Tours.tsx: Loading:", loading);
  console.log("Tours.tsx: Error:", error);
  console.log("Tours.tsx: Tours page data:", toursPageData);

  if (error) {
    console.error("Tours.tsx: GraphQL Error:", error);
  }

  // Transform GraphQL data to match our Tour interface
  const transformTours = (tours: any[]): Tour[] => {
    return tours.map((tour: any) => {
      const futureSessions = getFutureSessions(tour.sessions || []);
      const latestSession = getLatestSession(tour.sessions || []);
      
      // Use future session if available, otherwise use latest session (same logic as TourCard)
      const displaySession = futureSessions.length > 0 ? futureSessions[0] : latestSession;
      
      const maxPax = displaySession?.maxPax || 0;
      const registeredUsers = displaySession?.users?.length || 0;
      const availableSpots = maxPax - registeredUsers;

      return {
        id: tour.id,
        title: tour.title,
        slug: tour.slug,
        description: tour.description,
        cover: tour.image ? {
          url: tour.image.url,
          alt: tour.image.alternativeText || tour.title
        } : undefined,
        startDate: displaySession?.start || '2024-01-01',
        duration: displaySession?.start && displaySession?.end ? 
          Math.ceil((new Date(displaySession.end).getTime() - new Date(displaySession.start).getTime()) / (1000 * 60 * 60 * 24)) : 7,
        price: displaySession?.price || 0,
        maxParticipants: displaySession?.maxPax || 10,
        availableSpots: availableSpots > 0 ? availableSpots : 0,
        status: displaySession?.status,
        difficulty: tour.difficulty || 'medium' as const,
        featured: false,
        coach: {
          id: '1',
          name: 'Coach WeShoot',
          slug: 'coach-weshoot',
          avatar: {
            url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
            alt: 'Coach WeShoot'
          }
        },
        destination: {
          id: tour.states?.[0]?.id || '1',
          name: tour.places?.[0]?.name || 'Destinazione',
          slug: tour.places?.[0]?.slug || 'destinazione',
          country: tour.states?.[0]?.name || 'Paese'
        },
        collection: tour.collections?.[0] ? {
          id: tour.collections[0].id,
          title: tour.collections[0].name,
          slug: tour.collections[0].slug
        } : undefined,
        sessions: tour.sessions || [],
        states: tour.states,
        places: tour.places
      };
    });
  };

  const loadMoreTours = useCallback(async () => {
    if (!hasMore || loading) return;

    try {
      const { data: newData } = await fetchMore({
        variables: {
          start: allTours.length,
          limit: TOURS_PER_PAGE
        }
      });

      if (newData?.tours) {
        const newTours = transformTours(newData.tours);
        setAllTours(prev => [...prev, ...newTours]);
        setHasMore(newData.tours.length === TOURS_PER_PAGE);
      }
    } catch (error) {
      console.error('Error loading more tours:', error);
    }
  }, [allTours.length, hasMore, loading, fetchMore]);

  const { isFetching } = useInfiniteScroll({
    hasMore,
    isLoading: loading,
    onLoadMore: loadMoreTours
  });

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  const heroImage = toursPageData?.toursPage?.cover;
  const faqs = toursPageData?.toursPage?.faqs || [];

  return (
    <>
      <SEO 
        title="Viaggi Fotografici - WeShoot.it"
        description="Scopri i nostri viaggi fotografici nel mondo. Destinazioni uniche, coach esperti e piccoli gruppi per un'esperienza fotografica indimenticabile."
        url="https://www.weshoot.it/viaggi-fotografici/"
      />
      
      <div className="min-h-screen bg-white">
        <Header />
        
        <ToursHero 
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          heroImage={heroImage}
        />

        <ToursQuickLinks />

        <ToursContent 
          tours={allTours}
          loading={loading && allTours.length === 0}
          loadingMore={loading || isFetching}
          error={error}
          searchTerm={searchTerm}
          onClearSearch={handleClearSearch}
          hasMore={hasMore}
        />

        <ToursFAQ faqs={faqs} />

        <ToursInfoSection />
      </div>
      
      <Footer />
    </>
  );
};

export default Tours;
