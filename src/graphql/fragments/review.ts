
import { gql } from "@apollo/client";
import { IMAGE_FRAGMENT } from "./image";

export const REVIEW_FRAGMENT = gql`
  fragment ReviewFields on Review {
    id
    title
    description
    rating
    ratingOrganization
    ratingCordiality
    ratingProfessionality
    ratingKnowledge
    published_at
    created_at
    user {
      firstName
      profilePicture {
        ...ImageFields
      }
    }
  }
  ${IMAGE_FRAGMENT}
`;
