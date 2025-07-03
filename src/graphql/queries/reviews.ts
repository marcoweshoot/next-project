
import { gql } from "@apollo/client";

export const GET_REVIEWS = gql`
  query GetReviews($limit: Int) {
    reviews(limit: $limit) {
      id
      title
      description
      rating
      user {
        firstName
        profilePicture {
          url
          alternativeText
        }
      }
      created_at
    }
  }
`;
