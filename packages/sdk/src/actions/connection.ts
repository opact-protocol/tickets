import { AttachedGas } from "../constants";
import type { Transaction } from "../helpers";
import type { ConnectionType } from "../interfaces";

export const sendTransactionsCallback = async (
  connection: ConnectionType,
  transactions: Transaction[]
): Promise<any> => {
  if (connection.functionCall) {
    const outcomes: any[] = [];

    for (let i = 0; i < transactions.length; i++) {
      const { receiverId, actions } = transactions[i];

      const { params: { methodName = "", deposit = "", args = {} } = {} } =
        actions[0] || {};

      const res = await connection.functionCall({
        args,
        contractId: receiverId,
        methodName: methodName,
        gas: AttachedGas as any,
        attachedDeposit: deposit,
      });

      outcomes.push(res);
    }

    return outcomes;
  }

  const wallet = await connection.wallet();

  return await wallet.signAndSendTransactions({
    transactions: transactions as any,
  });
};
