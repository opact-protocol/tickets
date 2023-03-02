import axios from "axios";
import { AttachedGas, nearNominationExp } from "../constants";

let _nextId = 321;

export interface Transaction {
  signerId: string;
  receiverId: string;
  actions: Action[];
}

export interface Action {
  type: string;
  params: Params;
}

export interface Params {
  methodName: string;
  args: any;
  gas: string;
  deposit: string;
}

export const getTransaction = (
  signerId: string,
  receiverId: string,
  method: string,
  args: object,
  amount?: string | undefined,
  skipParser = false
): Transaction => {
  const deposit = getAmount(amount, skipParser);

  return {
    signerId,
    receiverId,
    actions: [
      {
        type: "FunctionCall",
        params: {
          methodName: method,
          args,
          gas: AttachedGas,
          deposit,
        },
      },
    ],
  };
};

export const viewFunction = async (
  nodeUrl: string,
  contractId: string,
  methodName: string,
  args: any = {}
) => {
  const serializedArgs = Buffer.from(JSON.stringify(args)).toString("base64");

  const params = {
    request_type: "call_function",
    account_id: contractId,
    method_name: methodName,
    args_base64: serializedArgs,
    finality: "optimistic",
  };

  const { data: { result } = {} } = await sendJsonRpc(nodeUrl, "query", params);

  if (result.error) {
    throw new Error(result.error as string);
  }

  if (result.error) {
    throw new Error(result.error as string);
  }

  return JSON.parse(Buffer.from(result.result).toString());
};

export const sendJsonRpc = async (
  nodeUrl: string,
  method: string,
  params: object
) => {
  const body = JSON.stringify({
    method,
    params,
    id: _nextId++,
    jsonrpc: "2.0",
  });

  const rpcService = axios.create({
    baseURL: nodeUrl,
    headers: {
      "Content-Type": "application/json",
    },
  });

  return await rpcService.post("/", body);
};

export const getAmount = (amount: string | undefined, skip = false) => {
  if (!amount) {
    return "1";
  }

  if (skip) {
    return amount;
  }

  return parseNearAmount(amount)!;
};

/**
 * Convert human readable NEAR amount to internal indivisible units.
 * Effectively this multiplies given amount.
 *
 * @param rawAmount decimal string (potentially fractional) denominated in NEAR.
 * @returns The parsed yoctoⓃ amount or null if no amount was passed in
 */
export const parseNearAmount = (rawAmount?: string) => {
  if (!rawAmount) {
    return null;
  }

  if (rawAmount === "1") {
    return "1";
  }

  const amount = cleanupRawAmount(rawAmount);

  const split = amount.split(".");

  const wholePart = split[0];

  const fracPart = split[1] || "";

  if (split.length > 2 || fracPart.length > nearNominationExp) {
    throw new Error(`Cannot parse '${amount}' as NEAR amount`);
  }
  return trimLeadingZeroes(wholePart + fracPart.padEnd(nearNominationExp, "0"));
};

export const cleanupRawAmount = (amount: string) => {
  return amount.replace(/,/g, "").trim();
};

export const trimLeadingZeroes = (value: string) => {
  const replacedValue = value.replace(/^0+/, "");

  if (replacedValue === "") {
    return "0";
  }

  return replacedValue;
};

