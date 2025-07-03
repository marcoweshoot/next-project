
import type { TourSession, SessionUser } from '@/types/tour';

interface Tour {
  id: string;
  title: string;
  slug: string;
  sessions?: TourSession[];
}

export const filterToursByPhotographer = (tours: Tour[], photographerUsername: string): Tour[] => {
  console.log('filterToursByPhotographer - All tours received:', tours);
  console.log('filterToursByPhotographer - Looking for username:', photographerUsername);
  
  const photographerTours = tours.filter(tour => {
    // Verifica se il tour ha sessioni
    if (!tour.sessions || tour.sessions.length === 0) {
      console.log(`Tour "${tour.title}" has no sessions`);
      return false;
    }

    // Verifica se almeno una sessione contiene il fotografo
    const hasPhotographerInSessions = tour.sessions.some(session => {
      if (!session.users || session.users.length === 0) {
        return false;
      }
      
      const hasPhotographer = session.users.some(user => {
        const matches = user.username === photographerUsername;
        if (matches) {
          console.log(`Found photographer ${photographerUsername} in session ${session.id} of tour "${tour.title}"`);
        }
        return matches;
      });
      
      return hasPhotographer;
    });

    if (!hasPhotographerInSessions) {
      console.log(`Tour "${tour.title}" does NOT have photographer ${photographerUsername} in any session`);
    }

    return hasPhotographerInSessions;
  });

  console.log('Filtered photographer tours:', photographerTours.length, 'out of', tours.length);
  console.log('Photographer tours:', photographerTours.map(t => t.title));

  return photographerTours;
};
