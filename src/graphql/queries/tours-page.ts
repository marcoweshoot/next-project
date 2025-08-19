
import { gql } from "@apollo/client";

export const GET_TOURS_PAGE = gql`
  query GetToursPage($locale: String = "it") {
    toursPage(locale: $locale) {
      id
      title
      description
      locale
      cover {
        id
        url
        alternativeText
        caption
        width
        height
      }
      SEO {
        id
        metaTitle
        metaDescription
        structuredData
      }
      Header {
        id
        type
        cover {
          id
          url
          alternativeText
          width
          height
        }
      }
      faqs {
        id
        question
        answer
        locale
      }
    }
  }
`;
