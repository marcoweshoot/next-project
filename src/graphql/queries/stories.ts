
import { gql } from "@apollo/client";

export const GET_STORIES = gql`
  query GetStories($locale: String!, $limit: Int) {
    stories(locale: $locale, limit: $limit) {
      id
      name
      slug
      description
      photo {
        url
        alternativeText
      }
      photographer {
        id
        firstName
        username
        bio
        instagram
        profilePicture {
          url
          alternativeText
        }
      }
    }
  }
`;
