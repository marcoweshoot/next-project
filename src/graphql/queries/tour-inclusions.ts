
import { gql } from "@apollo/client";

export const TOUR_INCLUSIONS_FIELDS = gql`
  fragment TourInclusionsFields on Tour {
    whats_includeds {
      id
      title
      description
      locale
      icon {
        id
        name
        alternativeText
        caption
        width
        height
        hash
        ext
        mime
        size
        url
        previewUrl
        provider
        provider_metadata
      }
    }
    whats_not_includeds {
      id
      title
      description
      locale
      icon {
        id
        name
        alternativeText
        caption
        width
        height
        hash
        ext
        mime
        size
        url
        previewUrl
        provider
        provider_metadata
      }
    }
  }
`;
