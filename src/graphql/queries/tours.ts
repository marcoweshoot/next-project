
// Re-export all tour queries from their respective files
export { GET_TOURS } from './tours-list';
export { GET_TOUR_BY_SLUG } from './tour-detail';
export { GET_TOUR_SESSIONS } from './tours-sessions';

// Export tour fragments for reusability
export { TOUR_BASE_FIELDS } from './tour-base';
export { TOUR_ITINERARY_FIELDS } from './tour-itinerary';
export { TOUR_INCLUSIONS_FIELDS } from './tour-inclusions';
