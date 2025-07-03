
import { gql } from "@apollo/client";
import { IMAGE_FRAGMENT } from "../fragments/image";

export const GET_COURSES_PAGE = gql`
  ${IMAGE_FRAGMENT}
  query GetCoursesPage($locale: String!) {
    coursesPage(locale: $locale) {
      id
      title
      subtitle
      body
      cover {
        ...ImageFields
      }
      faqs {
        id
        question
        answer
      }
      seo {
        metaTitle
        metaDescription
        shareImage {
          ...ImageFields
        }
      }
    }
  }
`;
