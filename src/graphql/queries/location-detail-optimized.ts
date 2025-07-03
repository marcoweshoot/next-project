
import { gql } from "@apollo/client";

export const GET_LOCATION_DETAIL_OPTIMIZED = gql`
  query GetLocationDetailOptimized($slug: String!, $locale: String = "it") {
    locations(locale: $locale, where: { slug: $slug }) {
      id
      title
      description
      slug
      longitude
      latitude
      state {
        id
        name
        slug
      }
      pictures(limit: 6) {
        id
        title
        type
        image {
          id
          url
          alternativeText
          formats
        }
      }
      tours(limit: 4) {
        id
        title
        slug
        excerpt
        difficulty
        image {
          id
          url
          alternativeText
          formats
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
        sessions(limit: 1, sort: "start:asc") {
          id
          start
          end
          price
          maxPax
          currency
        }
      }
    }
  }
`;
