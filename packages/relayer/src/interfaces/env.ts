export interface Env {
  // Near network data
  // mainnet or testnet
  NEAR_NETWORK: "mainnet" | "testnet";
  RPC_URL: string;
  // Data for relayer account
  PRIVATE_KEY: string;
  ACCOUNT_ID: string;
  // Fee charged for relaying (0.25 == 25%)
  RELAYER_FEE: string;
  RELAYER_URL: string;
  HYC_CONTRACT: string;
  // Storage fee charged for relaying (0.25 == 25%)
  BASE_STORAGE_FEE: string;
}
