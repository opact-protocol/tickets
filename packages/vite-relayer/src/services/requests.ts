import { relayer } from "../main";
import { HEADERS } from "../constants";
import { ACCOUNT_ID, RELAYER_FEE } from "../constants/env";

export const getResponse = async (args: string, skip = false) => {
  return new Response(JSON.stringify(args), {
    headers: skip ? { "x-skip-request": "" } : HEADERS,
  });
};

export const handleData = () => {
  return new Response(
    JSON.stringify({
      relayerAccount: ACCOUNT_ID,
      feePercent: RELAYER_FEE,
    }),
    { headers: HEADERS }
  );
};

// router for GET endpoints
export const handleGet = async (event: FetchEvent): Promise<Response> => {
  switch (new URL(event.request.url).pathname) {
    case "/data":
      return handleData();
    default:
      return getResponse("", true);
  }
};

// router for POST endpoints
export const handlePost = async (event: FetchEvent): Promise<Response> => {
  switch (new URL(event.request.url).pathname) {
    case "/relay":
      return relayer(event);
    // return new Response("Route not found", { status: 404, ...HEADERS })
    default:
      return new Response("Route not found", { status: 404, ...HEADERS });
  }
};

export const fetch = async (event: FetchEvent): Promise<void> => {
  const method = event.request.method;

  if (method === "get") {
    event.respondWith(handleGet(event));

    return;
  }

  if (method === "post") {
    event.respondWith(handlePost(event));

    return;
  }

  event.respondWith(
    new Response("Route not found", { status: 404, ...HEADERS })
  );
};
