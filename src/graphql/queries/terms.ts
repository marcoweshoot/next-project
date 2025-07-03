
import { gql } from '@apollo/client';

export const GET_TERMS_CONDITIONS = gql`
  query GetTermsConditions {
    terminiCondizioniPage {
      title
      subtitle
      body
    }
  }
`;
