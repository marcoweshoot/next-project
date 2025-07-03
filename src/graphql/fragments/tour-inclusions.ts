
import { gql } from "@apollo/client";

export const WHATS_INCLUDED_FRAGMENT = gql`
  fragment WhatsIncludedFields on WhatsIncluded {
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
`;

export const WHATS_NOT_INCLUDED_FRAGMENT = gql`
  fragment WhatsNotIncludedFields on WhatsNotIncluded {
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
`;
