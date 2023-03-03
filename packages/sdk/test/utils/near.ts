import { connect, keyStores, KeyPair } from "near-api-js";
import { Buffer } from "buffer";
import Process from "process";

/* tslint:disable */
globalThis.Buffer = Buffer;
globalThis.process = Process;
/* tslint:disable */

export const setupNear = async ({
  RPC_URL,
  ACCOUNT_ID,
  PRIVATE_KEY,
  NEAR_NETWORK,
}: {
  RPC_URL: string,
  ACCOUNT_ID: string,
  PRIVATE_KEY: string,
  NEAR_NETWORK: string,
}) => {
  const myKeyStore = new keyStores.InMemoryKeyStore();

  const keyPair = KeyPair.fromString(PRIVATE_KEY);

  await myKeyStore.setKey(NEAR_NETWORK, ACCOUNT_ID, keyPair);

  const connectionConfig = {
    nodeUrl: RPC_URL,
    networkId: NEAR_NETWORK,
  };

  return connect({ ...connectionConfig, keyStore: myKeyStore });
};
