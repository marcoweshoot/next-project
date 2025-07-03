
import { gql } from "@apollo/client";
import { IMAGE_FRAGMENT } from "../fragments/image";

export const TOUR_ITINERARY_FIELDS = gql`
  fragment TourItineraryFields on Tour {
    days {
      id
      created_at
      updated_at
      number
      title
      locale
      published_at
      steps {
        id
        created_at
        updated_at
        title
        description
        locale
        published_at
        locations {
          id
          longitude
          latitude
          title
          description
          slug
          locale
          published_at
          pictures {
            id
            title
            type
            published_at
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
        created_at
        updated_at
        number
        title
        locale
        published_at
      }
    }
  }
  ${IMAGE_FRAGMENT}
`;
