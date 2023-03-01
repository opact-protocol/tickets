import { AttachedGas } from "@/constants";
import { Transaction } from "@/helpers";
import { Account } from "near-api-js";
import { ConnectionType } from "..";

export const sendTransactionsCallback = async (
  connection: ConnectionType,
  transactions: Transaction[],
): Promise<any> => {
  if (connection instanceof Account) {
    return await Promise.all(transactions.map(async ({
      receiverId,
      actions,
    }) => {
      const {
        params: {
          methodName = '',
          args = {},
        } = {}
      } = actions[0] || {};

      return await connection.functionCall({
        args,
        contractId: receiverId,
        methodName: methodName,
        gas: AttachedGas as any,
      });
    }));
  }

  const wallet = await connection.wallet();

  return wallet.signAndSendTransactions({ transactions: transactions as any });
}
