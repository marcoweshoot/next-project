
import { gql } from "@apollo/client";
import { USER_FRAGMENT } from "./user";

export const SESSION_FRAGMENT = gql`
  fragment SessionFields on Session {
    id
    start
    end
    status
    sessionId
    maxPax
    price
    deposit
    balance
    minPax
    currency
    priceCompanion
    locale
    users {
      ...UserFields
    }
  }
  ${USER_FRAGMENT}
`;
