import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";
import { registerApolloClient } from "@apollo/experimental-nextjs-app-support/rsc";

export const { getClient } = registerApolloClient(() => {
  return new ApolloClient({
    ssrMode: typeof window === "undefined", // ✅ attiva modalità SSR su server
    cache: new InMemoryCache(),
    link: new HttpLink({
      uri: "https://api.weshoot.it/graphql",
      fetch,
    }),
    connectToDevTools: process.env.NODE_ENV === "development",
  });
});
