import Process from "process";
import { Buffer } from "buffer";
import type { Env } from "./types/env";
import { connect, keyStores, KeyPair, providers } from "near-api-js";

/* tslint:disable */
globalThis.Buffer = Buffer;
globalThis.process = Process;
/* tslint:enable */

export const attachedGas = "300000000000000" as any;
export const denylistDeposit = "320000000000000000000" as any;
export const allowlistDeposit = "480000000000000000000" as any;

export const setupNear = async ({
  RPC_URL,
  ACCOUNT_ID,
  PRIVATE_KEY,
  NEAR_NETWORK,
}: Env) => {
  const myKeyStore = new keyStores.InMemoryKeyStore();

  const keyPair = KeyPair.fromString(PRIVATE_KEY);

  await myKeyStore.setKey(NEAR_NETWORK, ACCOUNT_ID, keyPair);

  const connectionConfig = {
    nodeUrl: RPC_URL,
    networkId: NEAR_NETWORK,
  };

  return connect({ ...connectionConfig, keyStore: myKeyStore });
};

export const viewFunction = async (
  nodeUrl: string,
  contractId: string,
  methodName: string,
  args: any = {}
) => {
  const provider = new providers.JsonRpcProvider({ url: nodeUrl });

  const serializedArgs = Buffer.from(JSON.stringify(args)).toString("base64");

  const res = (await provider.query({
      request_type: "call_function",
      account_id: contractId,
      method_name: methodName,
      args_base64: serializedArgs,
      finality: "optimistic",
  })) as any;

  return JSON.parse(Buffer.from(res.result).toString());
};

export const paginationSize = 100;

export const getHapioneEntriesQuery = `
  query GetHapioneEntries($lastViewed: BigInt!) {
    hapioneEntries(where: {counter_gte: $lastViewed}, first: ${paginationSize}, orderBy: counter) {
      counter
      account
      category
      risk
    }
  }
`;
