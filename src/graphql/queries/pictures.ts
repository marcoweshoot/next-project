
import { gql } from "@apollo/client";
import { PICTURE_FRAGMENT } from "../fragments/picture";

export const GET_PICTURES = gql`
  query GetPictures($limit: Int, $type: String) {
    pictures(limit: $limit, where: { type: $type }) {
      ...PictureFields
    }
  }
  ${PICTURE_FRAGMENT}
`;

export const GET_ALL_PICTURES = gql`
  query GetAllPictures {
    pictures {
      ...PictureFields
    }
  }
  ${PICTURE_FRAGMENT}
`;

export const GET_GROUP_PICTURES = gql`
  query GetGroupPictures($limit: Int) {
    pictures(limit: $limit, where: { type: "group" }) {
      ...PictureFields
    }
  }
  ${PICTURE_FRAGMENT}
`;
