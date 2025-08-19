import { gql } from "@apollo/client";

export const GET_COACHES = gql`
  query GetCoaches {
    users(where: { level: "coach" }) {
      username
      firstName
      lastName
      instagram
      profilePicture {
        url
        alternativeText
      }
    }
  }
`;
