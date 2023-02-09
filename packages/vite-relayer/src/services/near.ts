import {
  RPC_URL,
  PRIVATE_KEY,
  ACCOUNT_ID,
  NEAR_NETWORK,
} from "../constants/env";
import { connect, keyStores, KeyPair, providers } from "near-api-js";
import type { CodeResult } from "near-api-js/lib/providers/provider";

export const connectionConfig = {
  nodeUrl: RPC_URL,
  networkId: NEAR_NETWORK,
};

export const setupNear = async () => {
  const myKeyStore = new keyStores.InMemoryKeyStore();

  const keyPair = KeyPair.fromString(PRIVATE_KEY);

  await myKeyStore.setKey(NEAR_NETWORK, ACCOUNT_ID, keyPair);

  return connect({ ...connectionConfig, keyStore: myKeyStore });
};

export const viewFunction = async (
  nodeUrl: string,
  contractId: string,
  methodName: string,
  args: any
) => {
  const provider = new providers.JsonRpcProvider({ url: nodeUrl });
  const serializedArgs = Buffer.from(JSON.stringify(args)).toString("base64");

  const res = await provider.query<CodeResult>({
    request_type: "call_function",
    account_id: contractId,
    method_name: methodName,
    args_base64: serializedArgs,
    finality: "optimistic",
  });

  return JSON.parse(Buffer.from(res.result).toString());
};
