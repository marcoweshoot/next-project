
import { gql } from "@apollo/client";

export const SEO_FRAGMENT = gql`
  fragment SEOFields on ComponentSharedSeo {
    id
    metaTitle
    metaDescription
    structuredData
  }
`;
