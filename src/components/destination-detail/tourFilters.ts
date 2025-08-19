import { Tour, Destination } from './types';

export const filterToursByDestination = (
  tours: Tour[],
  destination?: Destination
): Tour[] => {
  if (!destination?.slug) return [];

  return tours.filter((tour) => {
    if (!tour.states) {
      console.warn(`🔍 Tour "${tour.title}" has no states.`, tour);
      return false;
    }

    // Handle array of states
    if (Array.isArray(tour.states)) {
      return tour.states.some((state) => state?.slug === destination.slug);
    }

    // Handle single object (non-array) format
    if (typeof tour.states === 'object' && 'slug' in tour.states) {
      return tour.states.slug === destination.slug;
    }

    console.warn(`🔍 Tour "${tour.title}" has unexpected states format:`, tour.states);
    return false;
  });
};
