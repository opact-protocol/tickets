import Big from "big.js";
import { Env } from "./interfaces";
import { AttachedGas } from "./constants";
import { setupNear, viewFunction } from "./services/near";
import { RelayerPayload } from "./interfaces/relayer";
import { RouterRequest } from "@tsndr/cloudflare-worker-router";

const errorStatus = 500;
const successStatus = 200;

export const relayer = async (
  request: RouterRequest,
  env: Env
): Promise<{ status: number; body: any }> => {
  const {
    publicArgs,
    currencyContractId,
  }: { publicArgs: RelayerPayload; currencyContractId: string } = request.body;

  if (!publicArgs || !currencyContractId) {
    return {
      status: errorStatus,
      body: {
        status: "failure",
        error: "Your withdraw payload is not valid",
      },
    };
  }

  const { RPC_URL, ACCOUNT_ID, RELAYER_FEE } = env;

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

  try {
    // check if payload uses correct fee
    const minimumFee = new Big(publicArgs.quantity || 0).mul(
      new Big(RELAYER_FEE)
    );

    const payloadFee = new Big(publicArgs.fee || 0);

    if (payloadFee.lt(minimumFee)) {
      return {
        status: errorStatus,
        body: {
          status: "failure",
          error: `should at least minimum relayer fee: ${minimumFee.toFixed(
            0
          )}`,
        },
      };
    }
  } catch (e) {
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
