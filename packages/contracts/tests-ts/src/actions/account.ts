import { Near } from "near-api-js";
import { KeyPair } from "near-workspaces";
import { AccountCreator } from "near-api-js/lib/account_creator";

export const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const createAccount = async ({
  creator,
  config,
  near,
  accountId,
}: {
  creator: AccountCreator;
  config: any;
  near: Near;
  accountId: string;
}): Promise<any> => {
  const keyPair = KeyPair.fromRandom("ed25519");

  const publicKey = keyPair.getPublicKey();

  await config.deps.keyStore.setKey(config.networkId, accountId, keyPair);

  try {
    await creator.createAccount(accountId, publicKey);

    return await near.account(accountId);
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
      return await createAccount({ creator, config, near, accountId });
    } else {
      throw err;
    }
  }
};
