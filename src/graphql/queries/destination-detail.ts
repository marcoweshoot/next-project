
import { gql } from "@apollo/client";

export const GET_DESTINATION_DETAIL = gql`
  query GetDestinationDetail($locale: String, $slug: String!) {
    states(locale: $locale, where: { slug: $slug }) {
      id
      name
      slug
      description
      image {
        url
        alternativeText
      }
      seo {
        metaTitle
        metaDescription
      }
    }
    locations(locale: $locale, where: { state: { slug: $slug } }) {
      id
      title
      slug
      description
      longitude
      latitude
      pictures {
        id
        title
        type
        image {
          url
          alternativeText
          caption
        }
      }
    }
    tours(locale: $locale, where: { states: { slug: $slug } }) {
      id
      title
      slug
      description
      excerpt
      difficulty
      image {
        url
        alternativeText
      }
      states {
        id
        name
        slug
      }
      places {
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
            url
            alternativeText
          }
        }
      }
    }
  }
`;
