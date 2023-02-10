import { relayer } from "../main";
import { HEADERS } from "../constants";
import { Env } from "@/interfaces";

export const getResponse = async (args: string, skip = false) => {
  return new Response(JSON.stringify(args), {
    headers: skip ? { "x-skip-request": "" } : HEADERS,
  });
};

export const handleData = ({ ACCOUNT_ID, RELAYER_FEE }: Env) => {
  return new Response(
    JSON.stringify({
      relayerAccount: ACCOUNT_ID,
      feePercent: RELAYER_FEE,
    }),
    { headers: HEADERS }
  );
};

export const handleGet = async (
  request: Request,
  env: Env
): Promise<Response> => {
  switch (new URL(request.url).pathname) {
    case "/data":
      return handleData(env);
    default:
      return getResponse("", true);
  }
};

export const handlePost = async (
  request: Request,
  env: Env
): Promise<Response> => {
  switch (new URL(request.url).pathname) {
    case "/relay":
      return relayer(request, env);
    default:
      return new Response("Route not found", { status: 404, ...HEADERS });
  }
};

export const fetch = async (request: Request, env: Env): Promise<any> => {
  const method = request.method;

  if (method === "GET") {
    return await handleGet(request, env);
  }

  if (method === "POST") {
    return await handlePost(request, env);
  }

  return new Response("Route not found", { status: 404, ...HEADERS });
};
