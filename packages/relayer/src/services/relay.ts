import { Env } from "../interfaces";
import { AttachedGas } from "../constants";
import jwt from "@tsndr/cloudflare-worker-jwt";
import { RelayerPayload } from "../interfaces/relayer";
import { getTokenStorage, setupNear, viewFunction } from "../services/near";
import { RouterRequest } from "@tsndr/cloudflare-worker-router";

const errorStatus = 500;
const successStatus = 200;

export const relayer = async (
  request: RouterRequest,
  env: Env
): Promise<{ status: number; body: any }> => {
  const { token, publicArgs }: { publicArgs: RelayerPayload; token: string } =
    request.body;

  const isValidToken = await jwt.verify(token, env.PRIVATE_KEY);

  if (!publicArgs || !isValidToken) {
    return {
      status: errorStatus,
      body: {
        status: "failure",
        error: "Your withdraw payload is not valid",
      },
    };
  }

  const { RPC_URL, ACCOUNT_ID } = env;

  // setup NEAR config
  const connection = await setupNear(env);

  const account = await connection.account(ACCOUNT_ID);

  // check if payload uses correct relayer
  if (publicArgs.relayer !== ACCOUNT_ID) {
    return {
      status: errorStatus,
      body: {
        status: "failure",
        error: `should specify correct relayer address: ${ACCOUNT_ID}`,
      },
    };
  }

  const {
    payload: { tokenId, price_token_fee, receiver_storage, currencyContractId },
  } = jwt.decode(token);

  if (publicArgs.fee !== price_token_fee) {
    return {
      status: errorStatus,
      body: {
        status: "failure",
        error: "should at least minimum relayer fee",
      },
    };
  }

  // check if withdraw payload is valid
  try {
    await viewFunction(
      RPC_URL,
      currencyContractId,
      "view_is_withdraw_valid",
      publicArgs
    );
  } catch (error) {
    return {
      status: errorStatus,
      body: {
        status: "failure",
        error: "Your withdraw payload is not valid",
      },
    };
  }

  if (receiver_storage) {
    await account.functionCall({
      contractId: tokenId,
      methodName: "storage_deposit",
      args: {
        account_id: receiver_storage,
        registration_only: true,
      },
      gas: AttachedGas as any,
      attachedDeposit: "1000000000000000000000000" as any,
    });
  }

  const relayerStorage = await getTokenStorage(
    tokenId,
    env.ACCOUNT_ID,
    env.RPC_URL
  );

  if (!relayerStorage) {
    await account.functionCall({
      contractId: tokenId,
      methodName: "storage_deposit",
      args: {
        account_id: env.ACCOUNT_ID,
        registration_only: true,
      },
      gas: AttachedGas as any,
      attachedDeposit: "1000000000000000000000000" as any,
    });
  }

  // since payload is valid, submit transaction and return hash
  try {
    const transaction = await account.functionCall({
      contractId: currencyContractId,
      methodName: "withdraw",
      args: { ...publicArgs },
      gas: AttachedGas as any,
    });

    return {
      status: successStatus,
      body: {
        transaction,
      },
    };
  } catch (e) {
    console.warn(e);

    return {
      status: errorStatus,
      body: {
        status: "failure",
        error: "We have an error to process your withdraw",
      },
    };
  }
};
