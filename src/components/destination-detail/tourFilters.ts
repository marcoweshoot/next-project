
import { Tour, Destination } from './types';

export const filterToursByDestination = (tours: Tour[], destination?: Destination): Tour[] => {
  return tours.filter(tour => {
    // Handle both array and single object formats for states
    if (!tour.states) {
      console.log(`🔍 DestinationDetailTours - Tour ${tour.title} has no states:`, tour.states);
      return false;
    }
    
    // If states is an array, use some()
    if (Array.isArray(tour.states)) {
      return tour.states.some(state => state?.slug === destination?.slug);
    }
    
    // If states is a single object, check directly
    if (typeof tour.states === 'object' && 'slug' in tour.states) {
      return tour.states.slug === destination?.slug;
    }
    
    console.log(`🔍 DestinationDetailTours - Tour ${tour.title} has unexpected states format:`, tour.states);
    return false;
  });
};
