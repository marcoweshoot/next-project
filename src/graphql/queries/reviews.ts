import { gql } from '@apollo/client';

export const GET_REVIEWS = gql`
  query GetReviews {
    reviews {
      id
      created_at
      title
      description
      rating
      ratingOrganization
      ratingCordiality
      ratingProfessionality
      ratingKnowledge
      user {
        id
        profilePicture {
          url
          alternativeText
        }
        firstName
        lastName
      }
    }
  }
`;

export const GET_REVIEW_BY_ID = gql`
  query GetReviewById($id: ID!) {
    review(id: $id) {
      id
      created_at
      title
      description
      rating
      ratingOrganization
      ratingCordiality
      ratingProfessionality
      ratingKnowledge
      user {
        id
        profilePicture {
          url
          alternativeText
        }
        firstName
        lastName
      }
    }
  }
`;
