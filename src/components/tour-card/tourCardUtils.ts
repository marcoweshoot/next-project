
import { Tour } from '@/types';

export const getDifficultyBadge = (difficulty: string) => {
  switch (difficulty?.toLowerCase()) {
    case 'easy':
      return {
        text: 'Facile',
        className: 'bg-green-500 text-white'
      };
    case 'medium':
      return {
        text: 'Intermedio',
        className: 'bg-yellow-500 text-white'
      };
    case 'hard':
      return {
        text: 'Difficile',
        className: 'bg-red-500 text-white'
      };
    default:
      return {
        text: 'Intermedio',
        className: 'bg-yellow-500 text-white'
      };
  }
};

export const getFutureSessions = (sessions: any[]) => {
  if (!sessions || sessions.length === 0) {
    return [];
  }
  
  const now = new Date();
  
  const futureSessions = sessions.filter(session => {
    if (!session.start) {
      return false;
    }
    
    // Usa direttamente i campi start ed end delle sessioni
    const sessionDate = new Date(session.start);
    const isFuture = sessionDate > now;
    
    console.log('Session check:', {
      sessionId: session.id,
      start: session.start,
      sessionDate,
      now,
      isFuture
    });
    
    return isFuture;
  });
  
  // Sort future sessions by start date ascending to get the next one first
  const sortedFutureSessions = futureSessions.sort((a, b) => 
    new Date(a.start).getTime() - new Date(b.start).getTime()
  );
  
  console.log('Future sessions found:', sortedFutureSessions.length);
  
  return sortedFutureSessions;
};

export const getLatestSession = (sessions: any[]) => {
  if (!sessions || sessions.length === 0) return null;
  
  const sortedSessions = [...sessions].sort((a, b) => 
    new Date(b.start).getTime() - new Date(a.start).getTime()
  );
  
  return sortedSessions[0];
};

// Updated interface to only require the properties actually used by getTourLink
interface TourLinkData {
  slug: string;
  states?: Array<{ slug: string }> | { slug: string };
  places?: Array<{ slug: string }> | { slug: string };
}

export const getTourLink = (tour: TourLinkData) => {
  console.log('getTourLink - tour data:', tour);
  
  // Handle both array and object formats for states and places
  const stateData = Array.isArray(tour.states) ? tour.states[0] : tour.states;
  const placeData = Array.isArray(tour.places) ? tour.places[0] : tour.places;
  
  const stateSlug = stateData?.slug;
  const placeSlug = placeData?.slug;
  const tourSlug = tour.slug;
  
  console.log('getTourLink - slugs:', { stateSlug, placeSlug, tourSlug });
  
  // Priority: if we have state, place, and tour slugs, use the full path
  if (stateSlug && placeSlug && tourSlug) {
    const fullPath = `/viaggi-fotografici/destinazioni/${stateSlug}/${placeSlug}/${tourSlug}`;
    console.log('getTourLink - generating full path:', fullPath);
    return fullPath;
  }
  
  // Fallback: if we only have state and tour, use state path
  if (stateSlug && tourSlug) {
    const statePath = `/viaggi-fotografici/destinazioni/${stateSlug}/${tourSlug}`;
    console.log('getTourLink - generating state path:', statePath);
    return statePath;
  }
  
  // Temporary fallback for debugging: use a generic destination path
  if (tourSlug) {
    const debugPath = `/viaggi-fotografici/destinazioni/italia/italia/${tourSlug}`;
    console.log('getTourLink - using debug path:', debugPath);
    return debugPath;
  }
  
  // Last resort: use a fallback path that goes to tours list
  console.log('getTourLink - using fallback to tours list');
  return `/viaggi-fotografici/`;
};
