
import { gql } from "@apollo/client";

export const GET_COLLECTIONS = gql`
  query GetCollections($locale: String!) {
    collections(locale: $locale) {
      id
      name
      slug
      description
      image {
        url
        alternativeText
      }
      tours {
        id
        title
        slug
        image {
          url
          alternativeText
        }
      }
    }
  }
`;
