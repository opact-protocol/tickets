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
