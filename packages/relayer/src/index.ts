import { handleData } from "./data";
import { handleRelay } from "./relay";

export interface Env {
  // Near network data
  // mainnet or testnet
  NEAR_NETWORK: "mainnet" | "testnet";
  RPC_URL: string;
  // Data for relayer account
  PRIVATE_KEY: string;
  ACCOUNT_NAME: string;
  // Data for HYC contracts
  HYC_CONTRACT: string;
  // Fee charged for relaying (0.25 == 25%)
  RELAYER_FEE: string;
}

export const HEADERS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
};

// exported serverless function
export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    return handleRequest(request, env);
  },
};

// router for request method type
async function handleRequest(request: Request, env: Env): Promise<Response> {
  switch (request.method) {
    case "GET":
      return await handleGet(request, env);
    case "POST":
      return await handlePost(request, env);
    default:
      return new Response("Method not supported", { status: 404, ...HEADERS });
  }
}

// router for GET endpoints
async function handleGet(request: Request, env: Env): Promise<Response> {
  switch (new URL(request.url).pathname) {
    case "/data":
      return await handleData(env);
    default:
      return new Response("Route not found", { status: 404, ...HEADERS });
  }
}

// router for POST endpoints
async function handlePost(request: Request, env: Env): Promise<Response> {
  switch (new URL(request.url).pathname) {
    case "/relay":
      return await handleRelay(request, env);
    default:
      return new Response("Route not found", { status: 404, ...HEADERS });
  }
}
