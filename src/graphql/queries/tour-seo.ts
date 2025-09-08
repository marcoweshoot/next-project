
// SEO component (SEO.metaTitle, SEO.metaDescription, SEO.shareImage)
import { gql } from "@apollo/client";
export const TOUR_SEO_FIELDS = gql`
  fragment TourSeoFields on Tour {
    SEO {
      metaTitle
      metaDescription
      shareImage {
        alternativeText
        width
        height
        url
      }
    }
  }
`;