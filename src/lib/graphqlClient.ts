// /lib/graphqlClient.ts
import { GraphQLClient } from 'graphql-request';

let singleton: GraphQLClient | null = null;

export function getClient(): GraphQLClient {
  if (singleton) return singleton;

  const endpoint =
    process.env.STRAPI_GRAPHQL_API?.trim() ||
    process.env.NEXT_PUBLIC_GRAPHQL_API?.trim();

  if (!endpoint) {
    throw new Error('❌ STRAPI_GRAPHQL_API non definita');
  }

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const token = process.env.STRAPI_TOKEN?.trim();
  if (token) headers.Authorization = `Bearer ${token}`;

  // Nota: usiamo cache 'no-store' perché la cache la governiamo noi con unstable_cache.
  singleton = new GraphQLClient(endpoint, {
    headers,
    fetch: (input, init) =>
      fetch(input, {
        ...init,
        cache: 'no-store',
        next: { revalidate: 0 }, // nessuna ISR qui
      }),
  });

  return singleton;
}

// helper opzionale: richiesta tipizzata in un colpo
export async function gql<T = any>(
  query: string,
  variables?: Record<string, any>
): Promise<T> {
  const client = getClient();
  return client.request<T>(query, variables);
}
