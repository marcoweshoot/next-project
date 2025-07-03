
import { gql } from "@apollo/client";

export const GET_DESTINATIONS = gql`
  query GetDestinations($locale: String!) {
    states(locale: $locale) {
      id
      name
      slug
      image {
        url
        alternativeText
      }
    }
  }
`;
