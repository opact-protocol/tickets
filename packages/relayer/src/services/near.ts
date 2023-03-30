import { connect, keyStores, KeyPair, providers } from "near-api-js";
import { Buffer } from "buffer";
import Process from "process";
import { Env } from "@/interfaces/env";
import { TokenMetadata } from "@/interfaces";

/* tslint:disable */
globalThis.Buffer = Buffer;
globalThis.process = Process;
/* tslint:disable */

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

export const viewState = async (nodeUrl: string, accountId: string) => {
  const provider = new providers.JsonRpcProvider({ url: nodeUrl });

  return (await provider.query({
    finality: "final",
    account_id: accountId,
    request_type: "view_account",
  })) as any;
};

export const viewFungibleTokenMetadata = async (
  rpcUrl: string,
  contract: string
): Promise<any> => {
  return await viewFunction(rpcUrl, contract, "ft_metadata");
};

export const ftGetTokenMetadata = async (
  env: Env,
  id: string
): Promise<TokenMetadata> => {
  const metadata = await viewFunction(
    env.RPC_URL,
    id,
    'ft_metadata'
  ).catch(() => {
    //
  });

  if (
    !metadata.icon
  ) {
    return {
      ...metadata,
      icon: '',
      id,
    };
  }

  return { ...metadata, id };
};

export const getTokenStorage = async (
  contract: string,
  accountId: string,
  nodeRpcUrl: string
) => {
  return await viewFunction(nodeRpcUrl, contract, "storage_balance_of", {
    account_id: accountId,
  });
};
