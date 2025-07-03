
import { Tour } from './types';
import { Tour as TourCardTour } from '@/types';
import { getFutureSessions, getLatestSession } from '@/components/tour-card/tourCardUtils';

export const transformTourData = (tour: Tour): TourCardTour => {
  const futureSessions = getFutureSessions(tour.sessions || []);
  const latestSession = getLatestSession(tour.sessions || []);
  
  // Use future session if available, otherwise use latest session
  const displaySession = futureSessions.length > 0 ? futureSessions[0] : latestSession;
  
  const maxPax = displaySession?.maxPax || 0;
  const registeredUsers = displaySession?.users?.length || 0;
  const availableSpots = maxPax - registeredUsers;

  // Calculate tour status based on session data
  let tourStatus = displaySession?.status;
  
  // If no explicit status, derive it from availability
  if (!tourStatus) {
    if (availableSpots <= 0) {
      tourStatus = 'soldOut';
    } else if (availableSpots <= 2) {
      tourStatus = 'almostFull';
    } else {
      tourStatus = 'scheduled';
    }
  }

  // Map difficulty to allowed values, default to 'medium'
  const mapDifficulty = (difficulty?: string): 'easy' | 'medium' | 'hard' => {
    if (!difficulty) return 'medium';
    const lowerDifficulty = difficulty.toLowerCase();
    if (lowerDifficulty.includes('facile') || lowerDifficulty.includes('easy')) return 'easy';
    if (lowerDifficulty.includes('difficile') || lowerDifficulty.includes('hard')) return 'hard';
    return 'medium';
  };

  // Transform sessions to match TourSession interface
  const transformedSessions = (tour.sessions || []).map(session => ({
    id: session.id,
    start: session.start,
    end: session.end,
    price: session.price,
    maxPax: session.maxPax,
    status: session.status,
    users: session.users?.map(user => ({
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
  }));

  // Handle both array and single object formats for states and places
  const getStateInfo = () => {
    if (Array.isArray(tour.states)) {
      return tour.states[0];
    }
    return tour.states;
  };

  const getPlaceInfo = () => {
    if (Array.isArray(tour.places)) {
      return tour.places[0];
    }
    return tour.places;
  };

  const stateInfo = getStateInfo();
  const placeInfo = getPlaceInfo();

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
    maxParticipants: maxPax,
    availableSpots: availableSpots > 0 ? availableSpots : 0,
    status: tourStatus,
    difficulty: mapDifficulty(tour.difficulty),
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
      id: stateInfo?.id || '1',
      name: placeInfo?.name || 'Destinazione',
      slug: placeInfo?.slug || 'destinazione',
      country: stateInfo?.name || 'Paese'
    },
    sessions: transformedSessions,
    states: Array.isArray(tour.states) ? tour.states : tour.states ? [tour.states] : [],
    places: Array.isArray(tour.places) ? tour.places : tour.places ? [tour.places] : []
  };
};
