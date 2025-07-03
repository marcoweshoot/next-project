
import type { TourSession, SessionUser } from '@/types/tour';

interface Tour {
  sessions?: TourSession[];
}

export const getPhotographerSessions = (tour: Tour, photographerUsername: string): TourSession[] => {
  if (!tour.sessions) return [];
  
  return tour.sessions.filter(session =>
    session.users?.some(user => user.username === photographerUsername)
  );
};

export const getNextPhotographerSession = (tour: Tour, photographerUsername: string): TourSession | null => {
  const photographerSessions = getPhotographerSessions(tour, photographerUsername);
  
  if (photographerSessions.length === 0) return null;
  
  const now = new Date();
  
  // Prima prova a trovare sessioni future
  const futureSessions = photographerSessions.filter(session => 
    new Date(session.start) > now
  );
  
  if (futureSessions.length > 0) {
    // Ordina per data più vicina
    return futureSessions.sort((a, b) => 
      new Date(a.start).getTime() - new Date(b.start).getTime()
    )[0];
  }
  
  // Se non ci sono sessioni future, prendi la più recente
  return photographerSessions.sort((a, b) => 
    new Date(b.start).getTime() - new Date(a.start).getTime()
  )[0];
};
