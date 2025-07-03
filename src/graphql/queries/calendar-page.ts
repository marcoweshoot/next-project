
import { gql } from "@apollo/client";
import { SEO_FRAGMENT } from "../fragments/seo";
import { IMAGE_FRAGMENT } from "../fragments/image";

export const GET_CALENDAR_PAGE = gql`
  query GetCalendarPage {
    calendarPage {
      id
      SEO {
        ...SEOFields
      }
      cover {
        ...ImageFields
      }
    }
  }
  ${SEO_FRAGMENT}
  ${IMAGE_FRAGMENT}
`;
