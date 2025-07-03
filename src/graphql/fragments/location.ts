
import { gql } from "@apollo/client";

export const LOCATION_FRAGMENT = gql`
  fragment LocationFields on Location {
    id
    longitude
    latitude
    title
    description
    slug
    locale
    published_at
  }
`;
