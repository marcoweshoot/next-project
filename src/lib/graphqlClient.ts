// /lib/graphqlClient.ts
import { GraphQLClient } from 'graphql-request';

export const getClient = () => {
  const endpoint = process.env.STRAPI_GRAPHQL_API;
  if (!endpoint) throw new Error('❌ STRAPI_GRAPHQL_API non definita');

  return new GraphQLClient(endpoint, {
    // Next.js 13+: usa cache/ISR integrati
    next: { revalidate: 3600 },
  });
};
