// utils/tourFilters.ts
import type { TourSession } from '@/types/tour';

interface Tour {
  id: string;
  title: string;
  slug: string;
  sessions?: TourSession[];
}

export const filterToursByPhotographer = (
  tours: Tour[],
  photographerUsername: string
): Tour[] => {
  const now = new Date();

  const photographerTours = tours.reduce<Tour[]>((acc, tour) => {
    if (!tour.sessions || tour.sessions.length === 0) {
      return acc;
    }

    // 1) seleziona solo le sessioni future
    const futureSessions = tour.sessions.filter((session) => {
      const startDate = new Date(session.start);
      return startDate > now;
    });

    if (futureSessions.length === 0) {
      return acc;
    }

    // 2) di queste, prendi solo quelle con il fotografo
    const sessionsWithPhotographer = futureSessions.filter((session) => {
      return (
        session.users?.some((u) => u.username === photographerUsername) ?? false
      );
    });

    if (sessionsWithPhotographer.length === 0) {
      return acc;
    }

    // 3) includi il tour, ma con sessions filtrate
    acc.push({
      ...tour,
      sessions: sessionsWithPhotographer,
    });
    return acc;
  }, []);

  return photographerTours;
};
