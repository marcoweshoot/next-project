import { Tour } from '@/types';
import { getFutureSessions, getLatestSession, calculateTourDuration } from '@/utils/TourDataUtilis';

// ------------------------------------
// ✅ Difficulty badge helper
// ------------------------------------
export const getDifficultyBadge = (difficulty: string) => {
  switch (difficulty?.toLowerCase()) {
    case 'easy':
      return {
        text: 'Facile',
        className: 'bg-green-700 text-white',
      };
    case 'medium':
      return {
        text: 'Intermedio',
        className: 'bg-yellow-700 text-white',
      };
    case 'hard':
      return {
        text: 'Difficile',
        className: 'bg-red-700 text-white',
      };
    default:
      return {
        text: 'Intermedio',
        className: 'bg-yellow-700 text-white',
      };
  }
};

// ------------------------------------
// ✅ Tour link helper
// ------------------------------------
interface TourLinkData {
  slug: string;
  states: Array<{ slug: string }> | { slug: string };
  places: Array<{ slug: string }> | { slug: string };
}

export const getTourLink = (tour: TourLinkData) => {
  const stateSlug = (Array.isArray(tour.states) ? tour.states[0] : tour.states).slug;
  const placeSlug = (Array.isArray(tour.places) ? tour.places[0] : tour.places).slug;

  return `/viaggi-fotografici/destinazioni/${stateSlug}/${placeSlug}/${tour.slug}`;
};
