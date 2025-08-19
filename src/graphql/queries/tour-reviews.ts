import { gql } from "@apollo/client";
import { REVIEW_FRAGMENT } from "@/graphql/fragments/review";

export const TOUR_REVIEWS_FIELDS = gql`
  fragment TourReviewsFields on Tour {
    reviews {
      ...ReviewFields
    }
  }
  ${REVIEW_FRAGMENT}
`;
