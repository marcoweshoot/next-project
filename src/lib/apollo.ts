"use client";

import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";

const uri = process.env.NEXT_PUBLIC_GRAPHQL_API;

if (!uri) {
  throw new Error("❌ NEXT_PUBLIC_GRAPHQL_API non è definita in .env.local");
}

export const client = new ApolloClient({
  link: new HttpLink({ uri }),
  cache: new InMemoryCache(),
});
