
import { gql } from "@apollo/client";

export const GET_PHOTOGRAPHER_BY_USERNAME = gql`
  query GetPhotographerByUsername($username: String!) {
    users(where: { username: $username }) {
      id
      bio
      firstName
      lastName
      instagram
      username
      profilePicture {
        id
        url
        alternativeText
      }
      cover {
        id
        url
        alternativeText
      }
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
        }
      }
    }
  }
`;

export const GET_PHOTOGRAPHER_TOURS = gql`
  query GetPhotographerTours($username: String!) {
    tours(where: { sessions: { users: { username: $username } } }) {
      id
      title
      slug
      description
      excerpt
      difficulty
      experience_level
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
