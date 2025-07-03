"use client"

import { useMemo } from 'react';

interface Session {
  id: string;
  start: string;
  end: string;
  price: number;
  maxPax: number;
  status?: string;
  users?: Array<{
    id: string;
    username: string;
    firstName?: string;
    lastName?: string;
    profilePicture?: {
      url: string;
      alternativeText?: string;
    };
  }>;
}

interface Tour {
  id: string;
  title: string;
  slug: string;
  description?: string;
  excerpt?: string;
  difficulty?: string;
  currency?: string;
  image?: {
    url: string;
    alternativeText?: string;
  };
  places?: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
  states?: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
  sessions?: Session[];
}

export const useLastMinuteTours = (tours: Tour[] | undefined) => {
  return useMemo(() => {
    if (!Array.isArray(tours)) {
      console.warn("useLastMinuteTours: Expected array but got:", typeof tours);
      return [];
    }

    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000));

    const lastMinuteTours = tours.filter(tour => {
      // Safe check for sessions
      if (!Array.isArray(tour.sessions) || tour.sessions.length === 0) {
        return false;
      }

      // Check if any session starts within the next 30 days
      return tour.sessions.some(session => {
        if (!session.start) return false;
        
        const sessionStart = new Date(session.start);
        return sessionStart >= now && sessionStart <= thirtyDaysFromNow;
      });
    });

    // Transform to the expected format for LastMinuteTour
    return lastMinuteTours.map(tour => {
      const futureSession = tour.sessions?.find(session => {
        if (!session.start) return false;
        const sessionStart = new Date(session.start);
        return sessionStart >= now;
      });

      // Calculate duration if we have start and end dates
      let duration = '7 giorni';
      if (futureSession?.start && futureSession?.end) {
        const startDate = new Date(futureSession.start);
        const endDate = new Date(futureSession.end);
        const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        duration = `${days} giorni`;
      }
      
      const maxPax = futureSession?.maxPax || 0;
      const registeredUsers = futureSession?.users?.length || 0;
      const availableSpots = maxPax - registeredUsers;

      return {
        id: tour.id,
        title: tour.title,
        slug: tour.slug,
        image: tour.image?.url || 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        startDate: futureSession?.start ? new Date(futureSession.start).toLocaleDateString('it-IT') : '',
        duration: duration,
        price: futureSession?.price || 0,
        availableSpots: availableSpots > 0 ? availableSpots : 0,
        status: futureSession?.status,
        places: Array.isArray(tour.places) ? tour.places : [],
        states: Array.isArray(tour.states) ? tour.states : []
      };
    });
  }, [tours]);
};
