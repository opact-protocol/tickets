import Big from "big.js";
import { Env } from "./interfaces";
import { setupNear } from "./services/near";
import { RouterRequest } from "@tsndr/cloudflare-worker-router";
import { viewIsWithdrawValid, sendContractWithdraw } from 'hideyourcash-sdk';
import type { PublicArgsInterface } from 'hideyourcash-sdk';

const errorStatus = 500;
const successStatus = 200;

export const relayer = async (
  request: RouterRequest,
  env: Env
): Promise<{ status: number; body: any }> => {
  const payload: PublicArgsInterface = request.body;

  if (!payload) {
    return {
      status: errorStatus,
      body: {
        status: "failure",
        error: "Your withdraw payload is not valid",
      },
    };
  }

  const {
    RPC_URL,
    ACCOUNT_ID,
    RELAYER_FEE,
    HYC_CONTRACT,
  } = env;

  // setup NEAR config
  const connection = await setupNear(env);

  const account = await connection.account(ACCOUNT_ID);

  // check if payload uses correct relayer
  if (payload.relayer !== ACCOUNT_ID) {
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
    const minimumFee = new Big(payload.quantity! || 0).mul(new Big(RELAYER_FEE));

    const payloadFee = new Big(payload.fee || 0);

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
    const check = await viewIsWithdrawValid(
      RPC_URL,
      HYC_CONTRACT,
      payload,
    );

    console.log(check);
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
    const transaction = await sendContractWithdraw(
      RPC_URL,
      HYC_CONTRACT,
      env.ACCOUNT_ID,
      '',
      payload,
      account,
    );

    return {
      status: successStatus,
      body: {
        transaction,
      },
    };
  } catch (e) {
    return {
      status: errorStatus,
      body: {
        status: "failure",
        error: "We have an error to process your withdraw",
      },
    };
  }
};
