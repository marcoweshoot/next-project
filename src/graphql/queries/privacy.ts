
import { gql } from '@apollo/client';

export const GET_PRIVACY_POLICY = gql`
  query GdprPage {
    gdprPage {
      id
      created_at
      updated_at
      title
      subtitle
      body
      published_at
    }
  }
`;
