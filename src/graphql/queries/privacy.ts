import { gql } from '@apollo/client';

export const GET_PRIVACY_POLICY = gql`
  query GetPrivacyPolicy {
    gdprPage {
      title
      subtitle
      body
    }
  }
`;