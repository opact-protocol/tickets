import { useEnv } from "@/hooks/useEnv";
import { HideyourCash } from "hideyourcash-sdk";

export const hycService = new HideyourCash(
  useEnv("VITE_NEAR_NETWORK"),
  useEnv("VITE_NEAR_NODE_URL"),
  useEnv("VITE_CONTRACT"),
  useEnv("VITE_API_GRAPHQL_URL"),
  "./verifier.wasm",
  "./circuit.zkey"
);
