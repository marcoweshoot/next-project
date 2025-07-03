
import { Tour } from '@/types';

export const normalizeDifficulty = (difficulty?: string): 'easy' | 'medium' | 'hard' => {
  if (!difficulty) return 'medium';
  const normalized = difficulty.toLowerCase();
  if (normalized.includes('easy') || normalized.includes('facile')) return 'easy';
  if (normalized.includes('hard') || normalized.includes('difficile')) return 'hard';
  return 'medium';
};

export const transformGraphQLTours = (graphQLTours: any[]): Tour[] => {
  if (!Array.isArray(graphQLTours)) {
    console.warn("transformGraphQLTours: Expected array but got:", typeof graphQLTours);
    return [];
  }

  return graphQLTours.map((tour: any) => ({
    id: tour.id,
    title: tour.title,
    slug: tour.slug,
    description: tour.description,
    excerpt: tour.excerpt,
    difficulty: normalizeDifficulty(tour.difficulty),
    cover: tour.image ? {
      url: tour.image.url,
      alt: tour.image.alternativeText || tour.title
    } : undefined,
    startDate: tour.sessions && tour.sessions.length > 0 ? tour.sessions[0].start : undefined,
    endDate: tour.sessions && tour.sessions.length > 0 ? tour.sessions[0].end : undefined,
    duration: 7, // Default duration
    price: tour.sessions && tour.sessions.length > 0 ? tour.sessions[0].price : 0,
    maxParticipants: tour.sessions && tour.sessions.length > 0 ? tour.sessions[0].maxPax : 0,
    availableSpots: tour.sessions && tour.sessions.length > 0 ? tour.sessions[0].maxPax : 0,
    featured: false,
    coach: tour.sessions && tour.sessions.length > 0 && tour.sessions[0].users && tour.sessions[0].users.length > 0 ? {
      id: tour.sessions[0].users[0].id,
      name: tour.sessions[0].users[0].firstName || tour.sessions[0].users[0].username,
      slug: tour.sessions[0].users[0].username,
      avatar: tour.sessions[0].users[0].profilePicture ? {
        url: tour.sessions[0].users[0].profilePicture.url,
        alt: tour.sessions[0].users[0].firstName || tour.sessions[0].users[0].username
      } : undefined
    } : {
      id: "1",
      name: "Coach WeShoot",
      slug: "coach-weshoot"
    },
    destination: {
      id: "1",
      name: "Destinazione",
      slug: "destinazione",
      country: "Paese"
    },
    states: Array.isArray(tour.states) ? tour.states : [],
    places: Array.isArray(tour.places) ? tour.places : [],
    sessions: Array.isArray(tour.sessions) ? tour.sessions : []
  }));
};

export const filterTours = (tours: Tour[], searchTerm: string): Tour[] => {
  if (!Array.isArray(tours)) {
    console.warn("filterTours: Expected array but got:", typeof tours);
    return [];
  }

  if (!searchTerm.trim()) {
    return tours;
  }

  const lowercaseSearch = searchTerm.toLowerCase();
  
  return tours.filter((tour) => {
    // Safe checks to ensure we're working with valid data
    const title = tour.title || '';
    const description = tour.description || '';
    const excerpt = tour.excerpt || '';
    
    // Check in basic tour info
    if (title.toLowerCase().includes(lowercaseSearch) ||
        description.toLowerCase().includes(lowercaseSearch) ||
        excerpt.toLowerCase().includes(lowercaseSearch)) {
      return true;
    }

    // Safe check for states
    if (Array.isArray(tour.states) && tour.states.length > 0) {
      if (tour.states.some(state => state.name && state.name.toLowerCase().includes(lowercaseSearch))) {
        return true;
      }
    }

    // Safe check for places
    if (Array.isArray(tour.places) && tour.places.length > 0) {
      if (tour.places.some(place => place.name && place.name.toLowerCase().includes(lowercaseSearch))) {
        return true;
      }
    }

    // Safe check for coach
    if (tour.coach && typeof tour.coach === 'object' && tour.coach.name) {
      if (tour.coach.name.toLowerCase().includes(lowercaseSearch)) {
        return true;
      }
    }

    return false;
  });
};
