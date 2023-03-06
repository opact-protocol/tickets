import { connect, keyStores, KeyPair, accountCreator } from "near-api-js";
import { Buffer } from "buffer";
import Process from "process";
import type { Account } from "@near-wallet-selector/core";

const { UrlAccountCreator } = accountCreator;

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
  RPC_URL: string;
  ACCOUNT_ID: string;
  PRIVATE_KEY: string;
  NEAR_NETWORK: string;
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

export async function createAccount(
  connection: any,
  keyStore: any,
  account_id: string
): Promise<Account> {
  const config = {
    ...getConfig(),
    deps: { keyStore },
  };
  const accountCreator = new UrlAccountCreator(
    connection,
    "https://helper.testnet.near.org"
  );

  const keyPair = KeyPair.fromRandom("ed25519");

  const publicKey = keyPair.getPublicKey();

  await keyStore.setKey(config.networkId, account_id, keyPair);

  try {
    await accountCreator.createAccount(account_id, publicKey);

    return await connection.account(account_id);
  } catch (err: any) {
    if (
      err.toString().includes("TooManyRequestsError:") ||
      err.toString().includes("Error: Server Error") ||
      err
        .toString()
        .includes(
          "The server encountered a temporary error and could not complete your request.<p>Please try again in"
        )
    ) {
      await sleep(1000 * 60 * 1);
      return await createAccount(connection, keyStore, account_id);
    } else {
      throw err;
    }
  }
}

export const getConfig = () => {
  return {
    networkId: "testnet",
    nodeUrl: "https://rpc.testnet.near.org",
    walletUrl: "https://wallet.testnet.near.org",
    helperUrl: "https://helper.testnet.near.org",
    explorerUrl: "https://explorer.testnet.near.org",
  };
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
