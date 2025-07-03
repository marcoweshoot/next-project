
import React from 'react';
import TourCard from '@/components/TourCard';

interface CollectionTour {
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
  sessions?: Array<{
    id: string;
    start: string;
    end: string;
    price: number;
    maxPax: number;
    users?: Array<{
      id: string;
      username: string;
      firstName: string;
      lastName: string;
      profilePicture?: {
        id: string;
        url: string;
        alternativeText?: string;
      };
    }>;
  }>;
}

interface CollectionDetailToursProps {
  tours: CollectionTour[];
}

const CollectionDetailTours: React.FC<CollectionDetailToursProps> = ({ tours }) => {
  if (!tours || tours.length === 0) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Viaggi di questa Collezione
          </h2>
          <p className="text-gray-600">
            Non ci sono viaggi disponibili per questa collezione al momento.
          </p>
        </div>
      </section>
    );
  };

  // Helper function to normalize difficulty
  const normalizeDifficulty = (difficulty?: string): 'easy' | 'medium' | 'hard' => {
    if (!difficulty) return 'medium';
    
    const normalized = difficulty.toLowerCase();
    if (normalized.includes('easy') || normalized.includes('facile')) return 'easy';
    if (normalized.includes('hard') || normalized.includes('difficile') || normalized.includes('difficult')) return 'hard';
    return 'medium';
  };

  // Helper function to get coach from session
  const getCoachFromSession = (session: any) => {
    if (session?.users && session.users.length > 0) {
      const coach = session.users[0]; // Take the first user as coach
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
    return {
      id: '1',
      name: 'Coach WeShoot',
      slug: 'coach-weshoot',
      avatar: {
        url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
        alt: 'Coach WeShoot'
      }
    };
  };

  // Transform the collection tour data to match TourCard expectations
  const transformTour = (tour: CollectionTour) => {
    const nextSession = tour.sessions?.find(session => new Date(session.start) > new Date()) || tour.sessions?.[0];
    
    // Get coach from session
    const sessionCoach = getCoachFromSession(nextSession);
    
    return {
      id: tour.id,
      title: tour.title,
      slug: tour.slug,
      description: tour.description,
      excerpt: tour.excerpt,
      difficulty: normalizeDifficulty(tour.difficulty),
      cover: tour.image ? {
        url: tour.image.url,
        alt: tour.image.alternativeText
      } : undefined,
      startDate: nextSession?.start || new Date().toISOString(),
      endDate: nextSession?.end || new Date().toISOString(),
      duration: nextSession ? Math.ceil((new Date(nextSession.end).getTime() - new Date(nextSession.start).getTime()) / (1000 * 60 * 60 * 24)) : 7,
      price: nextSession?.price || 0,
      coach: sessionCoach,
      destination: {
        id: tour.states?.[0]?.id || '1',
        name: tour.states?.[0]?.name || tour.places?.[0]?.name || 'Destinazione',
        slug: tour.states?.[0]?.slug || tour.places?.[0]?.slug || 'destinazione',
        country: 'Italia',
        description: ''
      },
      // Keep the original states and places data for proper URL generation
      states: tour.states || [],
      places: tour.places || [],
      sessions: tour.sessions?.map(session => ({
        id: session.id,
        start: session.start,
        end: session.end,
        price: session.price,
        maxPax: session.maxPax,
        users: session.users?.map(user => ({
          id: user.id,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          profilePicture: user.profilePicture
        })) || []
      })) || []
    };
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Viaggi di questa Collezione
          </h2>
          <p className="text-xl text-gray-600">
            Scopri tutti i viaggi fotografici disponibili
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tours.map((tour) => (
            <div key={tour.id} className="animate-zoomIn">
              <TourCard tour={transformTour(tour)} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CollectionDetailTours;
