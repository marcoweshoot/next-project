
import { gql } from "@apollo/client";
import { IMAGE_FRAGMENT } from "./image";

export const PICTURE_FRAGMENT = gql`
  fragment PictureFields on Picture {
    id
    title
    type
    image {
      ...ImageFields
    }
  }
  ${IMAGE_FRAGMENT}
`;
