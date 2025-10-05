import React from 'react';
import TourCard from '@/components/TourCard';
import { Tour as TourCardTour } from '@/types';
import {
  getFutureSessions,
  getLatestSession,
  getDestinationFromTour
} from '@/utils/TourDataUtilis';

interface StoryRelatedToursProps {
  tours: any[];
}

const StoryRelatedTours: React.FC<StoryRelatedToursProps> = ({ tours }) => {
  if (!tours || tours.length === 0) {
    return null;
  }


  const transformStoryTourData = (tour: any): TourCardTour => {
    
    const futureSessions = getFutureSessions(tour.sessions || []);
    const latestSession = getLatestSession(tour.sessions || []);
    
    
    const displaySession = futureSessions.length > 0 ? futureSessions[0] : latestSession;
    

    const maxPax = displaySession?.maxPax || 0;
    const registeredUsers = displaySession?.users?.length || 0;
    const availableSpots = Math.max(0, maxPax - registeredUsers);

    let tourStatus = displaySession?.status;
    if (!tourStatus && displaySession) {
      if (availableSpots <= 0) {
        tourStatus = 'soldOut';
      } else if (availableSpots <= 2) {
        tourStatus = 'almostFull';
      } else {
        tourStatus = 'scheduled';
      }
    } else if (!displaySession) {
      tourStatus = 'coming_soon';
    }

    const mapDifficulty = (difficulty?: string): 'easy' | 'medium' | 'hard' => {
      if (!difficulty) return 'medium';
      const lowerDifficulty = difficulty.toLowerCase();
      if (lowerDifficulty.includes('facile') || lowerDifficulty.includes('easy')) return 'easy';
      if (lowerDifficulty.includes('difficile') || lowerDifficulty.includes('hard')) return 'hard';
      return 'medium';
    };

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
      return null;
    };

    const sessionCoach = getCoachFromSession(displaySession);

    const transformedSessions = (tour.sessions || []).map((session: any) => ({
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
    }));

    const transformedTour = {
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
      availableSpots: availableSpots,
      status: tourStatus,
      difficulty: mapDifficulty(tour.difficulty),
      featured: false,
      coach: sessionCoach || {
        id: '1',
        name: 'Coach WeShoot',
        slug: 'coach-weshoot',
        avatar: {
          url: 'https://wxoodcdxscxazjkoqhsg.supabase.co/storage/v1/object/public/picture//Coach-WeShoot.avif',
          alt: 'Coach WeShoot'
        }
      },
      destination: getDestinationFromTour(tour),
      sessions: transformedSessions,
      states: Array.isArray(tour.states) ? tour.states : tour.states ? [tour.states] : [],
      places: Array.isArray(tour.places) ? tour.places : tour.places ? [tour.places] : []
    };

    return transformedTour;
  };

  return (
    <section className="py-16 bg-muted">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Foto scattata durante questo viaggio
          </h2>
          <p className="text-lg text-muted-foreground">
            Scopri il viaggio fotografico che ha ispirato questa storia
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {tours.map((tour, index) => {
            const transformedTour = transformStoryTourData(tour);

            return (
              <TourCard 
                key={tour.id || `tour-${index}`} 
                tour={transformedTour}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default StoryRelatedTours;
