
import { getNextPhotographerSession, getPhotographerSessions } from './sessionUtils';
import type { TourSession, SessionUser } from '@/types/tour';

interface TourInput {
  id: string;
  title: string;
  slug: string;
  description?: string;
  excerpt?: string;
  difficulty?: string;
  experience_level?: string;
  image?: {
    id: string;
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
  sessions?: TourSession[];
}

export const transformTourForCard = (tour: TourInput, photographerUsername: string, photographerName: string) => {
  const nextSession = getNextPhotographerSession(tour, photographerUsername);
  
  // Calcola la durata della sessione
  const sessionDuration = nextSession?.start && nextSession?.end ? 
    Math.ceil((new Date(nextSession.end).getTime() - new Date(nextSession.start).getTime()) / (1000 * 60 * 60 * 24)) : 
    7;

  // Ottieni il coach specifico da questa sessione
  const sessionCoach = nextSession?.users?.find(user => user.username === photographerUsername);
  
  return {
    id: tour.id,
    title: tour.title,
    slug: tour.slug,
    description: tour.description || '',
    excerpt: tour.excerpt,
    difficulty: tour.difficulty as 'easy' | 'medium' | 'hard' | undefined,
    experience_level: tour.experience_level,
    cover: tour.image ? {
      url: tour.image.url,
      alt: tour.image.alternativeText
    } : undefined,
    coach: {
      id: sessionCoach?.id || '1',
      name: sessionCoach ? 
        `${sessionCoach.firstName || ''} ${sessionCoach.lastName || ''}`.trim() || sessionCoach.username :
        photographerName,
      slug: photographerUsername,
      avatar: sessionCoach?.profilePicture ? {
        url: sessionCoach.profilePicture.url,
        alt: sessionCoach.firstName || sessionCoach.username
      } : undefined
    },
    startDate: nextSession?.start || new Date().toISOString(),
    endDate: nextSession?.end || new Date().toISOString(),
    duration: sessionDuration,
    price: nextSession?.price || 0,
    maxParticipants: nextSession?.maxPax,
    availableSpots: nextSession?.maxPax,
    states: tour.states,
    places: tour.places,
    destination: {
      id: tour.states?.[0]?.id || tour.places?.[0]?.id || '1',
      name: tour.states?.[0]?.name || tour.places?.[0]?.name || 'Destinazione',
      slug: tour.states?.[0]?.slug || tour.places?.[0]?.slug || 'destinazione',
      country: 'Italia',
      description: tour.description
    },
    // Include solo le sessioni dove è presente il fotografo
    sessions: getPhotographerSessions(tour, photographerUsername)
  };
};
