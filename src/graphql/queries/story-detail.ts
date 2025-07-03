
import { gql } from "@apollo/client";

export const GET_STORY_DETAIL = gql`
  query GetStoryDetail($id: ID!) {
    story(id: $id) {
      id
      name
      slug
      description
      locale
      published_at
      seo {
        id
        metaTitle
        metaDescription
        structuredData
      }
      photographer {
        id
        instagram
        bio
        firstName
        lastName
        profilePicture {
          id
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
          id
          url
          alternativeText
          caption
          width
          height
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
          description
        }
        SEO {
          id
          metaTitle
          metaDescription
        }
      }
      photo {
        id
        url
        alternativeText
        caption
        width
        height
      }
    }
  }
`;
