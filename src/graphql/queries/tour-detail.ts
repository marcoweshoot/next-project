
import { gql } from "@apollo/client";
import { TOUR_BASE_FIELDS } from "./tour-base";
import { TOUR_ITINERARY_FIELDS } from "./tour-itinerary";
import { TOUR_INCLUSIONS_FIELDS } from "./tour-inclusions";

export const GET_TOUR_BY_SLUG = gql`
  query GetTourBySlug($locale: String) {
    tours(locale: $locale) {
      ...TourBaseFields
      ...TourItineraryFields
      ...TourInclusionsFields
    }
  }
  ${TOUR_BASE_FIELDS}
  ${TOUR_ITINERARY_FIELDS}
  ${TOUR_INCLUSIONS_FIELDS}
`;
