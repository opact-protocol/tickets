import { useEnv } from "@/hooks/useEnv";
import { ApolloClient, InMemoryCache } from "@apollo/client";

export const client = new ApolloClient({
  uri: useEnv("VITE_API_GRAPHQL_URL"),
  cache: new InMemoryCache(),
});
