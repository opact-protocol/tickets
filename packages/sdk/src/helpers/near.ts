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

/**
 * Send transactions callback
 * @param signerId The user accountId to sign the transaction
 * @param receiverId The contract accountId to receive the transaction
 * @param method The method to be called on contract
 * @param args The args to be sent to contract method
 * @param amount The human amount to be attached on transaction
 * @param skipParser The boolean to skip amount parser
 * @returns {Promise<Transaction>}
 */
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

/**
 * View function
 * @param nodeUrl The Current Near RPC Url
 * @param contractId The contract accountId to call view function
 * @param methodName The view method to be called on contract
 * @param args The args to be sent to contract view function
 * @returns {Promise<any>}
 */
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

  return JSON.parse(Buffer.from(result.result).toString());
};

/**
 * Get Transaction State
 * @param nodeUrl The Current Near RPC Url
 * @param txHash The transaction hash
 * @param accountId The accountId of signer of transaction
 * @returns {Promise<any>}
 */
export const getTransactionState = async ({
  nodeUrl,
  txHash,
  accountId,
}: { txHash: string, accountId: string, nodeUrl: string }) => {
  const { data: { result } = {} } = await sendJsonRpc(
    nodeUrl,
    "tx",
    [
      txHash,
      accountId,
    ],
  );

  return result;
}

/**
 * Get Account Balance
 * @param nodeUrl The Current Near RPC Url
 * @param accountId The Near accountId to get balance
 * @returns {Promise<any>}
 */
export const getAccountBalance = async ({
  nodeUrl,
  accountId,
}: {
  nodeUrl: string,
  accountId: string,
}) => {
  const { data: { result } = {} } = await sendJsonRpc(
    nodeUrl,
    "query",
    {
      finality: "final",
      account_id: accountId,
      request_type: "view_account",
    }
  );

  return result;
}

/**
 * Send JSON RPC
 * @param nodeUrl The Current Near RPC Url
 * @param params The RPC request params
 * @param method The RPC request method
 * @returns {Promise<any>}
 */
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

/**
 * Get Amount
 * @param amount The Near amount in Human Format
 * @param skip The flag to skip the amount parser
 * @returns {Promise<string>}
 */
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
 * Parse Near Amount
 * @param rawAmount The Near amount in Human Format
 * @returns {Promise<string>}
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

/**
 * Cleanup raw amount
 * @param amount The Near amount in Human Format
 * @returns {string}
 */
export const cleanupRawAmount = (amount: string) => {
  return amount.replace(/,/g, "").trim();
};

/**
 * Trim leading Zeroes
 * @param value The amount to trim leading zeroes
 * @returns {Promise<string>}
 */
export const trimLeadingZeroes = (value: string) => {
  const replacedValue = value.replace(/^0+/, "");

  if (replacedValue === "") {
    return "0";
  }

  return replacedValue;
};
