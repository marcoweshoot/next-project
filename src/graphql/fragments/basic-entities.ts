
import { gql } from "@apollo/client";

export const STATE_FRAGMENT = gql`
  fragment StateFields on State {
    id
    name
    slug
    description
    locale
  }
`;

export const PLACE_FRAGMENT = gql`
  fragment PlaceFields on Place {
    id
    name
    slug
    locale
  }
`;

export const COLLECTION_FRAGMENT = gql`
  fragment CollectionFields on Collection {
    id
    name
    description
    excerpt
    slug
    locale
  }
`;

export const PACKAGE_FRAGMENT = gql`
  fragment PackageFields on Package {
    id
    title
    description
    quantity
    price
    type
    locale
  }
`;

export const COUPON_FRAGMENT = gql`
  fragment CouponFields on Coupon {
    id
    code
    amount
    type
    available
    expireDate
    active
  }
`;

export const FAQ_FRAGMENT = gql`
  fragment FAQFields on Faq {
    id
    question
    answer
    locale
  }
`;

export const DAY_FRAGMENT = gql`
  fragment DayFields on Day {
    id
    number
    title
    locale
  }
`;

export const HIGHLIGHT_FRAGMENT = gql`
  fragment HighlightFields on Highlight {
    id
    title
    description
    locale
    icon {
      url
      alternativeText
    }
  }
`;
