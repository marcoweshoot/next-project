
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
      image {
        id
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
      }
      states {
        id
        name
        slug
        description
        locale
      }
      collections {
        id
        name
        description
        excerpt
        slug
        locale
      }
      sessions(sort: "start:asc") {
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
