
import { gql } from "@apollo/client";

export const WHATS_INCLUDED_FRAGMENT = gql`
  fragment WhatsIncludedFields on WhatsIncluded {
    id
    title
    description
    locale
    icon {
      alternativeText
      width
      height
      url
    }
  }
`;

export const WHATS_NOT_INCLUDED_FRAGMENT = gql`
  fragment WhatsNotIncludedFields on WhatsNotIncluded {
    id
    title
    description
    locale
    icon {
      alternativeText
      width
      height
      url
    }
  }
`;
