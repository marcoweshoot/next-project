
import { gql } from "@apollo/client";

export const GET_COLLECTION_DETAIL = gql`
  query GetCollectionDetail($slug: String!, $locale: String!) {
    collections(where: { slug: $slug }, locale: $locale) {
      id
      name
      slug
      description
      excerpt
      image {
        url
        alternativeText
      }
      seo {
        metaTitle
        metaDescription
        shareImage {
          url
        }
      }
      faqs {
        id
        question
        answer
      }
      tours {
        id
        title
        slug
        description
        excerpt
        difficulty
        currency
        image {
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
          price
          maxPax
          users {
            id
            username
            firstName
            lastName
            profilePicture {
              id
              url
              alternativeText
            }
          }
        }
      }
    }
  }
`;
