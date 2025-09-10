// graphql/queries/tour-base.ts
import { gql } from "@apollo/client";
import { IMAGE_FRAGMENT } from "../fragments/image";
import { SESSION_FRAGMENT } from "../fragments/session";
import { REVIEW_FRAGMENT } from "../fragments/review";
import { PICTURE_FRAGMENT } from "../fragments/picture";
import { LOCATION_FRAGMENT } from "../fragments/location";
import { TOUR_LOCALIZATION_FRAGMENT } from "../fragments/tour-localization";
import {
  STATE_FRAGMENT,
  PLACE_FRAGMENT,
  COLLECTION_FRAGMENT,
  PACKAGE_FRAGMENT,
  COUPON_FRAGMENT,
  FAQ_FRAGMENT,
} from "../fragments/basic-entities";

export const TOUR_BASE_FIELDS = gql`
  fragment TourBaseFields on Tour {
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


    highlights {
      id
      title
      description
      locale
      icon {
           url
           alternativeText
           width
           height
      }
    }

    things2know {
      id
      title
      description
      locale
      icon { ...ImageFields }
    }

    image { ...ImageFields }
    places { ...PlaceFields }
    states { ...StateFields }
    locations { ...LocationFields }
    reviews { ...ReviewFields }
    pictures { ...PictureFields }
    packages { ...PackageFields }
    coupons { ...CouponFields }
    faqs { ...FAQFields }
    collections { ...CollectionFields }
    sessions { ...SessionFields }
    localizations { ...TourLocalizationFields }
  }
  ${IMAGE_FRAGMENT}
  ${STATE_FRAGMENT}
  ${PLACE_FRAGMENT}
  ${LOCATION_FRAGMENT}
  ${REVIEW_FRAGMENT}
  ${PICTURE_FRAGMENT}
  ${PACKAGE_FRAGMENT}
  ${COUPON_FRAGMENT}
  ${FAQ_FRAGMENT}
  ${COLLECTION_FRAGMENT}
  ${SESSION_FRAGMENT}
  ${TOUR_LOCALIZATION_FRAGMENT}
`;
