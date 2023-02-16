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
): Promise<{ status: number; body: string }> => {
  const payload: RelayerPayload = request.body;

  if (!payload) {
    return {
      status: errorStatus,
      body: JSON.stringify({
        status: "failure",
        error: "Your withdraw payload is not valid",
      }),
    };
  }

  const { RPC_URL, ACCOUNT_ID, RELAYER_FEE, HYC_CONTRACT } = env;

  // setup NEAR config
  const connection = await setupNear(env);

  const account = await connection.account(ACCOUNT_ID);

  // check if payload uses correct relayer
  if (payload.relayer !== ACCOUNT_ID) {
    return {
      status: errorStatus,
      body: JSON.stringify({
        status: "failure",
        error: `should specify correct relayer address: ${ACCOUNT_ID}`,
      }),
    };
  }

  try {
    // check if payload uses correct fee
    const minimumFee = new Big(payload.quantity || 0).mul(new Big(RELAYER_FEE));

    const payloadFee = new Big(payload.fee || 0);

    if (payloadFee.lt(minimumFee)) {
      return {
        status: errorStatus,
        body: JSON.stringify({
          status: "failure",
          error: `should at least minimum relayer fee: ${minimumFee.toFixed(
            0
          )}`,
        }),
      };
    }
  } catch (e) {
    console.warn(e);

    return {
      status: errorStatus,
      body: JSON.stringify({
        status: "failure",
        error: "should at least minimum relayer fee",
      }),
    };
  }

  // check if withdraw payload is valid
  try {
    await viewFunction(
      RPC_URL,
      HYC_CONTRACT,
      "view_is_withdraw_valid",
      payload
    );
  } catch (error) {
    console.warn(error);

    return {
      status: errorStatus,
      body: JSON.stringify({
        status: "failure",
        error: "Your withdraw payload is not valid",
      }),
    };
  }

  // since payload is valid, submit transaction and return hash
  try {
    const transaction = await account.functionCall({
      contractId: HYC_CONTRACT,
      methodName: "withdraw",
      args: { ...payload },
      gas: AttachedGas as any,
    });

    console.log(
      `src/main.ts: transaction for accountId ${payload.recipient}`,
      transaction
    );

    return {
      status: successStatus,
      body: JSON.stringify({
        transaction,
      }),
    };
  } catch (e) {
    console.warn(e);

    return {
      status: errorStatus,
      body: JSON.stringify({
        status: "failure",
        error: "We have an error to process your withdraw",
      }),
    };
  }
};
