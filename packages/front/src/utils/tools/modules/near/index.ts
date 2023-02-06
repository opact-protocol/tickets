import { useEnv } from "@/hooks/useEnv";
import actions from "@/utils/actions";
import { providers } from "near-api-js";
import { CodeResult } from "near-api-js/lib/providers/provider";

export interface Transaction {
  signerId: string;
  receiverId: string;
  actions: Action[];
}
export interface TransactionPayload {
  status: Status;
  transaction: Transaction;
  receipts_outcome: ReceiptOutcome[];
}

interface ReceiptOutcome {
  id: string;
  block_hash: string;
  outcome: Outcome;
}

interface Outcome {
  executor_id: string;
  gas_burnt: number;
  logs: string[];
  receipt_ids: string[];
  status: Status;
  tokens_burnt: string;
}

interface Status {
  SuccessValue?: string;
  SuccessReceiptId?: string;
  Failure?: string;
}

export interface Action {
  FunctionCall: FunctionCall;
}

interface FunctionCall {
  args: string;
  deposit: string;
  gas: number;
  method_name: string;
}

export interface Args {
  token_id: [TokenId, string];
}

export interface TokenId {
  type: string;
  account_id: string;
}
const hycTransaction = "hyc-transaction";

export const provider = new providers.JsonRpcProvider(
  useEnv("VITE_NEAR_NODE_URL")
);

export const AttachedGas = "300000000000000";

const refreshPage = (transactions) => {
  const newUrl =
    window.location.origin +
    window.location.pathname +
    "?transactionHashes=" +
    transactions;

  window.location.href = newUrl;
};

export const getTransactionState = async (txHash: string, accountId: string) =>
  await provider.txStatus(txHash, accountId);

export const getTransactionsStatus = (receiptsOutcome: ReceiptOutcome[]) =>
  receiptsOutcome.every(
    ({ outcome }) => !Object.keys(outcome.status).includes("Failure")
  )
    ? "success"
    : "error";

export const getTransactionsAction = (
  transactions: Partial<TransactionPayload>[]
) => {
  return transactions
    .map((payload) => {
      const action = actions.find(({ check }) =>
        check(payload as TransactionPayload)
      );

      if (!action) {
        return;
      }

      const status = getTransactionsStatus(payload.receipts_outcome!);

      return {
        status,
        message: action[status],
        methodName: action.methodName,
      };
    })
    .filter((item) => item)[0];
};

export const executeMultipleTransactions = async (
  transactions: Transaction[],
  wallet: any
) => {
  try {
    const result = await wallet.signAndSendTransactions({ transactions });
    localStorage.removeItem(hycTransaction);
    refreshPage(result.map(({ transaction }) => transaction.hash).join(","));
  } catch (e) {
    console.warn(e);
  }
};

export const getTransaction = (
  signerId: string,
  receiverId: string,
  method: string,
  args: any,
  amount: string
): any => {
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
