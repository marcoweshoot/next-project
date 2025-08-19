
import { gql } from "@apollo/client";

export const TOUR_LOCALIZATION_FRAGMENT = gql`
  fragment TourLocalizationFields on Tour {
    id
    title
    slug
    description
    excerpt
    difficulty
    experience_level
    things_needed
    currency
    tour_id
    video_url
    workshop
    priority
    locale
  }
`;
