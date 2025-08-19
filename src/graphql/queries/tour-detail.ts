import { gql } from "@apollo/client";
import { TOUR_BASE_FIELDS } from "./tour-base";
import { TOUR_ITINERARY_FIELDS } from "./tour-itinerary";
import { TOUR_INCLUSIONS_FIELDS } from "./tour-inclusions";
import { TOUR_REVIEWS_FIELDS } from "./tour-reviews";

export const GET_TOUR_BY_SLUG = gql`
  query GetTourBySlug($slug: String!, $locale: String) {
    tours(where: { slug: $slug }, locale: $locale) {
      ...TourBaseFields
      ...TourItineraryFields
      ...TourInclusionsFields
      ...TourReviewsFields
    }
  }
  ${TOUR_BASE_FIELDS}
  ${TOUR_ITINERARY_FIELDS}
  ${TOUR_INCLUSIONS_FIELDS}
  ${TOUR_REVIEWS_FIELDS}
`;

export const GET_ALL_TOUR_SLUGS = gql`
  query GetAllTourSlugs($locale: String) {
    tours(locale: $locale) {
      slug
      states {
        slug
      }
      places {
        slug
      }
    }
  }
`;
