import Big from "big.js";
import { setupNear } from "./services/near";
import { RelayerPayload } from "./interfaces/relayer";
import {
  ACCOUNT_ID,
  RELAYER_FEE,
  HYC_CONTRACT,
  AttachedGas,
} from "./constants";
import { getResponse } from "./services/requests";
import { viewFunction, connectionConfig } from "./services/near";

export const relayer = async (event: FetchEvent): Promise<Response> => {
  const args: RelayerPayload = await event.request.json();

  const nearConnection = await setupNear();

  const account = await nearConnection.account(ACCOUNT_ID);

  // check if payload uses correct relayer
  if (args.relayer != ACCOUNT_ID) {
    return getResponse(
      JSON.stringify({
        status: "failure",
        error: `should specify correct relayer address: ${ACCOUNT_ID}`,
      })
    );
  }

  // check if payload uses correct fee
  const minimumFee = new Big(args.quantity).mul(new Big(RELAYER_FEE));

  const payloadFee = new Big(args.fee);

  if (payloadFee.lt(minimumFee)) {
    return getResponse(
      JSON.stringify({
        status: "failure",
        error: `should at least minimum relayer fee: ${minimumFee.toFixed(0)}`,
      })
    );
  }

  // check if payload is valid
  try {
    await viewFunction(
      connectionConfig.nodeUrl,
      HYC_CONTRACT,
      "view_is_withdraw_valid",
      args
    );
  } catch (error) {
    return getResponse(
      JSON.stringify({
        status: "failure",
        error,
      })
    );
  }

  // since payload is valid, submit transaction and return hash
  const transaction = await account.functionCall({
    contractId: HYC_CONTRACT,
    methodName: "withdraw",
    args,
    gas: AttachedGas,
  });

  return getResponse(
    JSON.stringify({
      status: "success",
      transaction,
    })
  );
};
