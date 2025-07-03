"use client";
import { useMemo } from 'react';
import { useQuery } from '@apollo/client';
import { GET_FUTURE_SESSIONS } from '@/graphql/queries/tours-sessions';
import { GET_CALENDAR_PAGE } from '@/graphql/queries/calendar-page';

interface TourSession {
  id: string;
  startDate: string;
  endDate: string;
  status: 'scheduled' | 'confirmed' | 'almostConfirmed' | 'almostFull' | 'waitingList' | 'soldOut';
  price: number;
  currency: string;
  availableSpots?: number;
  tour: {
    id: string;
    title: string;
    slug: string;
    duration: number;
    coach: {
      id: string;
      name: string;
      avatar?: {
        url: string;
        alt?: string;
      };
    };
  };
}

interface GroupedSessions {
  [key: string]: {
    month: string;
    year: number;
    tours: TourSession[];
  };
}

export const useCalendarData = () => {
  // Query per i dati della pagina calendario
  const { data: pageData, loading: pageLoading } = useQuery(GET_CALENDAR_PAGE, {
    errorPolicy: 'all',
    fetchPolicy: 'cache-first'
  });

  const { data, loading, error } = useQuery(GET_FUTURE_SESSIONS, {
    errorPolicy: 'all',
    notifyOnNetworkStatusChange: false,
    fetchPolicy: 'cache-first'
  });

  const sessions = useMemo((): TourSession[] => {
    if (!data?.tours) return [];
    
    const allSessions: TourSession[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    data.tours.forEach((tour: any) => {
      if (tour.sessions && tour.sessions.length > 0) {
        tour.sessions.forEach((session: any) => {
          const sessionStartDate = new Date(session.start);
          
          if (sessionStartDate >= today) {
            const startDate = new Date(session.start);
            const endDate = new Date(session.end);
            const duration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
            
            let sessionCoach;
            if (session.users && session.users.length > 0) {
              const user = session.users[0];
              sessionCoach = {
                id: user.id,
                name: user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user.username,
                avatar: {
                  url: user.profilePicture?.url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
                  alt: user.firstName || user.username
                }
              };
            } else {
              sessionCoach = {
                id: '1',
                name: 'WeShoot Team',
                avatar: {
                  url: tour.image?.url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
                  alt: 'WeShoot Team'
                }
              };
            }
            
            allSessions.push({
              id: session.id || session.sessionId,
              startDate: session.start,
              endDate: session.end,
              status: session.status || 'scheduled',
              price: session.price || 0,
              currency: session.currency || tour.currency || 'EUR',
              availableSpots: session.maxPax,
              tour: {
                id: tour.id,
                title: tour.title,
                slug: tour.slug,
                duration: duration,
                coach: sessionCoach
              }
            });
          }
        });
      }
    });
    
    return allSessions;
  }, [data]);

  const groupedSessions = useMemo((): GroupedSessions => {
    const grouped: GroupedSessions = {};
    
    sessions
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
      .forEach(session => {
        const date = new Date(session.startDate);
        const year = date.getFullYear();
        const month = date.toLocaleDateString('it-IT', { month: 'long' });
        const key = `${year}-${month}`;
        
        if (!grouped[key]) {
          grouped[key] = {
            month,
            year,
            tours: []
          };
        }
        
        grouped[key].tours.push(session);
      });
    
    return grouped;
  }, [sessions]);

  const seoData = pageData?.calendarPage?.SEO;
  const coverImage = pageData?.calendarPage?.cover?.url || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80';

  return {
    sessions,
    groupedSessions,
    loading: loading || pageLoading,
    error,
    seoData,
    coverImage
  };
};
