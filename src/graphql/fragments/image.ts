import { gql } from "@apollo/client";

export const IMAGE_FRAGMENT = gql`
  fragment ImageFields on UploadFile {
    id
    url
    alternativeText
    caption
    width
    height
    formats
  }
`;
