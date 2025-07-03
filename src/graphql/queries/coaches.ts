
import { gql } from "@apollo/client";

export const GET_COACHES = gql`
  query GetCoaches {
    users(where: { level: "coach" }) {
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
    }
  }
`;
