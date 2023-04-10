import type { Queue } from "@cloudflare/workers-types/experimental"
import type { QueuedData } from "./pagination";

export interface Env {
  // Near network data
  // mainnet or testnet
  NEAR_NETWORK: "mainnet" | "testnet";
  RPC_URL: string;
  // Data for relayer account
  PRIVATE_KEY: string;
  ACCOUNT_ID: string;
  // Addresses for relevant contracts
  HYC_CONTRACT: string;
  // Graphql URL
  GRAPHQL_URL: string;
  // Bindings
  QUEUE: Queue<QueuedData>;
  DURABLE: DurableObjectNamespace;
}
