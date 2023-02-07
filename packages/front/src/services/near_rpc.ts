import { useEnv } from "@/hooks/useEnv";
import { Near, connect } from "near-api-js";

const NEAR_CONFIG = {
  networkId: useEnv("VITE_NEAR_NETWORK"),
  nodeUrl: useEnv("VITE_NEAR_NODE_URL"),
};

export const nearRpcClient: Near = await connect(NEAR_CONFIG);
