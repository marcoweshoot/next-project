import { gql } from "@apollo/client";

// Elenco completo delle location (i singoli spot fotografici) usato dalla sitemap.
// Attenzione: `location` e `place` sono entità distinte su Strapi — la route
// /viaggi-fotografici/destinazioni/[stateslug]/posti/[locationslug] risolve
// esclusivamente le location, quindi la sitemap deve partire da qui e non dai place.
export const GET_ALL_LOCATIONS = gql`
  query GetAllLocations($locale: String, $limit: Int) {
    locations(locale: $locale, limit: $limit) {
      id
      slug
      updated_at
      state {
        slug
      }
    }
  }
`;
