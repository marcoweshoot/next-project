// Query dedicata alla landing promo "Porta un Amico" del workshop di Roma.
// Usa graphql-request (non Apollo) perché la pagina gira via getClient() da @/lib/graphqlClient.
import { gql } from 'graphql-request';

/** Tour Strapi del workshop di fotografia a Roma. */
export const PROMO_ROMA_TOUR_ID = '32';

/** Sessioni ammesse alla promo: allowlist esplicita, così il CMS non può farne comparire altre. */
export const PROMO_ROMA_SESSION_IDS = ['286', '269', '268', '264'];

/** Prezzo pieno a persona (€) e prezzo promo a persona (€). */
export const PROMO_FULL_PRICE = 69;
export const PROMO_PRICE_PER_PERSON = 50;
export const PROMO_PARTY_SIZE = 2;

export const GET_PROMO_ROMA_TOUR = gql`
  query PromoRomaTour($id: ID!) {
    tour(id: $id) {
      id
      title
      excerpt
      image {
        url
        alternativeText
      }
      sessions {
        id
        start
        end
        price
        deposit
        maxPax
        status
      }
      faqs {
        id
        question
        answer
      }
      reviews {
        id
        title
        description
        rating
        created_at
        user {
          firstName
          profilePicture {
            url
            alternativeText
          }
        }
      }
    }
  }
`;
