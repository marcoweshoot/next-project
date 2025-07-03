// Re-export all tour queries from their respective files
export { GET_TOURS, GET_TOURS_PREVIEW } from './tours-list';
export { GET_TOUR_BY_SLUG } from './tour-detail';
export { GET_TOUR_SESSIONS, GET_FUTURE_SESSIONS } from './tours-sessions';
export { GET_LOCATION_BY_SLUG } from './location-detail';

// Export tour fragments
export { TOUR_BASE_FIELDS } from './tour-base';
export { TOUR_ITINERARY_FIELDS } from './tour-itinerary';
export { TOUR_INCLUSIONS_FIELDS } from './tour-inclusions';

// Export other queries that are being imported in various pages
export { GET_COACHES } from './coaches';
export { GET_COLLECTIONS } from './collections';
export { GET_DESTINATIONS } from './destinations';
export { GET_PHOTOGRAPHER_BY_USERNAME, GET_PHOTOGRAPHER_TOURS } from './photographer';
export { GET_PRIVACY_POLICY } from './privacy';
export { GET_REVIEWS } from './reviews';
export { GET_STORIES } from './stories';
export { GET_STORY_DETAIL } from './story-detail';
export { GET_TERMS_CONDITIONS } from './terms';
export { GET_COURSES } from './courses';
export { GET_COURSES_PAGE } from './courses-page';

// Export destination detail query
export { GET_DESTINATION_DETAIL } from './destination-detail';

// Export collection detail query
export { GET_COLLECTION_DETAIL } from './collection-detail';

// Export homepage query
export { GET_HOMEPAGE } from './homepage';

// Export pictures query
export { GET_PICTURES, GET_GROUP_PICTURES } from './pictures';

// Export calendar page query
export { GET_CALENDAR_PAGE } from './calendar-page';

// Export tours page query
export { GET_TOURS_PAGE } from './tours-page';

// Export sessions query
export { GET_SESSIONS, GET_FUTURE_SESSIONS_DIRECT } from './sessions';

// Export optimized location detail query
export { GET_LOCATION_DETAIL_OPTIMIZED } from './location-detail-optimized';
