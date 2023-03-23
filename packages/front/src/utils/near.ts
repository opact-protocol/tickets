import actions from "@/utils/actions";

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

/**
 * Near constants
 */
export const AttachedGas = "300000000000000";
export const OneYOctoNear = "1000000000000000000000000";


export const hycTransaction = "hyc-transaction";

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
