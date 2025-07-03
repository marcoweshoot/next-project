
import { gql } from "@apollo/client";
import { IMAGE_FRAGMENT } from "./image";

export const USER_FRAGMENT = gql`
  fragment UserFields on UsersPermissionsUser {
    id
    username
    firstName
    lastName
    bio
    instagram
    profilePicture {
      ...ImageFields
    }
  }
  ${IMAGE_FRAGMENT}
`;
