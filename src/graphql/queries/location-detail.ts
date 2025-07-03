
import { gql } from "@apollo/client";

export const GET_LOCATION_BY_SLUG = gql`
  query GetLocationBySlug($slug: String!, $locale: String = "it") {
    locations(locale: $locale, where: { slug: $slug }) {
      id
      title
      slug
      description
      longitude
      latitude
      state {
        id
        name
        slug
        description
      }
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
        }
      }
      tours {
        id
        title
        slug
        description
        excerpt
        difficulty
        image {
          id
          url
          alternativeText
        }
        states {
          id
          name
          slug
        }
        places {
          id
          name
          slug
        }
        sessions {
          id
          start
          end
          price
          maxPax
          users {
            id
            username
            firstName
            profilePicture {
              id
              url
              alternativeText
            }
          }
        }
      }
    }
  }
`;
