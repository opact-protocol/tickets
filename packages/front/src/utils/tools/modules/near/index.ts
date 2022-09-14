import { providers } from "near-api-js";
import type { CodeResult } from "near-api-js/lib/providers/provider";

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
  args: Args;
  gas: string;
  deposit: string;
}

export interface Args {
  token_id: [TokenId, string];
}

export interface TokenId {
  type: string;
  account_id: string;
}

export const AttachedGas = "300000000000000";

export const executeMultipleTransactions = async (
  transactions: Transaction[],
  wallet: any
) => {
  return wallet.signAndSendTransactions({ transactions });
};

export const getTransaction = (
  signerId: string,
  receiverId: string,
  method: string,
  args: any,
  amount: string
): Transaction => {
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
          deposit: amount,
        },
      },
    ],
  };
};

export const viewFunction = async (
  selector,
  contractId,
  methodName,
  args = {}
) => {
  const { network } = selector.options;

  const provider = new providers.JsonRpcProvider({ url: network.nodeUrl });

  const serializedArgs = window.btoa(JSON.stringify(args));

  const res = await provider.query<CodeResult>({
    request_type: "call_function",
    account_id: contractId,
    method_name: methodName,
    args_base64: serializedArgs,
    finality: "optimistic",
  });

  return (
    res &&
    res.result.length > 0 &&
    JSON.parse(Buffer.from(res.result).toString())
  );
};

export const getTokenStorage = async (connection, account, token) => {
  try {
    return await viewFunction(connection, token, "storage_balance_of", {
      account_id: account,
    });
  } catch (e) {
    return;
  }
};
