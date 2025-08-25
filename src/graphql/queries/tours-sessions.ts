
import { gql } from "@apollo/client";

export const GET_TOUR_SESSIONS = gql`
  query GetTourSessions($limit: Int, $start: Int) {
    tours(limit: $limit, start: $start) {
      id
      title
      slug
      currency
      image {
        id
        url
        alternativeText
      }
      places {
        id
        name
        slug
      }
      states {
        id
        name
        slug
      }
      collections {
        id
        name
        slug
      }
      sessions {
        id
        start
        end
        status
        sessionId
        maxPax
        price
        deposit
        balance
        minPax
        currency
        priceCompanion
        users {
          id
          username
          firstName
          lastName
          bio
          instagram
          profilePicture {
            id
            url
            alternativeText
          }
        }
      }
    }
  }
`;

// Query ottimizzata per il calendario che carica tutte le sessioni
export const GET_FUTURE_SESSIONS = gql`
  query GetFutureSessions($limit: Int) {
    tours(limit: $limit) {
      id
      title
      slug
      currency
      difficulty
      experience_level
      places {
        slug
      }
      states {
        slug
      }
      image {
        id
        url
        alternativeText
      }
      sessions {
        id
        start
        end
        status
        sessionId
        maxPax
        price
        currency
        users {
          id
          firstName
          lastName
          profilePicture {
            url
            alternativeText
          }
        }
      }
    }
  }
`;