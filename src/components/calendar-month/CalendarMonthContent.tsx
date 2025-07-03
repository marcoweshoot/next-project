"use client"

import { useParams } from "next/navigation";
import React from 'react';
import { useQuery } from '@apollo/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import PageHeader from '@/components/PageHeader';
import { GET_FUTURE_SESSIONS } from '@/graphql/queries/tours-sessions';
import { Tour } from '@/types';
import { getFutureSessions, getLatestSession } from '@/components/tour-card/tourCardUtils';
import CalendarMonthLoading from './CalendarMonthLoading';
import CalendarMonthError from './CalendarMonthError';
import CalendarMonthEmpty from './CalendarMonthEmpty';
import CalendarMonthToursGrid from './CalendarMonthToursGrid';

const CalendarMonthContent: React.FC<{
  children?: React.ReactNode;
}> = (
  {
    children
  }
) => {
  const { year, month } = useParams();
  const { data, loading, error } = useQuery(GET_FUTURE_SESSIONS, {
    variables: { limit: 100 },
    errorPolicy: 'all'
  });

  console.log('CalendarMonth - params:', { year, month });
  console.log('CalendarMonth - raw data:', data);

  // Transform tours data and filter by month
  const getToursForMonth = () => {
    if (!data?.tours || !year || !month) return [];

    const targetYear = parseInt(year);
    const monthNames = {
      'gennaio': 0, 'febbraio': 1, 'marzo': 2, 'aprile': 3, 'maggio': 4, 'giugno': 5,
      'luglio': 6, 'agosto': 7, 'settembre': 8, 'ottobre': 9, 'novembre': 10, 'dicembre': 11
    };
    const targetMonth = monthNames[month.toLowerCase() as keyof typeof monthNames];

    if (targetMonth === undefined) return [];

    const filteredTours: Tour[] = [];

    data.tours.forEach((tour: any) => {
      console.log('Raw tour data:', {
        id: tour.id,
        title: tour.title,
        slug: tour.slug,
        states: tour.states,
        places: tour.places,
        sessions: tour.sessions?.length || 0
      });

      const futureSessions = getFutureSessions(tour.sessions || []);
      const latestSession = getLatestSession(tour.sessions || []);
      
      // Filter sessions for the target month/year
      const monthSessions = (tour.sessions || []).filter((session: any) => {
        const sessionDate = new Date(session.start);
        return sessionDate.getFullYear() === targetYear && sessionDate.getMonth() === targetMonth;
      });

      if (monthSessions.length > 0) {
        // Use the first session of the month as display session
        const displaySession = monthSessions[0];
        
        const maxPax = displaySession?.maxPax || 0;
        const registeredUsers = displaySession?.users?.length || 0;
        const availableSpots = maxPax - registeredUsers;

        // Get coach from session
        const getCoachFromSession = (session: any) => {
          if (session?.users && session.users.length > 0) {
            const coach = session.users[0];
            return {
              id: coach.id,
              name: coach.firstName ? `${coach.firstName} ${coach.lastName || ''}`.trim() : coach.username,
              slug: coach.username,
              avatar: coach.profilePicture ? {
                url: coach.profilePicture.url,
                alt: coach.firstName || coach.username
              } : undefined
            };
          }
          return {
            id: '1',
            name: 'Coach WeShoot',
            slug: 'coach-weshoot',
            avatar: {
              url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
              alt: 'Coach WeShoot'
            }
          };
        };

        const sessionCoach = getCoachFromSession(displaySession);

        const transformedTour: Tour = {
          id: tour.id,
          title: tour.title,
          slug: tour.slug,
          description: tour.description,
          cover: tour.image ? {
            url: tour.image.url,
            alt: tour.image.alternativeText || tour.title
          } : undefined,
          startDate: displaySession?.start || new Date().toISOString(),
          duration: displaySession?.start && displaySession?.end ? 
            Math.ceil((new Date(displaySession.end).getTime() - new Date(displaySession.start).getTime()) / (1000 * 60 * 60 * 24)) : 7,
          price: displaySession?.price || 0,
          maxParticipants: maxPax,
          availableSpots: availableSpots > 0 ? availableSpots : 0,
          status: displaySession?.status,
          difficulty: (tour.difficulty || 'medium') as 'easy' | 'medium' | 'hard',
          featured: false,
          coach: sessionCoach,
          destination: {
            id: tour.states?.[0]?.id || '1',
            name: tour.places?.[0]?.name || 'Destinazione',
            slug: tour.places?.[0]?.slug || 'destinazione',
            country: tour.states?.[0]?.name || 'Paese'
          },
          sessions: tour.sessions?.map((session: any) => ({
            id: session.id,
            start: session.start,
            end: session.end,
            price: session.price,
            maxPax: session.maxPax,
            status: session.status,
            users: session.users?.map((user: any) => ({
              id: user.id,
              username: user.username,
              firstName: user.firstName,
              lastName: user.lastName,
              profilePicture: user.profilePicture ? {
                id: user.profilePicture.id || '',
                url: user.profilePicture.url,
                alternativeText: user.profilePicture.alternativeText
              } : undefined
            })) || []
          })) || [],
          // Assegniamo direttamente i dati grezzi per il link
          states: tour.states,
          places: tour.places
        };

        console.log('Final tour data for link construction:', {
          tourId: tour.id,
          tourSlug: tour.slug,
          rawStates: tour.states,
          rawPlaces: tour.places,
          finalStates: transformedTour.states,
          finalPlaces: transformedTour.places
        });

        filteredTours.push(transformedTour);
      }
    });

    return filteredTours;
  };

  const monthTours = getToursForMonth();
  const monthName = month ? month.charAt(0).toUpperCase() + month.slice(1) : '';

  if (loading) {
    return <CalendarMonthLoading />;
  }

  if (error) {
    console.error('CalendarMonth - Error:', error);
    return <CalendarMonthError />;
  }

  return (
    <>
      <SEO 
        title={`Viaggi Fotografici ${monthName} ${year} - WeShoot.it`}
        description={`Scopri tutti i viaggi fotografici programmati per ${monthName} ${year}. Prenota il tuo posto per un'esperienza fotografica indimenticabile.`}
        url={`https://www.weshoot.it/viaggi-fotografici/calendario/${year}/${month}/`}
      />
      
      <div className="min-h-screen bg-white">
        <Header />
        
        <PageHeader>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Viaggi Fotografici {monthName} {year}
            </h1>
            <p className="text-xl text-white/80">
              Tutti i viaggi programmati per {monthName} {year}
            </p>
          </div>
        </PageHeader>

        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {monthTours.length > 0 ? (
              <CalendarMonthToursGrid 
                tours={monthTours} 
                monthName={monthName} 
                year={year || ''} 
              />
            ) : (
              <CalendarMonthEmpty 
                monthName={monthName} 
                year={year || ''} 
              />
            )}
          </div>
        </section>
      </div>
      
      <Footer />
    </>
  );
};

export default CalendarMonthContent;
