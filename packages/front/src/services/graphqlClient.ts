import { useEnv } from "@/hooks/useEnv";
import { ApolloClient, InMemoryCache } from "@apollo/client";

export const client = new ApolloClient({
  uri: useEnv("VITE_GRAPHQL_API_URL"),
  cache: new InMemoryCache(),
});
