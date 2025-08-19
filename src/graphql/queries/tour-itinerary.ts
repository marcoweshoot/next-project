
import { gql } from "@apollo/client";
import { IMAGE_FRAGMENT } from "../fragments/image";

export const TOUR_ITINERARY_FIELDS = gql`
  fragment TourItineraryFields on Tour {
    days {
      id
      number
      title
      locale
      steps {
        id
        title
        description
        locale
        locations {
          id
          longitude
          latitude
          title
          description
          slug
          locale
          pictures {
            id
            title
            type
            image {
              id
              url
              alternativeText
              caption
              width
              height
              formats
            }
          }
        }
        gallery {
          ...ImageFields
        }
      }
      localizations {
        id
        number
        title
        locale
      }
    }
  }
  ${IMAGE_FRAGMENT}
`;
