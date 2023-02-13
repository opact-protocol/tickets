import Big from "big.js";
import { Env } from "./interfaces";
import { AttachedGas } from "./constants";
import { getResponse } from "./services/router";
import { setupNear, viewFunction } from "./services/near";
import { RelayerPayload } from "./interfaces/relayer";

export const relayer = async (
  request: Request,
  env: Env
): Promise<Response> => {
  let payload: RelayerPayload;

  try {
    payload = await request.json();

    console.log("relayer/main.tsx: POST relay with payload: ", payload);
  } catch (e) {
    console.warn(e);
    return getResponse(
      {
        status: "failure",
        error: "payload not is valid",
      },
      402
    );
  }

  const { RPC_URL, ACCOUNT_ID, RELAYER_FEE, HYC_CONTRACT } = env;

  // setup NEAR config
  const connection = await setupNear(env);

  const account = await connection.account(ACCOUNT_ID);

  // check if payload uses correct relayer
  if (payload.relayer !== ACCOUNT_ID) {
    return getResponse(
      {
        status: "failure",
        error: `should specify correct relayer address: ${ACCOUNT_ID}`,
      },
      402
    );
  }

  try {
    // check if payload uses correct fee
    const minimumFee = new Big(payload.quantity || 0).mul(new Big(RELAYER_FEE));

    const payloadFee = new Big(payload.fee || 0);

    if (payloadFee.lt(minimumFee)) {
      return getResponse(
        {
          status: "failure",
          error: `should at least minimum relayer fee: ${minimumFee.toFixed(
            0
          )}`,
        },
        402
      );
    }
  } catch (e) {
    console.warn(e);
  }

  // check if payload is valid
  try {
    await viewFunction(
      RPC_URL,
      HYC_CONTRACT,
      "view_is_withdraw_valid",
      payload
    );
  } catch (error) {
    console.warn(error);

    return getResponse(
      {
        status: "failure",
        error: "Withdraw is not valid",
      },
      402
    );
  }

  // since payload is valid, submit transaction and return hash
  try {
    const transaction = await account.functionCall({
      contractId: HYC_CONTRACT,
      methodName: "withdraw",
      args: payload,
      gas: AttachedGas as any,
    });

    console.log(
      `src/main.ts: transaction for accountId ${payload.recipient}`,
      transaction
    );

    return getResponse({
      status: "success",
      transaction,
    });
  } catch (e) {
    console.warn(e);

    return getResponse(
      {
        status: "failure",
        error: "Error on withdraw",
      },
      402
    );
  }
};
