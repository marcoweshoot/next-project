
import { gql } from "@apollo/client";

export const GET_SESSIONS = gql`
  query GetSessions($locale: String) {
    sessions(locale: $locale, sort: "start:asc") {
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
    }
  }
`;

export const GET_FUTURE_SESSIONS_DIRECT = gql`
  query GetFutureSessionsDirect($locale: String) {
    sessions(locale: $locale, sort: "start:asc", where: { start_gte: "${new Date().toISOString()}" }) {
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
    }
  }
`;
