
import { gql } from "@apollo/client";

export const GET_HOMEPAGE = gql`
  query GetHomePage($locale: String!) {
    homePage(locale: $locale) {
      id
      title
      locale
      Tours {
        id
        title
        subtitle
        tours {
          id
          title
          slug
          description
          excerpt
          difficulty
          currency
          image {
            id
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
      SEO {
        id
        metaTitle
        metaDescription
        structuredData
      }
      whatsWeshoot {
        id
        title
        subtitle
      }
      IconWithTextSection {
        id
      }
      WhyWeShoot {
        id
        Title
        Subtitle
      }
      IconWhySection {
        id
      }
      CollectionSection {
        id
        title
        subtitle
      }
      localizations {
        id
        locale
      }
    }
  }
`;
