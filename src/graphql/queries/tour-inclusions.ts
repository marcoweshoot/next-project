
import { gql } from "@apollo/client";

export const TOUR_INCLUSIONS_FIELDS = gql`
  fragment TourInclusionsFields on Tour {
    whats_includeds {
      id
      created_at
      updated_at
      title
      description
      locale
      published_at
      icon {
        id
        created_at
        updated_at
        name
        alternativeText
        caption
        width
        height
        formats
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
      created_at
      updated_at
      title
      description
      locale
      published_at
      icon {
        id
        created_at
        updated_at
        name
        alternativeText
        caption
        width
        height
        formats
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
