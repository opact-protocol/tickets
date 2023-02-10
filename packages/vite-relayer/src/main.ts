import Big from "big.js";
import { RelayerPayload } from "./interfaces/relayer";
import {
  HEADERS,
  RPC_URL,
  ACCOUNT_ID,
  RELAYER_FEE,
  HYC_CONTRACT,
} from "./constants";
import { getResponse } from "./services/requests";

export const sha256 = async (message: string) => {
  // encode as UTF-8
  const msgBuffer = new TextEncoder().encode(message);

  // hash the message
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);

  // convert bytes to hex string
  return [...new Uint8Array(hashBuffer)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
};

const buildArgs = (methodName: string, contractId: string, args: any) => {
  const serializedArgs = self.btoa(JSON.stringify(args));

  return JSON.stringify({
    jsonrpc: "2.0",
    id: "dontcare",
    method: "query",
    params: {
      finality: "optimistic",
      account_id: contractId,
      method_name: methodName,
      args_base64: serializedArgs,
      request_type: "call_function",
    },
  });
};

export const relayer = async (event: FetchEvent): Promise<Response> => {
  const args: RelayerPayload = await event.request.json();

  // check if payload uses correct relayer
  if (args.relayer !== ACCOUNT_ID) {
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
    const isValidArgs = buildArgs("view_is_withdraw_valid", HYC_CONTRACT, args);

    const res = await fetch(RPC_URL, {
      method: "query",
      headers: HEADERS,
      body: isValidArgs,
    });

    const { result } = JSON.parse(await res.text());

    const data = JSON.parse(Buffer.from(result.result).toString());

    console.log("data", data);
  } catch (error) {
    return new Response(
      JSON.stringify({
        status: "failure",
        error,
      }),
      { headers: HEADERS }
    );
  }

  // since payload is valid, submit transaction and return hash
  const transaction = await account.functionCall({
    contractId: HYC_CONTRACT,
    methodName: "withdraw",
    args,
    gas: "300000000000000",
  });

  return new Response(
    JSON.stringify({
      status: "success",
      transaction,
    }),
    { headers: HEADERS }
  );
};
