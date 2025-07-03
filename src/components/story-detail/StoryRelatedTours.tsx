
import React from 'react';
import TourCard from '@/components/TourCard';
import { Tour as TourCardTour } from '@/types';
import { getFutureSessions, getLatestSession } from '@/components/tour-card/tourCardUtils';

interface StoryRelatedToursProps {
  tours: any[];
}

const StoryRelatedTours: React.FC<StoryRelatedToursProps> = ({ tours }) => {
  if (!tours || tours.length === 0) {
    return null;
  }

  console.log('StoryRelatedTours - Raw tours data:', tours);

  const transformStoryTourData = (tour: any): TourCardTour => {
    console.log('StoryRelatedTours - Processing individual tour:', tour);
    console.log('StoryRelatedTours - Tour sessions:', tour.sessions);
    
    const futureSessions = getFutureSessions(tour.sessions || []);
    const latestSession = getLatestSession(tour.sessions || []);
    
    console.log('StoryRelatedTours - Future sessions:', futureSessions);
    console.log('StoryRelatedTours - Latest session:', latestSession);
    
    // Use future session if available, otherwise use latest session
    const displaySession = futureSessions.length > 0 ? futureSessions[0] : latestSession;
    
    console.log('StoryRelatedTours - Display session:', displaySession);

    const maxPax = displaySession?.maxPax || 0;
    const registeredUsers = displaySession?.users?.length || 0;
    const availableSpots = Math.max(0, maxPax - registeredUsers);

    // Calculate tour status based on session data
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

    // Map difficulty to allowed values
    const mapDifficulty = (difficulty?: string): 'easy' | 'medium' | 'hard' => {
      if (!difficulty) return 'medium';
      const lowerDifficulty = difficulty.toLowerCase();
      if (lowerDifficulty.includes('facile') || lowerDifficulty.includes('easy')) return 'easy';
      if (lowerDifficulty.includes('difficile') || lowerDifficulty.includes('hard')) return 'hard';
      return 'medium';
    };

    // Extract coach from session users (first user is typically the coach)
    const getCoachFromSession = (session: any) => {
      if (session?.users && session.users.length > 0) {
        const coach = session.users[0]; // Take the first user as coach
        console.log('StoryRelatedTours - Coach from session:', coach);
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
    console.log('StoryRelatedTours - Session coach:', sessionCoach);

    // Transform sessions to match TourSession interface
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

    // Handle states and places
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
          url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
          alt: 'Coach WeShoot'
        }
      },
      destination: {
        id: stateInfo?.id || '1',
        name: placeInfo?.name || stateInfo?.name || 'Destinazione',
        slug: placeInfo?.slug || stateInfo?.slug || 'destinazione',
        country: stateInfo?.name || 'Paese'
      },
      sessions: transformedSessions,
      states: Array.isArray(tour.states) ? tour.states : tour.states ? [tour.states] : [],
      places: Array.isArray(tour.places) ? tour.places : tour.places ? [tour.places] : []
    };

    console.log('StoryRelatedTours - Final transformed tour:', transformedTour);
    return transformedTour;
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Foto scattata durante questo viaggio
          </h2>
          <p className="text-lg text-gray-600">
            Scopri il viaggio fotografico che ha ispirato questa storia
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tours.map((tour) => {
            console.log('StoryRelatedTours - Processing tour for render:', tour);
            
            // Transform the tour data using our custom transformer
            const transformedTour = transformStoryTourData(tour);
            
            console.log('StoryRelatedTours - Transformed tour for render:', transformedTour);

            return (
              <TourCard 
                key={tour.id} 
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
