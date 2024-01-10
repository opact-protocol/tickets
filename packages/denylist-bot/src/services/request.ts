
import type { Env } from "../types/env";
import { getHapioneEntriesQuery } from "../utils";
import type { FeederState, FetchResponseInterface } from "../types/pagination";

export const sendRequest = async (counter: FeederState, env: Env): Promise<FetchResponseInterface> => {
  const response = await fetch(env.GRAPHQL_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: getHapioneEntriesQuery,
      variables: {
        lastViewed: counter,
      },
    }),
  });

  return await response.json();
};
