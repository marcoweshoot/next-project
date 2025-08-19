import { gql } from '@apollo/client';

export const GET_STORY_DETAIL_BY_SLUG = gql`
  query GetStoryDetailBySlug($slug: String!, $locale: String!) {
    stories(where: { slug: { eq: $slug } }, locale: $locale, limit: 1) {
      id
      name
      slug
      description
      locale
      seo {
        metaTitle
        metaDescription
        structuredData
      }
      photographer {
        instagram
        bio
        firstName
        lastName
        profilePicture {
          url
          alternativeText
          caption
          width
          height
        }
      }
      tour {
        id
        title
        slug
        description
        excerpt
        difficulty
        experience_level
        currency
        image {
          url
          alternativeText
          caption
          width
          height
        }
        places {
          name
          slug
        }
        states {
          name
          slug
          description
        }
        SEO {
          metaTitle
          metaDescription
        }
        sessions {
          id
          start
          end
          price
          maxPax
          status
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
      photo {
        url
        alternativeText
        caption
        width
        height
      }
    }
  }
`;

export const GET_STORY_SLUGS = gql`
  query GetStorySlugs($locale: String!) {
    stories(locale: $locale) {
      slug
    }
  }
`;
