
import { gql } from "@apollo/client";

export const GET_COURSES = gql`
  query GetCourses($locale: String!, $limit: Int) {
    courses(locale: $locale, limit: $limit) {
      id
      title
      slug
      excerpt
      presentation
      totalLessons
      price
      url
      cover {
        url
        alternativeText
      }
      image {
        url
        alternativeText
      }
      teacher {
        firstName
        lastName
        bio
        instagram
        profilePicture {
          url
          alternativeText
        }
        pictures {
          id
          title
          type
          published_at
          image {
            id
            url
            alternativeText
            width
            height
          }
        }
      }
      faqs {
        id
        question
        answer
        published_at
      }
    }
  }
`;
