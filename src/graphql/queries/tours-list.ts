
import { gql } from "@apollo/client";

export const GET_TOURS = gql`
  query GetTours($locale: String, $limit: Int = 6, $start: Int = 0) {
    tours(locale: $locale, limit: $limit, start: $start, sort: "priority:desc,published_at:desc") {
      id
      title
      slug
      description
      excerpt
      difficulty
      experience_level
      currency
      tour_id
      video_url
      workshop
      priority
      locale
      published_at
      image {
        id
        created_at
        updated_at
        name
        alternativeText
        caption
        width
        height
        formats
        hash
        ext
        mime
        size
        url
        previewUrl
        provider
        provider_metadata
      }
      places {
        id
        name
        slug
        locale
        published_at
      }
      states {
        id
        name
        slug
        description
        locale
        published_at
      }
      collections {
        id
        name
        description
        excerpt
        slug
        locale
        published_at
      }
      sessions(sort: "start:asc") {
        id
        created_at
        updated_at
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
        published_at
        users {
          id
          username
          firstName
          lastName
          bio
          instagram
          profilePicture {
            id
            url
            alternativeText
          }
        }
      }
    }
  }
`;

// Query per ottenere il totale dei tour
export const GET_TOURS_COUNT = gql`
  query GetToursCount($locale: String) {
    toursConnection(locale: $locale) {
      aggregate {
        count
      }
    }
  }
`;

// Query leggera per ottenere solo i tour highlights
export const GET_TOURS_PREVIEW = gql`
  query GetToursPreview($locale: String, $limit: Int = 6) {
    tours(locale: $locale, limit: $limit, sort: "priority:desc") {
      id
      title
      slug
      excerpt
      currency
      image {
        id
        url
        alternativeText
      }
      places {
        id
        name
        slug
      }
      states {
        id
        name
        slug
      }
      sessions(limit: 1, sort: "start:asc") {
        id
        start
        end
        price
        maxPax
        currency
        users {
          id
          username
          firstName
          lastName
          profilePicture {
            id
            url
            alternativeText
          }
        }
      }
    }
  }
`;

// Query per ottenere un'immagine hero random dai tour
export const GET_TOURS_HERO_IMAGE = gql`
  query GetToursHeroImage($locale: String) {
    tours(locale: $locale, limit: 1, sort: "priority:desc") {
      id
      image {
        id
        url
        alternativeText
        width
        height
      }
    }
  }
`;
